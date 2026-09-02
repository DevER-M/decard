# Decard — Decentralized Pokémon Card NFT Marketplace

## Project Overview

A decentralized marketplace where users can **mint, list, and buy** unique Pokémon-style digital game cards on the **Ethereum Sepolia testnet**. Each card is a unique ERC-721 NFT with an image, name, description, and attributes/rarity. Card images and metadata are stored on **IPFS** via **Pinata**.

**Repo:** `git@github.com:DevER-M/decard.git` — branch `main`
**Status:** Contracts **deployed to Sepolia**, frontend live locally. See "Live Deployment" below.

## Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Ethereum Sepolia Testnet (chainId `11155111`) |
| **Smart Contracts** | Solidity 0.8.24, OpenZeppelin 4.9.6, built/tested via **Ape Framework** (Python) |
| **NFT Standard** | ERC-721 (each card is unique, 1/1) |
| **IPFS** | Pinata (pin card images + metadata JSON) |
| **Frontend** | **Next.js 16** (App Router, Turbopack) + **React 19** + TypeScript |
| **Wallet** | **RainbowKit** + wagmi v2 + viem v2 |
| **Frontend State** | @tanstack/react-query + wagmi caching |

## Live Deployment (Sepolia)

- **GameCardNFT** (name `GameCardNFT`, symbol `CARD`): `0x277B0105263e9471d91D1fE0eAb1fEEBDB2C0B83`
- **Marketplace**: `0x40DC222617c8a69DEE34B688E08c74385e81dB97`
- Deployer/owner Ape account: `decard` → `0xa8f4507C897b515950456F28B1587Dbf8A5559F1`

These addresses live in `frontend/.env.local` as `NEXT_PUBLIC_GAME_CARD_ADDRESS` / `NEXT_PUBLIC_MARKETPLACE_ADDRESS` and in `frontend/.env.local.example`. Also mirrored in the ABI constants via `frontend/src/lib/config.ts`.

## Setup & Workflows

### Python environment (Ape)

Python managed with **uv** (locked v3.12 in `.python-version`). **You MUST activate the venv** — every Ape command requires it, otherwise Ape warns `Missing compilers for .sol`.

```bash
uv sync                      # install env + ape plugins into .venv
source .venv/bin/activate    # REQUIRED first for every shell
ape compile
ape test                     # 17 tests, local EVM
```

Plugins `ape-solidity` + `ape-etherscan` are **pinned as project dependencies** in `pyproject.toml` (not just `ape plugins install`), so they are always installed by `uv sync`.

### Ape accounts (Sepolia)

- The `decard` account is **passphrase-encrypted**. Any signing prompts for the passphrase.
- `ape accounts list` / `ape accounts generate decard` / `ape accounts export decard` (prints seed/private key after passphrase)
- Unlock for a session with `ape accounts unlock decard` to avoid repeated prompts.
- Deployment to Sepolia uses the public RPC (no Infura key needed):
  ```bash
  ape run deploy --network ethereum:sepolia
  ```

### Network config (`ape-config.yaml`)

- `default_network: local` for tests; Sepolia uses the **`node` provider**:
  - URI: `https://ethereum-sepolia-rpc.publicnode.com`
  - Do **not** revert to `default_provider: infura` — it errors with "No provider named 'infura'" unless an API key is configured.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill PINATA_JWT + addresses (already filled locally)
