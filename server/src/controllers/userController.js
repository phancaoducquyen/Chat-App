import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || "";

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { email: { $regex: keyword, $options: "i" } }
    ]
  })
    .select("-password")
    .limit(20);

  res.json(users);
});

export const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("friends", "-password")
    .select("friends");

  res.json(user.friends || []);
});
