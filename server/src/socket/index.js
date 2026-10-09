import { Server } from "socket.io";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { socketAuth } from "./socketAuth.js";

const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  io.use(socketAuth);

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date()
    });

    io.emit("user_online", { userId });

    socket.on("join_conversation", async ({ conversationId }) => {
      if (!conversationId) return;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      const isMember = conversation.members.some(
        (m) => m.toString() === userId
      );

      if (isMember) {
        socket.join(conversationId);
      }
    });

    socket.on("send_message", async (payload, callback) => {
      try {
        const { conversationId, text, fileUrl, fileName, fileType } = payload;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return callback?.({ ok: false, message: "Không tìm thấy cuộc trò chuyện" });
        }

        const isMember = conversation.members.some(
          (m) => m.toString() === userId
        );

        if (!isMember) {
          return callback?.({ ok: false, message: "Bạn không thuộc cuộc trò chuyện này" });
        }

        let message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text: text || "",
          fileUrl: fileUrl || "",
          fileName: fileName || "",
          fileType: fileType || "",
          seenBy: [userId]
        });

        message = await Message.findById(message._id)
          .populate("sender", "-password")
          .populate("seenBy", "-password");

        await Conversation.findByIdAndUpdate(conversationId, {
          updatedAt: new Date()
        });

        io.to(conversationId).emit("receive_message", message);

        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("message_seen", async ({ messageId, conversationId }) => {
      if (!messageId || !conversationId) return;

      const message = await Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { seenBy: userId } },
        { new: true }
      )
        .populate("sender", "-password")
        .populate("seenBy", "-password");

      io.to(conversationId).emit("message_seen", message);
    });

    socket.on("typing", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit("typing", {
        conversationId,
        user: {
          _id: socket.user._id,
          name: socket.user.name
        }
      });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      if (!conversationId) return;
      socket.to(conversationId).emit("stop_typing", {
        conversationId,
        userId
      });
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);

      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      io.emit("user_offline", {
        userId,
        lastSeen: new Date()
      });
    });
  });

  return io;
};
