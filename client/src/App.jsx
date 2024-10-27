import React, { useState } from "react";
import Web3 from "web3";

function App() {
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    } else {
      alert("No Ethereum wallet found. Install MetaMask!");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Movie NFT Platform</h1>
        <button onClick={connectWallet}>Connect Wallet</button>
        {account && <p>Connected as: {account}</p>}
      </header>
    </div>
  );
}

export default App;
