import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const populateConversation = (query) => {
  return query.populate("members", "-password").populate("createdBy", "-password");
};

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await populateConversation(
    Conversation.find({ members: req.user._id }).sort({ updatedAt: -1 })
  );

  res.json(conversations);
});

export const createPrivateConversation = asyncHandler(async (req, res) => {
  const { memberId } = req.body;

  if (!memberId) {
    res.status(400);
    throw new Error("Thiếu memberId");
  }

  let conversation = await Conversation.findOne({
    type: "private",
    members: { $all: [req.user._id, memberId], $size: 2 }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: "private",
      members: [req.user._id, memberId],
      createdBy: req.user._id
    });
  }

  conversation = await Conversation.findById(conversation._id)
    .populate("members", "-password")
    .populate("createdBy", "-password");

  res.status(201).json(conversation);
});

export const createGroupConversation = asyncHandler(async (req, res) => {
  const { groupName, memberIds } = req.body;

  if (!groupName || !Array.isArray(memberIds)) {
    res.status(400);
    throw new Error("Thiếu tên nhóm hoặc danh sách thành viên");
  }

  const uniqueMembers = [...new Set([req.user._id.toString(), ...memberIds])];

  if (uniqueMembers.length < 2) {
    res.status(400);
    throw new Error("Nhóm cần ít nhất 2 thành viên");
  }

  let conversation = await Conversation.create({
    type: "group",
    groupName,
    members: uniqueMembers,
    createdBy: req.user._id
  });

  conversation = await Conversation.findById(conversation._id)
    .populate("members", "-password")
    .populate("createdBy", "-password");

  res.status(201).json(conversation);
});

export const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;

  const conversation = await Conversation.findById(id);

  if (!conversation) {
    res.status(404);
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  if (conversation.type !== "group") {
    res.status(400);
    throw new Error("Chỉ có thể thêm thành viên vào nhóm");
  }

  if (conversation.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Chỉ trưởng nhóm được thêm thành viên");
  }

  const user = await User.findById(memberId);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  conversation.members.addToSet(memberId);
  await conversation.save();

  const updated = await Conversation.findById(id)
    .populate("members", "-password")
    .populate("createdBy", "-password");

  res.json(updated);
});

export const removeMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;

  const conversation = await Conversation.findById(id);

  if (!conversation) {
    res.status(404);
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  if (conversation.type !== "group") {
    res.status(400);
    throw new Error("Chỉ có thể xóa thành viên khỏi nhóm");
  }

  if (conversation.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Chỉ trưởng nhóm được xóa thành viên");
  }

  conversation.members = conversation.members.filter(
    (m) => m.toString() !== memberId
  );

  await conversation.save();

  const updated = await Conversation.findById(id)
    .populate("members", "-password")
    .populate("createdBy", "-password");

  res.json(updated);
});

export const leaveConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await Conversation.findById(id);

  if (!conversation) {
    res.status(404);
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  if (conversation.type !== "group") {
    res.status(400);
    throw new Error("Chỉ nhóm mới có chức năng rời nhóm");
  }

  conversation.members = conversation.members.filter(
    (m) => m.toString() !== req.user._id.toString()
  );

  await conversation.save();

  res.json({ message: "Đã rời nhóm" });
});

export const deleteConversation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const conversation = await Conversation.findById(id);

  if (!conversation) {
    res.status(404);
    throw new Error("Không tìm thấy cuộc trò chuyện");
  }

  if (conversation.type === "group" && conversation.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Chỉ trưởng nhóm được giải tán nhóm");
  }

  await conversation.deleteOne();

  res.json({ message: "Đã xóa cuộc trò chuyện" });
});
