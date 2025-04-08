import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { StudySessionLogger } from "../typechain-types";

describe("StudySessionLogger", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployStudySessionLoggerFixture() {
    // Get signers (accounts)
    const [owner, user1, user2] = await hre.ethers.getSigners();

    // Deploy the StudySessionLogger contract
    const StudySessionLoggerFactory =
      await hre.ethers.getContractFactory("StudySessionLogger");
    const studySessionLogger =
      (await StudySessionLoggerFactory.deploy()) as StudySessionLogger;

    // Sample material identifiers
    const material1 = "pdf:calculus:chapter1";
    const material2 = "video:physics:mechanics";
    const material3 = "interactive:chemistry:lab1";

    return {
      studySessionLogger,
      owner,
      user1,
      user2,
      material1,
      material2,
      material3,
    };
  }

  describe("Deployment", function () {
    it("Should initialize totalSessionsLogged to 0", async function () {
      const { studySessionLogger } = await loadFixture(
        deployStudySessionLoggerFixture
      );
      expect(await studySessionLogger.totalSessionsLogged()).to.equal(0);
    });
  });

  describe("Logging Sessions", function () {
    it("Should allow a user to log a study session", async function () {
      const { studySessionLogger, user1, material1 } = await loadFixture(
        deployStudySessionLoggerFixture
      );

      // Get the current timestamp
      const currentTime = await time.latest();

      // Log a session
      await expect(studySessionLogger.connect(user1).logSessionStart(material1))
        .to.emit(studySessionLogger, "SessionLogged")
        .withArgs(0, user1.address, material1, anyValue);

      // Check totalSessionsLogged incremented
      expect(await studySessionLogger.totalSessionsLogged()).to.equal(1);

      // Check user session count
      expect(
        await studySessionLogger.getUserSessionCount(user1.address)
      ).to.equal(1);

      // Check session details
      const session = await studySessionLogger.getSessionDetails(0);
      expect(session.user).to.equal(user1.address);
      expect(session.materialIdentifier).to.equal(material1);
      expect(session.startTimestamp).to.be.at.least(currentTime);
    });

    it("Should revert with empty material identifier", async function () {
      const { studySessionLogger, user1 } = await loadFixture(
        deployStudySessionLoggerFixture
      );

      await expect(
        studySessionLogger.connect(user1).logSessionStart("")
      ).to.be.revertedWith("Material identifier required");
    });

    it("Should allow multiple users to log sessions", async function () {
      const { studySessionLogger, user1, user2, material1, material2 } =
        await loadFixture(deployStudySessionLoggerFixture);

      // User 1 logs a session
      await studySessionLogger.connect(user1).logSessionStart(material1);

      // User 2 logs a session
      await studySessionLogger.connect(user2).logSessionStart(material2);

      // Check total sessions
      expect(await studySessionLogger.totalSessionsLogged()).to.equal(2);

      // Check user session counts
      expect(
        await studySessionLogger.getUserSessionCount(user1.address)
      ).to.equal(1);
      expect(
        await studySessionLogger.getUserSessionCount(user2.address)
      ).to.equal(1);

      // Check session ownership
      const session1 = await studySessionLogger.getSessionDetails(0);
      expect(session1.user).to.equal(user1.address);

      const session2 = await studySessionLogger.getSessionDetails(1);
      expect(session2.user).to.equal(user2.address);
    });

    it("Should allow a user to log multiple sessions", async function () {
      const { studySessionLogger, user1, material1, material2, material3 } =
        await loadFixture(deployStudySessionLoggerFixture);

      // Log multiple sessions
      await studySessionLogger.connect(user1).logSessionStart(material1);
      await studySessionLogger.connect(user1).logSessionStart(material2);
      await studySessionLogger.connect(user1).logSessionStart(material3);

      // Check total sessions
      expect(await studySessionLogger.totalSessionsLogged()).to.equal(3);

      // Check user session count
      expect(
        await studySessionLogger.getUserSessionCount(user1.address)
      ).to.equal(3);

      // Check session details
      const session1 = await studySessionLogger.getUserSessionByIndex(
        user1.address,
        0
      );
      expect(session1.materialIdentifier).to.equal(material1);

      const session2 = await studySessionLogger.getUserSessionByIndex(
        user1.address,
        1
      );
      expect(session2.materialIdentifier).to.equal(material2);

      const session3 = await studySessionLogger.getUserSessionByIndex(
        user1.address,
        2
      );
      expect(session3.materialIdentifier).to.equal(material3);
    });
  });

  describe("Retrieving Session Data", function () {
    it("Should allow retrieving a session by ID", async function () {
      const { studySessionLogger, user1, material1 } = await loadFixture(
        deployStudySessionLoggerFixture
      );

      // Log a session
      await studySessionLogger.connect(user1).logSessionStart(material1);

      // Retrieve the session
      const session = await studySessionLogger.getSessionDetails(0);

      // Verify session details
      expect(session.user).to.equal(user1.address);
      expect(session.materialIdentifier).to.equal(material1);
    });

    it("Should revert when retrieving non-existent session ID", async function () {
      const { studySessionLogger } = await loadFixture(
        deployStudySessionLoggerFixture
      );

      await expect(studySessionLogger.getSessionDetails(0)).to.be.revertedWith(
        "Session ID does not exist"
      );
    });

    it("Should allow retrieving a user's session by index", async function () {
      const { studySessionLogger, user1, material1, material2 } =
        await loadFixture(deployStudySessionLoggerFixture);

      // Log multiple sessions
      await studySessionLogger.connect(user1).logSessionStart(material1);
      await studySessionLogger.connect(user1).logSessionStart(material2);

      // Retrieve the sessions
      const session1 = await studySessionLogger.getUserSessionByIndex(
        user1.address,
        0
      );
      const session2 = await studySessionLogger.getUserSessionByIndex(
        user1.address,
        1
      );

      // Verify session details
      expect(session1.materialIdentifier).to.equal(material1);
      expect(session2.materialIdentifier).to.equal(material2);
    });

    it("Should revert when accessing out of bounds user session index", async function () {
      const { studySessionLogger, user1, material1 } = await loadFixture(
        deployStudySessionLoggerFixture
      );

      // Log one session
      await studySessionLogger.connect(user1).logSessionStart(material1);

      // Try to access non-existent index
      await expect(
        studySessionLogger.getUserSessionByIndex(user1.address, 1)
      ).to.be.revertedWith("Index out of bounds");
    });

    it("Should return all session IDs for a user", async function () {
      const { studySessionLogger, user1, material1, material2 } =
        await loadFixture(deployStudySessionLoggerFixture);

      // Log multiple sessions
      await studySessionLogger.connect(user1).logSessionStart(material1);
      await studySessionLogger.connect(user1).logSessionStart(material2);

      // Get all session IDs
      const sessions = await studySessionLogger.getAllUserSessions(
        user1.address
      );

      // Verify session IDs
      expect(sessions.length).to.equal(2);
      expect(sessions[0]).to.equal(0);
      expect(sessions[1]).to.equal(1);
    });

    it("Should return an empty array for a user with no sessions", async function () {
      const { studySessionLogger, user1 } = await loadFixture(
        deployStudySessionLoggerFixture
      );

      // Get all session IDs for a user with no sessions
      const sessions = await studySessionLogger.getAllUserSessions(
        user1.address
      );

      // Verify empty array
      expect(sessions.length).to.equal(0);
    });

    it("Should return session IDs for a specific material", async function () {
      const { studySessionLogger, user1, user2, material1, material2 } =
        await loadFixture(deployStudySessionLoggerFixture);

      // Multiple users log sessions with the same material
      await studySessionLogger.connect(user1).logSessionStart(material1);
      await studySessionLogger.connect(user2).logSessionStart(material2);
      await studySessionLogger.connect(user1).logSessionStart(material2);

      // Get sessions for material2
      const sessions =
        await studySessionLogger.getSessionsByMaterial(material2);

      // Verify session IDs
      expect(sessions.length).to.equal(2);
      expect(sessions[0]).to.equal(1); // user2's session with material2
      expect(sessions[1]).to.equal(2); // user1's session with material2
    });

    it("Should return an empty array for a material with no sessions", async function () {
      const { studySessionLogger, user1, material1, material3 } =
        await loadFixture(deployStudySessionLoggerFixture);

      // Log a session with material1
      await studySessionLogger.connect(user1).logSessionStart(material1);

      // Get sessions for material3 (which has no sessions)
      const sessions =
        await studySessionLogger.getSessionsByMaterial(material3);

      // Verify empty array
      expect(sessions.length).to.equal(0);
    });
  });
});
