const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the MovieNFT contract
  const MovieNFT = await ethers.getContractFactory("MovieNFT");
  const movieNFT = await MovieNFT.deploy(); // Add arguments if the constructor requires them

  await movieNFT.deployed();

  console.log("MovieNFT deployed to:", movieNFT.address);

  // Save contract ABI and address to the frontend
  const contractData = {
    abi: JSON.parse(
      fs.readFileSync(
        "./artifacts/contracts/MovieNFT.sol/MovieNFT.json",
        "utf-8"
      )
    ).abi,
    networks: {
      [network.config.chainId]: {
        address: movieNFT.address,
      },
    },
  };

  // Paths for saving the contract data
  const frontendPath = path.resolve(
    __dirname,
    "../client/contracts/MovieNFT.json"
  );
  const srcPath = path.resolve(__dirname, "../src/contracts/MovieNFT.json");

  // Ensure the client/contracts directory exists
  const frontendDir = path.dirname(frontendPath);
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // Ensure the src/contracts directory exists
  const srcDir = path.dirname(srcPath);
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
  }

  // Write the updated contract data to the frontend
  fs.writeFileSync(frontendPath, JSON.stringify(contractData, null, 2));
  console.log("Contract ABI and address saved to:", frontendPath);

  // Write the updated contract data to src/contracts
  fs.writeFileSync(srcPath, JSON.stringify(contractData, null, 2));
  console.log("Contract ABI and address saved to:", srcPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment:", error);
    process.exit(1);
  });
