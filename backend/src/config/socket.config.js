import { Server as SocketIOServer } from "socket.io";
import { socketAuthMiddleware } from "../middleware/socketAuth.middleware.js";
import {
  handleDirectMessage,
  handleGroupMessage,
} from "../services/message.services.js";
import Message from "../models/message.model.js";

export function setupSocketServer(server) {
  const io = new SocketIOServer(server, {
    cors: { 
      origin: "http://localhost:5173",
      credentials: true
    },
  });

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    // Join personal room for direct messages
    socket.on("join", () => {
      socket.join(socket.user._id.toString());
    });

    // Join group room
    socket.on("join-group", (groupId) => {
      socket.join(`group_${groupId}`);
    });

    // Handle direct messages
    socket.on("send-message", async (messageData, callback) => {
      handleDirectMessage(io, socket, messageData, callback);
    });

    // Handle group messages
    socket.on("send-group-message", async (messageData, callback) => {
      handleGroupMessage(io, socket, messageData, callback);
    });

    // دعم ميزة قراءة الرسائل
    socket.on("mark-as-read", async ({ messageId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { read: true });
        io.emit("message-read", messageId);
      } catch (err) {
        // يمكن إضافة لوج أو تجاهل الخطأ
      }
    });
  });

  return io;
}
