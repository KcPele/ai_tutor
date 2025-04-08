import { ethers } from "hardhat";

async function main() {
  console.log("Deploying SubscriptionManager contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const subscriptionManager = await ethers.deployContract(
    "SubscriptionManager"
  );
  await subscriptionManager.waitForDeployment();

  console.log(`SubscriptionManager deployed to ${subscriptionManager.target}`);

  // Define initial plans
  const freePlan = {
    name: "Free",
    price: ethers.parseEther("0"),
    duration: BigInt(90 * 24 * 60 * 60), // 90 days in seconds
  };

  const basicPlan = {
    name: "Basic",
    price: ethers.parseEther("0.01"), // 0.01 EDU
    duration: BigInt(30 * 24 * 60 * 60), // 30 days in seconds
  };

  const proPlan = {
    name: "Pro",
    price: ethers.parseEther("0.05"), // 0.05 EDU
    duration: BigInt(30 * 24 * 60 * 60), // 30 days in seconds
  };

  // Add plans
  console.log("Adding initial subscription plans...");

  const freeTx = await subscriptionManager.addPlan(
    freePlan.name,
    freePlan.price,
    freePlan.duration
  );
  await freeTx.wait();
  console.log(`Added ${freePlan.name} plan`);

  const basicTx = await subscriptionManager.addPlan(
    basicPlan.name,
    basicPlan.price,
    basicPlan.duration
  );
  await basicTx.wait();
  console.log(`Added ${basicPlan.name} plan`);

  const proTx = await subscriptionManager.addPlan(
    proPlan.name,
    proPlan.price,
    proPlan.duration
  );
  await proTx.wait();
  console.log(`Added ${proPlan.name} plan`);

  console.log("Deployment and initial setup complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
