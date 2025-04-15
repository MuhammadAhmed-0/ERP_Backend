
const Schedule = require('../models/Schedule');

exports.createSchedule = async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('teacher', 'name')
      .populate('student', 'name')
      .populate('subject', 'name');
    res.json(schedules);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('teacher', 'name')
      .populate('student', 'name')
      .populate('subject', 'name');
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
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