npm run dev                        # http://localhost:3000
npx tsc --noEmit                   # typecheck
npm run build                      # production build (verified green)
```

Wallet connect requires **MetaMask on Sepolia (chainId 11155111)**. Import the `decard` account via seed phrase or private key to test with the deployed account.

## Previous Issues / Gotchas (IMPORTANT)

1. **`createConfig` + bare `injected()` produced no wallet modal.** Fixed by integrating **RainbowKit** (see Frontend section).
2. **RainbowKit build fails with "Can't resolve '@x402/core/client'"** — its Coinbase-wallet dependency needs extra packages. Installed directly:
   ```
   npm install @x402/core @x402/evm @x402/svm
   ```
   Do not remove them (build breaks).
3. **ipfs.io gateway has no CORS**, so `fetch()` of metadata from the browser silently failed → cards showed with no name/image/description. Fix: default gateway is **`https://gateway.pinata.cloud/ipfs/`** (CORS-enabled) with ipfs.io + Cloudflare as fallbacks. Replace default via `NEXT_PUBLIC_IPFS_GATEWAY`.
4. **Ape `mintCard(...).return_value` returns an off-by-one tokenId** (Ape 0.8.51 quirk). Tests derive the token id from `totalSupply()` instead of trusting `.return_value`. Not an issue in the frontend (uses viem directly).
5. **Pinata upload 401 / "token is malformed"** = `PINATA_JWT` is still the placeholder in `.env.local`. Must be a real JWT from https://app.pinata.cloud → API Keys → New Key → JWT; restart dev server afterwards (env read at startup).
6. **Account shows 0 ETH in MetaMask** with multiple "Sepolia" entries: pick the network with **chainId 11155111** and the imported `decard` address; see Live Deployment above.
7. **Next.js 16 is newer than typical training data** — read `frontend/node_modules/next/dist/docs/` before writing Next-specific code. `frontend/AGENTS.md` is auto-maintained by `next dev`.
8. **Secrets:** the `decard` seed phrase/passphrase and `PINATA_JWT` are sensitive — never commit them (`.env.local` is gitignored; only `.env.local.example` is committed via force-add).

## Project Structure

```
decard/
├── contracts/
│   ├── GameCardNFT.sol       # ERC-721 minting contract
│   └── Marketplace.sol       # Listing/buying/cancelling
├── tests/
│   ├── test_game_card.py     # Ape/Python tests (5) — minting, tokenURI, ownership, events
│   └── test_marketplace.py   # Ape/Python tests (12) — list/buy/cancel, reentrancy, events
├── scripts/
│   ├── deploy.py             # Ape deploy to Sepolia (prints addresses)
│   └── integration.py        # Live Sepolia flow: mint → approve → list → buy (interactive signing)
├── ape-config.yaml           # Ape config: solidity 0.8.24, OZ 4.9.6, sepolia node provider
├── pyproject.toml / uv.lock  # uv-managed env + ape plugin deps
├── frontend/
│   ├── package.json          # next 16, react 19, wagmi 2, viem 2, rainbowkit 2, @tanstack/react-query, @x402/*
│   ├── next.config.ts
│   ├── .env.local            # REAL keys/addresses (gitignored)
│   ├── .env.local.example    # committed template
│   └── src/
│       ├── app/
│       │   ├── layout.tsx            # Root layout (Geist fonts, Providers)
│       │   ├── providers.tsx         # WagmiProvider + QueryClient + RainbowKitProvider (darkTheme)
│       │   ├── page.tsx              # Marketplace (browse listings, rarity/type filters)
│       │   ├── mint/page.tsx         # Upload + mint card
│       │   ├── collection/page.tsx   # Cards owned by wallet + ListCardModal
│       │   ├── api/pinata/route.ts   # Server-side Pinata upload (protects PINATA_JWT)
│       │   └── globals.css           # All app styles
│       ├── components/
│       │   ├── Nav.tsx               # Header nav + ConnectWallet
│       │   ├── ConnectWallet.tsx     # RainbowKit ConnectButton
│       │   ├── CardGrid.tsx
│       │   ├── CardItem.tsx          # Renders card + list/buy/unlist actions
│       │   ├── MintForm.tsx          # Image/name/attrs → upload → mint
│       │   ├── ListCardModal.tsx     # Price → approve → list flow
│       │   └── BuyButton.tsx
│       ├── hooks/
│       │   ├── useGameCard.ts        # mint, balanceOf, totalSupply, tokensOfOwner; readTokenURI + fetchCardMetadata helpers
│       │   ├── useMarketplace.ts     # approve, listCard, buyCard, cancelListing; readListing helper
│       │   ├── useIPFS.ts            # uploadCardMetadata wrapper (loading/error)
│       │   └── useCards.ts           # Enrich tokenIds → metadata + listing via useQuery
│       ├── lib/
│       │   ├── config.ts             # CHAIN, addresses, IPFS_GATEWAY, toHttpUrl(s) w/ fallbacks
│       │   ├── wagmi.ts              # RainbowKit getDefaultConfig (shared)
│       │   ├── contracts.ts          # ABI imports + GAME_CARD / MARKETPLACE constants
│       │   ├── pinata.ts             # uploadCardMetadata (image + JSON → ipfs:// URI)
│       │   └── abis/                 # GameCardNFT.json, Marketplace.json (Ape-generated ABIs)
│       └── types/index.ts            # Rarity, CardType, CardMetadata, CardData, Listing, etc.
└── README.md / AGENTS.md
```

