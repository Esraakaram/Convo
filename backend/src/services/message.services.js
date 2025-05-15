import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

// Helper: check if userA blocked userB or vice versa
async function isBlocked(userAId, userBId) {
  const [userA, userB] = await Promise.all([
    User.findById(userAId),
    User.findById(userBId),
  ]);
  if (!userA || !userB) return true; // treat as blocked if either missing
  return userA.blocked.includes(userBId) || userB.blocked.includes(userAId);
}

export async function handleDirectMessage(
  io,
  socket,
  { sender, receiver, content },
  callback
) {
  try {
    if (sender !== socket.user._id.toString()) {
      return callback?.({ error: "Sender mismatch" });
    }

    if (await isBlocked(sender, receiver)) {
      return callback?.({ error: "You cannot message this user" });
    }

    const message = new Message({ sender, receiver, content });
    await message.save();

    io.to([receiver, sender]).emit("receive-message", message);
    callback?.({ success: true, message });
  } catch (err) {
    callback?.({ error: "Failed to send message" });
  }
}

export async function handleGroupMessage(
  io,
  socket,
  { sender, groupId, content },
  callback
) {
  try {
    if (sender !== socket.user._id.toString()) {
      return callback?.({ error: "Sender mismatch" });
    }

    const group = await Group.findById(groupId).populate("members");
    if (!group) {
      return callback?.({ error: "Group not found" });
    }

    if (!group.members.map((m) => m._id.toString()).includes(sender)) {
      return callback?.({ error: "Not a group member" });
    }

    // Block enforcement: Check if sender is blocked by any member or has blocked any member
    const otherMembers = group.members.filter(
      (m) => m._id.toString() !== sender
    );
    for (const member of otherMembers) {
      if (await isBlocked(sender, member._id.toString())) {
        return callback?.({
          error: `Blocked communication with group member: ${member.fullName}`,
        });
      }
    }

    const message = new Message({ sender, group: groupId, content });
    await message.save();

    io.to(`group_${groupId}`).emit("receive-group-message", message);
    callback?.({ success: true, message });
  } catch (err) {
    callback?.({ error: "Failed to send group message" });
  }
}
