// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (token/ERC20/ERC20.sol)

pragma solidity ^0.8.0;

interface ITokenManager {

    function exitToMainFromOriginERC20(
        address contractOnMainnet,
        uint256 amount
    ) external;

    function transferToSchainFromOriginERC20(
        string calldata targetSchainName,
        address contractOnMainnet,
        uint256 amount
    ) external;
}
