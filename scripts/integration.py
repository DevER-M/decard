import os

import ape
from ape import accounts, project
from eth_utils import to_wei

NFT_ADDR = "0x68F2B471CCca503B131D5cDf4D2CC7eAE472AC3a"
MP_ADDR = "0xFD484e1Bb85d39EcDce0C808fc7d8098803201F7"

# The buyer must be a separate funded Ape keyring account (not the seller),
# because a seller cannot meaningfully buy their own listing. Create one with:
#     ape accounts generate decard_buyer   (then fund it with Sepolia ETH)
BUYER_ACCOUNT = os.getenv("BUYER_ACCOUNT", "decard_buyer")


def main():
    acct = accounts.load("decard")
    try:
        buyer = accounts.load(BUYER_ACCOUNT)
    except Exception:
        raise SystemExit(
            f"Buyer account '{BUYER_ACCOUNT}' not found. Create it with "
            f"`ape accounts generate {BUYER_ACCOUNT}` and fund it with Sepolia ETH."
        )

    nft = project.GameCardNFT.at(NFT_ADDR)
    mp = project.Marketplace.at(MP_ADDR)

    # 1. Mint a card
    uri = "ipfs://QmIntegrationTestMetadataHash"
    before = nft.totalSupply()
    nft.mintCard(uri, sender=acct)
    token_id = nft.totalSupply()
    print(f"1. Minted card tokenId={token_id} (supply {before} -> {nft.totalSupply()})")
    print(f"   ownerOf: {nft.ownerOf(token_id)}")
    print(f"   tokenURI: {nft.tokenURI(token_id)}")

    # 2. Approve marketplace, then list
    nft.approve(MP_ADDR, token_id, sender=acct)
    print(f"2. Approved marketplace to transfer token {token_id}")
    price = to_wei("0.01", "ether")
    mp.listCard(NFT_ADDR, token_id, price, sender=acct)
    seller, p, active = mp.getListing(NFT_ADDR, token_id)
    print(f"3. Listed card: seller={seller} price={p} active={active}")

    # 4. Buy with a separate funded account
    print(f"   buyer: {buyer.address} (balance {buyer.balance / 10**18} ETH)")
    mp.buyCard(NFT_ADDR, token_id, sender=buyer, value=price)
    _, _, active_after = mp.getListing(NFT_ADDR, token_id)
    print(f"4. Bought card: new owner={nft.ownerOf(token_id)}")
    print(f"   listing active after buy: {active_after}")
    print(f"   seller tokensOfOwner: {nft.tokensOfOwner(acct)}")
    print(f"   buyer  tokensOfOwner: {nft.tokensOfOwner(buyer)}")
    print("\nPASS: mint -> approve -> list -> buy flow succeeded on Sepolia")