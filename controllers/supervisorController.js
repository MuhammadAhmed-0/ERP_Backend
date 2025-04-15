
const Schedule = require('../models/Schedule');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ClassHistory = require('../models/ClassHistory');

exports.getSchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate(['student', 'teacher', 'subject']);
    res.json(schedules);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(schedule);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Schedule removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password -sensitiveData');
    res.json(students);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password -sensitiveData');
    res.json(teachers);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getTeachersAttendance = async (req, res) => {
  try {
    const attendance = await ClassHistory.find().populate('teacher');
    res.json(attendance);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getClassesStatus = async (req, res) => {
  try {
    const status = await ClassHistory.find().populate(['schedule', 'teacher', 'student']);
    res.json(status);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
