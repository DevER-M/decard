# Decard — Decentralized Pokémon Card NFT Marketplace

A decentralized marketplace where users can **mint, list, and buy** unique Pokémon-style digital game cards on the **Ethereum Sepolia testnet**.

Each card is a unique **ERC-721** NFT with an image, name, description, and stats (rarity/type/attack/defense/HP). Images and metadata are stored on **IPFS** via **Pinata**.

## Tech Stack

- **Smart contracts**: Solidity (`0.8.24`), OpenZeppelin 4.9.6, built/tested with **Ape Framework** (Python)
- **Frontend**: Next.js 14 (App Router) + TypeScript + React
- **Wallet / chain access**: wagmi v2 + viem (Ethereum Sepolia)
- **IPFS**: Pinata

## Getting Started

### Prerequisites

- Python >= 3.10 (managed with `uv`)
- Node.js >= 18 + npm

### Smart Contracts (Ape)

```bash
uv sync
source .venv/bin/activate
ape compile          # compile contracts
ape test             # run the test-suite (local EVM)
```

Deploy to Sepolia:

```bash
ape accounts generate decard
# fund the account from a Sepolia faucet, then:
ape run deploy --network ethereum:sepolia
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # add your Pinata JWT + deployed addresses
npm run dev
```

Open http://localhost:3000 and connect a wallet (e.g. MetaMask) on Sepolia.

## Project Layout

```
contracts/   Solidity contracts (GameCardNFT, Marketplace)
tests/       Ape/Python tests
scripts/     Ape deployment script
frontend/    Next.js + wagmi marketplace UI
```

See [AGENTS.md](./AGENTS.md) for full architecture details.
