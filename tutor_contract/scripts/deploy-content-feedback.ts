import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ContentFeedback contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const contentFeedback = await ethers.deployContract("ContentFeedback");
  await contentFeedback.waitForDeployment();

  console.log(`ContentFeedback deployed to ${contentFeedback.target}`);
  console.log("Deployment complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
