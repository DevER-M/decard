import ape
import pytest


@pytest.fixture
def owner(accounts):
    return accounts[0]


@pytest.fixture
def minter(accounts):
    return accounts[1]


@pytest.fixture
def game_card(project, owner):
    return owner.deploy(project.GameCardNFT, "GameCardNFT", "CARD")


def test_initial_metadata(game_card):
    assert game_card.name() == "GameCardNFT"
    assert game_card.symbol() == "CARD"
    assert game_card.totalSupply() == 0


def test_mint_card(game_card, minter):
    meta_uri = "ipfs://QmExampleMetadataHash"
    game_card.mintCard(meta_uri, sender=minter)
    token_id = game_card.totalSupply()

    assert token_id == 1
    assert game_card.ownerOf(token_id) == minter
    assert game_card.tokenURI(token_id) == meta_uri
    assert game_card.tokenMinter(token_id) == minter
    assert game_card.balanceOf(minter) == 1
    assert game_card.totalSupply() == 1


def test_mint_multiple_cards_are_unique(game_card, minter):
    token_ids = []
    for i in range(3):
        game_card.mintCard(f"ipfs://QmUri{i}", sender=minter)
        token_ids.append(game_card.totalSupply())

    # Token IDs are unique and sequential
    assert token_ids == [1, 2, 3]
    assert game_card.totalSupply() == 3

    # Each card has its own metadata URI
    assert game_card.tokenURI(1) == "ipfs://QmUri0"
    assert game_card.tokenURI(2) == "ipfs://QmUri1"
    assert game_card.tokenURI(3) == "ipfs://QmUri2"


def test_tokens_of_owner(game_card, minter, accounts):
    other = accounts[2]
    game_card.mintCard("ipfs://QmUri1", sender=minter)
    game_card.mintCard("ipfs://QmUri2", sender=minter)
    game_card.mintCard("ipfs://QmUri3", sender=other)

    token_ids = game_card.tokensOfOwner(minter)
    assert sorted(token_ids) == [1, 2]

    other_tokens = game_card.tokensOfOwner(other)
    assert other_tokens == [3]


def test_tokens_of_owner_reflects_transfer(game_card, minter, accounts):
    other = accounts[2]
    game_card.mintCard("ipfs://QmUri1", sender=minter)
    game_card.mintCard("ipfs://QmUri2", sender=minter)

    # Transfer token 1 away
    game_card.transferFrom(minter, other, 1, sender=minter)

    assert game_card.ownerOf(1) == other
    assert game_card.tokensOfOwner(minter) == [2]
    assert game_card.tokensOfOwner(other) == [1]


def test_tokens_of_owner_reflects_transfer_back(game_card, minter, accounts):
    other = accounts[2]
    game_card.mintCard("ipfs://QmUri1", sender=minter)
    game_card.transferFrom(minter, other, 1, sender=minter)
    game_card.transferFrom(other, minter, 1, sender=other)

    assert game_card.ownerOf(1) == minter
    assert game_card.tokensOfOwner(minter) == [1]
    assert game_card.tokensOfOwner(other) == []


def test_card_minted_event_emitted(game_card, minter):
    meta_uri = "ipfs://QmEventTest"
    receipt = game_card.mintCard(meta_uri, sender=minter)

    logs = [log for log in receipt.decode_logs(game_card.CardMinted) if log.event_name == "CardMinted"]
    assert len(logs) == 1
    assert logs[0].tokenId == 1
    assert logs[0].metadataURI == meta_uri
    assert logs[0].minter == minter
