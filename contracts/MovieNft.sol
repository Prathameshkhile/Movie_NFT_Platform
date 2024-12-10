// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MovieNFT is ERC721, Ownable {
    uint256 private _currentTokenId = 0;

    struct Movie {
        string name;
        uint256 releaseYear;
        string genre;
        string poster;
        uint256 shares;
        uint256 basePrice; // Base price of 1 share in wei
    }

    mapping(uint256 => Movie) public movies;
    mapping(uint256 => mapping(address => uint256)) public movieShares; // tokenId -> buyer -> shares
    mapping(uint256 => uint256) public totalSharesSold; // tokenId -> total shares sold
    mapping(uint256 => address) public movieOwners; // tokenId -> movie producer

    event MovieMinted(uint256 tokenId, string name, uint256 releaseYear, string genre, string poster, uint256 shares, uint256 basePrice);
    event SharesBought(uint256 tokenId, address buyer, uint256 amount, uint256 price);

    // Pass the initial owner to the Ownable constructor
    constructor() ERC721("MovieNFT", "MNFT") Ownable(msg.sender) {}

    function mintNFT(
        string memory movieName,
        uint256 releaseYear,
        string memory genre,
        string memory poster,
        uint256 shares,
        uint256 basePrice
    ) public onlyOwner {
        require(shares > 0, "Number of shares must be greater than zero.");
        require(basePrice > 0, "Base price must be greater than zero.");

        uint256 tokenId = _currentTokenId;
        _currentTokenId++;

        movies[tokenId] = Movie(movieName, releaseYear, genre, poster, shares, basePrice);
        _safeMint(msg.sender, tokenId);
        movieOwners[tokenId] = msg.sender;

        emit MovieMinted(tokenId, movieName, releaseYear, genre, poster, shares, basePrice);
    }

    function buyShares(uint256 tokenId, uint256 amount) public payable {
        Movie storage movie = movies[tokenId];
        require(movie.shares >= amount, "Not enough shares available.");
        uint256 totalCost = amount * movie.basePrice;
        require(msg.value == totalCost, "Incorrect Ether sent.");

        // Deduct shares from movie's total shares
        movie.shares -= amount;
        // Add shares to the buyer
        movieShares[tokenId][msg.sender] += amount;
        // Increment total shares sold
        totalSharesSold[tokenId] += amount;

        // Transfer Ether to the movie producer
        payable(movieOwners[tokenId]).transfer(msg.value);

        emit SharesBought(tokenId, msg.sender, amount, movie.basePrice);
    }

    function getMovieDetails(uint256 tokenId) public view returns (Movie memory) {
        return movies[tokenId];
    }

    function getMyShares(uint256 tokenId) public view returns (uint256) {
        return movieShares[tokenId][msg.sender];
    }

    mapping(uint256 => string) public tokenIdToMovie;

    // Add a function to associate movies with token IDs
    function setMovie(uint256 tokenId, string memory movieName) public onlyOwner {
    require(ownerOf(tokenId) == msg.sender, "Only the token owner can set the movie");
    movies[tokenId].name = movieName;
}
}

