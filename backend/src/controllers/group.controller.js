import Group from "../models/group.model.js";
import Message from "../models/message.model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;
    const creator = req.user._id;

    // التحقق من البيانات المطلوبة
    if (!name) {
      return res.status(400).json({ 
        success: false,
        message: "  the name of the group is requierd" 
      });
    }

    // إنشاء المجموعة
    const group = new Group({
      name,
      members: [creator],
      admins: [creator],
      description: description || "",
      avatar: avatar || ""
    });

    await group.save();
    res.status(201).json({ 
      success: true,
      message: "group created successfully",
      group 
    });
  } catch (err) {
    console.error("error in creating the group", err);
    res.status(500).json({ 
      success: false,
      message: " error in creating the group",
      error: err.message 
    });
  }
};

export const addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: " the group is not found " });
    // تحقق أن المستخدم الحالي عضو
    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: "يجب أن تكون عضوًا في المجموعة لإضافة أعضاء" });
    // تحقق أن المستخدم الحالي مشرف
    const isAdmin = group.admins.some(a => a.toString() === req.user._id.toString());
    if (!isAdmin) return res.status(403).json({ success: false, message: "فقط المشرف يمكنه إضافة أعضاء" });
    // تحقق أن العضو غير موجود بالفعل
    const alreadyMember = group.members.some(m => m.toString() === userId);
    if (alreadyMember) return res.status(400).json({ success: false, message: "المستخدم بالفعل عضو في المجموعة" });
    group.members.push(userId);
    await group.save();
    res.status(200).json({ success: true, message: "تمت إضافة العضو بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "حدث خطأ أثناء إضافة العضو", error: err.message });
  }
};

export const removeMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(req.user._id)) return res.status(403).json({ message: "Not a group member" });
    if (!group.admins.includes(req.user._id)) return res.status(403).json({ message: "Only admins can remove members" });
    if (!group.members.includes(userId)) return res.status(400).json({ message: "User not in group" });
    group.members = group.members.filter(id => id.toString() !== userId);
    // Optionally remove from admins as well
    group.admins = group.admins.filter(id => id.toString() !== userId);
    await group.save();
    res.status(200).json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await Group.findById(groupId).populate('members', 'fullName email profilePic');
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json({ group });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  try {
    const messages = await Message.find({ group: groupId }).populate('sender', 'fullName email profilePic').sort({ createdAt: 1 });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  const { groupId } = req.params;
  const sender = req.user._id;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "Content required" });
  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.includes(sender)) return res.status(403).json({ message: "Not a group member" });
    const message = new Message({ sender, group: groupId, content });
    await message.save();
    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    // جلب جميع المجموعات
    const groups = await Group.find({})
      .populate('members', 'fullName email profilePic')
      .populate('admins', 'fullName email profilePic');
    
    // إضافة خاصية joined و isAdmin لكل مجموعة
    const groupsWithMembership = groups.map(group => {
      const groupObj = group.toObject();
      groupObj.joined = group.members.some(member => 
        member._id.toString() === userId.toString()
      );
      groupObj.isAdmin = group.admins.some(admin => 
        admin._id.toString() === userId.toString()
      );
      return groupObj;
    });
    
    res.status(200).json({
      success: true,
      groups: groupsWithMembership
    });
  } catch (err) {
    console.error("خطأ في جلب المجموعات:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المجموعات",
      error: err.message
    });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "المجموعة غير موجودة"
      });
    }

    // التحقق من العضوية
    const isMember = group.members.some(member => 
      member.toString() === userId.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: "أنت بالفعل عضو في هذه المجموعة"
      });
    }

    // إضافة العضو للمجموعة
    group.members.push(userId);
    await group.save();

    res.status(200).json({
      success: true,
      message: "تم الانضمام للمجموعة بنجاح",
      group
    });
  } catch (err) {
    console.error("خطأ في الانضمام للمجموعة:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الانضمام للمجموعة",
      error: err.message
    });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "المجموعة غير موجودة"
      });
    }

    // التحقق من العضوية
    const isMember = group.members.some(member => 
      member.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "أنت لست عضواً في هذه المجموعة"
      });
    }

    // التحقق من المشرفين
    const isAdmin = group.admins.some(admin => 
      admin.toString() === userId.toString()
    );

    // لا يمكن للمشرف الوحيد مغادرة المجموعة
    if (isAdmin && group.admins.length === 1) {
      return res.status(400).json({
        success: false,
        message: "لا يمكن للمشرف الوحيد مغادرة المجموعة"
      });
    }

    // إزالة العضو من المجموعة
    group.members = group.members.filter(member => 
      member.toString() !== userId.toString()
    );

    // إزالة العضو من المشرفين إذا كان مشرفاً
    if (isAdmin) {
      group.admins = group.admins.filter(admin => 
        admin.toString() !== userId.toString()
      );
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "تم مغادرة المجموعة بنجاح",
      group
    });
  } catch (err) {
    console.error("خطأ في مغادرة المجموعة:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء مغادرة المجموعة",
      error: err.message
    });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "المجموعة غير موجودة" });
    }
    // فقط المشرف يمكنه الحذف
    if (!group.admins.some(admin => admin.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: "فقط المشرف يمكنه حذف المجموعة" });
    }
    await group.deleteOne();
    res.status(200).json({ success: true, message: "تم حذف المجموعة بنجاح" });
  } catch (err) {
    console.error("خطأ في حذف المجموعة:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء حذف المجموعة", error: err.message });
  }
};
