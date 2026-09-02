import ape
import pytest
from eth_utils import to_wei


@pytest.fixture
def owner(accounts):
    return accounts[0]


@pytest.fixture
def seller(accounts):
    return accounts[1]


@pytest.fixture
def buyer(accounts):
    return accounts[2]


@pytest.fixture
def game_card(project, owner):
    return owner.deploy(project.GameCardNFT, "GameCardNFT", "CARD")


@pytest.fixture
def marketplace(project, owner):
    return owner.deploy(project.Marketplace)


@pytest.fixture
def listed_card(game_card, marketplace, seller):
    """Mint a card to seller and list it on the marketplace."""
    game_card.mintCard("ipfs://QmTestCard", sender=seller)
    token_id = game_card.totalSupply()
    game_card.approve(marketplace.address, token_id, sender=seller)
    marketplace.listCard(game_card.address, token_id, to_wei("1", "ether"), sender=seller)
    return token_id


def test_initial_empty_listing(marketplace, game_card):
    seller_, price, active = marketplace.getListing(game_card.address, 1)
    assert seller_ == "0x0000000000000000000000000000000000000000"
    assert price == 0
    assert active is False


def test_list_card(marketplace, game_card, seller):
    game_card.mintCard("ipfs://QmCard1", sender=seller)
    token_id = game_card.totalSupply()
    game_card.approve(marketplace.address, token_id, sender=seller)

    price = to_wei("2", "ether")
    receipt = marketplace.listCard(game_card.address, token_id, price, sender=seller)

    seller_, stored_price, active = marketplace.getListing(game_card.address, token_id)
    assert seller_ == seller
    assert stored_price == price
    assert active is True

    logs = [log for log in receipt.decode_logs(marketplace.CardListed) if log.event_name == "CardListed"]
    assert len(logs) == 1
    assert logs[0].nftContract == game_card.address
    assert logs[0].tokenId == token_id
    assert logs[0].price == price
    assert logs[0].seller == seller


def test_list_card_zero_price_reverts(marketplace, game_card, seller):
    game_card.mintCard("ipfs://QmCard1", sender=seller)
    token_id = game_card.totalSupply()
    game_card.approve(marketplace.address, token_id, sender=seller)

    with ape.reverts("Price must be greater than 0"):
        marketplace.listCard(game_card.address, token_id, 0, sender=seller)


def test_list_card_non_owner_reverts(marketplace, game_card, seller, buyer):
    game_card.mintCard("ipfs://QmCard1", sender=seller)
    token_id = game_card.totalSupply()

    with ape.reverts("Not the owner of this card"):
        marketplace.listCard(game_card.address, token_id, to_wei("1", "ether"), sender=buyer)


def test_list_card_without_approval_reverts(marketplace, game_card, seller):
    game_card.mintCard("ipfs://QmCard1", sender=seller)
    token_id = game_card.totalSupply()

    with ape.reverts("Marketplace must be approved to transfer the card"):
        marketplace.listCard(game_card.address, token_id, to_wei("1", "ether"), sender=seller)


def test_buy_card(listed_card, game_card, marketplace, seller, buyer):
    price = to_wei("1", "ether")
    seller_balance_before = seller.balance
    buyer_balance_before = buyer.balance

    receipt = marketplace.buyCard(game_card.address, listed_card, sender=buyer, value=price)

    # NFT ownership transferred
    assert game_card.ownerOf(listed_card) == buyer

    # tokensOfOwner reflects the transfer
    assert game_card.tokensOfOwner(seller) == []
    assert game_card.tokensOfOwner(buyer) == [listed_card]

    # Listing is no longer active
    _, _, active = marketplace.getListing(game_card.address, listed_card)
    assert active is False

    # Seller received ETH, buyer paid ETH + gas
    assert seller.balance == seller_balance_before + price
    assert buyer.balance < buyer_balance_before - price + price

    logs = [log for log in receipt.decode_logs(marketplace.CardSold) if log.event_name == "CardSold"]
    assert len(logs) == 1
    assert logs[0].nftContract == game_card.address
    assert logs[0].tokenId == listed_card
    assert logs[0].price == price
    assert logs[0].seller == seller
    assert logs[0].buyer == buyer


def test_buy_card_wrong_amount_reverts(listed_card, game_card, marketplace, buyer):
    with ape.reverts("Incorrect amount sent"):
        marketplace.buyCard(game_card.address, listed_card, sender=buyer, value=to_wei("0.5", "ether"))


def test_buy_card_not_listed_reverts(marketplace, game_card, buyer):
    with ape.reverts("Card is not listed for sale"):
        marketplace.buyCard(game_card.address, 999, sender=buyer, value=to_wei("1", "ether"))


def test_buy_card_twice_reverts(marketplace, game_card, listed_card, buyer):
    price = to_wei("1", "ether")
    marketplace.buyCard(game_card.address, listed_card, sender=buyer, value=price)

    with ape.reverts("Card is not listed for sale"):
        marketplace.buyCard(game_card.address, listed_card, sender=buyer, value=price)


def test_buy_card_after_seller_transfers_card_away_reverts(listed_card, game_card, marketplace, seller, buyer, accounts):
    """If the seller transfers the card away off-marketplace, buying reverts."""
    receiver = accounts[9]
    game_card.transferFrom(seller, receiver, listed_card, sender=seller)

    with ape.reverts("Seller no longer owns the card"):
        marketplace.buyCard(game_card.address, listed_card, sender=buyer, value=to_wei("1", "ether"))


def test_buy_card_after_seller_revokes_approval_reverts(listed_card, game_card, marketplace, seller, buyer):
    """Revoking marketplace approval after listing makes buying revert cleanly."""
    game_card.approve("0x0000000000000000000000000000000000000000", listed_card, sender=seller)

    with ape.reverts("Marketplace no longer approved for the card"):
        marketplace.buyCard(game_card.address, listed_card, sender=buyer, value=to_wei("1", "ether"))


def test_cancel_listing(listed_card, game_card, marketplace, seller):
    receipt = marketplace.cancelListing(game_card.address, listed_card, sender=seller)

    _, _, active = marketplace.getListing(game_card.address, listed_card)
    assert active is False
    assert game_card.ownerOf(listed_card) == seller

    logs = [log for log in receipt.decode_logs(marketplace.ListingCancelled) if log.event_name == "ListingCancelled"]
    assert len(logs) == 1
    assert logs[0].nftContract == game_card.address
    assert logs[0].tokenId == listed_card


def test_cancel_listing_not_seller_reverts(listed_card, game_card, marketplace, buyer):
    with ape.reverts("Only the seller can cancel"):
        marketplace.cancelListing(game_card.address, listed_card, sender=buyer)


def test_cancel_inactive_listing_reverts(marketplace, game_card, seller):
    game_card.mintCard("ipfs://QmCard1", sender=seller)
    token_id = game_card.totalSupply()
    with ape.reverts("Card is not listed for sale"):
        marketplace.cancelListing(game_card.address, token_id, sender=seller)
