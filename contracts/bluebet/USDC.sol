// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../tokens/MintableBaseToken.sol";

contract USDC is MintableBaseToken {
    constructor() MintableBaseToken("USDC", "USDC", 1000000) {
    }

    function id() external pure returns (string memory _name) {
        return "USDC";
    }
}
