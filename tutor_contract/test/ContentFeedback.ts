import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { ContentFeedback } from "../typechain-types";

describe("ContentFeedback", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployContentFeedbackFixture() {
    // Get signers (accounts)
    const [owner, user1, user2, newOwner] = await hre.ethers.getSigners();

    // Deploy the ContentFeedback contract
    const ContentFeedbackFactory =
      await hre.ethers.getContractFactory("ContentFeedback");
    const contentFeedback =
      (await ContentFeedbackFactory.deploy()) as ContentFeedback;

    // Example content identifiers and feedback
    const contentId1 = "pdf:math101:page5";
    const contentId2 = "video:chemistry:timestamp-302";
    const testComment1 = "Great explanation of derivatives!";
    const testComment2 = "Could use more examples on stoichiometry.";

    return {
      contentFeedback,
      owner,
      user1,
      user2,
      newOwner,
      contentId1,
      contentId2,
      testComment1,
      testComment2,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { contentFeedback, owner } = await loadFixture(
        deployContentFeedbackFixture
      );
      expect(await contentFeedback.owner()).to.equal(owner.address);
    });

    it("Should initialize feedbackCounter to 0", async function () {
      const { contentFeedback } = await loadFixture(
        deployContentFeedbackFixture
      );
      expect(await contentFeedback.feedbackCounter()).to.equal(0);
    });
  });

  describe("Submitting Feedback", function () {
    it("Should allow users to submit feedback with valid parameters", async function () {
      const { contentFeedback, user1, contentId1, testComment1 } =
        await loadFixture(deployContentFeedbackFixture);

      // Submit feedback with rating 4
      const rating = 4;
      await expect(
        contentFeedback
          .connect(user1)
          .submitFeedback(contentId1, rating, testComment1)
      )
        .to.emit(contentFeedback, "FeedbackSubmitted")
        .withArgs(0, user1.address, contentId1, rating, testComment1);

      // Check feedback counter
      expect(await contentFeedback.feedbackCounter()).to.equal(1);

      // Check user feedback count
      expect(
        await contentFeedback.getUserFeedbackCount(user1.address)
      ).to.equal(1);
    });

    it("Should store feedback details correctly", async function () {
      const { contentFeedback, user1, contentId1, testComment1 } =
        await loadFixture(deployContentFeedbackFixture);

      // Get the current timestamp
      const currentTime = await time.latest();

      // Submit feedback
      const rating = 5;
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, rating, testComment1);

      // Get feedback details
      const feedback = await contentFeedback.getFeedbackById(0);

      // Verify feedback details
      expect(feedback.user).to.equal(user1.address);
      expect(feedback.contentIdentifier).to.equal(contentId1);
      expect(feedback.rating).to.equal(rating);
      expect(feedback.comment).to.equal(testComment1);
      expect(feedback.timestamp).to.be.at.least(currentTime);
    });

    it("Should allow multiple feedback submissions", async function () {
      const {
        contentFeedback,
        user1,
        user2,
        contentId1,
        contentId2,
        testComment1,
        testComment2,
      } = await loadFixture(deployContentFeedbackFixture);

      // User 1 submits feedback
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, 4, testComment1);

      // User 2 submits feedback
      await contentFeedback
        .connect(user2)
        .submitFeedback(contentId2, 3, testComment2);

      // User 1 submits another feedback
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId2, 5, "Additional comment");

      // Check feedback counter
      expect(await contentFeedback.feedbackCounter()).to.equal(3);

      // Check user feedback counts
      expect(
        await contentFeedback.getUserFeedbackCount(user1.address)
      ).to.equal(2);
      expect(
        await contentFeedback.getUserFeedbackCount(user2.address)
      ).to.equal(1);
    });

    it("Should revert when rating is out of range", async function () {
      const { contentFeedback, user1, contentId1, testComment1 } =
        await loadFixture(deployContentFeedbackFixture);

      // Try with rating 0
      await expect(
        contentFeedback
          .connect(user1)
          .submitFeedback(contentId1, 0, testComment1)
      ).to.be.revertedWith("Rating must be between 1 and 5");

      // Try with rating 6
      await expect(
        contentFeedback
          .connect(user1)
          .submitFeedback(contentId1, 6, testComment1)
      ).to.be.revertedWith("Rating must be between 1 and 5");
    });

    it("Should revert when content identifier is empty", async function () {
      const { contentFeedback, user1, testComment1 } = await loadFixture(
        deployContentFeedbackFixture
      );

      await expect(
        contentFeedback.connect(user1).submitFeedback("", 4, testComment1)
      ).to.be.revertedWith("Content identifier required");
    });
  });

  describe("Retrieving Feedback", function () {
    it("Should allow retrieving feedback by ID", async function () {
      const { contentFeedback, user1, contentId1, testComment1 } =
        await loadFixture(deployContentFeedbackFixture);

      // Submit feedback
      const rating = 4;
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, rating, testComment1);

      // Retrieve feedback
      const feedback = await contentFeedback.getFeedbackById(0);

      // Verify feedback details
      expect(feedback.user).to.equal(user1.address);
      expect(feedback.contentIdentifier).to.equal(contentId1);
      expect(feedback.rating).to.equal(rating);
      expect(feedback.comment).to.equal(testComment1);
    });

    it("Should revert when retrieving non-existent feedback", async function () {
      const { contentFeedback } = await loadFixture(
        deployContentFeedbackFixture
      );

      await expect(contentFeedback.getFeedbackById(0)).to.be.revertedWith(
        "Feedback ID does not exist"
      );
    });

    it("Should allow retrieving user's feedback by index", async function () {
      const { contentFeedback, user1, contentId1, contentId2, testComment1 } =
        await loadFixture(deployContentFeedbackFixture);

      // Submit multiple feedback entries
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, 4, testComment1);
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId2, 5, "Another comment");

      // Retrieve feedback IDs
      const feedbackId0 = await contentFeedback.getUserFeedbackIdByIndex(
        user1.address,
        0
      );
      const feedbackId1 = await contentFeedback.getUserFeedbackIdByIndex(
        user1.address,
        1
      );

      // Verify feedback IDs
      expect(feedbackId0).to.equal(0);
      expect(feedbackId1).to.equal(1);

      // Verify feedback details
      const feedback0 = await contentFeedback.getFeedbackById(feedbackId0);
      expect(feedback0.contentIdentifier).to.equal(contentId1);

      const feedback1 = await contentFeedback.getFeedbackById(feedbackId1);
      expect(feedback1.contentIdentifier).to.equal(contentId2);
    });

    it("Should revert when index is out of bounds", async function () {
      const { contentFeedback, user1 } = await loadFixture(
        deployContentFeedbackFixture
      );

      await expect(
        contentFeedback.getUserFeedbackIdByIndex(user1.address, 0)
      ).to.be.revertedWith("Index out of bounds");
    });

    it("Should return all user feedback IDs", async function () {
      const { contentFeedback, user1, contentId1, contentId2 } =
        await loadFixture(deployContentFeedbackFixture);

      // Submit multiple feedback entries
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, 4, "Comment 1");
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId2, 5, "Comment 2");

      // Get all feedback IDs
      const feedbackIds = await contentFeedback.getAllUserFeedbackIds(
        user1.address
      );

      // Verify feedback IDs
      expect(feedbackIds.length).to.equal(2);
      expect(feedbackIds[0]).to.equal(0);
      expect(feedbackIds[1]).to.equal(1);
    });
  });

  describe("Rewarding Feedback", function () {
    it("Should allow the owner to reward feedback", async function () {
      const { contentFeedback, owner, user1, contentId1 } = await loadFixture(
        deployContentFeedbackFixture
      );

      // Submit feedback
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, 4, "Helpful comment");

      // Get initial user balance
      const initialBalance = await hre.ethers.provider.getBalance(
        user1.address
      );

      // Owner rewards the feedback
      const rewardAmount = hre.ethers.parseEther("0.1");
      await expect(
        contentFeedback
          .connect(owner)
          .rewardFeedback(0, { value: rewardAmount })
      )
        .to.emit(contentFeedback, "FeedbackRewarded")
        .withArgs(0, user1.address, rewardAmount);

      // Check user balance increased
      const finalBalance = await hre.ethers.provider.getBalance(user1.address);
      expect(finalBalance - initialBalance).to.equal(rewardAmount);
    });

    it("Should revert when non-owner tries to reward feedback", async function () {
      const { contentFeedback, user1, user2, contentId1 } = await loadFixture(
        deployContentFeedbackFixture
      );

      // Submit feedback
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, 4, "Comment");

      // User2 tries to reward feedback
      const rewardAmount = hre.ethers.parseEther("0.1");
      await expect(
        contentFeedback
          .connect(user2)
          .rewardFeedback(0, { value: rewardAmount })
      ).to.be.revertedWithCustomError(
        contentFeedback,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Should revert when rewarding non-existent feedback", async function () {
      const { contentFeedback, owner } = await loadFixture(
        deployContentFeedbackFixture
      );

      // Try to reward non-existent feedback
      const rewardAmount = hre.ethers.parseEther("0.1");
      await expect(
        contentFeedback
          .connect(owner)
          .rewardFeedback(0, { value: rewardAmount })
      ).to.be.revertedWith("Feedback ID does not exist");
    });

    it("Should revert when reward amount is zero", async function () {
      const { contentFeedback, owner, user1, contentId1 } = await loadFixture(
        deployContentFeedbackFixture
      );

      // Submit feedback
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, 4, "Comment");

      // Try to reward with zero amount
      await expect(
        contentFeedback.connect(owner).rewardFeedback(0, { value: 0 })
      ).to.be.revertedWith("Reward amount must be greater than 0");
    });
  });

  describe("Ownership", function () {
    it("Should allow transferring ownership", async function () {
      const { contentFeedback, owner, newOwner, user1, contentId1 } =
        await loadFixture(deployContentFeedbackFixture);

      // Transfer ownership
      await contentFeedback.connect(owner).transferOwnership(newOwner.address);

      // Verify new owner
      expect(await contentFeedback.owner()).to.equal(newOwner.address);

      // Submit feedback
      await contentFeedback
        .connect(user1)
        .submitFeedback(contentId1, 4, "Comment");

      // Old owner can't reward
      const rewardAmount = hre.ethers.parseEther("0.1");
      await expect(
        contentFeedback
          .connect(owner)
          .rewardFeedback(0, { value: rewardAmount })
      ).to.be.revertedWithCustomError(
        contentFeedback,
        "OwnableUnauthorizedAccount"
      );

      // New owner can reward
      await expect(
        contentFeedback
          .connect(newOwner)
          .rewardFeedback(0, { value: rewardAmount })
      ).not.to.be.reverted;
    });
  });
});
