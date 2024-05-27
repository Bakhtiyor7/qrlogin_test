const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", (roomID) => {
    socket.join(roomID);
    console.log(`Client joined room ${roomID}`);
  });

  socket.on("message", (roomID, data) => {
    console.log(`Received message for room ${roomID}: ${JSON.stringify(data)}`);
    io.to(roomID).emit("message", data);
  });

  socket.on("messageToSign", (roomID, data) => {
    console.log(
      `Received sign message for room ${roomID}: ${JSON.stringify(data)}`
    );
    io.to(roomID).emit("message", data);
  });

  socket.on("signedMessage", (roomId, data) => {
    console.log(
      `Recieved signed message for room ${roomId}: ${JSON.stringify(data)}`
    );
    io.to(roomId).emit("signedMessage", data);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`user left room ${roomId}`);
    // 방이 비어 있는지 확인하고 비어 있으면 자동으로 삭제됨
    if (io.sockets.adapter.rooms.get(roomId) === undefined) {
      console.log(`Room ${roomId} is empty and will be destroyed`);
    }
  });

  // socket.on("walletPublicKey", (roomId, data) => {
  //   console.log(
  //     `Received walletPublicKey for room ${roomId}: ${JSON.stringify(data)}`
  //   );
  //   io.to(roomId).emit("walletPublicKey", data);
  // });

  // socket.on("encryptedMessage", (roomId, data) => {
  //   console.log(`Received encryptedMessage for room ${roomId}: ${data}`);
  //   io.to(roomId).emit("encryptedMessage", data);
  // });

  // zigap =============

  socket.on("messageSend", (roomId, data) => {
    console.log(
      `Received request message for room ${roomId}: ${JSON.stringify(data)}`
    );
    io.to(roomId).emit("messageSend", data);
  });

  // dapp ===================

  socket.on("requestMessage", (roomId, data) => {
    console.log(
      `Received request message for room ${roomId}: ${JSON.stringify(data)}`
    );
    io.to(roomId).emit("requestMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
