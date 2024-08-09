// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "./interfaces/IRewardTracker.sol";
import "./interfaces/IVester.sol";
import "../tokens/interfaces/IMintable.sol";
import "../core/interfaces/IBlpManager.sol";
import "../access/Governable.sol";

contract RewardRouterV2 is ReentrancyGuard, Governable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;
    using Address for address payable;

    bool public isInitialized;

    address public collateralToken;
    address public blu;
    address public esBlu;
    address public bnBlu;

    address public blp; // BLU Liquidity Provider token

    address public stakedBluTracker;
    address public bonusBluTracker;
    address public feeBluTracker;

    address public stakedBlpTracker;
    address public feeBlpTracker;

    address public blpManager;

    address public bluVester;
    address public blpVester;

    mapping (address => address) public pendingReceivers;

    event StakeBlu(address account, address token, uint256 amount);
    event UnstakeBlu(address account, address token, uint256 amount);

    event StakeBlp(address account, uint256 amount);
    event UnstakeBlp(address account, uint256 amount);

    receive() external payable {
    }

    struct initParams{
        address _collateralToken;
        address _blu;
        address _esBlu;
        address _bnBlu;
        address _blp;
        address _stakedBluTracker;
        address _bonusBluTracker;
        address _feeBluTracker;
        address _feeBlpTracker;
        address _stakedBlpTracker;
        address _blpManager;
        address _bluVester;
        address _blpVester;
    }

    function initialize(initParams memory params) external onlyGov {
        require(!isInitialized, "RewardRouter: already initialized");
        isInitialized = true;

        collateralToken = params._collateralToken;

        blu = params._blu;
        esBlu = params._esBlu;
        bnBlu = params._bnBlu;

        blp = params._blp;

        stakedBluTracker = params._stakedBluTracker;
        bonusBluTracker = params._bonusBluTracker;
        feeBluTracker = params._feeBluTracker;

        feeBlpTracker = params._feeBlpTracker;
        stakedBlpTracker = params._stakedBlpTracker;

        blpManager = params._blpManager;

        bluVester = params._bluVester;
        blpVester = params._blpVester;
    }

    // to help users who accidentally send their tokens to this contract
    function withdrawToken(address _token, address _account, uint256 _amount) external onlyGov {
        IERC20(_token).safeTransfer(_account, _amount);
    }

    function batchStakeBluForAccount(address[] memory _accounts, uint256[] memory _amounts) external nonReentrant onlyGov {
        address _blu = blu;
        for (uint256 i = 0; i < _accounts.length; i++) {
            _stakeBlu(msg.sender, _accounts[i], _blu, _amounts[i]);
        }
    }

    function stakeBluForAccount(address _account, uint256 _amount) external nonReentrant onlyGov {
        _stakeBlu(msg.sender, _account, blu, _amount);
    }

    function stakeBlu(uint256 _amount) external nonReentrant {
        _stakeBlu(msg.sender, msg.sender, blu, _amount);
    }

    function stakeEsBlu(uint256 _amount) external nonReentrant {
        _stakeBlu(msg.sender, msg.sender, esBlu, _amount);
    }

    function unstakeBlu(uint256 _amount) external nonReentrant {
        _unstakeBlu(msg.sender, blu, _amount, true);
    }

    function unstakeEsBlu(uint256 _amount) external nonReentrant {
        _unstakeBlu(msg.sender, esBlu, _amount, true);
    }

    function mintAndStakeBlp(address _token, uint256 _amount, uint256 _minUsdg, uint256 _minBlp) external nonReentrant returns (uint256) {
        require(_amount > 0, "RewardRouter: invalid _amount");
        require(_token == collateralToken, "RewardRouter: invalid _token");

        address account = msg.sender;
        uint256 blpAmount = IBlpManager(blpManager).addLiquidityForAccount(account, account, _token, _amount, _minUsdg, _minBlp);
        IRewardTracker(feeBlpTracker).stakeForAccount(account, account, blp, blpAmount);
        IRewardTracker(stakedBlpTracker).stakeForAccount(account, account, feeBlpTracker, blpAmount);

        emit StakeBlp(account, blpAmount);

        return blpAmount;
    }

    function unstakeAndRedeemBlp(address _tokenOut, uint256 _blpAmount, uint256 _minOut, address _receiver) external nonReentrant returns (uint256) {
        require(_blpAmount > 0, "RewardRouter: invalid _blpAmount");

        address account = msg.sender;
        IRewardTracker(stakedBlpTracker).unstakeForAccount(account, feeBlpTracker, _blpAmount, account);
        IRewardTracker(feeBlpTracker).unstakeForAccount(account, blp, _blpAmount, account);
        uint256 amountOut = IBlpManager(blpManager).removeLiquidityForAccount(account, _tokenOut, _blpAmount, _minOut, _receiver);

        emit UnstakeBlp(account, _blpAmount);

        return amountOut;
    }

    function claim() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeBluTracker).claimForAccount(account, account);
        IRewardTracker(feeBlpTracker).claimForAccount(account, account);

        IRewardTracker(stakedBluTracker).claimForAccount(account, account);
        IRewardTracker(stakedBlpTracker).claimForAccount(account, account);
    }

    function claimEsBlu() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(stakedBluTracker).claimForAccount(account, account);
        IRewardTracker(stakedBlpTracker).claimForAccount(account, account);
    }

    function claimFees() external nonReentrant {
        address account = msg.sender;

        IRewardTracker(feeBluTracker).claimForAccount(account, account);
        IRewardTracker(feeBlpTracker).claimForAccount(account, account);
    }

    function compound() external nonReentrant {
        _compound(msg.sender);
    }

    function compoundForAccount(address _account) external nonReentrant onlyGov {
        _compound(_account);
    }

    function handleRewards(
        bool _shouldClaimBlu,
        bool _shouldStakeBlu,
        bool _shouldClaimEsBlu,
        bool _shouldStakeEsBlu,
        bool _shouldStakeMultiplierPoints,
        bool _shouldClaimToken
    ) external nonReentrant {
        address account = msg.sender;

        uint256 bluAmount = 0;
        if (_shouldClaimBlu) {
            uint256 bluAmount0 = IVester(bluVester).claimForAccount(account, account);
            uint256 bluAmount1 = IVester(blpVester).claimForAccount(account, account);
            bluAmount = bluAmount0.add(bluAmount1);
        }

        if (_shouldStakeBlu && bluAmount > 0) {
            _stakeBlu(account, account, blu, bluAmount);
        }

        uint256 esBluAmount = 0;
        if (_shouldClaimEsBlu) {
            uint256 esBluAmount0 = IRewardTracker(stakedBluTracker).claimForAccount(account, account);
            uint256 esBluAmount1 = IRewardTracker(stakedBlpTracker).claimForAccount(account, account);
            esBluAmount = esBluAmount0.add(esBluAmount1);
        }

        if (_shouldStakeEsBlu && esBluAmount > 0) {
            _stakeBlu(account, account, esBlu, esBluAmount);
        }

        if (_shouldStakeMultiplierPoints) {
            uint256 bnBluAmount = IRewardTracker(bonusBluTracker).claimForAccount(account, account);
            if (bnBluAmount > 0) {
                IRewardTracker(feeBluTracker).stakeForAccount(account, account, bnBlu, bnBluAmount);
            }
        }

        if (_shouldClaimToken) {
            IRewardTracker(feeBluTracker).claimForAccount(account, account);
            IRewardTracker(feeBlpTracker).claimForAccount(account, account);
        }
    }

    function batchCompoundForAccounts(address[] memory _accounts) external nonReentrant onlyGov {
        for (uint256 i = 0; i < _accounts.length; i++) {
            _compound(_accounts[i]);
        }
    }

    function signalTransfer(address _receiver) external nonReentrant {
        require(IERC20(bluVester).balanceOf(msg.sender) == 0, "RewardRouter: sender has vested tokens");
        require(IERC20(blpVester).balanceOf(msg.sender) == 0, "RewardRouter: sender has vested tokens");

        _validateReceiver(_receiver);
        pendingReceivers[msg.sender] = _receiver;
    }

    function acceptTransfer(address _sender) external nonReentrant {
        require(IERC20(bluVester).balanceOf(_sender) == 0, "RewardRouter: sender has vested tokens");
        require(IERC20(blpVester).balanceOf(_sender) == 0, "RewardRouter: sender has vested tokens");

        address receiver = msg.sender;
        require(pendingReceivers[_sender] == receiver, "RewardRouter: transfer not signalled");
        delete pendingReceivers[_sender];

        _validateReceiver(receiver);
        _compound(_sender);

        uint256 stakedBlu = IRewardTracker(stakedBluTracker).depositBalances(_sender, blu);
        if (stakedBlu > 0) {
            _unstakeBlu(_sender, blu, stakedBlu, false);
            _stakeBlu(_sender, receiver, blu, stakedBlu);
        }

        uint256 stakedEsBlu = IRewardTracker(stakedBluTracker).depositBalances(_sender, esBlu);
        if (stakedEsBlu > 0) {
            _unstakeBlu(_sender, esBlu, stakedEsBlu, false);
            _stakeBlu(_sender, receiver, esBlu, stakedEsBlu);
        }

        uint256 stakedBnBlu = IRewardTracker(feeBluTracker).depositBalances(_sender, bnBlu);
        if (stakedBnBlu > 0) {
            IRewardTracker(feeBluTracker).unstakeForAccount(_sender, bnBlu, stakedBnBlu, _sender);
            IRewardTracker(feeBluTracker).stakeForAccount(_sender, receiver, bnBlu, stakedBnBlu);
        }

        uint256 esBluBalance = IERC20(esBlu).balanceOf(_sender);
        if (esBluBalance > 0) {
            IERC20(esBlu).transferFrom(_sender, receiver, esBluBalance);
        }

        uint256 blpAmount = IRewardTracker(feeBlpTracker).depositBalances(_sender, blp);
        if (blpAmount > 0) {
            IRewardTracker(stakedBlpTracker).unstakeForAccount(_sender, feeBlpTracker, blpAmount, _sender);
            IRewardTracker(feeBlpTracker).unstakeForAccount(_sender, blp, blpAmount, _sender);

            IRewardTracker(feeBlpTracker).stakeForAccount(_sender, receiver, blp, blpAmount);
            IRewardTracker(stakedBlpTracker).stakeForAccount(receiver, receiver, feeBlpTracker, blpAmount);
        }

        IVester(bluVester).transferStakeValues(_sender, receiver);
        IVester(blpVester).transferStakeValues(_sender, receiver);
    }

    function _validateReceiver(address _receiver) private view {
        require(IRewardTracker(stakedBluTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: stakedBluTracker.averageStakedAmounts > 0");
        require(IRewardTracker(stakedBluTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: stakedBluTracker.cumulativeRewards > 0");

        require(IRewardTracker(bonusBluTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: bonusBluTracker.averageStakedAmounts > 0");
        require(IRewardTracker(bonusBluTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: bonusBluTracker.cumulativeRewards > 0");

        require(IRewardTracker(feeBluTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: feeBluTracker.averageStakedAmounts > 0");
        require(IRewardTracker(feeBluTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: feeBluTracker.cumulativeRewards > 0");

        require(IVester(bluVester).transferredAverageStakedAmounts(_receiver) == 0, "RewardRouter: bluVester.transferredAverageStakedAmounts > 0");
        require(IVester(bluVester).transferredCumulativeRewards(_receiver) == 0, "RewardRouter: bluVester.transferredCumulativeRewards > 0");

        require(IRewardTracker(stakedBlpTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: stakedBlpTracker.averageStakedAmounts > 0");
        require(IRewardTracker(stakedBlpTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: stakedBlpTracker.cumulativeRewards > 0");

        require(IRewardTracker(feeBlpTracker).averageStakedAmounts(_receiver) == 0, "RewardRouter: feeBlpTracker.averageStakedAmounts > 0");
        require(IRewardTracker(feeBlpTracker).cumulativeRewards(_receiver) == 0, "RewardRouter: feeBlpTracker.cumulativeRewards > 0");

        require(IVester(blpVester).transferredAverageStakedAmounts(_receiver) == 0, "RewardRouter: bluVester.transferredAverageStakedAmounts > 0");
        require(IVester(blpVester).transferredCumulativeRewards(_receiver) == 0, "RewardRouter: bluVester.transferredCumulativeRewards > 0");

        require(IERC20(bluVester).balanceOf(_receiver) == 0, "RewardRouter: bluVester.balance > 0");
        require(IERC20(blpVester).balanceOf(_receiver) == 0, "RewardRouter: blpVester.balance > 0");
    }

    function _compound(address _account) private {
        _compoundBlu(_account);
        _compoundBlp(_account);
    }

    function _compoundBlu(address _account) private {
        uint256 esBluAmount = IRewardTracker(stakedBluTracker).claimForAccount(_account, _account);
        if (esBluAmount > 0) {
            _stakeBlu(_account, _account, esBlu, esBluAmount);
        }

        uint256 bnBluAmount = IRewardTracker(bonusBluTracker).claimForAccount(_account, _account);
        if (bnBluAmount > 0) {
            IRewardTracker(feeBluTracker).stakeForAccount(_account, _account, bnBlu, bnBluAmount);
        }
    }

    function _compoundBlp(address _account) private {
        uint256 esBluAmount = IRewardTracker(stakedBlpTracker).claimForAccount(_account, _account);
        if (esBluAmount > 0) {
            _stakeBlu(_account, _account, esBlu, esBluAmount);
        }
    }

    function _stakeBlu(address _fundingAccount, address _account, address _token, uint256 _amount) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        IRewardTracker(stakedBluTracker).stakeForAccount(_fundingAccount, _account, _token, _amount);
        IRewardTracker(bonusBluTracker).stakeForAccount(_account, _account, stakedBluTracker, _amount);
        IRewardTracker(feeBluTracker).stakeForAccount(_account, _account, bonusBluTracker, _amount);

        emit StakeBlu(_account, _token, _amount);
    }

    function _unstakeBlu(address _account, address _token, uint256 _amount, bool _shouldReduceBnBlu) private {
        require(_amount > 0, "RewardRouter: invalid _amount");

        uint256 balance = IRewardTracker(stakedBluTracker).stakedAmounts(_account);

        IRewardTracker(feeBluTracker).unstakeForAccount(_account, bonusBluTracker, _amount, _account);
        IRewardTracker(bonusBluTracker).unstakeForAccount(_account, stakedBluTracker, _amount, _account);
        IRewardTracker(stakedBluTracker).unstakeForAccount(_account, _token, _amount, _account);

        if (_shouldReduceBnBlu) {
            uint256 bnBluAmount = IRewardTracker(bonusBluTracker).claimForAccount(_account, _account);
            if (bnBluAmount > 0) {
                IRewardTracker(feeBluTracker).stakeForAccount(_account, _account, bnBlu, bnBluAmount);
            }

            uint256 stakedBnBlu = IRewardTracker(feeBluTracker).depositBalances(_account, bnBlu);
            if (stakedBnBlu > 0) {
                uint256 reductionAmount = stakedBnBlu.mul(_amount).div(balance);
                IRewardTracker(feeBluTracker).unstakeForAccount(_account, bnBlu, reductionAmount, _account);
                IMintable(bnBlu).burn(_account, reductionAmount);
            }
        }

        emit UnstakeBlu(_account, _token, _amount);
    }
}
