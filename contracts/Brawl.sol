// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev BRAWL native token to ERC20 Contract
 *
 */
contract Brawl {
    address _tokenManager = 0xD2aAA00500000000000000000000000000000000;

    uint256 private _totalSupply = 270000000 * 10**18;
    mapping(address => uint256) private _balances;

    uint256 _decimals = 18;
    string _name = "Block Brawlers";
    string _symbol = "BRAWL";

    bool lock = false;

    event ExitBalance(address user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    modifier onlyTokenManager() {
        require(
            msg.sender == _tokenManager,
            "Can only be called by TokenManager"
        );
        _;
    }

    function decimals() public view returns (uint256) {
        return _decimals;
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        if (account == _tokenManager) {
            return _totalSupply;
        } else {
            return _balances[account];
        }
    }

    function allowance(address owner, address spender)
        public
        view
        returns (uint256)
    {
        return _balances[owner];
    }

    function fundExit() external payable {
        require(
            msg.sender == tx.origin,
            "EOA only, other addresses will not exist at the destination"
        );
        require(!lock, "not locked");
        lock = true;
        uint256 fundingAmount = msg.value;
        if (
            msg.sender.balance < 10**16 &&
            fundingAmount > 10**16 &&
            // If the user has sent all their BRAWL, they don't have enough to pay for gas,
            //   and can't complete the transaction. Now we give them a little back.
            payable(msg.sender).send(10**16)
        ) {
            fundingAmount -= 10**16;
        }
        uint256 newBalance = _balances[msg.sender] + fundingAmount;
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
        if (payable(address(msg.sender)).send(exitAmount)) {
            emit Approval(msg.sender, _tokenManager, 0);
            emit ExitBalance(msg.sender, 0);
            emit Transfer(msg.sender, address(0), exitAmount);
        }
        lock = false;
    }

    // Used by the Token Manager to deliver tokens back to users after deposit
    function transfer(address to, uint256 amount)
        public
        onlyTokenManager
        returns (bool)
    {
        require(!lock, "not locked");
        lock = true;
        bool isSucess = false;
        if (payable(to).send(amount)) {
            emit Transfer(_tokenManager, address(0), amount);
            isSucess = true;
        }
        lock = false;
        return isSucess;
    }

    // Used by the Token Manager to send tokens to other chains
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public onlyTokenManager returns (bool) {
        require(!lock, "not locked");
        lock = true;
        require(_balances[from] >= amount, "must have enough exit balance");
        uint256 newBalance = _balances[from] - amount;
        _balances[from] = newBalance;
        emit Approval(from, _tokenManager, newBalance);
        emit ExitBalance(from, newBalance);
        emit Transfer(from, _tokenManager, amount);
        lock = false;
        return true;
    }
}
