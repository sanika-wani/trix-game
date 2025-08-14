// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PlayGame is Ownable {
    IERC20 public gt;

    struct Match {
        address player1;
        address player2;
        uint256 stake;
        bool p1Staked;
        bool p2Staked;
        bool finished;
    }

    mapping(bytes32 => Match) public matches;

    constructor(address _gt) {
        gt = IERC20(_gt);
    }

    function createMatch(bytes32 matchId, address p1, address p2, uint256 stake) public onlyOwner {
        matches[matchId] = Match(p1, p2, stake, false, false, false);
    }

    function stake(bytes32 matchId) public {
        Match storage m = matches[matchId];
        require(msg.sender == m.player1 || msg.sender == m.player2, "Not in match");
        require(gt.transferFrom(msg.sender, address(this), m.stake), "Stake failed");

        if (msg.sender == m.player1) m.p1Staked = true;
        if (msg.sender == m.player2) m.p2Staked = true;
    }

    function commitResult(bytes32 matchId, address winner) public onlyOwner {
        Match storage m = matches[matchId];
        require(m.p1Staked && m.p2Staked, "Not both staked");
        require(!m.finished, "Already finished");

        gt.transfer(winner, m.stake * 2);
        m.finished = true;
    }
}
