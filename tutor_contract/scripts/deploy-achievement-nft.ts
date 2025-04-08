import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AchievementNFT contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Base URI for the metadata
  const baseURI = "https://ai-tutor-app.example/api/achievements/";

  const achievementNFT = await ethers.deployContract("AchievementNFT", [
    baseURI,
  ]);
  await achievementNFT.waitForDeployment();

  console.log(`AchievementNFT deployed to ${achievementNFT.target}`);

  // Define initial achievement types
  console.log("Adding initial achievement types...");

  const achievements = [
    "First Login - Welcome aboard!",
    "First Lesson Completed - You're on your way!",
    "10 Hours of Study - Dedication pays off!",
    "Document Master - Uploaded 5 documents",
    "Quiz Champion - Scored 100% on a quiz",
  ];

  for (const achievement of achievements) {
    const tx = await achievementNFT.addAchievementType(achievement);
    await tx.wait();
    console.log(`Added achievement: ${achievement}`);
  }

  console.log("Deployment and initial setup complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
