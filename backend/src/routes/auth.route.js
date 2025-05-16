import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  addFriend,
  removeFriend,
  blockUser,
  unblockUser,
  getFriends,
  getBlocked,
  getUserByName,
  searchUsers,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

// Social actions
router.post("/add-friend", protectRoute, addFriend);
router.post("/remove-friend", protectRoute, removeFriend);
router.post("/block-user", protectRoute, blockUser);
router.post("/unblock-user", protectRoute, unblockUser);
router.get("/friends", protectRoute, getFriends);
router.get("/blocked", protectRoute, getBlocked);
router.get("/search", protectRoute, searchUsers);
router.get("/:userName/get-user", protectRoute, getUserByName);

export default router;