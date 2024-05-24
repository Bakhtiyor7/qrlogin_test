import { io } from "socket.io-client";
import CryptoService from "./CryptoService";
import CryptoJS from "crypto-js";

class Wallet {
  private privateKey: string;
  public publicKey: string;
  public socket: any;
  private roomId: string;
  private walletAddress: string;
  private dappPublicKey: string;
  private signMessage: string;
  private sharedSecret: string;

  constructor(walletAddress: string) {
    const { privateKey, publicKey } = CryptoService.generateKeys();
    console.log("private key:", privateKey);
    console.log("public key:", publicKey);
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.walletAddress = walletAddress;
    this.socket = null;
    this.roomId = "";
    this.dappPublicKey = "";
    this.signMessage = "";
    this.sharedSecret = "";
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

    //
    this.deriveSharedSecret();
  }

  // create a shared secret
  private deriveSharedSecret() {
    this.sharedSecret = CryptoJS.SHA256(
      this.privateKey + this.dappPublicKey
    ).toString(CryptoJS.enc.Hex);
    console.log("Derived shared secret:", this.sharedSecret);
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

  public async sendWalletAddress() {
    const ecryptedAddress = await CryptoService.encrypt(
      this.walletAddress,
      this.sharedSecret
    );
    this.socket.emit("walletAddress", this.roomId, {
      // TODO: encrypt wallet address
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
