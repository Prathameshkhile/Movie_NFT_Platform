async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const MovieNFT = await ethers.getContractFactory("MovieNFT");
  const movieNFT = await MovieNFT.deploy(); // No arguments passed here

  await movieNFT.deployed();

  console.log("MovieNFT deployed to:", movieNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in deployment:", error);
    process.exit(1);
  });
