// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import Wallet from "./wallet";
import { createRoot } from "react-dom/client";
import "./index.css";

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [deeplink, setDeeplink] = useState("");
  const [roomId, setRoomId] = useState("");
  const [dappPublicKey, setDappPublicKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const handleInputChange = (e) => {
    const data = e.target.value;
    setDeeplink(data);

    if (data) {
      const urlParams = new URLSearchParams(data.split("?")[1]);
      const roomId = urlParams.get("roomId");
      const dappPublicKey = urlParams.get("publicKey");

      setRoomId(roomId);
      setDappPublicKey(dappPublicKey);
      console.log("Parsed data:", data);
    }
  };

  const handleConnect = () => {
    if (walletAddress && roomId && dappPublicKey) {
      const newWallet = new Wallet(walletAddress);
      newWallet.connectToServer("http://localhost:3000", roomId, dappPublicKey);
      setWallet(newWallet);
      setConnected(true);
    }
  };

  const handleDisconnect = () => {
    if (wallet) {
      wallet.disconnect();
      setConnected(false);
      setWallet(null);
    }
  };

  const handleSignMessage = () => {
    if (wallet) {
      wallet.messageToSign();
    }
  };

  return (
    <div
      className="WalletComponent"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h1>Wallet</h1>
      <input
        type="text"
        placeholder="QR data"
        value={deeplink}
        onChange={handleInputChange}
        disabled={connected}
      />
      <input
        type="text"
        placeholder="Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        disabled={connected}
      />
      <button
        onClick={handleConnect}
        disabled={!deeplink || !walletAddress || connected}
      >
        Connect to Server
      </button>

      <button onClick={handleDisconnect} disabled={!connected}>
        Disconnect
      </button>
      <button onClick={handleSignMessage} disabled={!connected}>
        Sign Message
      </button>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
