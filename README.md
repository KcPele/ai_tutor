# AI Teaching App

The AI Teaching App is an interactive learning platform that leverages AI models to teach users based on uploaded materials. The app features a real-time whiteboard for enhanced learning and provides a conversational interface for engaging interactions.

## Features

- **Material Upload**: Upload PDFs, which the AI processes to generate teaching content
- **AI Tutor**: Interact with an AI tutor specialized in various subjects (math, science, history, etc.)
- **Interactive Whiteboard**: AI dynamically writes on a whiteboard to explain concepts
- **Conversational Learning**: Chat with the AI to ask questions and get explanations in real time

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Bun (v1.0 or later)
- OpenAI API key

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your OpenAI API credentials:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

### Installation

```bash
# Install dependencies
bun install

# Run the development server
bun run dev
```

### Usage

1. Sign up or sign in to your account
2. Navigate to the Teaching page from the dashboard
3. Upload a PDF document you want to learn about
4. Select an AI tutor role that best matches the subject matter
5. Ask questions about the document's content
6. The AI will respond and use the whiteboard to illustrate concepts

## Tech Stack

- **AI Model**: ChatGPT (via OpenAI API)
- **Frontend**: Next.js
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN/UI
- **PDF Processing**: PDF.js
- **Whiteboard**: Fabric.js
- **Blockchain**: Solidity smart contracts on OpenCampus network

## Smart Contracts

The application utilizes several Solidity smart contracts to enable blockchain-based features. All contracts are implemented with Solidity version 0.8.28 and include comprehensive event logging for tracking on-chain activity.

### Deployed Contracts

All contracts are deployed on the OpenCampus network (Chain ID: 656476):

| Contract            | Address                                    | Explorer Link                                                                                                  |
| ------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| SubscriptionManager | 0x6089425B0b0FA591ff0cd4AfCa937e92A51ac652 | [View on Explorer](https://opencampus-codex.blockscout.com/address/0x6089425B0b0FA591ff0cd4AfCa937e92A51ac652) |
| StudySessionLogger  | 0x3D10A21cCfEE3d970a49d09b0562A7502c251991 | [View on Explorer](https://opencampus-codex.blockscout.com/address/0x3D10A21cCfEE3d970a49d09b0562A7502c251991) |
| ContentFeedback     | 0x9B6D9a7a8d9c396ea5db88e7BD3e57b5adB929B3 | [View on Explorer](https://opencampus-codex.blockscout.com/address/0x9B6D9a7a8d9c396ea5db88e7BD3e57b5adB929B3) |
| AchievementNFT      | 0x5DF906D043346bE3915DA2fC1Ff13B1E1092FAed | [View on Explorer](https://opencampus-codex.blockscout.com/address/0x5DF906D043346bE3915DA2fC1Ff13B1E1092FAed) |

### SubscriptionManager

Manages user subscription plans to access premium features of the AI Tutor.

**Features:**

- Plan creation and management for platform administrators
- Subscription processing for users
- Automatic renewal and expiration handling

**Key Functions:**

- `subscribe(uint8 _planId)`: Allows users to subscribe to a specific plan
- `isSubscriptionActive(address _user)`: Checks if a user has an active subscription
- `getSubscriptionStatus(address _user)`: Returns detailed subscription information

### StudySessionLogger

Logs and tracks user study sessions on the blockchain.

**Features:**

- Records start and end times of study sessions
- Tracks materials studied and session durations
- Maintains historical study data for analysis

**Key Functions:**

- `logSessionStart(string memory _materialId)`: Records the beginning of a study session
- `getUserSessionCount(address _user)`: Returns the total number of sessions for a user
- `getSessionsByMaterial(string memory _materialId)`: Retrieves all sessions for a specific study material

### ContentFeedback

Manages user feedback on learning content and materials.

**Features:**

- Allows users to submit ratings and text feedback
- Enables rewarding users for valuable feedback
- Maintains feedback history for course improvement

**Key Functions:**

- `submitFeedback(string memory _contentId, string memory _feedbackText, uint8 _rating)`: Records user feedback
- `rewardFeedback(uint256 _feedbackId, uint256 _rewardAmount)`: Allows admins to reward helpful feedback
- `getFeedbackDetails(uint256 _feedbackId)`: Retrieves complete feedback information

### AchievementNFT

Issues unique NFTs representing learning milestones or achievements within the AI Tutor App.

**Features:**

- ERC721-compliant achievement tokens
- Custom achievement types with descriptions
- On-chain verification of learning milestones

**Key Functions:**

- `addAchievementType(string memory _description)`: Creates new achievement categories
- `awardAchievement(address _recipient, uint256 _achievementTypeId)`: Mints achievement NFTs to users
- `getAchievementTypeDescription(uint256 _typeId)`: Retrieves achievement descriptions
- `getTokenAchievementType(uint256 _tokenId)`: Returns the achievement type for a specific token

## Interacting with Contracts

To interact with these contracts in your application:

```javascript
import { ethers } from "ethers";
import {
  SubscriptionManager_CONTRACT_ADDRESS,
  SubscriptionManager_ABI,
} from "../constants";

// Example: Check if a user has an active subscription
async function checkSubscription(userAddress) {
  // Setup provider and contract
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  // Load ABI dynamically
  const abiData = await SubscriptionManager_ABI();

  // Create contract instance
  const subscriptionManager = new ethers.Contract(
    SubscriptionManager_CONTRACT_ADDRESS,
    abiData.abi,
    provider
  );

  // Call contract method
  const isActive = await subscriptionManager.isSubscriptionActive(userAddress);
  return isActive;
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
