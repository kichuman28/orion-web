# Orion - Blockchain-Powered Academic Review Platform

Orion is a decentralized platform for academic paper submissions and peer review, leveraging blockchain technology for transparency and incentivization.

## Features

![Screenshot 2025-03-23 105320](https://github.com/user-attachments/assets/2d6965ce-fa35-4041-898e-8e83fdac4148)
![Screenshot 2025-03-23 113159](https://github.com/user-attachments/assets/408b07f6-4901-4973-9af4-81e31565922e)
![Screenshot 2025-03-23 113152](https://github.com/user-attachments/assets/d01f59b3-f583-460d-b218-2893aa928716)
![Screenshot 2025-03-23 113245](https://github.com/user-attachments/assets/63759e52-a219-4378-838a-ddf227c0d9d7)
![Screenshot 2025-03-23 113223](https://github.com/user-attachments/assets/adf7c39a-b160-45fe-8424-c92b4d1536a7)


- 🔐 Secure authentication with role-based access control
- 📄 Academic paper submission and review system
- ⛓️ Blockchain integration for paper verification and staking
- 🌐 IPFS storage for decentralized and persistent paper storage
- 👥 Role-based dashboards for users, committee members, and admins
- 💰 MetaMask wallet integration for blockchain interactions and staking

## Technology Stack

- **Frontend**: React with Vite
- **Styling**: TailwindCSS
- **Authentication/Database**: Firebase (Auth + Firestore)
- **File Storage**: IPFS via Pinata
- **Blockchain**: Ethereum compatible (Open Campus EDU Chain)
- **Wallet Connection**: ethers.js with MetaMask

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Firebase account
- Pinata account for IPFS storage
- Ethereum wallet (like MetaMask)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/orion.git
   cd orion
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials
   - Add your Pinata API keys
   - Add blockchain configuration

4. Start the development server
   ```
   npm run dev
   ```

## IPFS Integration

The platform uses IPFS (InterPlanetary File System) via Pinata for decentralized storage of academic papers. This approach offers several advantages:

- **Permanence**: Files on IPFS cannot be deleted or modified once uploaded
- **Content addressing**: Files are referenced by their content, not location
- **Censorship resistance**: No central authority can remove content
- **Improved availability**: Content can be fetched from multiple nodes

### How it works

1. When a user uploads a paper (PDF file), it's sent to IPFS via Pinata's API
2. Pinata pins the file (keeps it permanently available) and returns an IPFS hash (CID)
3. The CID is stored in Firestore along with paper metadata
4. When someone wants to view the paper, it's fetched from the IPFS network

### Configuration

To use the IPFS integration, you need:

1. A Pinata account (sign up at [pinata.cloud](https://pinata.cloud))
2. API Keys from your Pinata dashboard
3. These keys added to your `.env` file:

```
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## Wallet Integration

The platform integrates with Ethereum wallets (primarily MetaMask) to enable blockchain interactions such as staking tokens when submitting papers.

### Features

- **Universal wallet connection**: Connect your wallet from any page via the header button
- **Persistent connection**: Wallet connection state is preserved across the application
- **Chain switching**: Automatically prompts users to switch to the EDU Chain network
- **Paper submission gating**: Users must connect a wallet to submit papers
- **Transaction support**: Real stake transactions when submitting papers

### How to Use

1. Click the "Connect Wallet" button in the header
2. Approve the connection request in your MetaMask wallet
3. If prompted, approve switching to the EDU Chain network
4. Your wallet address will now appear in the header, and you can submit papers

### Configuration

Configure the blockchain connection in your `.env` file:

```
VITE_CHAIN_ID=0xA045C
VITE_CHAIN_NAME=EDU Chain Testnet
VITE_RPC_URL=https://open-campus-codex-sepolia.drpc.org
VITE_BLOCK_EXPLORER=https://opencampus-codex.blockscout.com
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
