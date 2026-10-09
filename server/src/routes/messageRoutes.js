import express from "express";
import { getMessages, seenMessage } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:conversationId", protect, getMessages);
router.put("/:messageId/seen", protect, seenMessage);

export default router;
