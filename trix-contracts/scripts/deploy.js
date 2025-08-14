const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy USDT
  const USDT = await hre.ethers.getContractFactory("TestUSDT");
  const usdt = await USDT.deploy(); // deployed immediately
  console.log("USDT deployed at:", usdt.target); // use .target in v6

  // Deploy GameToken
  const GT = await hre.ethers.getContractFactory("GameToken");
  const gt = await GT.deploy();
  console.log("GameToken deployed at:", gt.target);

  // Deploy TokenStore
  const Store = await hre.ethers.getContractFactory("TokenStore");
  const store = await Store.deploy(usdt.target, gt.target);
  console.log("TokenStore deployed at:", store.target);

  // Transfer GT minting rights to TokenStore
  await gt.transferOwnership(store.target);
  console.log("Transferred GT ownership to TokenStore");

  // Deploy PlayGame
  const Game = await hre.ethers.getContractFactory("PlayGame");
  const game = await Game.deploy(gt.target);
  console.log("PlayGame deployed at:", game.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
