
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const FeeChalan = require('../models/FeeChalan');
const { validationResult } = require('express-validator');

exports.addUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role });
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, 
      { permissions: req.body.permissions },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement({
      ...req.body,
      createdBy: req.user.id
    });
    await announcement.save();
    res.json(announcement);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.generateFeeChallan = async (req, res) => {
  try {
    const challan = new FeeChalan({
      student: req.params.studentId,
      ...req.body
    });
    await challan.save();
    res.json(challan);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.generateSalaryInvoice = async (req, res) => {
  try {
    // Implementation for generating salary invoice
    res.json({ msg: 'Salary invoice generated' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.addTeacherBonus = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.teacherId,
      { $push: { bonuses: req.body } },
      { new: true }
    );
    res.json(teacher);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
