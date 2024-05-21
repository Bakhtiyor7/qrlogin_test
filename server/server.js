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

  socket.on("walletPublicKey", (roomID, data) => {
    console.log(
      `Received walletPublicKey for room ${roomID}: ${JSON.stringify(data)}`
    );
    io.to(roomID).emit("walletPublicKey", data);
  });

  socket.on("encryptedMessage", (roomID, data) => {
    console.log(`Received encryptedMessage for room ${roomID}: ${data}`);
    io.to(roomID).emit("encryptedMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
