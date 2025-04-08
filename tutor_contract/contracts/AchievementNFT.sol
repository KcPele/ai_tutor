// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AchievementNFT
 * @dev Issues unique NFTs representing learning milestones or achievements within the AI Tutor App
 */
contract AchievementNFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId;

    // Mapping from achievement type ID to its description or name
    mapping(uint256 => string) public achievementTypes;
    uint256 public nextAchievementTypeId;

    // Mapping from token ID to the achievement type ID it represents
    mapping(uint256 => uint256) public tokenAchievementTypes;

    // Base URI for token metadata
    string private _baseTokenURI;

    event AchievementTypeAdded(uint256 indexed typeId, string description);
    event AchievementAwarded(
        address indexed user,
        uint256 indexed tokenId,
        uint256 achievementTypeId
    );

    /**
     * @dev Initializes the contract by setting a name, symbol, and base URI.
     * @param baseURI The base URI for token metadata
     */
    constructor(
        string memory baseURI
    ) ERC721("AI Tutor Achievements", "AITA") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Allows the owner to define a new type of achievement.
     * @param _description The description of the achievement type
     */
    function addAchievementType(string memory _description) public onlyOwner {
        uint256 typeId = nextAchievementTypeId++;
        achievementTypes[typeId] = _description;
        emit AchievementTypeAdded(typeId, _description);
    }

    /**
     * @dev Awards an achievement NFT of a specific type to a user.
     * Only the owner (the application backend/admin) can call this.
     * @param _recipient The address that will receive the achievement NFT
     * @param _achievementTypeId The type ID of the achievement to award
     * @return The ID of the newly minted token
     */
    function awardAchievement(
        address _recipient,
        uint256 _achievementTypeId
    ) public onlyOwner returns (uint256) {
        require(
            bytes(achievementTypes[_achievementTypeId]).length > 0,
            "Achievement type does not exist"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(_recipient, tokenId);
        tokenAchievementTypes[tokenId] = _achievementTypeId;

        emit AchievementAwarded(_recipient, tokenId, _achievementTypeId);
        return tokenId;
    }

    /**
     * @dev Returns the URI for a given token ID.
     * @param tokenId The ID of the token to query
     * @return The URI for the token metadata
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (!_exists(tokenId)) revert ERC721NonexistentToken(tokenId);

        string memory baseURI = _baseURI();
        // Append the token ID to the base URI
        return
            bytes(baseURI).length > 0
                ? string(abi.encodePacked(baseURI, tokenId.toString()))
                : "";
    }

    /**
     * @dev Base URI for computing {tokenURI}.
     * @return The base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Sets the base URI for all token types.
     * @param baseURI_ The new base URI
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    /**
     * @dev Returns the description of an achievement type.
     * @param _typeId The ID of the achievement type
     * @return The description of the achievement type
     */
    function getAchievementTypeDescription(
        uint256 _typeId
    ) public view returns (string memory) {
        return achievementTypes[_typeId];
    }

    /**
     * @dev Returns the achievement type of a token.
     * @param _tokenId The ID of the token
     * @return The achievement type ID
     */
    function getTokenAchievementType(
        uint256 _tokenId
    ) public view returns (uint256) {
        if (!_exists(_tokenId)) revert ERC721NonexistentToken(_tokenId);
        return tokenAchievementTypes[_tokenId];
    }

    /**
     * @dev Returns whether the token exists.
     * @param tokenId The token ID to check.
     * @return Whether the token exists.
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
