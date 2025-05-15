import Channel from "../models/channel.model.js";
import Message from "../models/message.model.js";

const createChannel = async (req, res) => {
  const { name, members, description, avatar } = req.body;
  const admin = req.user._id;
  if (!name || !members || !Array.isArray(members) || !members.length < 2) {
    return res
      .status(400)
      .json({ message: "Name and at least 2 members required" });
  }

  try {
    const channel = new Channel({
      name,
      members: [...new Set([...members, admin.toString()])],
      admins: [admin],
      description,
      avatar,
    });
    await channel.save();
    res.status(201).json({ channel });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addMember = async (req, res) => {
  const { channelId } = req.params;
  const { userId } = req.body;
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    if (!channel.admins.includes(req.user._id))
      return res.status(403).json({ message: "Only admins can add members" });
    if (channel.members.includes(userId))
      return res.status(400).json({ message: "User already in the channel" });
    channel.members.push(userId);
    await channel.save();
    res.status(200).json({ message: "Member added" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getChannel = async (req, res) => {
  const { channelId } = req.params;
  try {
    const channel = await Channel.findById(channelId).populate("members");
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    res.status(200).json({ channel });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const removeMember = async (req, res) => {
  const { channelId } = req.params;
  const { userId } = req.body;
  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });
    if (!channel.admins.includes(req.user._id))
      return res.status(403).json({ message: "Only admins can add members" });
    if (!channel.members.includes(userId))
      return res
        .status(400)
        .json({ message: "User already not in the channel" });
    channel.members = channel.members.filter((id) => id.toString() !== userId);
    await channel.save();
    res.status(200).json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getChannelMessages = async (req, res) => {
  const { channelId } = req.params;
  try {
    const channel = await Channel.findById(channelId);
    const messages = await Message.find({ channel: channelId })
      .populate("admin")
      .sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const sendChannelMessage = async (req, res) => {
  const { channelId } = rea.params;
  const admin = req.user._id;
  const content = req.body;
  if (!content) return res.status(400).json({ message: "Content required" });

  try {
    const channel = await Channel.findById(channelId);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    if (!channel.admins.includes(sender))
      return res.status(403).json({ message: "Not a channel admin" });

    const message = new Message({ sender: admin, channel: channelId, content });
    await message.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  sendChannelMessage,
  getChannelMessages,
  removeMember,
  getChannel,
  createChannel,
  addMember,
};
