import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  console.log("REGISTER START");
  console.log("REGISTER BODY:", req.body);

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    console.log("REGISTER ERROR: missing fields");
    res.status(400);
    throw new Error("Vui lòng nhập đầy đủ thông tin");
  }

  if (password.length < 6) {
    console.log("REGISTER ERROR: password too short");
    res.status(400);
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }

  console.log("CHECK EXISTED USER");
  const existedUser = await User.findOne({ email });
  console.log("CHECK EXISTED USER DONE");

  if (existedUser) {
    console.log("REGISTER ERROR: email existed");
    res.status(400);
    throw new Error("Email đã tồn tại");
  }

  console.log("CREATE USER");
  const user = await User.create({ name, email, password });
  console.log("CREATE USER DONE");

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id)
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});
