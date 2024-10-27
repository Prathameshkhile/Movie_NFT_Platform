// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MovieNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;

    // Constructor that initializes the ERC721 and Ownable base classes
    constructor() ERC721("MovieNFT", "MOV") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start token ID counter from 1
    }

    // Function to mint a new NFT
    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        uint256 newItemId = _tokenIdCounter;
        _tokenIdCounter++; // Increment the tokenId for the next NFT

        _mint(recipient, newItemId); // Mint the NFT to the recipient
        _setTokenURI(newItemId, tokenURI); // Set the token URI for the minted NFT

        return newItemId;
    }
}
