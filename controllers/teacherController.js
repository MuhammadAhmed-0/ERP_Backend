
const Teacher = require('../models/Teacher');
const Schedule = require('../models/Schedule');

exports.addTeacher = async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.json(teacher);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().select('-password').populate('subjects');
    res.json(teachers);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .select('-password')
      .populate('subjects');
    if (!teacher) {
      return res.status(404).json({ msg: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(teacher);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Teacher removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getTeacherSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({ teacher: req.params.id })
      .populate(['student', 'subject']);
    res.json(schedule);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getTeacherAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .select('attendance');
    res.json(teacher.attendance);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          attendance: {
            ...req.body,
            markedBy: req.user.id
          }
        }
      },
      { new: true }
    );
    res.json(teacher.attendance);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getSalaryHistory = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .select('salaryHistory');
    res.json(teacher.salaryHistory);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
