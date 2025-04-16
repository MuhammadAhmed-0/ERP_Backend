const Student = require("../models/Student");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.addStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    email,
    password,
    guardianName,
    guardianContact,
    phoneNumber,
    address,
    dateOfBirth,
    grade,
    isTrailBased,
    trailEndDate,
    subjects,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = new Student({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      guardianName,
      guardianContact,
      dateOfBirth,
      grade,
      isTrailBased: isTrailBased || false,
      trailEndDate: isTrailBased ? trailEndDate : null,
      subjects: subjects || [],
      createdBy: req.user.id,
    });

    await student.save();

    res.status(201).json({
      msg: "Student created successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        guardianName: student.guardianName,
      },
    });
  } catch (err) {
    console.error("Error in addStudent:", err.message);
    res.status(500).send("Server error");
  }
};

exports.getStudents = async (req, res) => {
  try {
    let students;
    let projection;

    switch (req.user.role) {
      case "admin":
        students = await Student.find()
          .select("-password")
          .populate("subjects", "name type");
        break;

      case "supervisor_quran":
      case "supervisor_subjects":
        projection = "name email grade subjects";
        students = await Student.find()
          .select(projection)
          .populate("subjects", "name type");
        break;

      case "teacher":
        projection = "name email grade subjects";

        students = await Student.find({
          "assignedTeachers.teacher": req.user.id,
        })
          .select(projection)
          .populate("subjects", "name type");
        break;

      default:
        return res
          .status(403)
          .json({ msg: "Unauthorized access to student list" });
    }

    res.json(students);
  } catch (err) {
    console.error("Error in getStudents:", err.message);
    res.status(500).send("Server error");
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password");

    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    if (req.user.role === "student" && req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to view this student" });
    }

    if (req.user.role === "teacher") {
      const isAssigned = student.assignedTeachers.some(
        (assignment) => assignment.teacher.toString() === req.user.id
      );

      if (!isAssigned) {
        return res.json({
          id: student._id,
          name: student.name,
          grade: student.grade,
        });
      }
    }

    res.json(student);
  } catch (err) {
    console.error("Error in getStudentById:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Student not found" });
    }
    res.status(500).send("Server error");
  }
};

exports.updateStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    phoneNumber,
    address,
    guardianName,
    guardianContact,
    grade,
    isTrailBased,
    trailEndDate,
  } = req.body;

  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to update this student" });
    }

    const studentFields = {};
    if (name) studentFields.name = name;
    if (phoneNumber) studentFields.phoneNumber = phoneNumber;
    if (address) studentFields.address = address;

    if (req.user.role === "admin") {
      if (guardianName) studentFields.guardianName = guardianName;
      if (guardianContact) studentFields.guardianContact = guardianContact;
      if (grade) studentFields.grade = grade;
      if (isTrailBased !== undefined) studentFields.isTrailBased = isTrailBased;
      if (trailEndDate) studentFields.trailEndDate = trailEndDate;
    }

    studentFields.updatedAt = Date.now();

    student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: studentFields },
      { new: true }
    ).select("-password");

    res.json(student);
  } catch (err) {
    console.error("Error in updateStudent:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Student not found" });
    }
    res.status(500).send("Server error");
  }
};

exports.getStudentAttendance = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }

    if (
      req.user.role !== "admin" &&
      req.user.role !== "supervisor_quran" &&
      req.user.role !== "supervisor_subjects" &&
      req.user.id !== req.params.id
    ) {
      if (req.user.role === "teacher") {
        const isAssigned = student.assignedTeachers.some(
          (assignment) => assignment.teacher.toString() === req.user.id
        );

        if (!isAssigned) {
          return res
            .status(403)
            .json({ msg: "Not authorized to view this student's attendance" });
        }
      } else {
        return res
          .status(403)
          .json({ msg: "Not authorized to view this student's attendance" });
      }
    }

    const { startDate, endDate } = req.query;
    let attendanceFilter = student.attendance;

    if (startDate) {
      const start = new Date(startDate);
      attendanceFilter = attendanceFilter.filter(
        (record) => new Date(record.date) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      attendanceFilter = attendanceFilter.filter(
        (record) => new Date(record.date) <= end
      );
    }

    res.json(attendanceFilter);
  } catch (err) {
    console.error("Error in getStudentAttendance:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Student not found" });
    }
    res.status(500).send("Server error");
  }
};

exports.getStudentFeeHistory = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: "Student not found" });
    }
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res
        .status(403)
        .json({ msg: "Not authorized to view this student's fee history" });
    }
    const feeHistory = await Promise.all(
      student.feeHistory.map(async (fee) => {
        if (fee.challanId) {
          const feeChalan = await FeeChalan.findById(fee.challanId);
          if (feeChalan) {
            return {
              ...fee.toObject(),
              challan: {
                id: feeChalan._id,
                month: feeChalan.month,
                issueDate: feeChalan.issueDate,
                dueDate: feeChalan.dueDate,
              },
            };
          }
        }
        return fee;
      })
    );

    res.json(feeHistory);
  } catch (err) {
    console.error("Error in getStudentFeeHistory:", err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Student not found" });
    }
    res.status(500).send("Server error");
  }
};
