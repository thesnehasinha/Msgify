const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

// CORS setup
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for testing; tighten in production
    methods: ["GET", "POST"],
  },
});

// Example socket event
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send-message", (msg) => {
    socket.broadcast.emit("receive-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ✅ Use dynamic port for Render
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("MSGIFY backend is running 🚀");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
