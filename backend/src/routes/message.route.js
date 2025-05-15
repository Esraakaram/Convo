import express from "express";
import { sendMessage, getMessagesBetweenUsers, getInbox, deleteMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send", protectRoute, sendMessage);
router.get("/conversation/:otherUserId", protectRoute, getMessagesBetweenUsers);
router.get("/inbox", protectRoute, getInbox);
router.delete("/:messageId", protectRoute, deleteMessage);

export default router;
