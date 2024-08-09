
// SPDX-License-Identifier: MIT

import "hardhat/console.sol";

pragma solidity ^0.8.0;

contract MaliciousTraderTest {
    event Received();

    address public positionRouter;

    constructor(address _positionRouter) {
        positionRouter = _positionRouter;
    }

    receive() external payable {
        // just consume lot of gas
        uint256 a;
        for (uint i = 0; i < 1000000; i++) {
            a = a * i;
        }
        emit Received();
    }
}
