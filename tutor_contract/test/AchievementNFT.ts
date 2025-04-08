import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { AchievementNFT } from "../typechain-types";

describe("AchievementNFT", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployAchievementNFTFixture() {
    // Get signers (accounts)
    const [owner, user1, user2, newOwner] = await hre.ethers.getSigners();

    // Deploy the AchievementNFT contract
    const baseURI = "https://ai-tutor-app.example/metadata/";
    const AchievementNFTFactory =
      await hre.ethers.getContractFactory("AchievementNFT");
    const achievementNFT = (await AchievementNFTFactory.deploy(
      baseURI
    )) as AchievementNFT;

    return { achievementNFT, baseURI, owner, user1, user2, newOwner };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { achievementNFT, owner } = await loadFixture(
        deployAchievementNFTFixture
      );
      expect(await achievementNFT.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      const { achievementNFT } = await loadFixture(deployAchievementNFTFixture);
      expect(await achievementNFT.name()).to.equal("AI Tutor Achievements");
      expect(await achievementNFT.symbol()).to.equal("AITA");
    });

    it("Should initialize nextAchievementTypeId to 0", async function () {
      const { achievementNFT } = await loadFixture(deployAchievementNFTFixture);
      expect(await achievementNFT.nextAchievementTypeId()).to.equal(0);
    });
  });

  describe("Achievement Types", function () {
    it("Should allow the owner to add achievement types", async function () {
      const { achievementNFT } = await loadFixture(deployAchievementNFTFixture);

      await expect(achievementNFT.addAchievementType("Completed First Lesson"))
        .to.emit(achievementNFT, "AchievementTypeAdded")
        .withArgs(0, "Completed First Lesson");

      expect(await achievementNFT.nextAchievementTypeId()).to.equal(1);
      expect(await achievementNFT.getAchievementTypeDescription(0)).to.equal(
        "Completed First Lesson"
      );
    });

    it("Should allow adding multiple achievement types", async function () {
      const { achievementNFT } = await loadFixture(deployAchievementNFTFixture);

      await achievementNFT.addAchievementType("Completed First Lesson");
      await achievementNFT.addAchievementType("10 Hours of Study");
      await achievementNFT.addAchievementType("Mastered Calculus");

      expect(await achievementNFT.nextAchievementTypeId()).to.equal(3);
      expect(await achievementNFT.getAchievementTypeDescription(0)).to.equal(
        "Completed First Lesson"
      );
      expect(await achievementNFT.getAchievementTypeDescription(1)).to.equal(
        "10 Hours of Study"
      );
      expect(await achievementNFT.getAchievementTypeDescription(2)).to.equal(
        "Mastered Calculus"
      );
    });

    it("Should not allow non-owners to add achievement types", async function () {
      const { achievementNFT, user1 } = await loadFixture(
        deployAchievementNFTFixture
      );

      await expect(
        achievementNFT
          .connect(user1)
          .addAchievementType("Unauthorized Achievement")
      ).to.be.revertedWithCustomError(
        achievementNFT,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Awarding Achievements", function () {
    it("Should allow the owner to award achievements", async function () {
      const { achievementNFT, user1 } = await loadFixture(
        deployAchievementNFTFixture
      );

      // Add an achievement type first
      await achievementNFT.addAchievementType("Completed First Lesson");

      // Award achievement to user1
      await expect(achievementNFT.awardAchievement(user1.address, 0))
        .to.emit(achievementNFT, "AchievementAwarded")
        .withArgs(user1.address, 0, 0);

      // Check token ownership
      expect(await achievementNFT.ownerOf(0)).to.equal(user1.address);
      expect(await achievementNFT.balanceOf(user1.address)).to.equal(1);
      expect(await achievementNFT.getTokenAchievementType(0)).to.equal(0);
    });

    it("Should increment token IDs correctly when awarding multiple achievements", async function () {
      const { achievementNFT, user1, user2 } = await loadFixture(
        deployAchievementNFTFixture
      );

      // Add achievement types
      await achievementNFT.addAchievementType("Completed First Lesson");
      await achievementNFT.addAchievementType("10 Hours of Study");

      // Award achievements
      await achievementNFT.awardAchievement(user1.address, 0);
      await achievementNFT.awardAchievement(user2.address, 0);
      await achievementNFT.awardAchievement(user1.address, 1);

      // Check token ownership and types
      expect(await achievementNFT.ownerOf(0)).to.equal(user1.address);
      expect(await achievementNFT.ownerOf(1)).to.equal(user2.address);
      expect(await achievementNFT.ownerOf(2)).to.equal(user1.address);

      expect(await achievementNFT.balanceOf(user1.address)).to.equal(2);
      expect(await achievementNFT.balanceOf(user2.address)).to.equal(1);

      expect(await achievementNFT.getTokenAchievementType(0)).to.equal(0);
      expect(await achievementNFT.getTokenAchievementType(1)).to.equal(0);
      expect(await achievementNFT.getTokenAchievementType(2)).to.equal(1);
    });

    it("Should revert when trying to award non-existent achievement types", async function () {
      const { achievementNFT, user1 } = await loadFixture(
        deployAchievementNFTFixture
      );

      await expect(
        achievementNFT.awardAchievement(user1.address, 0)
      ).to.be.revertedWith("Achievement type does not exist");
    });

    it("Should not allow non-owners to award achievements", async function () {
      const { achievementNFT, user1 } = await loadFixture(
        deployAchievementNFTFixture
      );

      // Add an achievement type first
      await achievementNFT.addAchievementType("Completed First Lesson");

      // Try to award achievement as non-owner
      await expect(
        achievementNFT.connect(user1).awardAchievement(user1.address, 0)
      ).to.be.revertedWithCustomError(
        achievementNFT,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  describe("Token URIs", function () {
    it("Should return correct token URIs", async function () {
      const { achievementNFT, user1, baseURI } = await loadFixture(
        deployAchievementNFTFixture
      );

      // Add an achievement type and award it
      await achievementNFT.addAchievementType("Completed First Lesson");
      await achievementNFT.awardAchievement(user1.address, 0);

      // Check token URI
      expect(await achievementNFT.tokenURI(0)).to.equal(baseURI + "0");
    });

    it("Should allow the owner to update base URI", async function () {
      const { achievementNFT, user1 } = await loadFixture(
        deployAchievementNFTFixture
      );

      // Add an achievement type and award it
      await achievementNFT.addAchievementType("Completed First Lesson");
      await achievementNFT.awardAchievement(user1.address, 0);

      // Update base URI
      const newBaseURI = "https://new-metadata-server.example/";
      await achievementNFT.setBaseURI(newBaseURI);

      // Check token URI with new base URI
      expect(await achievementNFT.tokenURI(0)).to.equal(newBaseURI + "0");
    });

    it("Should revert when querying URI for non-existent token", async function () {
      const { achievementNFT } = await loadFixture(deployAchievementNFTFixture);

      await expect(achievementNFT.tokenURI(0)).to.be.reverted;
    });
  });

  describe("Ownership", function () {
    it("Should allow transferring ownership", async function () {
      const { achievementNFT, owner, newOwner } = await loadFixture(
        deployAchievementNFTFixture
      );

      // Transfer ownership
      await achievementNFT.transferOwnership(newOwner.address);

      // Check new owner
      expect(await achievementNFT.owner()).to.equal(newOwner.address);

      // Old owner should no longer have privileges
      await expect(
        achievementNFT.addAchievementType("Test")
      ).to.be.revertedWithCustomError(
        achievementNFT,
        "OwnableUnauthorizedAccount"
      );

      // New owner should have privileges
      await expect(achievementNFT.connect(newOwner).addAchievementType("Test"))
        .not.to.be.reverted;
    });
  });
});
