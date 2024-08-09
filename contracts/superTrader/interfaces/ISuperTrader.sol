// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface ISuperTrader {
    function isSuperTrader(address _account) external view returns (bool);
}
