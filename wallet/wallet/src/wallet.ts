import { io } from "socket.io-client";
import CryptoService from "./CryptoService";

class Wallet {
  private privateKey: string;
  public publicKey: string;
  private socket: any;
  private roomId: string;
  private walletAddress: string;
  private dappPublicKey: string;
  private signMessage: string;

  constructor(walletAddress: string) {
    const { privateKey, publicKey } = CryptoService.generateKeys();
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.walletAddress = walletAddress;
    this.socket = null;
    this.roomId = "";
    this.dappPublicKey = "";
    this.signMessage = "";
  }

  public connectToServer(
    serverUrl: string,
    roomId: string,
    dappPublicKey: string
  ) {
    this.roomId = roomId;
    this.dappPublicKey = dappPublicKey;
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
    this.socket.on("messageToSign", (message: string) => {
      this.signMessage = message;
      console.log("Received message to sign:", message);
    });

    // confirm the verification, send the wallet address if true
    this.socket.on("verifySignature", (isValid: boolean) => {
      if (isValid) {
        this.sendWalletAddress();
      }
    });
  }

  public messageToSign() {
    if (this.signMessage) {
      const signature = CryptoService.sign(this.signMessage, this.privateKey);
      this.socket.emit("signedMessage", this.roomId, {
        signature,
        publicKey: this.publicKey,
      });
      this.signMessage = "";
    } else {
      console.log("No message to sign");
    }
  }

  public sendWalletAddress() {
    this.socket.emit("walletAddress", this.roomId, {
      address: this.walletAddress,
    });
    console.log("Sent wallet address to dapp:", this.walletAddress);
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

export default Wallet;
