const Schedule = require("../models/Schedule");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const ClassHistory = require("../models/ClassHistory");
const User = require("../models/User");
const Subject = require("../models/Subject");

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

exports.getStudentsForQuranSupervisor = async (req, res) => {
  try {
    if (req.user.role !== "supervisor_quran") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const users = await User.find({ role: "student" }).select(
      "name role gender profilePicture"
    );

    const result = [];

    for (const user of users) {
      const studentProfile = await Student.findOne({ user: user._id }).lean();
      if (!studentProfile) continue;

      const subjectIds = studentProfile.subjects.map((s) => s._id || s);
      const allSubjects = await Subject.find({ _id: { $in: subjectIds } });

      const quranSubjects = allSubjects.filter((s) => s.type === "quran");
      if (quranSubjects.length === 0) continue;

      const quranSubjectIds = quranSubjects.map((s) => s._id.toString());

      const { guardianContact, feeHistory, ...safeProfile } = studentProfile;

      const filteredSubjects = studentProfile.subjects.filter((s) =>
        quranSubjectIds.includes((s._id || s).toString())
      );

      const filteredTeachers = (studentProfile.assignedTeachers || []).filter(
        (teacher) =>
          teacher.subject &&
          quranSubjectIds.includes(
            (teacher.subject._id || teacher.subject).toString()
          )
      );

      result.push({
        ...user.toObject(),
        profile: {
          ...safeProfile,
          subjects: filteredSubjects,
          assignedTeachers: filteredTeachers,
          subjectsDetails: quranSubjects,
        },
      });
    }

    res.status(200).json({
      msg: "Students for Quran supervisor",
      count: result.length,
      users: result,
    });
  } catch (err) {
    console.error("getStudentsForQuranSupervisor error:", err.message);
    res.status(500).json({ msg: "Server error while fetching students" });
  }
};

exports.getStudentsForSubjectSupervisor = async (req, res) => {
  try {
    if (req.user.role !== "supervisor_subjects") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const users = await User.find({ role: "student" }).select(
      "name role gender profilePicture"
    );

    const result = [];

    for (const user of users) {
      const studentProfile = await Student.findOne({ user: user._id }).lean();
      if (!studentProfile) continue;

      const subjectIds = studentProfile.subjects.map((s) => s._id || s);
      const allSubjects = await Subject.find({ _id: { $in: subjectIds } });

      const subjectSubjects = allSubjects.filter((s) => s.type === "subjects");
      if (subjectSubjects.length === 0) continue;

      const subjectIdsOnly = subjectSubjects.map((s) => s._id.toString());

      const { guardianContact, feeHistory, ...safeProfile } = studentProfile;

      const filteredSubjects = studentProfile.subjects.filter((s) =>
        subjectIdsOnly.includes((s._id || s).toString())
      );

      const filteredTeachers = (studentProfile.assignedTeachers || []).filter(
        (teacher) =>
          teacher.subject &&
          subjectIdsOnly.includes(
            (teacher.subject._id || teacher.subject).toString()
          )
      );

      result.push({
        ...user.toObject(),
        profile: {
          ...safeProfile,
          subjects: filteredSubjects,
          assignedTeachers: filteredTeachers,
          subjectsDetails: subjectSubjects,
        },
      });
    }

    res.status(200).json({
      msg: "Students for Subject supervisor",
      count: result.length,
      users: result,
    });
  } catch (err) {
    console.error("getStudentsForSubjectSupervisor error:", err.message);
    res.status(500).json({ msg: "Server error while fetching students" });
  }
};
