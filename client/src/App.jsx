import React, { useState, useEffect } from "react";
import Web3 from "web3";
import MovieNFTContract from "./contracts/MovieNFT.json"; // Ensure the path is correct

function App() {
  const [movieName, setMovieName] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [genre, setGenre] = useState("");
  const [poster, setPoster] = useState("");
  const [shares, setShares] = useState(0);
  const [basePrice, setBasePrice] = useState(0);
  const [account, setAccount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [movieNFT, setMovieNFT] = useState(null);
  const [movies, setMovies] = useState([]); // State to hold minted movies
  const [buySharesTokenId, setBuySharesTokenId] = useState("");
  const [buySharesAmount, setBuySharesAmount] = useState("");

  useEffect(() => {
    loadWeb3();
    loadMoviesFromLocalStorage(); // Load movies from local storage
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
setAccount(accounts[0]); // Ensure the first account is used

      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = MovieNFTContract.networks[networkId];
      if (deployedNetwork) {
        const contract = new web3Instance.eth.Contract(
          MovieNFTContract.abi,
          deployedNetwork.address
        );
        setMovieNFT(contract);
        loadMovies(contract); // Load existing movies
      } else {
        alert("Contract not deployed on this network.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const loadMoviesFromLocalStorage = () => {
    const storedMovies = JSON.parse(localStorage.getItem("movies"));
    if (storedMovies) {
      setMovies(storedMovies);
    }
  };

  const loadMovies = async (contract) => {
    try {
      const totalMovies =
        (await contract.methods._tokenIdCounter().call()) || 0;
      const movieList = [];
      for (let i = 0; i < totalMovies; i++) {
        const movie = await contract.methods.getMovieDetails(i).call();
        movieList.push({ tokenId: i, ...movie });
      }
      setMovies(movieList);
      localStorage.setItem("movies", JSON.stringify(movieList)); // Save movies to local storage
    } catch (error) {
      console.error("Error loading movies:", error);
    }
  };

  const createNFT = async () => {
    try {
      const basePriceInWei = Web3.utils.toWei(basePrice.toString(), "ether");
      await movieNFT.methods
        .mintNFT(movieName, releaseYear, genre, poster, shares, basePriceInWei)
        .send({ from: account });
      alert("Movie NFT created successfully!");

      const newMovie = {
        tokenId: movies.length, // Simulating tokenId for local list
        name: movieName,
        releaseYear,
        genre,
        poster,
        shares,
        basePrice: basePriceInWei,
      };

      const updatedMovies = [...movies, newMovie];
      setMovies(updatedMovies);

      localStorage.setItem("movies", JSON.stringify(updatedMovies)); // Save updated movies to local storage

      // Clear input fields
      setMovieName("");
      setReleaseYear("");
      setGenre("");
      setPoster("");
      setShares(0);
      setBasePrice(0);
    } catch (error) {
      console.error("Error creating NFT:", error);
    }
  };

  const buyShares = async () => {
    try {
      const movie = movies.find(
        (movie) => movie.tokenId === parseInt(buySharesTokenId)
      );
      if (!movie) {
        alert("Invalid movie ID!");
        return;
      }

      const totalCost = movie.basePrice * buySharesAmount;
      await movieNFT.methods
        .buyShares(buySharesTokenId, buySharesAmount)
        .send({ from: account, value: totalCost });
      alert("Shares purchased successfully!");

      loadMovies(movieNFT); // Reload movies after buying shares
    } catch (error) {
      console.error("Error buying shares:", error);
    }
  };
  0


  const removeMovie = async (tokenId) => {
    try {
      // Verify ownership
      const owner = await movieNFT.methods.ownerOf(tokenId).call();
      if (owner.toLowerCase() !== account.toLowerCase()) {
        alert("Permission denied: You must be the owner of the NFT to remove it.");
        return;
      }
  
      // Call the burn function
      await movieNFT.methods.burn(tokenId).send({ from: account });
      alert(`Movie with token ID ${tokenId} removed successfully!`);
  
      // Update local state
      const updatedMovies = movies.filter((movie) => movie.tokenId !== tokenId);
      setMovies(updatedMovies);
      localStorage.setItem("movies", JSON.stringify(updatedMovies));
    } catch (error) {
      console.error("Error removing movie:", error);
  
      // Check for specific errors
      if (error.message.includes("You don't own this NFT")) {
        alert("Permission denied: You must be the owner of the NFT to remove it.");
      } else if (error.message.includes("revert")) {
        alert("Transaction reverted. Check your permissions and network settings.");
      } else {
        alert("Failed to remove the movie. Ensure you have the necessary permissions.");
      }
    }
  };
  
  
  

  return (
    <div>
      <h1>Movie NFT Platform</h1>
      <p>Connected Account: {account}</p>

      {/* Create NFT Section */}
      <h2>Create Movie NFT</h2>
      <input
        type="text"
        placeholder="Movie Name"
        value={movieName}
        onChange={(e) => setMovieName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Release Year"
        value={releaseYear}
        onChange={(e) => setReleaseYear(e.target.value)}
      />
      <input
        type="text"
        placeholder="Genre"
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
      />
      <input
        type="text"
        placeholder="Poster URL"
        value={poster}
        onChange={(e) => setPoster(e.target.value)}
      />
      <input
        type="number"
        placeholder="Number of Shares"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
      />
      <input
        type="number"
        placeholder="Base Price per Share (in Eth)"
        value={basePrice}
        onChange={(e) => setBasePrice(e.target.value)}
      />
      <button onClick={createNFT}>Create NFT</button>

      {/* Buy Shares Section */}
      <h2>Buy Shares</h2>
      <input
        type="number"
        placeholder="Token ID"
        value={buySharesTokenId}
        onChange={(e) => setBuySharesTokenId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Number of Shares"
        value={buySharesAmount}
        onChange={(e) => setBuySharesAmount(e.target.value)}
      />
      <button onClick={buyShares}>Buy Shares</button>

      {/* Display Movies */}
      <h2>Available Movies</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {movies.map((movie, index) => (
          <div
            key={movie.tokenId || index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <h3>{movie.name}</h3>
            <p>Token ID: {movie.tokenId}</p>
            <p>Release Year: {movie.releaseYear}</p>
            <p>Genre: {movie.genre}</p>
            <p>
              Poster:{" "}
              <a href={movie.poster} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </p>
            <p>Shares Left: {movie.shares}</p>
            <p>Base Price: {movie.basePrice} Wei</p>
            <button
              onClick={() => removeMovie(movie.tokenId)}
              style={{
                background: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
