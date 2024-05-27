// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { createRoot } from "react-dom/client";
import CryptoJS from "crypto-js";
import { Buffer } from "buffer";
// import QRCode from "qrcode.react";
import QrReader from "react-qr-reader"; // Assuming you have a QR code reader library
import "./index.css";

// Polyfill for Buffer in the browser
window.Buffer = window.Buffer || Buffer;

const generateKeyPair = () => {
  const privateKey = CryptoJS.lib.WordArray.random(32).toString(
    CryptoJS.enc.Hex
  );
  const publicKey = CryptoJS.SHA256(privateKey).toString(CryptoJS.enc.Hex);
  return { privateKey, publicKey };
};

const deriveSharedSecret = (privateKey, publicKey) => {
  const sharedSecret = CryptoJS.SHA256(privateKey + publicKey).toString(
    CryptoJS.enc.Hex
  );
  return sharedSecret;
};

// const encryptMessage = (sharedSecret, message) => {
//   const encrypted = CryptoJS.AES.encrypt(message, sharedSecret).toString();
//   return encrypted;
// };

const decryptMessage = (sharedSecret, encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, sharedSecret);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

const signMessage = (message, privateKey) => {
  return CryptoJS.HmacSHA256(message, privateKey).toString(CryptoJS.enc.Hex);
};

const App = () => {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [socket, setSocket] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);
  const [deeplink, setDeeplink] = useState("");
  const [walletAddresses, setWalletAddresses] = useState([
    "0x1234567890abcdef1234567890abcdef12345678",
  ]); // Example address list
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    const { privateKey, publicKey } = generateKeyPair();
    setPrivateKey(privateKey);
    setPublicKey(publicKey);
  }, []);

  const handleConnect = () => {
    const urlParams = new URLSearchParams(scannedData.split("?")[1]);
    const roomId = urlParams.get("roomId");
    const dappPublicKey = urlParams.get("publicKey");

    if (roomId && dappPublicKey) {
      setRoomId(roomId);

      const newSocket = io("http://localhost:3000");
      newSocket.on("connect", () => {
        console.log("Connected to Socket.io server");
        newSocket.emit("joinRoom", roomId);
        setConnected(true);
      });
      newSocket.on("disconnect", () => {
        console.log("Disconnected from Socket.io server");
        setConnected(false);
      });
      newSocket.on("encryptedMessage", (message) => {
        const decryptedMessage = decryptMessage(sharedSecret, message);
        console.log("Decrypted message:", decryptedMessage);
      });

      setSocket(newSocket);

      const sharedSecret = deriveSharedSecret(privateKey, dappPublicKey);
      console.log("Shared Secret:", sharedSecret);
      setSharedSecret(sharedSecret);
    }
  };

  const handleSendPublicKey = () => {
    if (socket && publicKey) {
      socket.emit("walletPublicKey", roomId, { publicKey });
      console.log("Sent public key to dapp:", publicKey);
    } else {
      console.log("Socket is not connected or public key is missing.");
    }
  };

  const handleSendWalletAddresses = () => {
    if (socket && walletAddresses.length > 0) {
      socket.emit("walletAddresses", roomId, { addresses: walletAddresses });
      console.log("Sent wallet addresses to dapp:", walletAddresses);
    } else {
      console.log("Socket is not connected or addresses are missing.");
    }
  };

  const handleSignMessage = () => {
    const message = "Sample message to sign";
    const signature = signMessage(message, privateKey);
    console.log("Signed message:", signature);
  };

  const handleScan = (data) => {
    if (data) {
      setScannedData(data);
      console.log("Scanned data:", data);
    }
  };

  const handleError = (err) => {
    console.error("QR code scan error:", err);
  };

  return (
    <div
      className="App"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h1>Wallet</h1>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        style={{ width: "300px" }}
      />
      <button onClick={handleConnect} disabled={!scannedData || connected}>
        Connect to Server
      </button>
      <button onClick={handleSendPublicKey} disabled={!connected}>
        Send Public Key
      </button>
      <button onClick={handleSendWalletAddresses} disabled={!connected}>
        Send Wallet Addresses
      </button>
      <button onClick={handleSignMessage}>Sign Message</button>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
