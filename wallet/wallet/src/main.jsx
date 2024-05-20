import React, { useState } from "react";
import io from "socket.io-client";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer";
import eccrypto from "eccrypto";
import "./index.css";

// Polyfill for Buffer in the browser
window.Buffer = window.Buffer || Buffer;

const App = () => {
  const [connected, setConnected] = useState(false);
  const [deeplink, setDeeplink] = useState("");
  const [roomId, setRoomId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [socket, setSocket] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);

  const handleConnect = () => {
    const fakeDeepLink =
      "dapp://connect?publicKey=04f78a2173204cef297ce436041e6f6103fd8bc80acb6b3ebffab686aebde023c54198047c184c54a7b482fdab58e01a147fcede12afafd9eccb3bf272ab960684&roomId=f39c9b27-1eab-415f-a4ee-a3a9082524be"; // Replace with actual deeplink
    const urlParams = new URLSearchParams(fakeDeepLink.split("?")[1]);
    const roomId = urlParams.get("roomId");
    console.log("roomId:::", roomId);
    const dappPublicKey = urlParams.get("publicKey");

    if (roomId && dappPublicKey) {
      setRoomId(roomId);

      // Generate a new key pair
      const privateKeyBuffer = eccrypto.generatePrivate();
      const publicKeyBuffer = eccrypto.getPublic(privateKeyBuffer);
      setPrivateKey(privateKeyBuffer.toString("hex"));
      setPublicKey(publicKeyBuffer.toString("hex"));

      const newSocket = io("http://localhost:3000");
      newSocket.on("connect", () => {
        console.log("Connected to Socket.io server");
        newSocket.emit("joinRoom", roomId);
        newSocket.emit("walletPublicKey", {
          publicKey: publicKeyBuffer.toString("hex"),
        });
        console.log(
          "Sent public key to dapp:",
          publicKeyBuffer.toString("hex")
        );
        setConnected(true);
      });
      newSocket.on("disconnect", () => {
        console.log("Disconnected from Socket.io server");
      });
      newSocket.on("message", async (message) => {
        if (message.type === "text") {
          try {
            const decryptedMessage = await eccrypto.decrypt(
              Buffer.from(privateKey, "hex"),
              message.payload
            );
            console.log("Decrypted message:", decryptedMessage.toString());
          } catch (error) {
            console.error("Error decrypting message:", error);
          }
        }
      });

      setSocket(newSocket);

      // Generate shared secret
      eccrypto
        .derive(
          Buffer.from(privateKeyBuffer, "hex"),
          Buffer.from(dappPublicKey, "hex")
        )
        .then((sharedSecret) => {
          console.log("Shared Secret:", sharedSecret.toString("hex"));
          setSharedSecret(sharedSecret);
        })
        .catch((error) => {
          console.error("Error deriving shared secret:", error);
        });
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
        marginLeft: "350px",
      }}
    >
      <h1>Wallet</h1>
      <button onClick={handleConnect}>Connect to Server</button>
      {connected ? (
        <div>
          <p>Connected to Dapp</p>
          <p>Public Key: {publicKey}</p>
        </div>
      ) : (
        <p>Waiting for connection...</p>
      )}
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
