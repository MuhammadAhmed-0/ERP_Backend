const Schedule = require("../models/Schedule");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Subject = require("../models/Subject");
const User = require("../models/User");

exports.createSchedule = async (req, res) => {
  try {
    // Role check
    if (!["supervisor_quran", "supervisor_subjects"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Only supervisors can create schedules" });
    }

    const {
      students: studentUserIds,
      teacher: teacherUserId,
      subject,
      day,
      startTime,
      endTime,
      classDate,
      isRecurring = false,
      recurrencePattern,
    } = req.body;

    // ❗️Ensure classDate is provided
    if (!classDate) {
      return res.status(400).json({
        message: "classDate is required",
      });
    }

    const supervisorDepartment = req.user.role.split("_")[1];

    // Validate teacher
    const teacher = await Teacher.findOne({ user: teacherUserId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Validate subject
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const isQuran = subjectDoc.name.toLowerCase().includes("quran");
    if (
      (isQuran && supervisorDepartment !== "quran") ||
      (!isQuran && supervisorDepartment !== "subjects")
    ) {
      return res.status(403).json({
        message: `Supervisor of '${supervisorDepartment}' cannot schedule '${subjectDoc.name}' class.`,
      });
    }

    // Check if teacher is assigned to this subject
    const teacherSubjectIds = teacher.subjects.map((s) => s._id.toString());
    if (!teacherSubjectIds.includes(subject)) {
      return res
        .status(400)
        .json({ message: "Teacher is not assigned to this subject" });
    }

    // Validate students
    const studentDocs = await Student.find({ user: { $in: studentUserIds } });
    if (studentDocs.length !== studentUserIds.length) {
      return res
        .status(404)
        .json({ message: "One or more students not found" });
    }

    // Get student names
    const studentUsers = await User.find({ _id: { $in: studentUserIds } });
    const studentUserMap = {};
    studentUsers.forEach((user) => {
      studentUserMap[user._id.toString()] = user.name || "Unknown Student";
    });

    // ✅ Check for exact duplicate
    const duplicate = await Schedule.findOne({
      teacher: teacherUserId,
      subject: subject,
      day: day,
      startTime: startTime,
      endTime: endTime,
      classDate: new Date(classDate),
      students: { $all: studentUserIds, $size: studentUserIds.length },
    });

    if (duplicate) {
      return res.status(400).json({
        message:
          "A class with the same teacher, students, subject, date, and time already exists.",
      });
    }

    // ✅ Check student time conflicts
    for (const student of studentDocs) {
      const studentId = student.user.toString();
      const studentName = studentUserMap[studentId] || "Unknown Student";

      const isEnrolled = student.subjects.some((s) => s.toString() === subject);
      if (!isEnrolled) {
        return res.status(400).json({
          message: `Student '${studentName}' is not enrolled in this subject`,
        });
      }

      const conflict = await Schedule.findOne({
        students: studentId,
        day,
        classDate: new Date(classDate),
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      });

      if (conflict) {
        return res.status(400).json({
          message: `Student '${studentName}' already has a class during this time`,
        });
      }
    }

    // ✅ Check teacher time conflicts
    const teacherConflict = await Schedule.findOne({
      teacher: teacherUserId,
      day,
      classDate: new Date(classDate),
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (teacherConflict) {
      const teacherUser = await User.findById(teacherUserId);
      return res.status(400).json({
        message: `Teacher '${
          teacherUser?.name || "Unknown Teacher"
        }' already has a class during this time`,
      });
    }

    const teacherUser = await User.findById(teacherUserId);
    const studentNames = studentUserIds.map(
      (id) => studentUserMap[id] || "Unknown Student"
    );

    // ✅ Create schedule
    const newSchedule = new Schedule({
      students: studentUserIds,
      studentNames,
      teacher: teacherUserId,
      teacherName: teacherUser?.name || "Unknown Teacher",
      subject,
      subjectName: subjectDoc.name,
      subjectType: subjectDoc.type,
      day,
      startTime,
      endTime,
      classDate: new Date(classDate),
      isRecurring,
      recurrencePattern,
      createdBy: req.user.id,
      createdByRole: req.user.role,
    });

    await newSchedule.save();

    const formattedDate = new Date(newSchedule.classDate)
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    return res.status(201).json({
      message: "Schedule created successfully",
      schedule: {
        _id: newSchedule._id,
        students: newSchedule.students,
        studentNames: newSchedule.studentNames,
        teacher: newSchedule.teacher,
        teacherName: newSchedule.teacherName,
        subject: newSchedule.subject,
        subjectName: newSchedule.subjectName,
        subjectType: newSchedule.subjectType,
        day: newSchedule.day,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        classDate: formattedDate,
        status: newSchedule.status,
      },
    });
  } catch (error) {
    console.error("❌ Error in createSchedule:", error.stack);
    return res.status(500).json({
      message: "Server error while creating schedule",
      error: error.message,
    });
  }
};

exports.getSchedulesForSupervisor = async (req, res) => {
  try {
    const role = req.user.role;

    if (!["supervisor_quran", "supervisor_subjects"].includes(role)) {
      return res
        .status(403)
        .json({ message: "Only supervisors can view schedules" });
    }

    const department = role.split("_")[1];

    const schedules = await Schedule.find({ subjectType: department })
      .sort({ day: 1, startTime: 1 })
      .select(
        "studentNames teacherName subjectName day startTime endTime status classDate"
      );

    const formattedSchedules = schedules.map((s) => ({
      _id: s._id,
      studentNames: s.studentNames,
      teacherName: s.teacherName,
      subjectName: s.subjectName,
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      classDate: s.classDate
        ? new Date(s.classDate).toLocaleDateString("en-GB").replace(/\//g, "-")
        : null,
    }));

    const scheduledCount = schedules.filter(
      (s) => s.status === "scheduled"
    ).length;

    return res.status(200).json({
      totalScheduled: scheduledCount,
      schedules: formattedSchedules,
    });
  } catch (err) {
    console.error("❌ Error fetching schedules:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      students: studentUserIds,
      teacher: teacherUserId,
      subject,
      day,
      startTime,
      endTime,
      classDate,
    } = req.body;

    const supervisorDepartment = req.user.role?.split("_")[1];

    if (!["quran", "subjects"].includes(supervisorDepartment)) {
      return res
        .status(403)
        .json({ message: "Only supervisors can update schedules" });
    }

    if (!classDate) {
      return res.status(400).json({ message: "classDate is required" });
    }

    // Fetch existing schedule
    const existingSchedule = await Schedule.findById(id);
    if (!existingSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    // Validate teacher
    const teacher = await Teacher.findOne({ user: teacherUserId });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Validate subject
    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.status(404).json({ message: "Subject not found" });
    }

    const isQuran = subjectDoc.name.toLowerCase().includes("quran");
    if (
      (isQuran && supervisorDepartment !== "quran") ||
      (!isQuran && supervisorDepartment !== "subjects")
    ) {
      return res.status(403).json({
        message: `Supervisor of '${supervisorDepartment}' cannot schedule '${subjectDoc.name}' class.`,
      });
    }

    // Check if teacher is assigned to this subject
    const teacherSubjectIds = teacher.subjects.map((s) => s._id.toString());
    if (!teacherSubjectIds.includes(subject)) {
      return res
        .status(400)
        .json({ message: "Teacher is not assigned to this subject" });
    }

    // Validate students
    const studentDocs = await Student.find({ user: { $in: studentUserIds } });
    if (studentDocs.length !== studentUserIds.length) {
      return res
        .status(404)
        .json({ message: "One or more students not found" });
    }

    // Get user names of students
    const studentUsers = await User.find({ _id: { $in: studentUserIds } });
    const studentUserMap = {};
    studentUsers.forEach((user) => {
      studentUserMap[user._id.toString()] = user.name || "Unknown Student";
    });

    // Check for duplicate schedule
    const duplicate = await Schedule.findOne({
      _id: { $ne: id },
      teacher: teacherUserId,
      subject: subject,
      day,
      startTime,
      endTime,
      classDate: new Date(classDate),
      students: { $all: studentUserIds, $size: studentUserIds.length },
    });

    if (duplicate) {
      return res.status(400).json({
        message:
          "A class with the same teacher, students, subject, date, and time already exists.",
      });
    }

    // Check student time conflicts
    for (const student of studentDocs) {
      const studentId = student.user.toString();
      const studentName = studentUserMap[studentId] || "Unknown Student";

      const isEnrolled = student.subjects.some((s) => s.toString() === subject);
      if (!isEnrolled) {
        return res.status(400).json({
          message: `Student '${studentName}' is not enrolled in this subject`,
        });
      }

      const conflict = await Schedule.findOne({
        _id: { $ne: id },
        students: studentId,
        classDate: new Date(classDate),
        day,
        $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      });

      if (conflict) {
        return res.status(400).json({
          message: `Student '${studentName}' already has a class during this time`,
        });
      }
    }

    // Check teacher time conflicts
    const teacherConflict = await Schedule.findOne({
      _id: { $ne: id },
      teacher: teacherUserId,
      classDate: new Date(classDate),
      day,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (teacherConflict) {
      const teacherUser = await User.findById(teacherUserId);
      return res.status(400).json({
        message: `Teacher '${
          teacherUser?.name || "Unknown Teacher"
        }' already has a class during this time`,
      });
    }

    const teacherUser = await User.findById(teacherUserId);
    const studentNames = studentUserIds.map(
      (id) => studentUserMap[id] || "Unknown Student"
    );

    // ✅ Update the schedule
    existingSchedule.students = studentUserIds;
    existingSchedule.studentNames = studentNames;
    existingSchedule.teacher = teacherUserId;
    existingSchedule.teacherName = teacherUser?.name || "Unknown Teacher";
    existingSchedule.subject = subject;
    existingSchedule.subjectName = subjectDoc.name;
    existingSchedule.subjectType = subjectDoc.type;
    existingSchedule.day = day;
    existingSchedule.startTime = startTime;
    existingSchedule.endTime = endTime;
    existingSchedule.classDate = new Date(classDate);
    existingSchedule.updatedBy = req.user._id;

    await existingSchedule.save();

    const formattedDate = new Date(existingSchedule.classDate)
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    return res.status(200).json({
      message: "Schedule updated successfully",
      schedule: {
        _id: existingSchedule._id,
        studentNames: existingSchedule.studentNames,
        teacherName: existingSchedule.teacherName,
        subjectName: existingSchedule.subjectName,
        day: existingSchedule.day,
        startTime: existingSchedule.startTime,
        endTime: existingSchedule.endTime,
        classDate: formattedDate,
        status: existingSchedule.status,
      },
    });
  } catch (error) {
    console.error("❌ Error in updateSchedule:", error.stack);
    return res.status(500).json({
      message: "Server error while updating schedule",
      error: error.message,
    });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const role = req.user.role;
    const supervisorDepartment = role?.split("_")[1];

    if (!["supervisor_quran", "supervisor_subjects"].includes(role)) {
      return res
        .status(403)
        .json({ message: "Only supervisors can delete schedules" });
    }

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (schedule.subjectType !== supervisorDepartment) {
      return res.status(403).json({
        message: `You are not allowed to delete ${schedule.subjectType} class.`,
      });
    }

    await Schedule.findByIdAndDelete(id);

    return res.status(200).json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting schedule:", error.stack);
    return res.status(500).json({
      message: "Server error while deleting schedule",
      error: error.message,
    });
  }
};

// exports.getMySchedulesAsTeacher = async (req, res) => {
//   try {
//     const loggedInUser = req.user;

//     if (!["teacher_quran", "teacher_subjects"].includes(loggedInUser.role)) {
//       return res
//         .status(403)
//         .json({ message: "Only teachers can access this route" });
//     }

//     const teacherUserId = loggedInUser._id;

//     const schedules = await Schedule.find({ teacher: teacherUserId })
//       .sort({ classDate: 1, startTime: 1 })
//       .select(
//         "studentNames subjectName day startTime endTime status classDate teacherName"
//       );

//     const formattedSchedules = schedules.map((s) => ({
//       _id: s._id,
//       studentNames: s.studentNames,
//       subjectName: s.subjectName,
//       day: s.day,
//       startTime: s.startTime,
//       endTime: s.endTime,
//       status: s.status,
//       teacher:s.teacherName,
//       classDate: s.classDate
//         ? new Date(s.classDate).toLocaleDateString("en-GB").replace(/\//g, "-")
//         : null,
//     }));

//     return res.status(200).json({
//       total: formattedSchedules.length,
//       schedules: formattedSchedules,
//     });
//   } catch (error) {
//     console.error("❌ Error in getMySchedulesAsTeacher:", error.stack);
//     return res.status(500).json({
//       message: "Server error while fetching schedules",
//       error: error.message,
//     });
//   }
// };
