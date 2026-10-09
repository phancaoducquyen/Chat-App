import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat_app",
  jwtSecret: process.env.JWT_SECRET || "chat_app_secret_123",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173"
};
