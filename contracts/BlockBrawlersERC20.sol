// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @dev Contract for wrapping sFuel into an ERC20 token
 * 
 */
contract BlockBrawlersERC20 {
    address public _tokenManager;

    uint256 _totalSupply = 270000000 * 10 **18;
    mapping(address => uint256) private _balances;

    uint256 decimals = 18;
    string name = "Block Brawlers";
    string symbol = "BRAWL";

    bool lock = false;

    event ExitBalance(address user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyTokenManager() {
      require(msg.sender == _tokenManager, "Can only be called by TokenManager");
      _;
    }

    constructor(address tokenManager) {
      _tokenManager = tokenManager;
    }

    function totalSupply() public view returns (uint256) {
      return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
      if(account == _tokenManager) {
        return _totalSupply;
      } else {
        return _balances[account];
      }
    }

    function allowance(address owner, address spender) public view returns (uint256) {
      return _balances[owner];
    }

    function fundExit() external payable {
      require(msg.sender == tx.origin, "EOA only");
      require(!lock, "not locked");
      lock = true;
      uint256 fundingAmount = msg.value;
      if(
        msg.sender.balance < 10 ** 16 && 
        fundingAmount > 10 ** 16 && 
        // If the user has sent all their BRAWL, they don't have enough to pay for gas,
        //   and can't complete the transaction. Now we give them a little back.
        payable(msg.sender).send(10 ** 16)
      ) {
        fundingAmount -= 10 ** 16;
      }
      uint newBalance = _balances[msg.sender] + fundingAmount;
      _balances[msg.sender] = newBalance;
      emit Approval(msg.sender, _tokenManager, newBalance);
      emit ExitBalance(msg.sender, newBalance);
      emit Transfer(address(0), msg.sender, fundingAmount);
      lock = false;
    }

    function undoExit() external {
      require(!lock, "not locked");
      lock = true;
      uint256 exitAmount = _balances[msg.sender];
      delete _balances[msg.sender];
      if(payable(address(this)).send(exitAmount)) {
        emit Approval(msg.sender, _tokenManager, 0);
        emit ExitBalance(msg.sender, 0);
        emit Transfer(msg.sender, address(0), exitAmount);
      }
      lock = false;
    }

    // Used by the Token Manager to deliver tokens back to users af
    function transfer(address to, uint256 amount) public onlyTokenManager returns (bool) {
      require(!lock, "not locked");
      lock = true;
      if(payable(to).send(amount)) {
        emit Transfer(_tokenManager, address(0), amount);
        return true;
      }
      lock = false;
      return false;
    }

    function transferFrom(
      address from,
      address to,
      uint256 amount
    ) public onlyTokenManager returns (bool) {
      require(!lock, "not locked");
      lock = true;
      require(_balances[from] == amount);
      delete _balances[from];
      emit Approval(from, _tokenManager, 0);
      emit ExitBalance(from, 0);
      emit Transfer(from, _tokenManager, amount);
      lock = false;
      return true;
    }
}
