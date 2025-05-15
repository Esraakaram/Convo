import express from "express";
import {
  createGroup,
  addMember,
  removeMember,
  getGroup,
  getGroupMessages,
  sendGroupMessage,
  getAllGroups,
  joinGroup,
  leaveGroup,
  deleteGroup
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getAllGroups);
router.post("/", protectRoute, createGroup);
router.post("/:groupId/join", protectRoute, joinGroup);
router.post("/:groupId/leave", protectRoute, leaveGroup);
router.post("/:groupId/add-member", protectRoute, addMember);
router.post("/:groupId/remove-member", protectRoute, removeMember);
router.get("/:groupId", protectRoute, getGroup);
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/messages", protectRoute, sendGroupMessage);
router.delete("/:groupId", protectRoute, deleteGroup);

export default router;
