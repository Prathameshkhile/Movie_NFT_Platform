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
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setWeb3(web3Instance);
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

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

  const loadMovies = async (contract) => {
    const totalMovies = (await contract.methods._tokenIdCounter().call()) || 0;
    const movieList = [];
    for (let i = 0; i < totalMovies; i++) {
      const movie = await contract.methods.getMovieDetails(i).call();
      movieList.push({ tokenId: i, ...movie });
    }
    setMovies(movieList);
  };

  const createNFT = async () => {
    try {
      await movieNFT.methods
        .mintNFT(movieName, releaseYear, genre, poster, shares, basePrice)
        .send({ from: account });
      alert("Movie NFT created successfully!");

      // Add the new movie to the local state
      const newMovie = {
        tokenId: movies.length, // Simulating tokenId for local list
        name: movieName,
        releaseYear,
        genre,
        poster,
        shares,
        basePrice,
      };
      setMovies([...movies, newMovie]); // Add new movie to the list

      // Clear input fields
      setMovieName("");
      setReleaseYear("");
      setGenre("");
      setPoster("");
      setShares(0);
      setBasePrice(0);

      loadMovies(movieNFT); // Reload movies from blockchain
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

  const removeMovie = async (tokenId) => {
    try {
      // Add a method in your smart contract to burn or delete a movie NFT if supported
      await movieNFT.methods.burn(tokenId).send({ from: account });
      alert(`Movie with token ID ${tokenId} removed successfully!`);
      setMovies(movies.filter((movie) => movie.tokenId !== tokenId)); // Update local state
    } catch (error) {
      console.error("Error removing movie:", error);
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
        placeholder="Base Price per Share (in Wei)"
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
              style={{ background: "red", color: "white", border: "none", padding: "5px 10px" }}
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
