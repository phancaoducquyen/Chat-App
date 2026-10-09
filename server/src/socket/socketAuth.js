import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Không có token socket"));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Người dùng không tồn tại"));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Socket token không hợp lệ"));
  }
};
