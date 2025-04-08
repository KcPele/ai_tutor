# Tutor Smart Contract

This project contains a smart contract for managing tutoring sessions on the OpenCampus network. The contract allows tutors to register, students to book sessions, and provides functionality for completing sessions and managing payments.

## Getting Started

### Prerequisites

- Node.js and npm installed
- An Ethereum wallet with a private key
- OpenCampus testnet tokens for deployment

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your private key:

```
ACCOUNT_PRIVATE_KEY='your_private_key_here'
```

### Compile the contract

```bash
npx hardhat compile
```

## Deployment to OpenCampus

### Step 1: Configure the Network

Before deploying to OpenCampus, you need to configure the hardhat.config.ts file:

1. Make sure you have your private key in the `.env` file
2. Uncomment the OpenCampus network configuration in hardhat.config.ts:

```typescript
opencampus: {
  url: `https://rpc.open-campus-codex.gelato.digital/`,
  accounts: [process.env.ACCOUNT_PRIVATE_KEY || ""],
  chainId: 656476
}
```

### Step 2: Deploy the Contract

Run the deployment script specifying the OpenCampus network:

```bash
npx hardhat run scripts/deploy.ts --network opencampus
```

### Step 3: Verify the Contract (Optional)

After deployment, you can verify your contract on the OpenCampus Block Explorer:

1. Get the deployed contract address from the deployment output
2. Run the verification command:

```bash
npx hardhat verify --network opencampus YOUR_CONTRACT_ADDRESS
```

3. Visit the OpenCampus Block Explorer to interact with your verified contract: https://opencampus-codex.blockscout.com/

## Contract Features

- **Register as a tutor**: Tutors can register with their name, expertise, and hourly rate
- **Book sessions**: Students can book tutoring sessions with registered tutors
- **Complete sessions**: Tutors can mark sessions as completed
- **Release payments**: Contract owner can release payments to tutors after session completion
- **Update profiles**: Tutors can update their profiles

## Network Information

- **Network Name**: OpenCampus Codex
- **Chain ID**: 656476
- **RPC URL**: https://rpc.open-campus-codex.gelato.digital/
- **Explorer**: https://opencampus-codex.blockscout.com/

## Testing Locally

To test the contract locally, you can run:

```bash
npx hardhat test
```

## License

This project is licensed under the MIT License.
