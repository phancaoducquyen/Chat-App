import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    res.status(404);
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  const isMember = conversation.members.some(
    (m) => m.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error("Bạn không thuộc cuộc trò chuyện này");
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "-password")
    .populate("seenBy", "-password")
    .sort({ createdAt: 1 });

  res.json(messages);
});

export const seenMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { seenBy: req.user._id } },
    { new: true }
  )
    .populate("sender", "-password")
    .populate("seenBy", "-password");

  res.json(message);
});
