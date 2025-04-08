import { ethers } from "hardhat";

async function main() {
  console.log("Deploying TutorContract...");

  const tutorContract = await ethers.deployContract("TutorContract");
  await tutorContract.waitForDeployment();

  console.log(`TutorContract deployed to ${await tutorContract.getAddress()}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
