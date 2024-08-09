// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/MintableBaseToken.sol";

contract Bluespade is MintableBaseToken {
    constructor() MintableBaseToken("Bluespade", "BLU", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "BLU";
    }
}
