import express from "express";
import {
  createChannel,
  addMember,
  removeMember,
  getChannel,
  getChannelMessages,
  sendChannelMessage
} from "../controllers/channel.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createChannel);
router.post("/:channelId/add-member", protectRoute, addMember);
router.post("/:channelId/remove-member", protectRoute, removeMember);
router.get("/:channelId", protectRoute, getChannel);
router.get("/:channelId/messages", protectRoute, getChannelMessages);
router.post("/:channelId/messages", protectRoute, sendChannelMessage);

export default router;
