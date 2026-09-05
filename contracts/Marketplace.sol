// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Marketplace
 * @notice Marketplace where users can list and buy ERC-721 game cards.
 *         Holds no funds — ETH is transferred directly from buyer to seller.
 */
contract Marketplace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Events
    event CardListed(address indexed nftContract, uint256 indexed tokenId, uint256 price, address indexed seller);
    event CardSold(address indexed nftContract, uint256 indexed tokenId, uint256 price, address indexed seller, address buyer);
    event ListingCancelled(address indexed nftContract, uint256 indexed tokenId);

    /**
     * @notice List a card for sale.
     * @dev The seller must have approved this contract to transfer the NFT.
     * @param nftContract The ERC-721 contract address
     * @param tokenId The card token id
     * @param price The sale price in wei
     */
    function listCard(address nftContract, uint256 tokenId, uint256 price) external {
        require(nftContract != address(0), "Invalid NFT contract");
        require(price > 0, "Price must be greater than 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner of this card");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "Marketplace must be approved to transfer the card"
        );

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit CardListed(nftContract, tokenId, price, msg.sender);
    }

    /**
     * @notice Buy a listed card.
     * @dev Sends ETH directly to the seller and transfers the NFT to the buyer.
     * @param nftContract The ERC-721 contract address
     * @param tokenId The card token id
     */
    function buyCard(address nftContract, uint256 tokenId) external payable nonReentrant {
        require(nftContract != address(0), "Invalid NFT contract");
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Card is not listed for sale");
        require(msg.value == listing.price, "Incorrect amount sent");

        address seller = listing.seller;
        address buyer = msg.sender;
        uint256 price = listing.price;
        IERC721 nft = IERC721(nftContract);

        // Revalidate before paying so a card transferred or un-approved
        // since listing cannot silently fail midway through the purchase.
        require(nft.ownerOf(tokenId) == seller, "Seller no longer owns the card");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(seller, address(this)),
            "Marketplace no longer approved for the card"
        );

        // Mark inactive before transfers to prevent reentrancy
        listing.active = false;

        // Transfer NFT from seller to buyer
        nft.transferFrom(seller, buyer, tokenId);

        // Send ETH directly to seller
        (bool success, ) = payable(seller).call{value: price}("");
        require(success, "ETH transfer to seller failed");

        emit CardSold(nftContract, tokenId, price, seller, buyer);
    }

    /**
     * @notice Cancel a listing.
     * @dev Only the seller can cancel their own listing.
     * @param nftContract The ERC-721 contract address
     * @param tokenId The card token id
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        require(nftContract != address(0), "Invalid NFT contract");
        Listing storage listing = listings[nftContract][tokenId];
        require(listing.active, "Card is not listed for sale");
        require(listing.seller == msg.sender, "Only the seller can cancel");

        listing.active = false;

        emit ListingCancelled(nftContract, tokenId);
    }

    /**
     * @notice Get the details of a listing.
     * @param nftContract The ERC-721 contract address
     * @param tokenId The card token id
     * @return seller Seller address
     * @return price Sale price in wei
     * @return active Whether the listing is active
     */
    function getListing(address nftContract, uint256 tokenId)
        external
        view
        returns (address seller, uint256 price, bool active)
    {
        Listing memory listing = listings[nftContract][tokenId];
        return (listing.seller, listing.price, listing.active);
    }
}
