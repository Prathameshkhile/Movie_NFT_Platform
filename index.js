require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const { ethers } = require("ethers");
const MovieNFT = require("./artifacts/contracts/MovieNFT.sol/MovieNFT.json");

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545", {
  name: "localhost",
  chainId: 31337, // Default Hardhat network ID
});
const signer = provider.getSigner(0); // Specify account index to avoid ENS resolution issues

const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const MovieNFTContract = new ethers.Contract(
  contractAddress,
  MovieNFT.abi,
  signer
);

app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.post("/mint", async (req, res) => {
  try {
    const { recipient, tokenURI } = req.body;
    const tx = await MovieNFTContract.mintNFT(recipient, tokenURI);
    await tx.wait();
    res.status(200).send("NFT Minted Successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error minting NFT");
  }
});
