// // eslint-disable-next-line no-unused-vars
// import React, { useState } from "react";
// import io from "socket.io-client";
// import { createRoot } from "react-dom/client";
// import CryptoJS from "crypto-js";
// import { Buffer } from "buffer";
// import "./index.css";
// import WalletComponent from "./walletComponent.jsx";

// // Polyfill for Buffer in the browser
// window.Buffer = window.Buffer || Buffer;

// const generateKeyPair = () => {
//   const privateKey = CryptoJS.lib.WordArray.random(32).toString(
//     CryptoJS.enc.Hex
//   );
//   const publicKey = CryptoJS.SHA256(privateKey).toString(CryptoJS.enc.Hex);
//   return { privateKey, publicKey };
// };

// const deriveSharedSecret = (privateKey, publicKey) => {
//   const sharedSecret = CryptoJS.SHA256(privateKey + publicKey).toString(
//     CryptoJS.enc.Hex
//   );
//   return sharedSecret;
// };

// const encryptMessage = (sharedSecret, message) => {
//   const encrypted = CryptoJS.AES.encrypt(message, sharedSecret).toString();
//   return encrypted;
// };

// const decryptMessage = (sharedSecret, encryptedMessage) => {
//   const bytes = CryptoJS.AES.decrypt(encryptedMessage, sharedSecret);
//   const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//   console.log("decrypted message:", decrypted);
//   return decrypted;
// };

// const App = () => {
//   const [connected, setConnected] = useState(false);
//   const [roomId, setRoomId] = useState("");
//   const [publicKey, setPublicKey] = useState("");
//   const [privateKey, setPrivateKey] = useState("");
//   const [socket, setSocket] = useState(null);
//   const [sharedSecret, setSharedSecret] = useState(null);
//   const [deeplink, setDeeplink] = useState("");

//   const handleConnect = () => {
//     const urlParams = new URLSearchParams(deeplink.split("?")[1]);
//     const roomId = urlParams.get("roomId");
//     const dappPublicKey = urlParams.get("publicKey");

//     if (roomId && dappPublicKey) {
//       setRoomId(roomId);

//       const { privateKey, publicKey } = generateKeyPair();
//       setPrivateKey(privateKey);
//       setPublicKey(publicKey);

//       const newSocket = io("http://localhost:3000");
//       newSocket.on("connect", () => {
//         console.log("Connected to Socket.io server");
//         newSocket.emit("joinRoom", roomId);
//         setConnected(true);
//       });
//       newSocket.on("disconnect", () => {
//         console.log("Disconnected from Socket.io server");
//         setConnected(false);
//       });
//       newSocket.on("encryptedMessage", (message) => {
//         const decryptedMessage = decryptMessage(sharedSecret, message);
//         console.log("Decrypted message:", decryptedMessage);
//       });

//       setSocket(newSocket);

//       const sharedSecret = deriveSharedSecret(privateKey, dappPublicKey);
//       console.log("Shared Secret:", sharedSecret);
//       setSharedSecret(sharedSecret);
//     }
//   };

//   const handleSendPublicKey = () => {
//     if (socket && publicKey) {
//       socket.emit("walletPublicKey", roomId, { publicKey });
//       console.log("Sent public key to dapp:", publicKey);
//     } else {
//       console.log("Socket is not connected or public key is missing.");
//     }
//   };

//   const handleSendMessage = () => {
//     if (sharedSecret && socket) {
//       const message = "Hello World from Wallet";
//       const encryptedMessage = encryptMessage(sharedSecret, message);
//       socket.emit("encryptedMessage", roomId, encryptedMessage);
//       console.log("Sent encrypted message to dapp:", encryptedMessage);
//     } else {
//       console.log("Shared secret or socket is not available.");
//     }
//   };

//   return (
//     <div
//       className="App"
//       style={{
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         flexDirection: "column",
//         gap: "10px",
//       }}
//     >
//       <WalletComponent />
//       <h1>Wallet</h1>
//       <input
//         type="text"
//         placeholder="Enter deeplink"
//         value={deeplink}
//         onChange={(e) => setDeeplink(e.target.value)}
//       />
//       <button onClick={handleConnect} disabled={connected}>
//         Connect to Server
//       </button>
//       <button onClick={handleSendPublicKey} disabled={!connected}>
//         Send Public Key
//       </button>
//       <button onClick={handleSendMessage} disabled={!sharedSecret}>
//         Send Encrypted Message
//       </button>
//     </div>
//   );
// };

// const container = document.getElementById("root");
// const root = createRoot(container);
// root.render(<App />);