## Smart Contracts

### GameCardNFT.sol (ERC-721)
- Inherits OpenZeppelin `ERC721URIStorage` (unique token IDs + per-token metadata URIs)
- `mintCard(string metadataURI)` — mints a new card, increments token counter, sets token URI to IPFS metadata hash; returns `tokenId`
- `tokensOfOwner(address)` — array of token IDs owned (used by My Collection)
- `totalSupply()` — current token counter
- `tokenMinter(tokenId)` — minter tracker
- Event: `CardMinted(tokenId, metadataURI, minter)`

### Marketplace.sol
- `listCard(address nftContract, tokenId, price)` — requires seller → marketplace approval
- `buyCard(address nftContract, tokenId)` — `payable`, `nonReentrant`; ETH sent **directly to seller**
- `cancelListing(address nftContract, tokenId)` — seller only
- `getListing(address nftContract, tokenId)` — returns `(seller, price, active)`
- Events: `CardListed(tokenId, price, seller)`, `CardSold(...)`, `ListingCancelled(tokenId)`
- Marketplace holds **no funds**; NFT transfer requires prior `approve(marketplace, tokenId)`

## IPFS Flow (Pinata)

```
User image → POST /api/pinata (server, JWT) → image CID (ipfs://...)
                        ↓
Metadata JSON (name, description, image, attributes) → POST /api/pinata → metadata CID
                        ↓
metadata URI → mintCard() → stored as tokenURI (only on-chain data)
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

**On-chain test data (tokenId 1):** `bulbasaur` — metadata CID `ipfs://bafkreigoyka54wwlwybewowedeb3btgx73z4orelxhxovu6ecmp6qz5chi`

## Card Theme: Pokémon

| Rarity | Example | Drop Rate |
|---|---|---|
| Common | Pidgey, Rattata / bulbasaur | 50% |
| Uncommon | Butterfree, Arcanine | 30% |
| Rare | Gengar, Snorlax | 15% |
| Legendary | Mewtwo, Rayquaza | 4% |
| Mythical | Mew, Celebi | 1% |

**Attributes**: `Type` (Fire/Water/Grass/Electric/Psychic), `Attack`, `Defense`, `HP`, `Rarity`

## Frontend Pages

| Route | Function |
|---|---|
| `/` | Marketplace grid of all listings, filter by rarity/type, Buy buttons |
| `/mint` | Upload image → preview → set name/desc/attributes → upload IPFS → mint |
| `/collection` | Cards owned by connected wallet (via `tokensOfOwner`), List/Unlist actions |
| `POST /api/pinata` | Server-side image/metadata upload to Pinata (JWT not exposed to browser) |

## Testing (Ape Framework, Python)

- **`test_game_card.py`** (5): minting, sequential unique token IDs, tokenURI, ownership, `tokensOfOwner`, `CardMinted` event
- **`test_marketplace.py`** (12): list, zero-price/owner/approval reverts, buy (ownership transfer, balances, events), wrong-value/not-listed/double-buy reverts, cancel (+not-seller/inactive reverts)
- Run with `ape test` (local EVM, no network fees). **17 tests pass.**
- Ape quirk: never rely on `mintCard().return_value` — derive token IDs from `totalSupply()`.
- `scripts/integration.py` runs the real Sepolia flow (mint → approve → list → buy) but requires interactive signing + account unlock.

## Key Conventions

- **Language**: Smart contracts in Solidity; tests & scripts in **Python** (Ape); frontend in **TypeScript**
- **ERC-721** over ERC-1155 because each card is unique (1/1)
- **Direct ETH transfer** in Marketplace (simpler, no withdrawal function)
- **Wallet UX via RainbowKit** (modal), config via `NEXT_PUBLIC_WC_PROJECT_ID` (WalletConnect Cloud); injected wallets work without it
- **Client-side Pinata upload**, but the JWT lives server-side in `/api/pinata`
- **IPFS display via CORS-enabled gateway** (Pinata default, ipfs.io only as fallback)
- Always `source .venv/bin/activate` before Ape commands
- Never commit secrets/API keys (Pinata JWT, wallet passphrase/seed, private keys). `.env.local` is gitignored.