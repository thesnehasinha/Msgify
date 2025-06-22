const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now; tighten for production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("send-message", (msg) => {
    socket.broadcast.emit("receive-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ THIS IS REQUIRED FOR RENDER TO BIND THE RIGHT PORT
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("MSGIFY backend is running 🚀");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
