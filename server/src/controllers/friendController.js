import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  if (receiverId === req.user._id.toString()) {
    res.status(400);
    throw new Error("Không thể gửi lời mời cho chính mình");
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  const currentUser = await User.findById(req.user._id);
  if (currentUser.friends.includes(receiverId)) {
    res.status(400);
    throw new Error("Hai người đã là bạn bè");
  }

  const existed = await FriendRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
    status: "pending"
  });

  if (existed) {
    res.status(400);
    throw new Error("Đã gửi lời mời trước đó");
  }

  const request = await FriendRequest.create({
    sender: req.user._id,
    receiver: receiverId
  });

  res.status(201).json(request);
});

export const getFriendRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    receiver: req.user._id,
    status: "pending"
  }).populate("sender", "-password");

  res.json(requests);
});

export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await FriendRequest.findById(requestId);

  if (!request) {
    res.status(404);
    throw new Error("Không tìm thấy lời mời");
  }

  if (request.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Bạn không có quyền xử lý lời mời này");
  }

  request.status = "accepted";
  await request.save();

  await User.findByIdAndUpdate(request.sender, {
    $addToSet: { friends: request.receiver }
  });

  await User.findByIdAndUpdate(request.receiver, {
    $addToSet: { friends: request.sender }
  });

  res.json({ message: "Đã chấp nhận lời mời kết bạn" });
});

export const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await FriendRequest.findById(requestId);

  if (!request) {
    res.status(404);
    throw new Error("Không tìm thấy lời mời");
  }

  if (request.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Bạn không có quyền xử lý lời mời này");
  }

  request.status = "rejected";
  await request.save();

  res.json({ message: "Đã từ chối lời mời kết bạn" });
});
