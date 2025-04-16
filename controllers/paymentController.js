const FeeChalan = require("../models/FeeChalan");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const User = require("../models/User");
const SalaryInvoice = require("../models/SalaryInvoice");

exports.getOwnChallans = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "student") {
      return res
        .status(403)
        .json({ msg: "Only students can access this route" });
    }

    const student = await Student.findOne({ user: userId });

    if (!student) {
      return res.status(404).json({ msg: "Student record not found" });
    }

    const challans = await FeeChalan.find({ student: userId }).sort({
      issueDate: -1,
    });

    res.status(200).json({
      msg: "Your fee challans",
      challans,
    });
  } catch (err) {
    console.error("getOwnChallans error:", err.message);
    res.status(500).json({ msg: "Server error while fetching challans" });
  }
};

exports.getAllChallans = async (req, res) => {
  try {
    const userRole = req.user.role;
    const { studentId } = req.query;

    if (userRole !== "admin") {
      return res.status(403).json({ msg: "Only admin can access this route" });
    }

    const filter = {};

    if (studentId) {
      const user = await User.findById(studentId);
      if (!user) {
        return res
          .status(404)
          .json({ msg: "User with provided studentId not found" });
      }

      const student = await Student.findOne({ user: studentId });
      if (!student) {
        return res
          .status(400)
          .json({ msg: "Provided ID does not belong to a student" });
      }

      filter.student = studentId;
    }

    const challans = await FeeChalan.find(filter)
      .populate("student", "name email")
      .sort({ status: 1, issueDate: -1 });
    res.status(200).json({
      msg: "All challans fetched successfully",
      challans,
    });
  } catch (err) {
    console.error("getAllChallans error:", err.message);
    res.status(500).json({ msg: "Server error while fetching challans" });
  }
};

exports.getAllSalaryInvoices = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole !== "admin") {
      return res.status(403).json({ msg: "Only admin can access this route" });
    }

    const { role, month, status, userId } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (month) filter.month = month;
    if (status) filter.status = status;

    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ msg: "User with provided userId not found" });
      }

      const validRoles = ["teacher", "supervisor_quran", "supervisor_subjects"];
      if (!validRoles.includes(user.role)) {
        return res.status(400).json({
          msg: "Provided ID does not belong to a teacher or supervisor",
        });
      }

      filter.user = userId;
    }

    const invoices = await SalaryInvoice.find(filter)
      .populate("user", "name email role")
      .populate("processedBy", "name")
      .sort({ paymentDate: -1 });

    res.status(200).json({
      msg: "All salary invoices fetched successfully",
      invoices,
    });
  } catch (err) {
    console.error("getAllSalaryInvoices error:", err.message);
    res
      .status(500)
      .json({ msg: "Server error while fetching salary invoices" });
  }
};


exports.getOwnSalaryInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const allowedRoles = [
      "teacher_quran",
      "teacher_subjects",
      "supervisor_quran",
      "supervisor_subjects",
    ];

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ msg: "Only teachers or supervisors can access this route" });
    }

    const invoices = await SalaryInvoice.find({
      user: userId,
      role: userRole,
    })
      .populate("processedBy", "name email role") 
      .sort({ paymentDate: -1 });

    res.status(200).json({
      msg: "Your salary invoices",
      invoices,
    });
  } catch (err) {
    console.error("getOwnSalaryInvoices error:", err.message);
    res
      .status(500)
      .json({ msg: "Server error while fetching salary invoices" });
  }
};
