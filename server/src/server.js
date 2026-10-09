import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./socket/index.js";

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  initSocket(httpServer);

  httpServer.listen(env.port, "0.0.0.0", () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();