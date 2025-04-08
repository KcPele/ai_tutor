// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Match the project's Solidity version

/**
 * @title SubscriptionManager
 * @dev Manages user subscriptions for the AI Tutor application.
 * Subscriptions are paid in the native blockchain currency (e.g., EDU).
 */
contract SubscriptionManager {
    address public owner;
    uint8 public nextPlanId; // Counter for generating unique plan IDs

    struct Plan {
        uint8 id;
        string name; // e.g., "Free", "Pro", "Team"
        uint256 price; // Price in native currency (wei for ETH/EDU)
        uint256 duration; // Duration in seconds (e.g., 30 days = 30 * 24 * 60 * 60)
        bool isActive; // Whether the plan can be subscribed to
    }

    struct Subscription {
        uint8 planId; // ID of the plan the user is subscribed to
        uint256 expiresAt; // Timestamp when the subscription expires
    }

    mapping(uint8 => Plan) public plans; // Stores plan details by ID
    mapping(address => Subscription) public subscriptions; // Stores user subscription details

    event PlanAdded(
        uint8 indexed planId,
        string name,
        uint256 price,
        uint256 duration
    );
    event PlanUpdated(
        uint8 indexed planId,
        string name,
        uint256 price,
        uint256 duration,
        bool isActive
    );
    event Subscribed(
        address indexed user,
        uint8 indexed planId,
        uint256 expiresAt,
        uint256 amountPaid
    );
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "SubscriptionManager: Caller is not the owner"
        );
        _;
    }

    /**
     * @dev Sets the contract deployer as the initial owner.
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), owner);

        // Optionally, add a default "Free" plan on deployment
        // _addPlan("Free", 0, 365 * 100 * 24 * 60 * 60); // Free plan, lasts 100 years
    }

    // --- Owner Functions ---

    /**
     * @dev Allows the owner to add a new subscription plan.
     * @param _name The name of the plan (e.g., "Pro").
     * @param _price The price of the plan in native currency (wei).
     * @param _duration The duration of the plan in seconds.
     */
    function addPlan(
        string memory _name,
        uint256 _price,
        uint256 _duration
    ) public onlyOwner {
        require(bytes(_name).length > 0, "Plan name cannot be empty");
        require(_duration > 0, "Duration must be positive");

        uint8 currentPlanId = nextPlanId;
        plans[currentPlanId] = Plan({
            id: currentPlanId,
            name: _name,
            price: _price,
            duration: _duration,
            isActive: true // New plans are active by default
        });
        nextPlanId++;
        emit PlanAdded(currentPlanId, _name, _price, _duration);
    }

    /**
     * @dev Allows the owner to update an existing subscription plan.
     * @param _planId The ID of the plan to update.
     * @param _name The new name for the plan.
     * @param _price The new price for the plan.
     * @param _duration The new duration for the plan.
     * @param _isActive The new active status for the plan.
     */
    function updatePlan(
        uint8 _planId,
        string memory _name,
        uint256 _price,
        uint256 _duration,
        bool _isActive
    ) public onlyOwner {
        require(_planId < nextPlanId, "Plan ID does not exist");
        require(bytes(_name).length > 0, "Plan name cannot be empty");
        require(_duration > 0, "Duration must be positive");

        Plan storage planToUpdate = plans[_planId];
        planToUpdate.name = _name;
        planToUpdate.price = _price;
        planToUpdate.duration = _duration;
        planToUpdate.isActive = _isActive;

        emit PlanUpdated(_planId, _name, _price, _duration, _isActive);
    }

    /**
     * @dev Allows the owner to withdraw the contract's balance.
     */
    function withdrawFunds() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner, balance);
    }

    /**
     * @dev Allows the owner to transfer ownership of the contract.
     * @param _newOwner The address of the new owner.
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(
            _newOwner != address(0),
            "New owner cannot be the zero address"
        );
        address previousOwner = owner;
        owner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }

    // --- User Functions ---

    /**
     * @dev Allows a user to subscribe to or renew a plan by sending native currency.
     * @param _planId The ID of the plan to subscribe to.
     */
    function subscribe(uint8 _planId) public payable {
        require(_planId < nextPlanId, "Plan ID does not exist");
        Plan storage selectedPlan = plans[_planId];
        require(selectedPlan.isActive, "Plan is not active");
        require(msg.value == selectedPlan.price, "Incorrect payment amount");

        Subscription storage userSubscription = subscriptions[msg.sender];
        uint256 currentExpiresAt = userSubscription.expiresAt;
        uint256 newExpiresAt;

        // If current subscription is expired or non-existent, start new subscription from now
        // If current subscription is active, extend it (renewal)
        if (currentExpiresAt < block.timestamp) {
            newExpiresAt = block.timestamp + selectedPlan.duration;
        } else {
            newExpiresAt = currentExpiresAt + selectedPlan.duration;
        }

        userSubscription.planId = _planId;
        userSubscription.expiresAt = newExpiresAt;

        emit Subscribed(msg.sender, _planId, newExpiresAt, msg.value);
    }

    // --- View Functions ---

    /**
     * @dev Checks if a user's subscription is currently active.
     * @param _user The address of the user to check.
     * @return bool True if the subscription is active, false otherwise.
     */
    function isSubscriptionActive(address _user) public view returns (bool) {
        return subscriptions[_user].expiresAt > block.timestamp;
    }

    /**
     * @dev Gets the subscription details for a user.
     * @param _user The address of the user.
     * @return planId_ The ID of the plan the user is subscribed to.
     * @return expiresAt_ The timestamp when the subscription expires.
     */
    function getSubscriptionStatus(
        address _user
    ) public view returns (uint8 planId_, uint256 expiresAt_) {
        Subscription storage sub = subscriptions[_user];
        return (sub.planId, sub.expiresAt);
    }

    /**
     * @dev Gets the details of a specific plan.
     * @param _planId The ID of the plan.
     * @return id The plan ID.
     * @return name The plan name.
     * @return price The plan price.
     * @return duration The plan duration.
     * @return isActive The plan active status.
     */
    function getPlanDetails(
        uint8 _planId
    )
        public
        view
        returns (
            uint8 id,
            string memory name,
            uint256 price,
            uint256 duration,
            bool isActive
        )
    {
        require(_planId < nextPlanId, "Plan ID does not exist");
        Plan storage plan = plans[_planId];
        return (plan.id, plan.name, plan.price, plan.duration, plan.isActive);
    }
}
