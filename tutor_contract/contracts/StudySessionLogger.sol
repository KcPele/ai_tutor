// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title StudySessionLogger
 * @dev Creates an immutable on-chain record of study sessions initiated by users of the AI Tutor App
 */
contract StudySessionLogger {
    struct SessionLog {
        address user;
        string materialIdentifier; // e.g., PDF filename or hash
        uint256 startTimestamp;
    }

    uint256 public totalSessionsLogged;
    mapping(address => uint256[]) public userSessionIds; // Maps user to array of their session IDs
    mapping(uint256 => SessionLog) public sessionLogs; // Maps session ID to log details

    event SessionLogged(
        uint256 indexed sessionId,
        address indexed user,
        string materialIdentifier,
        uint256 timestamp
    );

    /**
     * @dev Logs the start of a study session for the calling user.
     * @param _materialIdentifier Identifier for the study material.
     * @return The ID of the newly logged session.
     */
    function logSessionStart(
        string memory _materialIdentifier
    ) public returns (uint256) {
        require(
            bytes(_materialIdentifier).length > 0,
            "Material identifier required"
        );

        uint256 sessionId = totalSessionsLogged++;
        sessionLogs[sessionId] = SessionLog({
            user: msg.sender,
            materialIdentifier: _materialIdentifier,
            startTimestamp: block.timestamp
        });
        userSessionIds[msg.sender].push(sessionId);

        emit SessionLogged(
            sessionId,
            msg.sender,
            _materialIdentifier,
            block.timestamp
        );
        return sessionId;
    }

    /**
     * @dev Get the number of sessions logged by a user.
     * @param _user The user address.
     * @return The number of sessions logged by the user.
     */
    function getUserSessionCount(address _user) public view returns (uint256) {
        return userSessionIds[_user].length;
    }

    /**
     * @dev Get the details of a specific session logged by a user.
     * @param _user The user address.
     * @param _index The index in the user's session log array.
     * @return The session log details.
     */
    function getUserSessionByIndex(
        address _user,
        uint256 _index
    ) public view returns (SessionLog memory) {
        require(_index < userSessionIds[_user].length, "Index out of bounds");
        uint256 sessionId = userSessionIds[_user][_index];
        return sessionLogs[sessionId];
    }

    /**
     * @dev Get the details of a specific session by its global ID.
     * @param _sessionId The session ID.
     * @return The session log details.
     */
    function getSessionDetails(
        uint256 _sessionId
    ) public view returns (SessionLog memory) {
        require(_sessionId < totalSessionsLogged, "Session ID does not exist");
        return sessionLogs[_sessionId];
    }

    /**
     * @dev Get all session IDs for a user.
     * @param _user The user address.
     * @return An array of session IDs.
     */
    function getAllUserSessions(
        address _user
    ) public view returns (uint256[] memory) {
        return userSessionIds[_user];
    }

    /**
     * @dev Get the total number of sessions logged by all users.
     * @return The total number of sessions.
     */
    function getTotalSessionsLogged() public view returns (uint256) {
        return totalSessionsLogged;
    }

    /**
     * @dev Get the session IDs for a specific material.
     * @param _materialIdentifier The material identifier.
     * @return An array of session IDs.
     */
    function getSessionsByMaterial(
        string memory _materialIdentifier
    ) public view returns (uint256[] memory) {
        // Count sessions for this material first
        uint256 count = 0;
        for (uint256 i = 0; i < totalSessionsLogged; i++) {
            if (
                keccak256(bytes(sessionLogs[i].materialIdentifier)) ==
                keccak256(bytes(_materialIdentifier))
            ) {
                count++;
            }
        }

        // Create an array to hold the IDs
        uint256[] memory ids = new uint256[](count);

        // Populate the array
        uint256 index = 0;
        for (uint256 i = 0; i < totalSessionsLogged; i++) {
            if (
                keccak256(bytes(sessionLogs[i].materialIdentifier)) ==
                keccak256(bytes(_materialIdentifier))
            ) {
                ids[index] = i;
                index++;
            }
        }

        return ids;
    }
}
