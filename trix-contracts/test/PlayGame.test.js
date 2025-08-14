const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PlayGame Integration Test", function () {
  let usdt, gt, store, game;
  let owner, player1, player2;
  const stakeAmount = ethers.parseUnits("10", 18); // 10 GT

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy USDT
    const USDT = await ethers.getContractFactory("TestUSDT");
    usdt = await USDT.deploy(); // no .deployed()

    // Deploy GameToken
    const GT = await ethers.getContractFactory("GameToken");
    gt = await GT.deploy();

    // Deploy TokenStore
    const Store = await ethers.getContractFactory("TokenStore");
    store = await Store.deploy(usdt.target ?? usdt.address, gt.target ?? gt.address);

    // Transfer GT minting rights to TokenStore
    await gt.transferOwnership(store.target ?? store.address);

    // Deploy PlayGame
    const Game = await ethers.getContractFactory("PlayGame");
    game = await Game.deploy(gt.target ?? gt.address);
  });

  it("should mint USDT, buy GT, create match, stake, and payout winner", async function () {
    // 1️⃣ Mint USDT to players
    await usdt.mint(player1.address, stakeAmount);
    await usdt.mint(player2.address, stakeAmount);

    expect(await usdt.balanceOf(player1.address)).to.equal(stakeAmount);
    expect(await usdt.balanceOf(player2.address)).to.equal(stakeAmount);

    // 2️⃣ Players approve store
    await usdt.connect(player1).approve(store.target ?? store.address, stakeAmount);
    await usdt.connect(player2).approve(store.target ?? store.address, stakeAmount);

    // 3️⃣ Buy GT
    await store.connect(player1).buy(stakeAmount);
    await store.connect(player2).buy(stakeAmount);

    expect(await gt.balanceOf(player1.address)).to.equal(stakeAmount);
    expect(await gt.balanceOf(player2.address)).to.equal(stakeAmount);

    // 4️⃣ Create match
    const matchId = ethers.keccak256(ethers.toUtf8Bytes("match1"));
    await game.connect(owner).createMatch(matchId, player1.address, player2.address, stakeAmount);

    const matchData = await game.matches(matchId);
    expect(matchData.player1).to.equal(player1.address);
    expect(matchData.player2).to.equal(player2.address);

    // 5️⃣ Players stake GT
    await gt.connect(player1).approve(game.target ?? game.address, stakeAmount);
    await gt.connect(player2).approve(game.target ?? game.address, stakeAmount);

    await game.connect(player1).stake(matchId);
    await game.connect(player2).stake(matchId);

    const stakedMatch = await game.matches(matchId);
    expect(stakedMatch.p1Staked).to.be.true;
    expect(stakedMatch.p2Staked).to.be.true;

    // 6️⃣ Commit result → winner gets 2x stake
    const player1BalanceBefore = await gt.balanceOf(player1.address);
    const player2BalanceBefore = await gt.balanceOf(player2.address);

    await game.connect(owner).commitResult(matchId, player1.address);

    const player1BalanceAfter = await gt.balanceOf(player1.address);
    const player2BalanceAfter = await gt.balanceOf(player2.address);

    expect(player1BalanceAfter).to.equal(player1BalanceBefore + stakeAmount * 2n);
    expect(player2BalanceAfter).to.equal(player2BalanceBefore);
  });
});
