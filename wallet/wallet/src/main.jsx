// wallet/src/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";
import "./index.css";

const socket = io("http://localhost:3001");

function App() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("roomId");
    const publicKey = params.get("publicKey");

    if (roomId && publicKey) {
      setRoomId(roomId);
      setPublicKey(publicKey);
      socket.emit("join-room", roomId);
    }
  }, []);

  useEffect(() => {
    if (roomId && publicKey) {
      socket.on("message", (message) => {
        console.log("Message from Dapp:", message);
      });

      const keyPair = eccrypto.generatePrivate();
      const publicKey = eccrypto.getPublic(keyPair).toString("hex");

      socket.emit("message", roomId, { publicKey });

      setConnected(true);
    }
  }, [roomId, publicKey]);

  return (
    <div className="App">
      <h1>Simple Wallet</h1>
      {connected ? <p>Connected to Dapp</p> : <p>Connecting...</p>}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
