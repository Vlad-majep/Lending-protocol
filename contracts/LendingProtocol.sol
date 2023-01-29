// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MCSToken is ERC20 {
    constructor(address owner) ERC20("MCSToken", "MCT") {
        _mint(owner, 1000);
    }
}

contract LendingProtocol {
    IERC20 public token; 
    mapping(address => uint) public tokenSupply;
    mapping(address => uint) public totalCollateral;
    mapping(address => uint) public totalBorrowed;
    mapping(address => mapping(address => uint)) public userCollateral;
    mapping(address => mapping(address => uint)) public userBorrowed;


    function deposit(address _token, uint _amount) public { 
        require(_amount > 0, "Amount must be greater than 0"); 
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        tokenSupply[_token] += _amount; 
        totalCollateral[_token] += _amount;
        userCollateral[_token][msg.sender] += _amount;
    } 
    
    function borrow(address _token, uint _amount) public { 
        require(_amount > 0, "Amount must be greater than 0"); 
        uint collateralAmount = userCollateral[_token][msg.sender]; 
        require(collateralAmount > 0, "There is no collateral available to borrow against"); 
        uint maxBorrowAmount = collateralAmount * 8 / 10; 
        require(_amount <= maxBorrowAmount, "Borrow amount exceeds the maximum borrow amount based on collateral"); 
        IERC20(_token).transfer(msg.sender, _amount); 
        totalBorrowed[_token] += _amount;
        userBorrowed[_token][msg.sender] += _amount;
    } 
    
    function repay(address _token, uint _amount) public { 
        require(_amount > 0, "Amount must be greater than 0"); 
        uint borrowedAmount = userBorrowed[_token][msg.sender]; 
        require(borrowedAmount >= _amount, "Repay amount exceeds the total borrowed amount"); 
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        userBorrowed[_token][msg.sender] -= _amount;
        totalBorrowed[_token] -= _amount; 
    }

    function liquidate(address _token) public  {
        require(userBorrowed[_token][msg.sender] < userCollateral[_token][msg.sender] * 8/10, "Your borrow is not liquidate");
        uint amount = totalBorrowed[_token];
        totalBorrowed[_token] -= amount;
        IERC20(_token).transferFrom(msg.sender, address(this), amount);
        amount = totalCollateral[_token];
        tokenSupply[_token] -= amount;
        totalCollateral[_token] -= amount;
        IERC20(_token).transfer(msg.sender, amount);
        delete userBorrowed[_token][msg.sender];
        delete userCollateral[_token][msg.sender];
    }
}