// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../access/Governable.sol";

contract SuperTrader is Governable{
    using SafeERC20 for IERC20;

    address public lpTrackerAddress;
    uint256 public lpCriteriaForSuperTrader;

    constructor() {
        lpTrackerAddress = 0x3E7B6f146c123BF86b2cB439a7296f88976323f7;
        lpCriteriaForSuperTrader = 1000 * 10 ** 18;
    }

    function setLPTrackerAddress(address _lpTrackerAddress) external onlyGov {
        lpTrackerAddress = _lpTrackerAddress;
    }

    function isSuperTrader(address _account) public view returns (bool) {
        if (IERC20(lpTrackerAddress).balanceOf(_account) >= lpCriteriaForSuperTrader)
            return true;
        else
            return false;
    }
}