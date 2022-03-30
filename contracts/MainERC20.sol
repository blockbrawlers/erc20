// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../contracts/ITokenManager";


/**
 * @dev Contract for wrapping sFuel into an ERC20 token
 * 
 */
contract MainERC20 {
    ITokenManager public _tokenManager;
    address public _mainnetContract;

    uint256 decimals = 18;
    string name = "Block Brawlers";
    string symbol = "BLOCK";

    modifier onlyTokenManager() {
      require(msg.sender == _tokenManager, "Can only be called by TokenManager");
      _;
    }

    constructor(address tokenManager, address mainnetContract) {
        _tokenManager = ITokenManager(tokenManager);
        _mainnetContract = mainnetContract;
    }

    function totalSupply() public view returns (uint256) {
        return 270000000 * 10 **18;
    }

    function balanceOf(address account) public view returns (uint256) {
        return 270000000 * 10 **18;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return 270000000 * 10 **18;
    }

    function exitToMainPayable()
      external
      payable
    {
        _tokenManager.exitToMainFromOriginERC20(_mainnetContract, msg.value);
    }

    function transferToSchainPayable(string calldata targetSchainName)
      external
      payable
    {
        _tokenManager.transferToSchainFromOriginERC20(targetSchainName, _mainnetContract, msg.value);
    }

    function transfer(address to, uint256 amount) public onlyTokenManager returns (bool) {
        to.send(amount);
        return true;
    }

    function mint(address to, uint256 amount) public onlyTokenManager {
        to.send(amount);
    }

    function burn(address to, uint256 amount) public {
        // Burn does nothing here
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        return true;
    }
}
