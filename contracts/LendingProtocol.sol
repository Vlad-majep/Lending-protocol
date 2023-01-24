// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./IERC20.sol";

contract ERC20  is IERC20 { 
  uint totalTokens;
  address owner;
  mapping(address => uint) balances;
  mapping(address => mapping(address => uint)) allowances;
  string _name;
  string _symbol;

  function name() external view returns(string memory) {
        return _name;
    }

    function symbol() external view returns(string memory) {
        return _symbol;
    }

    function decimals() external pure returns(uint) {
        return 1; // 1 token = 1 wei
    }

    function totalSupply() external view returns(uint) {
        return totalTokens;
    }

    modifier enoughTokens(address _from, uint _amount) {
        require(balanceOf(_from) >= _amount, "not enough tokens!");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not an owner!");
        _;
    }
    constructor(string memory name_, string memory symbol_, uint initialSupply) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
        mint(initialSupply, owner);
    }

    function balanceOf(address account) public view returns(uint) {
        return balances[account];
    }

    function transfer(address to, uint amount) external enoughTokens(msg.sender, amount) {
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    function mint(uint amount, address shop) public onlyOwner {
        balances[shop] += amount;
        totalTokens += amount;
        emit Transfer(address(0), shop, amount);
    }

    function burn(address _from, uint amount) public onlyOwner {
        balances[_from] -= amount;
        totalTokens -= amount;
    }

    function allowance(address _owner, address spender) public view returns(uint) {
        return allowances[_owner][spender];
    }

    function approve(address spender, uint amount) public {
        _approve(msg.sender, spender, amount);
    }

    function _approve(address sender, address spender, uint amount) internal virtual {
        allowances[sender][spender] = amount;
        emit Approve(sender, spender, amount);
    }

    function transferFrom(address sender, address recipient, uint amount) public enoughTokens(sender, amount) {
        allowances[sender][recipient] -= amount; // error!

        balances[sender] -= amount;
        balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }
}

contract MCSToken is ERC20 {
    constructor(address owner) ERC20("MCSToken", "MCT", 100000) {}
}
contract LendingProtocol {
  IERC20 public token;
  address payable public owner;
  mapping(address => uint) public tokenSupply;
  mapping(address => uint) public totalCollateral;
  mapping(address => uint) public totalBorrowed;


  constructor() {
        token = new MCSToken(address(this));
        owner = payable(msg.sender);
  }

  modifier onlyOwner() {
        require(msg.sender == owner, "not an owner!");
        _;
  }
  
  function deposit(address _token, uint256 _amount) public payable{ 
    require(_amount > 0, "Amount must be greater than 0"); 
    IERC20(_token).transfer(address(this), _amount);  
    tokenSupply[_token] += _amount; 
    totalCollateral[_token] += _amount; 
  } 
 
  function borrow(address _token, uint256 _amount) public payable{ 
    require(_amount > 0, "Amount must be greater than 0"); 
    uint256 collateralAmount = totalCollateral[_token]; 
    require(collateralAmount > 0, "There is no collateral available to borrow against"); 
    uint256 maxBorrowAmount = collateralAmount * 8 / 10; 
    require(_amount <= maxBorrowAmount, "Borrow amount exceeds the maximum borrow amount based on collateral"); 
    IERC20(_token).transferFrom(address(this), msg.sender, _amount); 
    totalBorrowed[_token] += _amount; 
  } 
 
  function repay(address _token, uint256 _amount) public payable{ 
    require(_amount > 0, "Amount must be greater than 0"); 
    uint256 borrowedAmount = totalBorrowed[_token]; 
    require(borrowedAmount >= _amount, "Repay amount exceeds the total borrowed amount"); 
    IERC20(_token).transfer(address(this), _amount); 
    totalBorrowed[_token] -= _amount; 
  } 
}