import { io } from "socket.io-client";
import CryptoService from "./CryptoService";
import CryptoJS from "crypto-js";

class SocketModule {
  private privateKey: string;
  public publicKey: string;
  public socket: any;
  private roomId: string;
  private walletAddress: string;
  private dappPublicKey: string;
  private messageToBeSigned: string;
  private sharedSecret: string;

  constructor() {
    this.socket = null;
    this.roomId = "";
    this.dappPublicKey = "";
    this.messageToBeSigned = "";
    this.sharedSecret = "";
  }
  v;

  public connectToServer(
    serverUrl: string,
    roomId: string
    // dappPublicKey: string
  ) {
    this.roomId = roomId;
    this.socket = io(serverUrl);

    // connect to room
    this.socket.on("connect", () => {
      console.log("Connected to Socket.io server");
      this.socket.emit("joinRoom", roomId);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });

    // Receive the message to be signed
    this.socket.on("messageSend", (message: string) => {
      console.log("message: ", message);
      this.messageToBeSigned = message;
      console.log("Received message to sign:", message);
    });
  }

  // send request message to DAPP
  public requestMessage() {
    console.log("sending the request!");
    this.socket.emit("requestMessage", this.roomId, {
      message: "Request message",
    });
    console.log("requst sent");
  }

  // sign
  public signMessage(keypair: any) {
    if (this.messageToBeSigned) {
      const signature = CryptoService.sign(
        this.messageToBeSigned,
        keypair.privateKey
      );
      this.socket.emit("signedMessage", this.roomId, {
        signature,
        publicKey: keypair.publicKey,
        address: keypair.address,
        etc: "...",
      });

      // this.messageToBeSigned = "";

      return new Promise((resolve, reject) => {
        resolve(null);
      });
    } else {
      console.log("No message to sign");
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.emit("leaveRoom", this.roomId);
      this.socket.disconnect();
      console.log(
        "Disconnected from Socket.io server and left room",
        this.roomId
      );
    }
  }
}

export default SocketModule;
