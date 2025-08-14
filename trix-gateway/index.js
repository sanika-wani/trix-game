require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const app = express();
app.use(express.json());

const PORT = 5000;

// Setup provider & server signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const serverWallet = new ethers.Wallet(process.env.PRIVATE_KEY_SERVER, provider);

// PlayGame ABI
const playGameAbi = [
  "function createMatch(bytes32 matchId, address p1, address p2, uint256 stake) external",
  "function commitResult(bytes32 matchId, address winner) external"
];

// PlayGame Contract
const playGame = new ethers.Contract(process.env.PLAYGAME_ADDRESS, playGameAbi, serverWallet);

// -----------------------------
// API: /api/createMatch
// -----------------------------
app.post("/api/createMatch", async (req, res) => {
  try {
    const { matchId, player1, player2, stake } = req.body;

    if (!matchId || !player1 || !player2 || !stake) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = await playGame.createMatch(matchId, player1, player2, stake);
    await tx.wait();

    res.json({ txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// API: /api/commitResult
// -----------------------------
app.post("/api/commitResult", async (req, res) => {
  try {
    const { matchId, winner } = req.body;

    if (!matchId || !winner) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = await playGame.commitResult(matchId, winner);
    await tx.wait();

    res.json({ txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
app.listen(PORT, () => console.log(`3XS API Gateway running on http://localhost:${PORT}`));
