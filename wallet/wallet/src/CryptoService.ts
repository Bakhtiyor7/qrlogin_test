import { ec as EC } from "elliptic";
import { io } from "socket.io-client";
class CryptoService {
  private ec: EC;
  roomId: any;
  socket: any;
  constructor() {
    this.ec = new EC("secp256k1");
  }
  public generateKeys() {
    const keyPair = this.ec.genKeyPair();
    const privateKey = keyPair.getPrivate("hex");
    const publicKey = keyPair.getPublic("hex");
    return {
      privateKey,
      publicKey,
    };
  }
  public sign(msg: string, prKey: string) {
    const key = this.ec.keyFromPrivate(prKey, "hex");
    const signature = key.sign(msg);
    return signature;
  }
  // public verify(msg: string, sig: EC.Signature, pubKey: string) {
  //   const key = this.ec.keyFromPublic(pubKey, "hex");
  //   const verified = key.verify(msg, sig);
  //   return verified;
  // }
}
export default new CryptoService();
