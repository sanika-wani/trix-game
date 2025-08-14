// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GameToken.sol";

contract TokenStore is Ownable {
    IERC20 public usdt;
    GameToken public gt;
    uint256 public rate = 1; // 1 USDT = 1 GT

    constructor(address _usdt, address _gt) {
        usdt = IERC20(_usdt);
        gt = GameToken(_gt);
    }

    function buy(uint256 usdtAmount) public {
        require(usdt.transferFrom(msg.sender, address(this), usdtAmount), "Transfer failed");
        gt.mint(msg.sender, usdtAmount * rate);
    }
}
