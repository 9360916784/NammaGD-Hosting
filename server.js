// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins (Render will host it)
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (roomId) => {
    console.log(`${socket.id} joining room ${roomId}`);
    socket.join(roomId);

    // notify existing peers in room that a new user connected
    socket.to(roomId).emit("user-connected", socket.id);

    // relay offer from one peer to another
    socket.on("offer", (offer, toId) => {
      io.to(toId).emit("offer", offer, socket.id);
    });

    // relay answer
    socket.on("answer", (answer, toId) => {
      io.to(toId).emit("answer", answer, socket.id);
    });

    // relay ICE candidate
    socket.on("candidate", (candidate, toId) => {
      io.to(toId).emit("candidate", candidate, socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      socket.to(roomId).emit("user-disconnected", socket.id);
    });

    // Leave room event (optional)
    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
