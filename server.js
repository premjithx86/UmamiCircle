const app = require("./src/app");
const connectDB = require("./src/config/db");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./src/services/notificationService");
require("dotenv").config();

const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Connect to Database
connectDB();

// Initialize Socket Service
initSocket(io);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
