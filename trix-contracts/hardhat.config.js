require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
const { RPC_URL, PRIVATE_KEY_SERVER } = process.env;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: RPC_URL,
      accounts: [PRIVATE_KEY_SERVER],
    },
  },
};
