// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GameCardNFT
 * @notice ERC-721 contract for unique Pokémon-style game cards.
 *         Each card has a unique tokenId and an IPFS metadata URI.
 */
contract GameCardNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    // Track tokens minted by each address (for "My Collection" queries)
    mapping(address => uint256[]) private _tokensOf;

    // Mapping from tokenId -> minter
    mapping(uint256 => address) public tokenMinter;

    // Events
    event CardMinted(uint256 indexed tokenId, string metadataURI, address indexed minter);

    /**
     * @param name Token name
     * @param symbol Token symbol
     */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable() {}

    /**
     * @notice Mint a new unique game card.
     * @param metadataURI IPFS metadata URI for the card
     * @return tokenId of the newly minted card
     */
    function mintCard(string memory metadataURI) external returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        tokenMinter[tokenId] = msg.sender;
        _tokensOf[msg.sender].push(tokenId);

        emit CardMinted(tokenId, metadataURI, msg.sender);

        return tokenId;
    }

    /**
     * @notice Get all token IDs owned by an address.
     * @param owner The address to query
     * @return Array of token IDs owned by `owner`
     */
    function tokensOfOwner(address owner) external view returns (uint256[] memory) {
        return _tokensOf[owner];
    }

    /**
     * @notice Get the number of cards minted so far (i.e. the current token counter).
     * @return The current highest token id / total supply counter
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}
