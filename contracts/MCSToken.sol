// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract MCSToken is ERC20 {
    constructor(address owner) ERC20("Vlad Token", "VLAD") {
        _mint(owner, 1000 * 10 ** decimals());
    }
}