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

  socket.on("publicKey", (data) => {
    const { roomID, publicKey } = data;
    console.log(`Received public key for room ${roomID}: ${publicKey}`);
    io.to(roomID).emit("publicKey", publicKey);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
