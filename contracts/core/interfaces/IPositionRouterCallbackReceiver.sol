// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IPositionRouterCallbackReceiver {
    function bluPositionCallback(bytes32 positionKey, bool isExecuted, bool isIncrease) external;
}
