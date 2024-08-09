// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IRouter.sol";
import "./interfaces/IVault.sol";
import "./interfaces/IPositionRouter.sol";
import "./interfaces/IPositionRouterCallbackReceiver.sol";

import "@openzeppelin/contracts/utils/Address.sol";
import "../peripherals/interfaces/ITimelock.sol";
import "./BasePositionManager.sol";

contract PositionRouter is BasePositionManager, IPositionRouter {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    struct IncreasePositionRequest {
        address account;
        address collateralToken;
        address indexToken;
        uint256 amountIn;
        uint256 minOut;
        uint256 sizeDelta;
        bool isLong;
        uint256 acceptablePrice;
        uint256 slPercent;
        uint256 tpPercent;
        uint256 blockNumber;
        uint256 blockTime;
        address callbackTarget;
    }

    struct IncreasePositionParams {
        address _collateralToken;
        address _indexToken;
        uint256 _minOut;
        uint256 _sizeDelta;
        bool _isLong;
        uint256 _acceptablePrice;
        uint256 _slPercent;
        uint256 _tpPercent;
        bytes32 _referralCode;
        address _callbackTarget;
    }

    struct DecreasePositionRequest {
        address account;
        address collateralToken;
        address indexToken;
        uint256 collateralDelta;
        uint256 sizeDelta;
        bool isLong;
        address receiver;
        uint256 acceptablePrice;
        uint256 minOut;
        uint256 blockNumber;
        uint256 blockTime;
        address callbackTarget;
    }

    struct DecreasePositionParams {
        address _collateralToken;
        address _indexToken;
        uint256 _collateralDelta;
        uint256 _sizeDelta;
        bool _isLong;
        address _receiver;
        uint256 _acceptablePrice;
        uint256 _minOut;
        address _callbackTarget;
    }

    uint256 public minBlockDelayKeeper;
    uint256 public minTimeDelayPublic;
    uint256 public maxTimeDelay;

    bool public isLeverageEnabled = true;

    bytes32[] public increasePositionRequestKeys;
    bytes32[] public decreasePositionRequestKeys;

    uint256 public override increasePositionRequestKeysStart;
    uint256 public override decreasePositionRequestKeysStart;

    uint256 public callbackGasLimit;

    mapping (address => bool) public isPositionKeeper;

    mapping (address => uint256) public increasePositionsIndex;
    mapping (bytes32 => IncreasePositionRequest) public increasePositionRequests;

    mapping (address => uint256) public decreasePositionsIndex;
    mapping (bytes32 => DecreasePositionRequest) public decreasePositionRequests;

    event CreateIncreasePosition(
        address indexed account,
        address collateralToken,
        address indexToken,
        uint256 amountIn,
        uint256 minOut,
        uint256 sizeDelta,
        bool isLong,
        uint256 acceptablePrice,
        uint256 slPercent,
        uint256 tpPercent,
        uint256 index,
        uint256 queueIndex
    );

    event ExecuteIncreasePosition(
        address indexed account,
        address collateralToken,
        address indexToken,
        uint256 amountIn,
        uint256 minOut,
        uint256 sizeDelta,
        bool isLong,
        uint256 acceptablePrice,
        uint256 slPercent,
        uint256 tpPercent,
        uint256 blockGap,
        uint256 timeGap
    );

    event CancelIncreasePosition(
        address indexed account,
        address collateralToken,
        address indexToken,
        uint256 amountIn,
        uint256 minOut,
        uint256 sizeDelta,
        bool isLong,
        uint256 acceptablePrice,
        uint256 blockGap,
        uint256 timeGap
    );

    event CreateDecreasePosition(
        address indexed account,
        address collateralToken,
        address indexToken,
        uint256 collateralDelta,
        uint256 sizeDelta,
        bool isLong,
        address receiver,
        uint256 acceptablePrice,
        uint256 minOut,
        uint256 index,
        uint256 queueIndex
    );

    event ExecuteDecreasePosition(
        address indexed account,
        address collateralToken,
        address indexToken,
        uint256 collateralDelta,
        uint256 sizeDelta,
        bool isLong,
        address receiver,
        uint256 acceptablePrice,
        uint256 minOut,
        uint256 blockGap,
        uint256 timeGap
    );

    event CancelDecreasePosition(
        address indexed account,
        address collateralToken,
        address indexToken,
        uint256 collateralDelta,
        uint256 sizeDelta,
        bool isLong,
        address receiver,
        uint256 acceptablePrice,
        uint256 minOut,
        uint256 blockGap,
        uint256 timeGap
    );

    event SetPositionKeeper(address indexed account, bool isActive);
    event SetIsLeverageEnabled(bool isLeverageEnabled);
    event SetDelayValues(uint256 minBlockDelayKeeper, uint256 minTimeDelayPublic, uint256 maxTimeDelay);
    event SetRequestKeysStartValues(uint256 increasePositionRequestKeysStart, uint256 decreasePositionRequestKeysStart);
    event SetCallbackGasLimit(uint256 callbackGasLimit);
    event Callback(address callbackTarget, bool success);

    modifier onlyPositionKeeper() {
        require(isPositionKeeper[msg.sender], "403");
        _;
    }

    constructor(
        address _vault,
        address _router,
        address _shortsTracker,
        uint256 _depositFee
    ) BasePositionManager(_vault, _router, _shortsTracker, _depositFee) {
    }

    function setPositionKeeper(address _account, bool _isActive) external onlyAdmin {
        isPositionKeeper[_account] = _isActive;
        emit SetPositionKeeper(_account, _isActive);
    }

    function setCallbackGasLimit(uint256 _callbackGasLimit) external onlyAdmin {
        callbackGasLimit = _callbackGasLimit;
        emit SetCallbackGasLimit(_callbackGasLimit);
    }

    function setIsLeverageEnabled(bool _isLeverageEnabled) external onlyAdmin {
        isLeverageEnabled = _isLeverageEnabled;
        emit SetIsLeverageEnabled(_isLeverageEnabled);
    }

    function setDelayValues(uint256 _minBlockDelayKeeper, uint256 _minTimeDelayPublic, uint256 _maxTimeDelay) external onlyAdmin {
        minBlockDelayKeeper = _minBlockDelayKeeper;
        minTimeDelayPublic = _minTimeDelayPublic;
        maxTimeDelay = _maxTimeDelay;
        emit SetDelayValues(_minBlockDelayKeeper, _minTimeDelayPublic, _maxTimeDelay);
    }

    function setRequestKeysStartValues(uint256 _increasePositionRequestKeysStart, uint256 _decreasePositionRequestKeysStart) external onlyAdmin {
        increasePositionRequestKeysStart = _increasePositionRequestKeysStart;
        decreasePositionRequestKeysStart = _decreasePositionRequestKeysStart;

        emit SetRequestKeysStartValues(_increasePositionRequestKeysStart, _decreasePositionRequestKeysStart);
    }

    function executeIncreasePositions(uint256 _endIndex) external override onlyPositionKeeper {
        uint256 index = increasePositionRequestKeysStart;
        uint256 length = increasePositionRequestKeys.length;

        if (index >= length) { return; }

        if (_endIndex > length) {
            _endIndex = length;
        }

        while (index < _endIndex) {
            bytes32 key = increasePositionRequestKeys[index];

            // if the request was executed then delete the key from the array
            // if the request was not executed then break from the loop, this can happen if the
            // minimum number of blocks has not yet passed
            // an error could be thrown if the request is too old or if the slippage is
            // higher than what the user specified, or if there is insufficient liquidity for the position
            // in case an error was thrown, cancel the request
            try this.executeIncreasePosition(key) returns (bool _wasExecuted) {
                if (!_wasExecuted) { break; }
            } catch {
                // wrap this call in a try catch to prevent invalid cancels from blocking the loop
                try this.cancelIncreasePosition(key) returns (bool _wasCancelled) {
                    if (!_wasCancelled) { break; }
                } catch {}
            }

            delete increasePositionRequestKeys[index];
            index++;
        }

        increasePositionRequestKeysStart = index;
    }

    function executeDecreasePositions(uint256 _endIndex) external override onlyPositionKeeper {
        uint256 index = decreasePositionRequestKeysStart;
        uint256 length = decreasePositionRequestKeys.length;

        if (index >= length) { return; }

        if (_endIndex > length) {
            _endIndex = length;
        }

        while (index < _endIndex) {
            bytes32 key = decreasePositionRequestKeys[index];

            // if the request was executed then delete the key from the array
            // if the request was not executed then break from the loop, this can happen if the
            // minimum number of blocks has not yet passed
            // an error could be thrown if the request is too old
            // in case an error was thrown, cancel the request
            try this.executeDecreasePosition(key) returns (bool _wasExecuted) {
                if (!_wasExecuted) { break; }
            } catch {
                // wrap this call in a try catch to prevent invalid cancels from blocking the loop
                try this.cancelDecreasePosition(key) returns (bool _wasCancelled) {
                    if (!_wasCancelled) { break; }
                } catch {}
            }

            delete decreasePositionRequestKeys[index];
            index++;
        }

        decreasePositionRequestKeysStart = index;
    }

    function createIncreasePosition(
        IncreasePositionParams calldata params,
        uint256 _amountIn
    ) external payable nonReentrant returns (bytes32) {
        _setTraderReferralCode(params._referralCode);

        if (_amountIn > 0) {
            IRouter(router).pluginTransfer(params._collateralToken, msg.sender, address(this), _amountIn);
        }

        return _createIncreasePosition(
            msg.sender,
            _amountIn,
            params
        );
    }

    function createDecreasePosition(DecreasePositionParams calldata _params) external payable nonReentrant returns (bytes32) {
        // require(_params._path.length == 1 || _params._path.length == 2, "len");

        return _createDecreasePosition(
            msg.sender,
            _params
        );
    }

    function getRequestQueueLengths() external view returns (uint256, uint256, uint256, uint256) {
        return (
            increasePositionRequestKeysStart,
            increasePositionRequestKeys.length,
            decreasePositionRequestKeysStart,
            decreasePositionRequestKeys.length
        );
    }

    function executeIncreasePosition(bytes32 _key) public nonReentrant returns (bool) {
        IncreasePositionRequest memory request = increasePositionRequests[_key];
        // if the request was already executed or cancelled, return true so that the executeIncreasePositions loop will continue executing the next request
        if (request.account == address(0)) { return true; }

        bool shouldExecute = _validateExecution(request.blockNumber, request.blockTime, request.account);
        if (!shouldExecute) { return false; }

        delete increasePositionRequests[_key];

        if (request.amountIn > 0) {
            uint256 amountIn = request.amountIn;
            uint256 afterFeeAmount = _collectFees(msg.sender, request.collateralToken, amountIn, request.indexToken, request.isLong, request.sizeDelta);
            IERC20(request.collateralToken).safeTransfer(vault, afterFeeAmount);
        }

        _increasePosition(request.account, request.collateralToken, request.indexToken, request.sizeDelta, request.isLong, request.acceptablePrice, request.slPercent, request.tpPercent);

        emit ExecuteIncreasePosition(
            request.account,
            request.collateralToken,
            request.indexToken,
            request.amountIn,
            request.minOut,
            request.sizeDelta,
            request.isLong,
            request.acceptablePrice,
            request.slPercent,
            request.tpPercent,
            block.number.sub(request.blockNumber),
            block.timestamp.sub(request.blockTime)
        );

        _callRequestCallback(request.callbackTarget, _key, true, true);

        return true;
    }

    function cancelIncreasePosition(bytes32 _key) public nonReentrant returns (bool) {
        IncreasePositionRequest memory request = increasePositionRequests[_key];
        // if the request was already executed or cancelled, return true so that the executeIncreasePositions loop will continue executing the next request
        if (request.account == address(0)) { return true; }

        bool shouldCancel = _validateCancellation(request.blockNumber, request.blockTime, request.account);
        if (!shouldCancel) { return false; }

        delete increasePositionRequests[_key];

        IERC20(request.collateralToken).safeTransfer(request.account, request.amountIn);

        emit CancelIncreasePosition(
            request.account,
            request.collateralToken,
            request.indexToken,
            request.amountIn,
            request.minOut,
            request.sizeDelta,
            request.isLong,
            request.acceptablePrice,
            block.number.sub(request.blockNumber),
            block.timestamp.sub(request.blockTime)
        );

        _callRequestCallback(request.callbackTarget, _key, false, true);

        return true;
    }

    function executeDecreasePosition(bytes32 _key) public nonReentrant returns (bool) {
        DecreasePositionRequest memory request = decreasePositionRequests[_key];
        // if the request was already executed or cancelled, return true so that the executeDecreasePositions loop will continue executing the next request
        if (request.account == address(0)) { return true; }

        bool shouldExecute = _validateExecution(request.blockNumber, request.blockTime, request.account);
        if (!shouldExecute) { return false; }

        delete decreasePositionRequests[_key];

        uint256 amountOut = _decreasePosition(request.account, request.collateralToken, request.indexToken, request.collateralDelta, request.sizeDelta, request.isLong, address(this), request.acceptablePrice);

        if (amountOut > 0) {
            IERC20(request.collateralToken).safeTransfer(request.receiver, amountOut);
        }

        emit ExecuteDecreasePosition(
            request.account,
            request.collateralToken,
            request.indexToken,
            request.collateralDelta,
            request.sizeDelta,
            request.isLong,
            request.receiver,
            request.acceptablePrice,
            request.minOut,
            block.number.sub(request.blockNumber),
            block.timestamp.sub(request.blockTime)
        );

        _callRequestCallback(request.callbackTarget, _key, true, false);

        return true;
    }

    function cancelDecreasePosition(bytes32 _key) public nonReentrant returns (bool) {
        DecreasePositionRequest memory request = decreasePositionRequests[_key];
        // if the request was already executed or cancelled, return true so that the executeDecreasePositions loop will continue executing the next request
        if (request.account == address(0)) { return true; }

        bool shouldCancel = _validateCancellation(request.blockNumber, request.blockTime, request.account);
        if (!shouldCancel) { return false; }

        delete decreasePositionRequests[_key];

        emit CancelDecreasePosition(
            request.account,
            request.collateralToken,
            request.indexToken,
            request.collateralDelta,
            request.sizeDelta,
            request.isLong,
            request.receiver,
            request.acceptablePrice,
            request.minOut,
            block.number.sub(request.blockNumber),
            block.timestamp.sub(request.blockTime)
        );

        _callRequestCallback(request.callbackTarget, _key, false, false);

        return true;
    }

    function getRequestKey(address _account, uint256 _index) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_account, _index));
    }

    function getIncreasePositionRequestPath(bytes32 _key) public view returns (address) {
        IncreasePositionRequest memory request = increasePositionRequests[_key];
        return request.indexToken;
    }

    function getDecreasePositionRequestPath(bytes32 _key) public view returns (address) {
        DecreasePositionRequest memory request = decreasePositionRequests[_key];
        return request.indexToken;
    }

    function _setTraderReferralCode(bytes32 _referralCode) internal {
        if (_referralCode != bytes32(0) && referralStorage != address(0)) {
            IReferralStorage(referralStorage).setTraderReferralCode(msg.sender, _referralCode);
        }
    }

    function _validateExecution(uint256 _positionBlockNumber, uint256 _positionBlockTime, address _account) internal view returns (bool) {
        if (_positionBlockTime.add(maxTimeDelay) <= block.timestamp) {
            revert("expired");
        }

        bool isKeeperCall = msg.sender == address(this) || isPositionKeeper[msg.sender];

        if (!isLeverageEnabled && !isKeeperCall) {
            revert("403");
        }

        if (isKeeperCall) {
            return _positionBlockNumber.add(minBlockDelayKeeper) <= block.number;
        }

        require(msg.sender == _account, "403");

        require(_positionBlockTime.add(minTimeDelayPublic) <= block.timestamp, "delay");

        return true;
    }

    function _validateCancellation(uint256 _positionBlockNumber, uint256 _positionBlockTime, address _account) internal view returns (bool) {
        bool isKeeperCall = msg.sender == address(this) || isPositionKeeper[msg.sender];

        if (!isLeverageEnabled && !isKeeperCall) {
            revert("403");
        }

        if (isKeeperCall) {
            return _positionBlockNumber.add(minBlockDelayKeeper) <= block.number;
        }

        require(msg.sender == _account, "403");

        require(_positionBlockTime.add(minTimeDelayPublic) <= block.timestamp, "delay");

        return true;
    }

    function _createIncreasePosition(
        address _account,
        uint256 _amountIn,
        IncreasePositionParams calldata _params
    ) internal returns (bytes32) {
        IncreasePositionRequest memory request = IncreasePositionRequest(
            _account,
            _params._collateralToken,
            _params._indexToken,
            _amountIn,
            _params._minOut,
            _params._sizeDelta,
            _params._isLong,
            _params._acceptablePrice,
            _params._slPercent,
            _params._tpPercent,
            block.number,
            block.timestamp,
            _params._callbackTarget
        );

        (uint256 index, bytes32 requestKey) = _storeIncreasePositionRequest(request);
        emit CreateIncreasePosition(
            _account,
            _params._collateralToken,
            _params._indexToken,
            _amountIn,
            _params._minOut,
            _params._sizeDelta,
            _params._isLong,
            _params._acceptablePrice,
            _params._slPercent,
            _params._tpPercent,
            index,
            increasePositionRequestKeys.length - 1
        );

        return requestKey;
    }

    function _storeIncreasePositionRequest(IncreasePositionRequest memory _request) internal returns (uint256, bytes32) {
        address account = _request.account;
        uint256 index = increasePositionsIndex[account].add(1);
        increasePositionsIndex[account] = index;
        bytes32 key = getRequestKey(account, index);

        increasePositionRequests[key] = _request;
        increasePositionRequestKeys.push(key);

        return (index, key);
    }

    function _storeDecreasePositionRequest(DecreasePositionRequest memory _request) internal returns (uint256, bytes32) {
        address account = _request.account;
        uint256 index = decreasePositionsIndex[account].add(1);
        decreasePositionsIndex[account] = index;
        bytes32 key = getRequestKey(account, index);

        decreasePositionRequests[key] = _request;
        decreasePositionRequestKeys.push(key);

        return (index, key);
    }

    function _createDecreasePosition(
        address _account,
        DecreasePositionParams calldata _params
    ) internal returns (bytes32) {
        DecreasePositionRequest memory request = DecreasePositionRequest(
            _account,
            _params._collateralToken,
            _params._indexToken,
            _params._collateralDelta,
            _params._sizeDelta,
            _params._isLong,
            _params._receiver,
            _params._acceptablePrice,
            _params._minOut,
            block.number,
            block.timestamp,
            _params._callbackTarget
        );

        (uint256 index, bytes32 requestKey) = _storeDecreasePositionRequest(request);
        
        emit CreateDecreasePosition(
            request.account,
            request.collateralToken,
            request.indexToken,
            request.collateralDelta,
            request.sizeDelta,
            request.isLong,
            request.receiver,
            request.acceptablePrice,
            request.minOut,
            index,
            decreasePositionRequestKeys.length - 1
        );
        return requestKey;
    }

    function _callRequestCallback(
        address _callbackTarget,
        bytes32 _key,
        bool _wasExecuted,
        bool _isIncrease
    ) internal {
        if (_callbackTarget == address(0)) {
            return;
        }

        if (!Address.isContract(_callbackTarget)) {
            return;
        }

        uint256 _gasLimit = callbackGasLimit;
        if (_gasLimit == 0) {
            return;
        }

        bool success;
        try IPositionRouterCallbackReceiver(_callbackTarget).bluPositionCallback{ gas: _gasLimit }(_key, _wasExecuted, _isIncrease) {
            success = true;
        } catch {}

        emit Callback(_callbackTarget, success);
    }
}
