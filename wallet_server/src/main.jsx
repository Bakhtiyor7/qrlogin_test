// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import SocketModule from "./SocketModule";
import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import "./index.css";

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [connected, setConnected] = useState(false);
  const [deeplink, setDeeplink] = useState("");
  const [roomId, setRoomId] = useState("");
  const [dappPublicKey, setDappPublicKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [messageToSign, setMessageToSign] = useState("");
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [isSignModalOpen, setSignModalOpen] = useState(false);
  const [keypair, setKeypair] = useState({
    privateKey: "",
    publicKey: "",
    address: "",
  });

  const handleInputChange = (e) => {
    const data = e.target.value;
    setDeeplink(data);

    if (data) {
      const urlParams = new URLSearchParams(data.split("?")[1]);
      const roomId = urlParams.get("roomId");
      // const dappPublicKey = urlParams.get("publicKey");
      const messageToSign = urlParams.get("messageToSign");

      setRoomId(roomId);
      setDappPublicKey(dappPublicKey);
      setMessageToSign(messageToSign);
      console.log("Parsed data:", data);
    }
  };

  const handleConnect = () => {
    if (walletAddress && roomId) {
      const newWallet = new SocketModule();
      newWallet.connectToServer("http://localhost:3000", roomId);

      // Listen for the message to sign
      newWallet.socket.on("messageToSign", (message) => {
        setMessageToSign(message);
        setSignModalOpen(true); // Open the sign modal when message is received
      });

      // Set the wallet instance and mark as connected
      setWallet(newWallet);
      setConnected(true);
      setWalletModalOpen(false); // Close the wallet modal
      newWallet.requestMessage();
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
      wallet.signMessage(keypair);
      setSignModalOpen(false); // Close the sign modal after signing
    }
  };

  const openWalletModal = () => {
    setWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setWalletModalOpen(false);
  };

  const openSignModal = () => {
    setSignModalOpen(true);
  };

  const closeSignModal = () => {
    setSignModalOpen(false);
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
      <button onClick={openWalletModal} disabled={connected}>
        Choose Wallet and Connect
      </button>

      <button onClick={handleDisconnect} disabled={!connected}>
        Disconnect
      </button>

      <Modal
        isOpen={isWalletModalOpen}
        onRequestClose={closeWalletModal}
        contentLabel="Choose Wallet Modal"
      >
        <h2>Choose Wallet</h2>
        <button onClick={handleConnect}>Connect</button>
      </Modal>

      <Modal
        isOpen={isSignModalOpen}
        onRequestClose={closeSignModal}
        contentLabel="Sign Message Modal"
      >
        <h2>Sign Message</h2>
        <p>{messageToSign}</p>
        <input
          type="text"
          placeholder="Private Key"
          onChange={(e) =>
            setKeypair({ ...keypair, privateKey: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Public Key"
          onChange={(e) =>
            setKeypair({ ...keypair, publicKey: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Wallet Address"
          onChange={(e) => setKeypair({ ...keypair, address: e.target.value })}
        />
        <button onClick={handleSignMessage}>Sign</button>
      </Modal>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
