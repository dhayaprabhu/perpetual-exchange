// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IBluIou {
    function mint(address account, uint256 amount) external returns (bool);
}
