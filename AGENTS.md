# Decard — Decentralized Pokémon Card NFT Marketplace

## Project Overview

A decentralized marketplace where users can **mint, list, and buy** unique Pokémon-style digital game cards on the **Ethereum Sepolia testnet**. Each card is a unique ERC-721 NFT with an image, name, description, and attributes/rarity. Card images and metadata are stored on **IPFS** via **Pinata**.

## Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Ethereum Sepolia Testnet |
| **Smart Contracts** | Solidity, compiled/tested/deployed via **Ape Framework** (Python) |
| **NFT Standard** | ERC-721 (each card is unique, 1/1) |
| **IPFS** | Pinata (pin card images + metadata JSON) |
| **Frontend** | Next.js 14 (App Router) + TypeScript + React |
| **Wallet** | wagmi v2 + viem |
| **Frontend State** | React hooks + wagmi caching |

## Project Structure

```
decard/
├── contracts/
│   ├── GameCardNFT.sol       # ERC-721 minting contract
│   └── Marketplace.sol       # Listing/buying/cancelling
├── tests/
│   ├── test_game_card.py     # Ape/Python tests
│   └── test_marketplace.py
├── scripts/
│   └── deploy.py             # Ape deployment script
├── ape-config.yaml           # Ape project config
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Root layout + providers
│       │   ├── page.tsx              # Marketplace (browse listings)
│       │   ├── mint/page.tsx         # Upload + mint card
│       │   └── collection/page.tsx   # Cards owned by wallet
│       ├── components/
│       │   ├── ConnectWallet.tsx
│       │   ├── CardGrid.tsx
│       │   ├── CardItem.tsx
│       │   ├── MintForm.tsx
│       │   ├── ListCardModal.tsx
│       │   └── BuyButton.tsx
│       ├── hooks/
│       │   ├── useMarketplace.ts     # list, buy, cancel, getListing
│       │   ├── useGameCard.ts        # mint, balanceOf, tokenURI
│       │   └── useIPFS.ts            # upload to Pinata
│       ├── lib/
│       │   ├── contracts.ts          # ABI imports + deployed addresses
│       │   ├── pinata.ts             # Pinata API helpers
│       │   └── config.ts             # chain, contract addresses
│       └── types/
│           └── index.ts
│   └── public/images/                # fallback card images
└── README.md
```

## Smart Contracts

### GameCardNFT.sol (ERC-721)
- Inherits OpenZeppelin `ERC721URIStorage` (unique token IDs + per-token metadata URIs)
- `mintCard(string metadataURI)` — mints a new card, increments token counter, sets token URI to IPFS metadata hash
- `ownerOf(tokenId)` and standard ERC-721 view functions
- Owner/minter tracker for "My Collection" queries
- Event: `CardMinted(tokenId, metadataURI, minter)`

### Marketplace.sol
- Uses `IERC721` + `transferFrom` for card transfers
- `listCard(address nftContract, tokenId, price)` — seller approves marketplace, then lists
- `buyCard(address nftContract, tokenId)` — sends ETH to seller, transfers NFT to buyer
- `cancelListing(address nftContract, tokenId)` — seller cancels
- `getListing(address nftContract, tokenId)` — view: seller, price, active status
- Events: `CardListed(tokenId, price, seller)`, `CardSold(tokenId, price, seller, buyer)`, `ListingCancelled(tokenId)`
- `ReentrancyGuard` on `buyCard`

### Data Model (on-chain)
- Marketplace contract holds **no funds**; direct seller→buyer ETH transfer
- Metadata & images on **IPFS**, only `tokenURI` stored on-chain

## IPFS Flow (Pinata)

```
Upload image → Pinata API → image CID (ipfs://Qm...)
                                ↓
Metadata JSON created (name, description, image, attributes)
                                ↓
Upload metadata JSON → Pinata API → metadata CID (ipfs://Qm...)
                                ↓
metadata URI passed to mintCard() → stored as tokenURI
```

### Metadata JSON Schema
```json
{
  "name": "Pikachu VMAX",
  "description": "Legendary electric card",
  "image": "ipfs://Qm...",
  "attributes": [
    { "trait_type": "Rarity", "value": "Legendary" },
    { "trait_type": "Type", "value": "Electric" },
    { "trait_type": "Attack", "value": 95 },
    { "trait_type": "Defense", "value": 60 }
  ]
}
```

## Card Theme: Pokémon

| Rarity | Example | Drop Rate |
|---|---|---|
| Common | Pidgey, Rattata | 50% |
| Uncommon | Butterfree, Arcanine | 30% |
| Rare | Gengar, Snorlax | 15% |
| Legendary | Mewtwo, Rayquaza | 4% |
| Mythical | Mew, Celebi | 1% |

**Attributes**: `Type` (Fire/Water/Grass/Electric/Psychic), `Attack`, `Defense`, `HP`, `Rarity`

## Frontend Pages

| Route | Function |
|---|---|
| `/` | Marketplace grid of all listings, filter by rarity/type |
| `/mint` | Upload image → preview → set name/desc/attributes → mint |
| `/collection` | Cards owned by connected wallet (via `balanceOf` + `tokenOfOwnerByIndex`) |
| Card Detail Modal | Show full card, list/unlist/buy actions |

## Testing (Ape Framework, Python)

- **`test_game_card.py`**: Minting, tokenURI, ownership, metadata
- **`test_marketplace.py`**: Listing, buying, cancellation, reentrancy protection, event emission
- Use Ape's `accounts` fixture to simulate multiple users
- Use Ape's built-in local EVM for fast test execution

## Key Conventions

- **Language**: Smart contracts in Solidity; tests & scripts in **Python** (Ape); frontend in **TypeScript**
- **ERC-721** over ERC-1155 because each card is unique (1/1)
- **Direct ETH transfer** in Marketplace (simpler, no withdrawal function)
- **Client-side Pinata upload** from frontend (no backend service needed)
- Never commit secrets/API keys (Pinata keys, wallet private keys)
