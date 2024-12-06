require("dotenv").config(); // If you decide to use environment variables
const { ethers, artifacts, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const MovieNFT = await ethers.getContractFactory(
    "contracts/MovieNft.sol:MovieNFT"
  );

  const basePrice = process.env.BASE_PRICE || "0.1"; // Use an env variable or default to 0.1
  console.log(`Deploying MovieNFT with base price: ${basePrice} ETH`);

  const movieNFT = await MovieNFT.deploy(
    "MovieNFT",
    "MNFT",
    ethers.utils.parseEther(basePrice)
  );

  await movieNFT.deployed();
  console.log("MovieNFT deployed to:", movieNFT.address);

  const contractArtifact = await artifacts.readArtifact(
    "contracts/MovieNft.sol:MovieNFT"
  );
  const networkId = network.config.chainId;

  const contractDetails = {
    address: movieNFT.address,
    ...contractArtifact,
    networks: {
      [networkId]: {
        address: movieNFT.address,
        transactionHash: movieNFT.deployTransaction.hash,
      },
    },
  };

  const outputPath = path.join(
    __dirname,
    "./artifacts/contracts/MovieNFT.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(contractDetails, null, 2));
  console.log("Contract details saved to:", outputPath);

  // Optional: Verify the contract on Etherscan
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await movieNFT.deployTransaction.wait(5); // Wait for 5 block confirmations
    await hre.run("verify:verify", {
      address: movieNFT.address,
      constructorArguments: [
        "MovieNFT",
        "MNFT",
        ethers.utils.parseEther(basePrice),
      ],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment:", error);
    process.exit(1);
  });

  const availableMovies = async (contractAddress, tokenIdArray) => {
    const movieNFT = await ethers.getContractAt("MovieNFT", contractAddress);
    const movies = [];
  
    for (const tokenId of tokenIdArray) {
      const movie = await movieNFT.tokenIdToMovie(tokenId);
      movies.push({ tokenId, movie });
    }
    return movies;
  };
  

