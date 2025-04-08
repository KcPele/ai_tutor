// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContentFeedback
 * @dev Allows users to provide feedback on AI explanations or content within the AI Tutor App
 */
contract ContentFeedback is Ownable {
    struct Feedback {
        address user;
        string contentIdentifier; // e.g., PDF hash + page number, or message ID
        uint8 rating; // e.g., 1-5
        string comment;
        uint256 timestamp;
    }

    uint256 public feedbackCounter;
    mapping(uint256 => Feedback) public feedbacks;

    // User to feedback IDs mapping for easy user-specific queries
    mapping(address => uint256[]) private userFeedbackIds;

    event FeedbackSubmitted(
        uint256 indexed feedbackId,
        address indexed user,
        string contentIdentifier,
        uint8 rating,
        string comment
    );

    event FeedbackRewarded(
        uint256 indexed feedbackId,
        address indexed user,
        uint256 amount
    );

    /**
     * @dev Initializes the contract with the deployer as the owner.
     */
    constructor() Ownable(msg.sender) {}

    /**
     * @dev Allows users to submit feedback.
     * @param _contentIdentifier An identifier for the content being reviewed.
     * @param _rating A numerical rating (e.g., 1-5).
     * @param _comment Textual feedback.
     * @return The ID of the submitted feedback.
     */
    function submitFeedback(
        string memory _contentIdentifier,
        uint8 _rating,
        string memory _comment
    ) public returns (uint256) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(
            bytes(_contentIdentifier).length > 0,
            "Content identifier required"
        );

        uint256 currentFeedbackId = feedbackCounter++;
        feedbacks[currentFeedbackId] = Feedback({
            user: msg.sender,
            contentIdentifier: _contentIdentifier,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp
        });

        // Store the feedback ID in the user's feedback list
        userFeedbackIds[msg.sender].push(currentFeedbackId);

        emit FeedbackSubmitted(
            currentFeedbackId,
            msg.sender,
            _contentIdentifier,
            _rating,
            _comment
        );
        return currentFeedbackId;
    }

    /**
     * @dev Allows the owner to reward a user for valuable feedback.
     * @param _feedbackId The ID of the feedback to reward.
     */
    function rewardFeedback(uint256 _feedbackId) public payable onlyOwner {
        require(_feedbackId < feedbackCounter, "Feedback ID does not exist");
        require(msg.value > 0, "Reward amount must be greater than 0");

        address user = feedbacks[_feedbackId].user;
        require(user != address(0), "Invalid user address");

        // Send the reward to the user
        (bool success, ) = user.call{value: msg.value}("");
        require(success, "Reward transfer failed");

        emit FeedbackRewarded(_feedbackId, user, msg.value);
    }

    /**
     * @dev Gets the number of feedback entries submitted by a user.
     * @param _user The address of the user.
     * @return The number of feedback entries.
     */
    function getUserFeedbackCount(address _user) public view returns (uint256) {
        return userFeedbackIds[_user].length;
    }

    /**
     * @dev Gets a feedback entry by ID.
     * @param _feedbackId The ID of the feedback.
     * @return user The address of the user who submitted the feedback.
     * @return contentIdentifier The identifier of the content.
     * @return rating The rating given (1-5).
     * @return comment The textual feedback.
     * @return timestamp The time when the feedback was submitted.
     */
    function getFeedbackById(
        uint256 _feedbackId
    )
        public
        view
        returns (
            address user,
            string memory contentIdentifier,
            uint8 rating,
            string memory comment,
            uint256 timestamp
        )
    {
        require(_feedbackId < feedbackCounter, "Feedback ID does not exist");
        Feedback storage feedback = feedbacks[_feedbackId];
        return (
            feedback.user,
            feedback.contentIdentifier,
            feedback.rating,
            feedback.comment,
            feedback.timestamp
        );
    }

    /**
     * @dev Gets a specific feedback entry submitted by a user by index.
     * @param _user The address of the user.
     * @param _index The index in the user's feedback list.
     * @return The ID of the feedback.
     */
    function getUserFeedbackIdByIndex(
        address _user,
        uint256 _index
    ) public view returns (uint256) {
        require(_index < userFeedbackIds[_user].length, "Index out of bounds");
        return userFeedbackIds[_user][_index];
    }

    /**
     * @dev Gets all feedback IDs submitted by a user.
     * @param _user The address of the user.
     * @return An array of feedback IDs.
     */
    function getAllUserFeedbackIds(
        address _user
    ) public view returns (uint256[] memory) {
        return userFeedbackIds[_user];
    }
}
