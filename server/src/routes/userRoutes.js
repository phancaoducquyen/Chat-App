import express from "express";
import { getFriends, searchUsers } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/friends", protect, getFriends);

export default router;
