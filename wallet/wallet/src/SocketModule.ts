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

  // constructor(walletAddress: string) {
  constructor() {
    // const { privateKey, publicKey } = CryptoService.generateKeys();
    // console.log("private key:", privateKey);
    // console.log("public key:", publicKey);
    // this.privateKey = privateKey;
    // this.publicKey = publicKey;
    // this.walletAddress = walletAddress;
    this.socket = null;
    this.roomId = "";
    this.dappPublicKey = "";
    this.messageToBeSigned = "";
    this.sharedSecret = "";
  }
  v;

  public connectToServer(
    serverUrl: string,
    roomId: string,
    dappPublicKey: string
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

    // confirm the verification, send the wallet address if true
    // this.socket.on("verifySignature", (isValid: boolean) => {
    //   if (isValid) {
    //     this.sendWalletAddress();
    //   }
    // });

    //
    // this.deriveSharedSecret();
  }

  // create a shared secret
  // private deriveSharedSecret() {
  //   this.sharedSecret = CryptoJS.SHA256(
  //     this.privateKey + this.dappPublicKey
  //   ).toString(CryptoJS.enc.Hex);
  //   console.log("Derived shared secret:", this.sharedSecret);
  // }

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

  // public async sendWalletAddress() {
  //   const ecryptedAddress = await CryptoService.encrypt(
  //     this.walletAddress,
  //     this.sharedSecret
  //   );
  //   this.socket.emit("walletAddress", this.roomId, {
  //     // TODO: encrypt wallet address
  //     address: this.walletAddress,
  //   });
  //   console.log("Sent wallet address to dapp:", this.walletAddress);
  // }

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
