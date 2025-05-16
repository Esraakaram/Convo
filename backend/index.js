import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { setupSocketServer } from "./src/config/socket.config.js";
import { connectDB } from "./src/lib/db.js";
import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import groupRoutes from "./src/routes/group.route.js";
import channelsRoutes from "./src/routes/channel.route.js";
import cookieParser from "cookie-parser";

// Initialize environment variables
dotenv.config();
const PORT = process.env.PORT || 5000;

// Create Express app
const app = express();

// 👇 حط دول قبل أي app.use تاني
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.use(cookieParser());
// CORS middleware for frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Set up routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/channels", channelsRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
setupSocketServer(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
  connectDB();
});