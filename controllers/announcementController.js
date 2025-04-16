const Announcement = require("../models/Announcement");

exports.createAnnouncement = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        msg: "Access denied. Only admins can create announcements.",
      });
    }

    const { title, content, recipients } = req.body;

    if (
      !title ||
      !content ||
      !recipients ||
      !Array.isArray(recipients.role) ||
      recipients.role.length === 0
    ) {
      return res.status(400).json({
        msg: "Title, content, and at least one recipient role are required.",
      });
    }

    const announcement = new Announcement({
      title,
      content,
      sender: req.user.id,
      senderRole: req.user.role,
      recipients,
    });

    await announcement.save();

    res.status(201).json({
      msg: "Announcement created successfully",
      announcement,
    });
  } catch (err) {
    console.error("Error in createAnnouncement:", err.message);
    res.status(500).json({ msg: "Server error while creating announcement" });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const userRole = req.user.role;

    const validRoles = [
      "student",
      "teacher_quran",
      "teacher_subjects",
      "supervisor_quran",
      "supervisor_subjects",
    ];

    if (!validRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ msg: "Access denied. Not allowed to view announcements." });
    }

    const announcements = await Announcement.find({
      $or: [{ "recipients.role": userRole }, { "recipients.role": "all" }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: announcements.length,
      announcements,
    });
  } catch (err) {
    console.error("Error in getAnnouncements:", err.message);
    res.status(500).json({ msg: "Server error while fetching announcements" });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, recipients } = req.body;
    if (!title && !content && !recipients) {
      return res
        .status(400)
        .json({ msg: "Please provide at least one field to update." });
    }

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ msg: "Announcement not found" });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (recipients && recipients.role?.length) {
      announcement.recipients = recipients;
    }

    await announcement.save();

    res.status(200).json({
      msg: "Announcement updated successfully",
      announcement,
    });
  } catch (err) {
    console.error("Error in updateAnnouncement:", err.message);
    res.status(500).json({ msg: "Server error while updating announcement" });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ msg: "Announcement not found" });
    }

    await announcement.deleteOne();

    res.status(200).json({ msg: "Announcement deleted successfully" });
  } catch (err) {
    console.error("Error in deleteAnnouncement:", err.message);
    res.status(500).json({ msg: "Server error while deleting announcement" });
  }
};
