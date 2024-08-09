// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/MintableBaseToken.sol";

contract BLP is MintableBaseToken {
    constructor() MintableBaseToken("BLU LP", "BLP", 0) {
    }

    function id() external pure returns (string memory _name) {
        return "BLP";
    }
}
