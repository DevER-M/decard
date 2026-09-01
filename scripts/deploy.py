from ape import accounts, project


def main():
    # Use the default account (or the one named in your ape account config)
    acct = accounts.load("decard")

    print(f"Deploying from account: {acct.address}")

    # Deploy the GameCardNFT contract
    game_card = acct.deploy(project.GameCardNFT, "GameCardNFT", "CARD")
    print(f"GameCardNFT deployed at: {game_card.address}")

    # Deploy the Marketplace contract
    marketplace = acct.deploy(project.Marketplace)
    print(f"Marketplace deployed at: {marketplace.address}")

    print("\nDeployment complete!")
    print(f"GameCardNFT : {game_card.address}")
    print(f"Marketplace : {marketplace.address}")
