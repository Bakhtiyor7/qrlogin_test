import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import QRCode from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import { createRoot } from "react-dom/client";
import CryptoJS from "crypto-js";
import { Buffer } from "buffer";
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

const encryptMessage = (sharedSecret, message) => {
  const encrypted = CryptoJS.AES.encrypt(message, sharedSecret).toString();
  return encrypted;
};

const decryptMessage = (sharedSecret, encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, sharedSecret);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [deeplink, setDeeplink] = useState("");
  const [socket, setSocket] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);

  useEffect(() => {
    const roomId = uuidv4();
    setRoomId(roomId);

    const { privateKey, publicKey } = generateKeyPair();
    setPrivateKey(privateKey);
    setPublicKey(publicKey);

    const deeplink = `dapp://connect?publicKey=${publicKey}&roomId=${roomId}`;
    setDeeplink(deeplink);
  }, []);

  const handleConnect = () => {
    const newSocket = io("http://localhost:3000");
    newSocket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });
    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });
    newSocket.on("walletPublicKey", (data) => {
      console.log("Received public key from wallet:", data.publicKey);
      const sharedSecret = deriveSharedSecret(privateKey, data.publicKey);
      console.log("Shared Secret:", sharedSecret);
      setSharedSecret(sharedSecret);
    });
    newSocket.on("encryptedMessage", (data) => {
      const decryptedMessage = decryptMessage(sharedSecret, data);
      console.log("Decrypted message from wallet:", decryptedMessage);
    });

    setSocket(newSocket);
  };

  const handleSendDeeplink = () => {
    if (socket && deeplink) {
      socket.emit("joinRoom", roomId);
      socket.emit("walletPublicKey", roomId, { publicKey });
      console.log("Sent deeplink to room:", deeplink);
    } else {
      console.log("Socket is not connected or deeplink is missing.");
    }
  };

  const handleSendHelloWorld = () => {
    if (sharedSecret && socket) {
      const helloWorldMessage = "Hello World";
      const encryptedMessage = encryptMessage(sharedSecret, helloWorldMessage);
      socket.emit("encryptedMessage", roomId, encryptedMessage);

      console.log("Sent encrypted Hello World message:", encryptedMessage);
    } else {
      console.log("Shared secret or socket is not available.");
    }
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
      <h1>Dapp</h1>
      {deeplink && <QRCode value={deeplink} />}
      <button onClick={handleConnect}>Connect to Server</button>
      <button onClick={handleSendDeeplink}>Send Deeplink</button>
      <button onClick={handleSendHelloWorld} disabled={!sharedSecret}>
        Send Hello World
      </button>
      <p>Deeplink: {deeplink}</p>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
