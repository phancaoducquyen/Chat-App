import express from "express";
import {
  acceptFriendRequest,
  getFriendRequests,
  rejectFriendRequest,
  sendFriendRequest
} from "../controllers/friendController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/request/:receiverId", protect, sendFriendRequest);
router.get("/requests", protect, getFriendRequests);
router.post("/accept/:requestId", protect, acceptFriendRequest);
router.post("/reject/:requestId", protect, rejectFriendRequest);

export default router;
