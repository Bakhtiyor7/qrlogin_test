import { io } from "socket.io-client";

class AddressProvideQR {
  public socket: any;
  private roomId: string;
  private messageToBeSigned: string;

  public QRConnectToServer(
    serverUrl: string,
    roomId: string,
    walletData
  ): Promise<void> {
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

  public sendWalletData(walletData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.emit("addressProvide", this.roomId, {
        address: walletData.address,
      });
      resolve();
    });
  }
}

export default AddressProvideQR;
