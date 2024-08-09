// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IRouter.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IOrderBook.sol";

import "../peripherals/interfaces/ITimelock.sol";
import "./BasePositionManager.sol";

contract PositionManager is BasePositionManager {
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Address for address payable;

    address public orderBook;
    bool public inLegacyMode;

    bool public shouldValidateIncreaseOrder = true;

    mapping (address => bool) public isOrderKeeper;
    mapping (address => bool) public isPartner;
    mapping (address => bool) public isLiquidator;

    event SetOrderKeeper(address indexed account, bool isActive);
    event SetLiquidator(address indexed account, bool isActive);
    event SetPartner(address account, bool isActive);
    event SetInLegacyMode(bool inLegacyMode);
    event SetShouldValidateIncreaseOrder(bool shouldValidateIncreaseOrder);

    modifier onlyOrderKeeper() {
        require(isOrderKeeper[msg.sender], "PositionManager: forbidden");
        _;
    }

    modifier onlyLiquidator() {
        require(isLiquidator[msg.sender], "PositionManager: forbidden");
        _;
    }

    modifier onlyPartnersOrLegacyMode() {
        require(isPartner[msg.sender] || inLegacyMode, "PositionManager: forbidden");
        _;
    }

    constructor(
        address _vault,
        address _router,
        address _shortsTracker,
        uint256 _depositFee,
        address _orderBook
    ) BasePositionManager(_vault, _router, _shortsTracker, _depositFee) {
        orderBook = _orderBook;
    }

    function setOrderKeeper(address _account, bool _isActive) external onlyAdmin {
        isOrderKeeper[_account] = _isActive;
        emit SetOrderKeeper(_account, _isActive);
    }

    function setLiquidator(address _account, bool _isActive) external onlyAdmin {
        isLiquidator[_account] = _isActive;
        emit SetLiquidator(_account, _isActive);
    }

    function setPartner(address _account, bool _isActive) external onlyAdmin {
        isPartner[_account] = _isActive;
        emit SetPartner(_account, _isActive);
    }

    function setInLegacyMode(bool _inLegacyMode) external onlyAdmin {
        inLegacyMode = _inLegacyMode;
        emit SetInLegacyMode(_inLegacyMode);
    }

    function setShouldValidateIncreaseOrder(bool _shouldValidateIncreaseOrder) external onlyAdmin {
        shouldValidateIncreaseOrder = _shouldValidateIncreaseOrder;
        emit SetShouldValidateIncreaseOrder(_shouldValidateIncreaseOrder);
    }

    function increasePosition(
        address _collateralToken,
        address _indexToken,
        uint256 _amountIn,
        // uint256 _minOut,
        uint256 _sizeDelta,
        bool _isLong,
        uint256 _price,
        uint256 _slPercent,
        uint256 _tpPercent
    ) external nonReentrant onlyPartnersOrLegacyMode {
        if (_amountIn > 0) {
            IRouter(router).pluginTransfer(_collateralToken, msg.sender, address(this), _amountIn);

            uint256 afterFeeAmount = _collectFees(msg.sender, _collateralToken, _amountIn, _indexToken, _isLong, _sizeDelta);
            IERC20(_collateralToken).safeTransfer(vault, afterFeeAmount);
        }

        _increasePosition(msg.sender, _collateralToken, _indexToken, _sizeDelta, _isLong, _price, _slPercent, _tpPercent);
    }

    function decreasePosition(
        address _collateralToken,
        address _indexToken,
        uint256 _collateralDelta,
        uint256 _sizeDelta,
        bool _isLong,
        address _receiver,
        uint256 _price
    ) external nonReentrant onlyPartnersOrLegacyMode {
        _decreasePosition(msg.sender, _collateralToken, _indexToken, _collateralDelta, _sizeDelta, _isLong, _receiver, _price);
    }

    function liquidatePosition(
        address _account,
        address _collateralToken,
        address _indexToken,
        bool _isLong,
        address _feeReceiver
    ) external nonReentrant onlyLiquidator {
        address _vault = vault;
        address timelock = IVault(_vault).gov();
        ( IVault.Position memory position, , )  = IVault(vault).getPosition(_account, _collateralToken, _indexToken, _isLong);

        uint256 markPrice = _isLong ? IVault(_vault).getMinPrice(_indexToken) : IVault(_vault).getMaxPrice(_indexToken);
        // should be called strictly before position is updated in Vault
        IShortsTracker(shortsTracker).updateGlobalShortData(_account, _collateralToken, _indexToken, _isLong, position.size, markPrice, false);

        ITimelock(timelock).enableLeverage(_vault);
        IVault(_vault).liquidatePosition(_account, _collateralToken, _indexToken, _isLong, _feeReceiver);
        ITimelock(timelock).disableLeverage(_vault);
    }

    function executeIncreaseOrder(address _account, uint256 _orderIndex) external onlyOrderKeeper {
        _validateIncreaseOrder(_account, _orderIndex);

        address _vault = vault;
        address timelock = IVault(_vault).gov();

        (
            /*address purchaseToken*/,
            /*uint256 purchaseTokenAmount*/,
            address collateralToken,
            address indexToken,
            uint256 sizeDelta,
            bool isLong
            /*uint256 triggerPrice*/,
            /*bool triggerAboveThreshold*/,
        ) = IOrderBook(orderBook).getIncreaseOrder(_account, _orderIndex);

        uint256 markPrice = isLong ? IVault(_vault).getMaxPrice(indexToken) : IVault(_vault).getMinPrice(indexToken);
        // should be called strictly before position is updated in Vault
        IShortsTracker(shortsTracker).updateGlobalShortData(_account, collateralToken, indexToken, isLong, sizeDelta, markPrice, true);

        ITimelock(timelock).enableLeverage(_vault);
        IOrderBook(orderBook).executeIncreaseOrder(_account, _orderIndex);
        ITimelock(timelock).disableLeverage(_vault);

        _emitIncreasePositionReferral(_account, sizeDelta);
    }

    function executeDecreaseOrder(address _account, uint256 _orderIndex) external onlyOrderKeeper {
        address _vault = vault;
        address timelock = IVault(_vault).gov();

        (
            address collateralToken,
            /*uint256 collateralDelta*/,
            address indexToken,
            uint256 sizeDelta,
            bool isLong
            /*uint256 triggerPrice*/,
            /*bool triggerAboveThreshold*/,
        ) = IOrderBook(orderBook).getDecreaseOrder(_account, _orderIndex);

        uint256 markPrice = isLong ? IVault(_vault).getMinPrice(indexToken) : IVault(_vault).getMaxPrice(indexToken);
        // should be called strictly before position is updated in Vault
        IShortsTracker(shortsTracker).updateGlobalShortData(_account, collateralToken, indexToken, isLong, sizeDelta, markPrice, false);

        ITimelock(timelock).enableLeverage(_vault);
        IOrderBook(orderBook).executeDecreaseOrder(_account, _orderIndex);
        ITimelock(timelock).disableLeverage(_vault);

        _emitDecreasePositionReferral(_account, sizeDelta);
    }

    function _validateIncreaseOrder(address _account, uint256 _orderIndex) internal view {
        (
            address _purchaseToken,
            uint256 _purchaseTokenAmount,
            address _collateralToken,
            address _indexToken,
            uint256 _sizeDelta,
            bool _isLong
            , // triggerPrice
            , // triggerAboveThreshold
        ) = IOrderBook(orderBook).getIncreaseOrder(_account, _orderIndex);

        _validateMaxGlobalSize(_collateralToken, _isLong, _sizeDelta);

        if (!shouldValidateIncreaseOrder) { return; }

        // shorts are okay
        if (!_isLong) { return; }

        // if the position size is not increasing, this is a collateral deposit
        require(_sizeDelta > 0, "PositionManager: long deposit");

        IVault _vault = IVault(vault);
        ( IVault.Position memory position, , ) = _vault.getPosition(_account, _collateralToken, _indexToken, _isLong);


        // if there is no existing position, do not charge a fee
        if (position.size == 0) { return; }

        uint256 nextSize = position.size.add(_sizeDelta);
        uint256 collateralDelta = _vault.tokenToUsdMin(_purchaseToken, _purchaseTokenAmount);
        uint256 nextCollateral = position.collateral.add(collateralDelta);

        uint256 prevLeverage = position.size.mul(BASIS_POINTS_DIVISOR).div(position.collateral);
        // allow for a maximum of a increasePositionBufferBps decrease since there might be some swap fees taken from the collateral
        uint256 nextLeverageWithBuffer = nextSize.mul(BASIS_POINTS_DIVISOR + increasePositionBufferBps).div(nextCollateral);

        require(nextLeverageWithBuffer >= prevLeverage, "PositionManager: long leverage decrease");
    }
}
