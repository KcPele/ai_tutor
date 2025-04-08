import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { SubscriptionManager } from "../typechain-types";

describe("SubscriptionManager", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySubscriptionManagerFixture() {
    // Get signers (accounts)
    const [owner, subscriber1, subscriber2, newOwner] =
      await hre.ethers.getSigners();

    // Deploy the SubscriptionManager contract
    const SubscriptionManagerFactory = await hre.ethers.getContractFactory(
      "SubscriptionManager"
    );
    const subscriptionManager =
      (await SubscriptionManagerFactory.deploy()) as SubscriptionManager;

    // Define test plan data
    const freePlanData = {
      name: "Free",
      price: hre.ethers.parseEther("0"), // 0 EDU
      duration: BigInt(30 * 24 * 60 * 60), // 30 days in seconds
    };

    const basicPlanData = {
      name: "Basic",
      price: hre.ethers.parseEther("0.01"), // 0.01 EDU
      duration: BigInt(30 * 24 * 60 * 60), // 30 days in seconds
    };

    const proPlanData = {
      name: "Pro",
      price: hre.ethers.parseEther("0.05"), // 0.05 EDU
      duration: BigInt(30 * 24 * 60 * 60), // 30 days in seconds
    };

    return {
      subscriptionManager,
      owner,
      subscriber1,
      subscriber2,
      newOwner,
      freePlanData,
      basicPlanData,
      proPlanData,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { subscriptionManager, owner } = await loadFixture(
        deploySubscriptionManagerFixture
      );
      expect(await subscriptionManager.owner()).to.equal(owner.address);
    });

    it("Should initialize nextPlanId to 0", async function () {
      const { subscriptionManager } = await loadFixture(
        deploySubscriptionManagerFixture
      );
      expect(await subscriptionManager.nextPlanId()).to.equal(0);
    });
  });

  describe("Plan Management", function () {
    describe("Adding Plans", function () {
      it("Should allow the owner to add a plan", async function () {
        const { subscriptionManager, freePlanData } = await loadFixture(
          deploySubscriptionManagerFixture
        );

        await expect(
          subscriptionManager.addPlan(
            freePlanData.name,
            freePlanData.price,
            freePlanData.duration
          )
        )
          .to.emit(subscriptionManager, "PlanAdded")
          .withArgs(
            0,
            freePlanData.name,
            freePlanData.price,
            freePlanData.duration
          );

        expect(await subscriptionManager.nextPlanId()).to.equal(1);
      });

      it("Should store plan details correctly", async function () {
        const { subscriptionManager, freePlanData } = await loadFixture(
          deploySubscriptionManagerFixture
        );

        await subscriptionManager.addPlan(
          freePlanData.name,
          freePlanData.price,
          freePlanData.duration
        );

        const planDetails = await subscriptionManager.getPlanDetails(0);
        expect(planDetails.id).to.equal(0);
        expect(planDetails.name).to.equal(freePlanData.name);
        expect(planDetails.price).to.equal(freePlanData.price);
        expect(planDetails.duration).to.equal(freePlanData.duration);
        expect(planDetails.isActive).to.equal(true);
      });

      it("Should revert if non-owner tries to add a plan", async function () {
        const { subscriptionManager, freePlanData, subscriber1 } =
          await loadFixture(deploySubscriptionManagerFixture);

        await expect(
          subscriptionManager
            .connect(subscriber1)
            .addPlan(
              freePlanData.name,
              freePlanData.price,
              freePlanData.duration
            )
        ).to.be.revertedWith("SubscriptionManager: Caller is not the owner");
      });

      it("Should revert if name is empty", async function () {
        const { subscriptionManager, freePlanData } = await loadFixture(
          deploySubscriptionManagerFixture
        );

        await expect(
          subscriptionManager.addPlan(
            "",
            freePlanData.price,
            freePlanData.duration
          )
        ).to.be.revertedWith("Plan name cannot be empty");
      });

      it("Should revert if duration is zero", async function () {
        const { subscriptionManager, freePlanData } = await loadFixture(
          deploySubscriptionManagerFixture
        );

        await expect(
          subscriptionManager.addPlan(
            freePlanData.name,
            freePlanData.price,
            BigInt(0)
          )
        ).to.be.revertedWith("Duration must be positive");
      });
    });

    describe("Updating Plans", function () {
      it("Should allow the owner to update a plan", async function () {
        const { subscriptionManager, freePlanData, basicPlanData } =
          await loadFixture(deploySubscriptionManagerFixture);

        // Add a plan first
        await subscriptionManager.addPlan(
          freePlanData.name,
          freePlanData.price,
          freePlanData.duration
        );

        // Update the plan
        await expect(
          subscriptionManager.updatePlan(
            0,
            basicPlanData.name,
            basicPlanData.price,
            basicPlanData.duration,
            false // Set isActive to false
          )
        )
          .to.emit(subscriptionManager, "PlanUpdated")
          .withArgs(
            0,
            basicPlanData.name,
            basicPlanData.price,
            basicPlanData.duration,
            false
          );

        // Verify the update
        const planDetails = await subscriptionManager.getPlanDetails(0);
        expect(planDetails.name).to.equal(basicPlanData.name);
        expect(planDetails.price).to.equal(basicPlanData.price);
        expect(planDetails.duration).to.equal(basicPlanData.duration);
        expect(planDetails.isActive).to.equal(false);
      });

      it("Should revert if trying to update a non-existent plan", async function () {
        const { subscriptionManager, basicPlanData } = await loadFixture(
          deploySubscriptionManagerFixture
        );

        await expect(
          subscriptionManager.updatePlan(
            0,
            basicPlanData.name,
            basicPlanData.price,
            basicPlanData.duration,
            true
          )
        ).to.be.revertedWith("Plan ID does not exist");
      });

      it("Should revert if non-owner tries to update a plan", async function () {
        const {
          subscriptionManager,
          freePlanData,
          basicPlanData,
          subscriber1,
        } = await loadFixture(deploySubscriptionManagerFixture);

        // Add a plan first
        await subscriptionManager.addPlan(
          freePlanData.name,
          freePlanData.price,
          freePlanData.duration
        );

        // Try to update as non-owner
        await expect(
          subscriptionManager
            .connect(subscriber1)
            .updatePlan(
              0,
              basicPlanData.name,
              basicPlanData.price,
              basicPlanData.duration,
              true
            )
        ).to.be.revertedWith("SubscriptionManager: Caller is not the owner");
      });
    });
  });

  describe("Subscriptions", function () {
    it("Should allow users to subscribe to a plan", async function () {
      const { subscriptionManager, basicPlanData, subscriber1 } =
        await loadFixture(deploySubscriptionManagerFixture);

      // Add a plan first
      await subscriptionManager.addPlan(
        basicPlanData.name,
        basicPlanData.price,
        basicPlanData.duration
      );

      // Subscribe to the plan
      const latestTime = BigInt(await time.latest());
      await expect(
        subscriptionManager
          .connect(subscriber1)
          .subscribe(0, { value: basicPlanData.price })
      )
        .to.emit(subscriptionManager, "Subscribed")
        .withArgs(subscriber1.address, 0, anyValue, basicPlanData.price);

      // Verify subscription details
      const subDetails = await subscriptionManager.getSubscriptionStatus(
        subscriber1.address
      );
      expect(subDetails.planId_).to.equal(0);
      expect(subDetails.expiresAt_).to.be.closeTo(
        latestTime + basicPlanData.duration,
        BigInt(5) // Allow a small variance due to block time differences
      );
    });

    it("Should extend subscription if already active", async function () {
      const { subscriptionManager, basicPlanData, subscriber1 } =
        await loadFixture(deploySubscriptionManagerFixture);

      // Add a plan first
      await subscriptionManager.addPlan(
        basicPlanData.name,
        basicPlanData.price,
        basicPlanData.duration
      );

      // Subscribe to the plan
      await subscriptionManager
        .connect(subscriber1)
        .subscribe(0, { value: basicPlanData.price });

      // Get the current expiry
      const subDetails1 = await subscriptionManager.getSubscriptionStatus(
        subscriber1.address
      );
      const initialExpiryTime = subDetails1.expiresAt_;

      // Subscribe again (renew)
      await subscriptionManager
        .connect(subscriber1)
        .subscribe(0, { value: basicPlanData.price });

      // Verify that the expiry time has been extended
      const subDetails2 = await subscriptionManager.getSubscriptionStatus(
        subscriber1.address
      );
      expect(subDetails2.expiresAt_).to.equal(
        initialExpiryTime + basicPlanData.duration
      );
    });

    it("Should reject subscription with incorrect payment", async function () {
      const { subscriptionManager, basicPlanData, subscriber1 } =
        await loadFixture(deploySubscriptionManagerFixture);

      // Add a plan first
      await subscriptionManager.addPlan(
        basicPlanData.name,
        basicPlanData.price,
        basicPlanData.duration
      );

      // Try to subscribe with incorrect payment
      const incorrectPayment = hre.ethers.parseEther("0.005"); // Less than required

      await expect(
        subscriptionManager
          .connect(subscriber1)
          .subscribe(0, { value: incorrectPayment })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should reject subscription to inactive plan", async function () {
      const { subscriptionManager, basicPlanData, subscriber1 } =
        await loadFixture(deploySubscriptionManagerFixture);

      // Add a plan first and then deactivate it
      await subscriptionManager.addPlan(
        basicPlanData.name,
        basicPlanData.price,
        basicPlanData.duration
      );

      await subscriptionManager.updatePlan(
        0,
        basicPlanData.name,
        basicPlanData.price,
        basicPlanData.duration,
        false // Set isActive to false
      );

      // Try to subscribe to inactive plan
      await expect(
        subscriptionManager
          .connect(subscriber1)
          .subscribe(0, { value: basicPlanData.price })
      ).to.be.revertedWith("Plan is not active");
    });

    it("Should correctly report active subscription status", async function () {
      const { subscriptionManager, basicPlanData, subscriber1 } =
        await loadFixture(deploySubscriptionManagerFixture);

      // Add a plan first
      await subscriptionManager.addPlan(
        basicPlanData.name,
        basicPlanData.price,
        basicPlanData.duration
      );

      // Initially, no active subscription
      expect(
        await subscriptionManager.isSubscriptionActive(subscriber1.address)
      ).to.equal(false);

      // Subscribe to the plan
      await subscriptionManager
        .connect(subscriber1)
        .subscribe(0, { value: basicPlanData.price });

      // Now subscription should be active
      expect(
        await subscriptionManager.isSubscriptionActive(subscriber1.address)
      ).to.equal(true);

      // Fast forward past expiration
      await time.increase(Number(basicPlanData.duration) + 1);

      // Subscription should be expired now
      expect(
        await subscriptionManager.isSubscriptionActive(subscriber1.address)
      ).to.equal(false);
    });
  });

  describe("Contract Management", function () {
    it("Should allow the owner to withdraw funds", async function () {
      const { subscriptionManager, owner, basicPlanData, subscriber1 } =
        await loadFixture(deploySubscriptionManagerFixture);

      // Add a plan first
      await subscriptionManager.addPlan(
        basicPlanData.name,
        basicPlanData.price,
        basicPlanData.duration
      );

      // Subscribe to add funds to the contract
      await subscriptionManager
        .connect(subscriber1)
        .subscribe(0, { value: basicPlanData.price });

      // Withdraw funds
      await expect(subscriptionManager.withdrawFunds())
        .to.emit(subscriptionManager, "FundsWithdrawn")
        .withArgs(owner.address, basicPlanData.price);

      // Check that the owner's balance increased
      await expect(subscriptionManager.withdrawFunds()).to.be.revertedWith(
        "No funds to withdraw"
      );
    });

    it("Should allow the owner to transfer ownership", async function () {
      const { subscriptionManager, owner, newOwner } = await loadFixture(
        deploySubscriptionManagerFixture
      );

      // Transfer ownership
      await expect(subscriptionManager.transferOwnership(newOwner.address))
        .to.emit(subscriptionManager, "OwnershipTransferred")
        .withArgs(owner.address, newOwner.address);

      // Verify new owner
      expect(await subscriptionManager.owner()).to.equal(newOwner.address);

      // Old owner should no longer have privileges
      await expect(
        subscriptionManager.addPlan("Test", BigInt(0), BigInt(1))
      ).to.be.revertedWith("SubscriptionManager: Caller is not the owner");

      // New owner should have privileges
      await expect(
        subscriptionManager
          .connect(newOwner)
          .addPlan("Test", BigInt(0), BigInt(1))
      ).not.to.be.reverted;
    });

    it("Should revert ownership transfer to zero address", async function () {
      const { subscriptionManager } = await loadFixture(
        deploySubscriptionManagerFixture
      );

      // Attempt to transfer ownership to zero address
      await expect(
        subscriptionManager.transferOwnership(hre.ethers.ZeroAddress)
      ).to.be.revertedWith("New owner cannot be the zero address");
    });
  });
});
