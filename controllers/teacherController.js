const Teacher = require("../models/Teacher");
const Schedule = require("../models/Schedule");
const Student = require("../models/Student");
const User = require("../models/User");

exports.getTeacherSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.find({ teacher: req.params.id }).populate([
      "student",
      "subject",
    ]);
    res.json(schedule);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getTeacherAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).select("attendance");
    res.json(teacher.attendance);
  } catch (err) {
    res.status(500).send("Server Error");
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
            markedBy: req.user.id,
          },
        },
      },
      { new: true }
    );
    res.json(teacher.attendance);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getAssignedStudentsForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacherUser = await User.findById(teacherId).select("name email");

    if (!teacherUser) {
      return res.status(404).json({ msg: "Teacher not found" });
    }

    const users = await User.find({ role: "student" }).select(
      "name email gender profilePicture"
    );

    const result = [];

    for (const user of users) {
      const studentProfile = await Student.findOne({ user: user._id }).lean();

      if (!studentProfile || !Array.isArray(studentProfile.assignedTeachers)) {
        continue;
      }

      const assignedToThisTeacher = studentProfile.assignedTeachers.filter(
        (a) => a?.teacher?._id?.toString() === teacherId.toString()
      );

      if (assignedToThisTeacher.length === 0) continue;

      result.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        profilePicture: user.profilePicture,
        grade: studentProfile.grade,
        isTrailBased: studentProfile.isTrailBased,
        enrollmentDate: studentProfile.enrollmentDate,
        assignedSubjects: assignedToThisTeacher.map((a) => ({
          subject: a.subject,
          isTemporary: a.isTemporary,
          startDate: a.startDate,
          endDate: a.endDate,
        })),
        attendance: studentProfile.attendance || [],
      });
    }

    return res.status(200).json({
      msg: "Students assigned to this teacher",
      teacher: {
        _id: teacherUser._id,
        name: teacherUser.name,
        email: teacherUser.email,
      },
      count: result.length,
      students: result,
    });
  } catch (err) {
    console.error("🔥 Error fetching students for teacher:", err.message);
    res.status(500).json({
      msg: "Server error while fetching students",
      error: err.message,
    });
  }
};
