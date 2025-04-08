<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build apps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build apps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

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
- Supabase account
- OpenAI API key

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your Supabase and OpenAI API credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
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
- **Authentication**: Supabase
- **PDF Processing**: PDF.js
- **Whiteboard**: Fabric.js
- **Blockchain**: Solidity smart contracts

## Smart Contracts

The application utilizes several Solidity smart contracts to enable blockchain-based features. All contracts are implemented with Solidity version 0.8.28 and include comprehensive event logging for tracking on-chain activity.

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
