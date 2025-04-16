const User = require("../models/User");
const FeeChalan = require("../models/FeeChalan");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Supervisor = require("../models/Supervisor");
const Client = require("../models/Client");
const SalaryInvoice = require("../models/SalaryInvoice");

exports.addUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied. Admins only." });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, gender, role, ...rest } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      role,
      createdBy: req.user.id,
    });

    await user.save();
    if (role === "student") {
      const student = new Student({
        user: user._id,
        ...rest,
      });

      await student.save();

      return res.status(201).json({
        msg: "Student user created successfully",
        user,
        student,
      });
    }
    if (role === "teacher_quran" || role === "teacher_subjects") {
      const department = role.includes("quran") ? "quran" : "subjects";
      const teacher = new Teacher({
        user: user._id,
        department,
        ...rest,
      });

      await teacher.save();

      return res.status(201).json({
        msg: "Teacher user created successfully",
        user,
        teacher,
      });
    }
    if (role === "supervisor_quran" || role === "supervisor_subjects") {
      const department = role.includes("quran") ? "quran" : "subjects";

      const supervisor = new Supervisor({
        user: user._id,
        department,
        ...rest,
      });

      await supervisor.save();

      return res.status(201).json({
        msg: "Supervisor user created successfully",
        user,
        supervisor,
      });
    }
    return res.status(201).json({
      msg: "User created successfully",
      user,
    });
  } catch (err) {
    console.error("Error in addUser:", err.message);
    res.status(500).json({ msg: "Server error while creating user" });
  }
};

exports.updateUser = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied. Admins only." });
  }

  const { userId } = req.params;
  const {
    name,
    email,
    phoneNumber,
    address,
    profilePicture,
    gender,
    isActive,
    role,
    password,
    ...roleSpecificFields
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (profilePicture) user.profilePicture = profilePicture;
    if (gender) user.gender = gender;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    let roleDoc;

    switch (user.role) {
      case "student":
        roleDoc = await Student.findOneAndUpdate(
          { user: user._id },
          { $set: roleSpecificFields },
          { new: true }
        );
        break;
      case "teacher":
        roleDoc = await Teacher.findOneAndUpdate(
          { user: user._id },
          { $set: roleSpecificFields },
          { new: true }
        );
        break;
      case "supervisor_quran":
      case "supervisor_subjects":
        roleDoc = await Supervisor.findOneAndUpdate(
          { user: user._id },
          { $set: roleSpecificFields },
          { new: true }
        );
        break;
    }

    res.status(200).json({
      msg: "User updated successfully",
      user,
      ...(roleDoc && { roleData: roleDoc }),
    });
  } catch (err) {
    console.error("Error in updateUser:", err.message);
    res.status(500).json({ msg: "Server error while updating user" });
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.isActive = false;
    user.updatedAt = new Date();

    await user.save();

    res.status(200).json({ msg: "User deactivated (soft deleted)", user });
  } catch (err) {
    console.error("Error in softDeleteUser:", err.message);
    res.status(500).json({ msg: "Server error during soft delete" });
  }
};

