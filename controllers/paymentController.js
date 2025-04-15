
const FeeChalan = require('../models/FeeChalan');
const Teacher = require('../models/Teacher');

exports.getStudentFeeHistory = async (req, res) => {
  try {
    const feeHistory = await FeeChalan.find({ student: req.params.studentId });
    res.json(feeHistory);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getTeacherSalaryHistory = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId).select('salaryHistory');
    res.json(teacher.salaryHistory);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.payFeeChallan = async (req, res) => {
  try {
    const challan = await FeeChalan.findByIdAndUpdate(
      req.params.challanId,
      { status: 'paid', paidAt: Date.now() },
      { new: true }
    );
    res.json(challan);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.paySalaryInvoice = async (req, res) => {
  try {
    // Implementation for paying salary invoice
    res.json({ msg: 'Salary paid successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
