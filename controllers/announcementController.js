
const Announcement = require('../models/Announcement');

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      sender: req.user.id
    });
    await announcement.save();
    res.json(announcement);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('sender', 'name')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('sender', 'name');
    if (!announcement) {
      return res.status(404).json({ msg: 'Announcement not found' });
    }
    res.json(announcement);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(announcement);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Announcement removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
