// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LendingProtocol is ERC20 {
    IERC20 public token;
    address payable public owner;
    mapping(address => uint) public tokenSupply;
    mapping(address => uint) public totalCollateral;
    mapping(address => uint) public totalBorrowed;


    constructor(uint initialSupply) ERC20("ROCKET", "ROC") {
            owner = payable(msg.sender);
            _mint(msg.sender, initialSupply);
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

        function checkLiquidation(address _token) public{
            require(totalBorrowed[_token] > totalCollateral[_token] * 8/10, "Your borrow is not liquidate");
            liquidate(_token);
        }

        function liquidate(address _token) public {
        uint256 amount = totalBorrowed[_token];
        IERC20(_token).transferFrom(owner, address(this), amount);
        amount = totalCollateral[_token];
        IERC20(_token).transfer(owner, amount);
        delete totalBorrowed[_token];
        delete totalCollateral[_token];
    }
    }