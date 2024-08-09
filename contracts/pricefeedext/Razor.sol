// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITransparentForwarder {
    /**
     * @dev using the hash of collection name, clients can query the result of that collection
     * @param _name bytes32 hash of the collection name
     * @return result of the collection and its power
     */
    function getResult(bytes32 _name) external payable returns (uint256, int8);
}

contract DataFeed {
    ITransparentForwarder public transparentForwarder;

    constructor() {
        transparentForwarder = ITransparentForwarder(0xbF5c5AD799b2245BA36562BebfcbAbc5D508Eb84);
    }

    // @notice fetch collection result by name
    // @param _name bytes32 hash of the collection name
    // @return result of the collection and its power
    // @return power
    function getResult(bytes32 name) public payable returns (uint256, int8) {
        (uint256 result, int8 power) = transparentForwarder.getResult{
            value: msg.value
        }(name);
        return (result, power);
    }
}