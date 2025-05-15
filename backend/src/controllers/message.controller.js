import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  const sender = req.user._id;
  const { receiver, content } = req.body;
  if (!receiver || !content) {
    return res.status(400).json({ message: "Receiver and content required" });
  }
  try {
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessagesBetweenUsers = async (req, res) => {
  const userId = req.user._id;
  const { otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get latest message per conversation
export const getInbox = async (req, res) => {
  const userId = req.user._id;
  try {
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            sender: "$sender",
            receiver: "$receiver",
          },
          doc: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { createdAt: -1 } },
    ]);
    res.status(200).json({ inbox: messages });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  const userId = req.user._id;
  const { messageId } = req.params;
  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.sender.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }
    await message.deleteOne();
    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
