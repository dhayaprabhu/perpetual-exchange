// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IRewardRouterV2 {
    function feeBlpTracker() external view returns (address);
    function stakedBlpTracker() external view returns (address);
}