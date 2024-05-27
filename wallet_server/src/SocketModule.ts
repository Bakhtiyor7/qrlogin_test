import { io } from "socket.io-client";
import CryptoService from "./CryptoService";
import CryptoJS from "crypto-js";

class SocketModule {
  private privateKey: string;
  public publicKey: string;
  public socket: any;
  private roomId: string;
  private messageToBeSigned: string;

  constructor() {
    this.socket = null;
    this.roomId = "";
    this.messageToBeSigned = "";
  }
  v;

  public connectToServer(serverUrl: string, roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomId = roomId;
      this.socket = io(serverUrl);

      // connect to room
      this.socket.on("connect", () => {
        console.log("Connected to Socket.io server");
        this.socket.emit("joinRoom", roomId);
        resolve();
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from Socket.io server");
      });
    });
  }

  // send request message to DAPP
  public requestMessage(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log("Sending the request message");
      this.socket.emit("requestMessage", this.roomId, {
        message: "Request message",
      });

      this.socket.on("sendMessage", (message: string) => {
        if (message) {
          console.log("Received message:", message);
          this.messageToBeSigned = message;
          resolve(message);
        } else {
          reject(new Error("No message received"));
        }
      });
    });
  }

  // sign
  public signMessage(keypair: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.messageToBeSigned) {
        const signature = CryptoService.sign(
          this.messageToBeSigned,
          keypair.privateKey
        );
        this.socket.emit("signedMessage", this.roomId, {
          signature,
          publicKey: keypair.publicKey,
          address: keypair.address,
        });
        console.log("Signed and sent message:", this.messageToBeSigned);
        this.messageToBeSigned = "";
        resolve();
      } else {
        reject(new Error("No message to sign"));
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.emit("leaveRoom", this.roomId);
      this.socket.disconnect();
      console.log(
        "Disconnected from Socket.io server and left room",
        this.roomId
      );
    }
  }

  // public signMessage(keypair: any) {
  //   if (this.messageToBeSigned) {
  //     const signature = CryptoService.sign(
  //       this.messageToBeSigned,
  //       keypair.privateKey
  //     );
  //     this.socket.emit("signedMessage", this.roomId, {
  //       signature,
  //       publicKey: keypair.publicKey,
  //       address: keypair.address,
  //       etc: "...",
  //     });

  //     // this.messageToBeSigned = "";

  //     return new Promise((resolve, reject) => {
  //       resolve(null);
  //     });
  //   } else {
  //     console.log("No message to sign");
  //   }
  // }
}

export default SocketModule;
