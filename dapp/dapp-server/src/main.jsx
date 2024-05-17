// dapp/src/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";
import QRCode from "qrcode.react";
import { v4 as uuidv4 } from "uuid";
import eccrypto from "eccrypto";
import "./index.css";

const socket = io("http://localhost:3001");

function App() {
  const [roomId, setRoomId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [deeplink, setDeeplink] = useState("");

  useEffect(() => {
    const roomId = uuidv4();
    setRoomId(roomId);
    socket.emit("join-room", roomId);

    const keyPair = eccrypto.generatePrivate();
    const publicKey = eccrypto.getPublic(keyPair).toString("hex");
    setPublicKey(publicKey);

    const deeplink = `dapp://connect?publicKey=${publicKey}&roomId=${roomId}`;
    setDeeplink(deeplink);
  }, []);

  return (
    <div className="App">
      <h1>Simple Dapp</h1>
      {deeplink && <QRCode value={deeplink} />}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
