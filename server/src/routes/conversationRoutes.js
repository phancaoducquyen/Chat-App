import express from "express";
import {
  addMember,
  createGroupConversation,
  createPrivateConversation,
  deleteConversation,
  getConversations,
  leaveConversation,
  removeMember
} from "../controllers/conversationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getConversations);
router.post("/private", protect, createPrivateConversation);
router.post("/group", protect, createGroupConversation);
router.put("/:id/add-member", protect, addMember);
router.put("/:id/remove-member", protect, removeMember);
router.delete("/:id/leave", protect, leaveConversation);
router.delete("/:id", protect, deleteConversation);

export default router;
