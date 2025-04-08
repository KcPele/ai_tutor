import { ethers } from "hardhat";

async function main() {
  console.log("Deploying StudySessionLogger contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const studySessionLogger = await ethers.deployContract("StudySessionLogger");
  await studySessionLogger.waitForDeployment();

  console.log(`StudySessionLogger deployed to ${studySessionLogger.target}`);
  console.log("Deployment complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
