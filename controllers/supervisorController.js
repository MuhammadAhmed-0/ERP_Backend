const Schedule = require("../models/Schedule");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const ClassHistory = require("../models/ClassHistory");
const User = require("../models/User");

exports.getQuranTeachersForSupervisor = async (req, res) => {
  try {
    if (req.user.role !== "supervisor_quran") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const teachers = await User.find({ role: "teacher_quran" }).select(
      "name role gender profilePicture"
    );

    const result = [];

    for (const user of teachers) {
      const teacherProfile = await Teacher.findOne({ user: user._id }).lean();
      if (teacherProfile) {
        const { salary, salaryHistory, ...safeProfile } = teacherProfile;
        result.push({
          ...user.toObject(),
          profile: safeProfile,
        });
      }
    }

    res.status(200).json({
      msg: "Quran teachers list",
      count: result.length,
      users: result,
    });
  } catch (err) {
    console.error("getQuranTeachersForSupervisor error:", err.message);
    res.status(500).json({ msg: "Server error while fetching Quran teachers" });
  }
};
exports.getSubjectTeachersForSupervisor = async (req, res) => {
  try {
    if (req.user.role !== "supervisor_subjects") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const teachers = await User.find({ role: "teacher_subjects" }).select(
      "name role gender profilePicture"
    );

    const result = [];

    for (const user of teachers) {
      const teacherProfile = await Teacher.findOne({ user: user._id }).lean();
      if (teacherProfile) {
        const { salary, salaryHistory, ...safeProfile } = teacherProfile;
        result.push({
          ...user.toObject(),
          profile: safeProfile,
        });
      }
    }

    res.status(200).json({
      msg: "Subject teachers list",
      count: result.length,
      users: result,
    });
  } catch (err) {
    console.error("getSubjectTeachersForSupervisor error:", err.message);
    res
      .status(500)
      .json({ msg: "Server error while fetching subject teachers" });
  }
};

exports.getAllStudentsForSupervisors = async (req, res) => {
  try {
    const allowedRoles = ["supervisor_quran", "supervisor_subjects"];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const users = await User.find({ role: "student" }).select(
      "name role gender profilePicture"
    );

    const result = [];

    for (const user of users) {
      const studentProfile = await Student.findOne({ user: user._id }).lean();
      if (studentProfile) {
        const { feeHistory, guardianContact, ...safeProfile } = studentProfile;
        result.push({
          ...user.toObject(),
          profile: safeProfile,
        });
      }
    }

    res.status(200).json({
      msg: "All students for supervisors",
      count: result.length,
      users: result,
    });
  } catch (err) {
    console.error("getAllStudentsForSupervisors error:", err.message);
    res.status(500).json({ msg: "Server error while fetching students" });
  }
};

// exports.getAllTeachersForSupervisor = async (req, res) => {
//   try {
//     if (!["supervisor_quran", "supervisor_subjects"].includes(req.user.role)) {
//       return res.status(403).json({ msg: "Access denied" });
//     }

//     const teachers = await User.find({ role: "teacher" }).select(
//       "name role gender profilePicture"
//     );

//     const result = [];

//     for (const user of teachers) {
//       const teacherProfile = await Teacher.findOne({ user: user._id }).lean();

//       if (teacherProfile) {
//         const { salary, salaryHistory, ...safeProfile } = teacherProfile;
//         result.push({
//           ...user.toObject(),
//           profile: safeProfile,
//         });
//       }
//     }

//     res.status(200).json({
//       count: result.length,
//       users: result,
//     });
//   } catch (err) {
//     console.error("getAllTeachersForSupervisor error:", err.message);
//     res.status(500).json({ msg: "Server error while fetching teachers" });
//   }
// };

// exports.getAllStudentsForSupervisor = async (req, res) => {
//   try {
//     if (!["supervisor_quran", "supervisor_subjects"].includes(req.user.role)) {
//       return res.status(403).json({ msg: "Access denied" });
//     }

//     const students = await User.find({ role: "student" }).select(
//       "name role gender profilePicture"
//     );

//     const result = [];

//     for (const user of students) {
//       const studentProfile = await Student.findOne({ user: user._id }).lean();

//       if (studentProfile) {
//         const { feeHistory, guardianContact, ...safeProfile } = studentProfile;
//         result.push({
//           ...user.toObject(),
//           profile: safeProfile,
//         });
//       }
//     }

//     res.status(200).json({
//       count: result.length,
//       users: result,
//     });
//   } catch (err) {
//     console.error("getAllStudentsForSupervisor error:", err.message);
//     res.status(500).json({ msg: "Server error while fetching students" });
//   }
// };

// exports.getSchedule = async (req, res) => {
//   try {
//     const schedules = await Schedule.find().populate([
//       "student",
//       "teacher",
//       "subject",
//     ]);
//     res.json(schedules);
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };

// exports.createSchedule = async (req, res) => {
//   try {
//     const schedule = new Schedule(req.body);
//     await schedule.save();
//     res.json(schedule);
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };

// exports.updateSchedule = async (req, res) => {
//   try {
//     const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json(schedule);
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };

// exports.deleteSchedule = async (req, res) => {
//   try {
//     await Schedule.findByIdAndDelete(req.params.id);
//     res.json({ msg: "Schedule removed" });
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };

// exports.getAllStudents = async (req, res) => {
//   try {
//     const students = await Student.find().select("-password -sensitiveData");
//     res.json(students);
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };

// exports.getAllTeachers = async (req, res) => {
//   try {
//     const teachers = await Teacher.find().select("-password -sensitiveData");
//     res.json(teachers);
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };

// exports.getTeachersAttendance = async (req, res) => {
//   try {
//     const attendance = await ClassHistory.find().populate("teacher");
//     res.json(attendance);
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };

// exports.getClassesStatus = async (req, res) => {
//   try {
//     const status = await ClassHistory.find().populate([
//       "schedule",
//       "teacher",
//       "student",
//     ]);
//     res.json(status);
//   } catch (err) {
//     res.status(500).send("Server Error");
//   }
// };