exports.hardDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const role = user.role;

    if (role === "student") {
      await Student.deleteOne({ user: user._id });
      await FeeChalan.deleteMany({ student: user._id });
    }

    if (role === "teacher") {
      await Teacher.deleteOne({ user: user._id });
      await SalaryInvoice.deleteMany({ user: user._id });
    }

    if (role === "supervisor_quran" || role === "supervisor_subjects") {
      await Supervisor.deleteOne({ user: user._id });
      await SalaryInvoice.deleteMany({ user: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res
      .status(200)
      .json({ msg: "User and all related data deleted permanently" });
  } catch (err) {
    console.error("Error in hardDeleteUser:", err.message);
    res.status(500).json({ msg: "Server error during hard delete" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password");
    const enrichedUsers = [];

    for (const user of users) {
      let profile = null;

      switch (user.role) {
        case "student":
          profile = await Student.findOne({ user: user._id });
          break;
        case "teacher_quran":
        case "teacher_subjects":
          profile = await Teacher.findOne({ user: user._id });
          break;
        case "supervisor_quran":
        case "supervisor_subjects":
          profile = await Supervisor.findOne({ user: user._id });
          break;
        default:
          profile = null;
      }

      enrichedUsers.push({
        ...user.toObject(),
        profile: profile || {},
      });
    }

    res.status(200).json({
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (err) {
    console.error("Error in getAllUsers:", err.message);
    res.status(500).json({ msg: "Server error while fetching users" });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const role = req.params.role;
    const validRoles = [
      "student",
      "teacher_quran",
      "teacher_subjects",
      "admin",
      "supervisor_quran",
      "supervisor_subjects",
    ];

    if (!validRoles.includes(role)) {
      return res
        .status(400)
        .json({ msg: `Invalid role. Valid roles: ${validRoles.join(", ")}` });
    }

    const users = await User.find({ role }).select("-password");
    const enrichedUsers = [];

    for (const user of users) {
      let profile = null;

      switch (user.role) {
        case "student":
          profile = await Student.findOne({ user: user._id });
          break;
        case "teacher_quran":
        case "teacher_subjects":
          profile = await Teacher.findOne({ user: user._id });
          break;
        case "supervisor_quran":
        case "supervisor_subjects":
          profile = await Supervisor.findOne({ user: user._id });
          break;
        default:
          profile = null;
      }

      enrichedUsers.push({
        ...user.toObject(),
        profile: profile || {},
      });
    }

    res.status(200).json({
      count: enrichedUsers.length,
      users: enrichedUsers,
    });
  } catch (err) {
    console.error("Error in getUsersByRole:", err.message);
    res.status(500).json({ msg: "Server error while fetching users by role" });
  }
};

exports.updatePermissions = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { permissions: req.body.permissions },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.generateFeeChallan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, month, dueDate, remarks } = req.body;

    if (!amount || !dueDate) {
      return res.status(400).json({ msg: "Amount and due date are required." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "Invalid user ID or user not found" });
    }
    if (user.role !== "student") {
      return res.status(403).json({
        msg: "Challan can only be generated for users with student role",
      });
    }
    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return res
        .status(404)
        .json({ msg: "No student record found linked to this user" });
    }

    const challan = new FeeChalan({
      student: user._id,
      amount,
      month,
      dueDate,
      remarks,
      status: "pending",
      issuedBy: req.user?.id || null,
    });

    await challan.save();

    student.feeHistory.push({
      challanId: challan._id,
      status: challan.status,
      dueDate: challan.dueDate,
      amount: challan.amount,
      paymentDate: null,
    });

    await student.save();

    res.status(201).json({
      msg: "Fee challan created successfully",
      challan,
    });
  } catch (err) {
    console.error("Error in generateFeeChallan:", err.message);
    res.status(500).json({ msg: "Server error while creating fee challan" });
  }
};

exports.updateFeeChallan = async (req, res) => {
  try {
    const { challanId } = req.params;
    const {
      status,
      paymentMethod,
      transactionId,
      paymentDate,
      remarks,
      amountPaid,
    } = req.body;

    const challan = await FeeChalan.findById(challanId);

    if (!challan) {
      return res.status(404).json({ msg: "Fee challan not found" });
    }

    if (status) challan.status = status;
    if (paymentMethod) challan.paymentMethod = paymentMethod;
    if (transactionId) challan.transactionId = transactionId;
    if (paymentDate) challan.paymentDate = new Date(paymentDate);
    if (remarks) challan.remarks = remarks;

    if (status === "paid") {
      challan.paymentHistory.push({
        amount: amountPaid || challan.amount,
        date: paymentDate || new Date(),
        method: paymentMethod || "manual",
        receivedBy: req.user.id,
      });
    }

    await challan.save();

    res.status(200).json({
      msg: "Fee challan updated successfully",
      challan,
    });
  } catch (err) {
    console.error("Error in updateFeeChallan:", err.message);
    res.status(500).json({ msg: "Server error while updating fee challan" });
  }
};

exports.generateSalaryInvoice = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, amount, bonusAmount, bonusReason, paymentDate, remarks } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const validRoles = [
      "teacher_quran",
      "teacher_subjects",
      "supervisor_quran",
      "supervisor_subjects",
    ];
    if (!validRoles.includes(user.role)) {
      return res
        .status(400)
        .json({ msg: "User is not eligible for salary invoice" });
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ msg: "Valid salary amount is required." });
    }

    let role = user.role;

    if (role === "teacher") {
      const teacher = await Teacher.findOne({ user: userId });
      if (!teacher) {
        return res.status(404).json({ msg: "Teacher profile not found" });
      }

      teacher.salaryHistory.push({
        month,
        amount,
        bonusAmount: bonusAmount || 0,
        paymentDate: paymentDate || new Date(),
        status: "paid",
        remarks,
        processedBy: req.user.id,
      });

      await teacher.save();
    } else {
      const supervisor = await Supervisor.findOne({ user: userId });
      if (!supervisor) {
        return res.status(404).json({ msg: "Supervisor profile not found" });
      }

      supervisor.salaryHistory = supervisor.salaryHistory || [];
      supervisor.salaryHistory.push({
        month,
        amount,
        bonusAmount: bonusAmount || 0,
        paymentDate: paymentDate || new Date(),
        status: "paid",
        remarks,
        processedBy: req.user.id,
      });

      await supervisor.save();
    }

    const salaryInvoice = new SalaryInvoice({
      user: userId,
      role,
      amount,
      bonus: {
        amount: bonusAmount || 0,
        reason: bonusReason,
        approvedBy: req.user.id,
      },
      month,
      paymentDate: paymentDate || new Date(),
      status: "paid",
      remarks,
      processedBy: req.user.id,
    });

    await salaryInvoice.save();

    res.status(201).json({
      msg: "Salary invoice generated successfully",
      salaryInvoice,
    });
  } catch (err) {
    console.error("Error in generateSalaryInvoice:", err.message);
    res
      .status(500)
      .json({ msg: "Server error while generating salary invoice" });
  }
};
