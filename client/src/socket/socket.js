import { io } from "socket.io-client";

export const createSocket = () => {
  const token = localStorage.getItem("token");

  return io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
    auth: { token },
    autoConnect: false
  });
};
