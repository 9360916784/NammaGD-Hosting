// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" } // allow connections from any origin (for demo)
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", socket.id);

    socket.on("offer", (offer, toId) => {
      io.to(toId).emit("offer", offer, socket.id);
    });
    socket.on("answer", (answer, toId) => {
      io.to(toId).emit("answer", answer, socket.id);
    });
    socket.on("candidate", (candidate, toId) => {
      io.to(toId).emit("candidate", candidate, socket.id);
    });

    socket.on("leave-room", () => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-disconnected", socket.id);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling server running on port ${PORT}`));
