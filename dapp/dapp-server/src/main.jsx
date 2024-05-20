import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import QRCode from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import eccrypto from "eccrypto";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import "./index.css";

// Polyfill for Buffer in the browser
window.Buffer = window.Buffer || Buffer;

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [deeplink, setDeeplink] = useState("");
  const [socket, setSocket] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);

  useEffect(() => {
    // Generate a new room ID and key pair
    const roomId = uuidv4();
    setRoomId(roomId);
    console.log("roomId", roomId);

    const privateKeyBuffer = eccrypto.generatePrivate();
    const publicKeyBuffer = eccrypto.getPublic(privateKeyBuffer);
    setPrivateKey(privateKeyBuffer.toString("hex"));
    setPublicKey(publicKeyBuffer.toString("hex"));

    console.log("Dapp Private Key:", privateKeyBuffer.toString("hex"));
    console.log("Dapp Public Key:", publicKeyBuffer.toString("hex"));

    const deeplink = `dapp://connect?publicKey=${publicKeyBuffer.toString(
      "hex"
    )}&roomId=${roomId}`;
    setDeeplink(deeplink);
    console.log("Deeplink:", deeplink);
  }, []);

  const handleConnect = () => {
    const newSocket = io("http://localhost:3000");
    newSocket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });
    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });
    newSocket.on("walletPublicKey", async (data) => {
      console.log("Received public key from wallet:", data.publicKey);
      console.log("Data:", data);
      try {
        const sharedSecret = await eccrypto.derive(
          Buffer.from(privateKey, "hex"),
          Buffer.from(data.publicKey, "hex")
        );
        console.log("Shared Secret:", sharedSecret.toString("hex"));
        setSharedSecret(sharedSecret);
      } catch (error) {
        console.error("Error deriving shared secret:", error);
      }
    });
    setSocket(newSocket);
  };

  const handleSendDeeplink = () => {
    if (socket && deeplink) {
      socket.emit("joinRoom", roomId);
      socket.emit("message", roomId, { publicKey, roomId });
      console.log("Sent deeplink to room:", deeplink);
    } else {
      console.log("Socket is not connected or deeplink is missing.");
    }
  };

  const handleSendHelloWorld = async () => {
    if (sharedSecret && socket) {
      const helloWorldMessage = "Hello World";
      try {
        const encryptedMessage = await eccrypto.encrypt(
          sharedSecret,
          Buffer.from(helloWorldMessage)
        );
        console.log("shared secret:", sharedSecret);
        socket.emit("message", roomId, {
          type: "text",
          payload: encryptedMessage,
        });

        console.log("Sent encrypted Hello World message:", encryptedMessage);
      } catch (error) {
        console.error("Error encrypting message:", error);
      }
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
      <button onClick={handleSendDeeplink} disabled={!socket}>
        Send Deeplink
      </button>
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
