// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IPositionRouter {
    function increasePositionRequestKeysStart() external returns (uint256);
    function decreasePositionRequestKeysStart() external returns (uint256);
    function executeIncreasePositions(uint256 _count) external;
    function executeDecreasePositions(uint256 _count) external;
}
