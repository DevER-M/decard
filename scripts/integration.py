import ape
from ape import accounts, project
from eth_utils import to_wei

NFT_ADDR = "0x277B0105263e9471d91D1fE0eAb1fEEBDB2C0B83"
MP_ADDR = "0x40DC222617c8a69DEE34B688E08c74385e81dB97"


def main():
    acct = accounts.load("decard")
    nft = project.GameCardNFT.at(NFT_ADDR)
    mp = project.Marketplace.at(MP_ADDR)

    # 1. Mint a card
    uri = "ipfs://QmIntegrationTestMetadataHash"
    token_id = None
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

    # 4. Buy with a fresh account
    buyer = accounts[1]
    mp.buyCard(NFT_ADDR, token_id, sender=buyer, value=price)
    _, _, active_after = mp.getListing(NFT_ADDR, token_id)
    print(f"4. Bought card: new owner={nft.ownerOf(token_id)}")
    print(f"   listing active after buy: {active_after}")
    print("\nPASS: mint -> approve -> list -> buy flow succeeded on Sepolia")
