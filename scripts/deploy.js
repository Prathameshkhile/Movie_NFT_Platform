const hre = require("hardhat");
const { errors } = require("web3");

async function main() {
  const MovieNFT = await ethers.getContractFactory("MovieNFT");
  const movieNFT = await MovieNFT.deploy();
  await movieNFT.deployed();

  console.log("MovieNFT deployed to: ", movieNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitcode = 1;
});
