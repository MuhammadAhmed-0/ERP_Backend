const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Supervisor = require("../models/Supervisor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, ...otherFields } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      createdBy: req.user.id,
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Error in registerUser:", err.message);
    res.status(500).send("Server error");
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res
        .status(401)
        .json({ msg: "Account is inactive. Please contact administrator." });
    }
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user, result: "Logged In Successfully!" });
      }
    );
  } catch (err) {
    console.error("Error in loginUser:", err.message);
    res.status(500).send("Server error");
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    let roleData = null;

    switch (user.role) {
      case "student":
        roleData = await Student.findOne({ user: user._id }).populate().lean();
        break;

      case "teacher_quran":
      case "teacher_subjects":
        roleData = await Teacher.findOne({ user: user._id }).populate().lean();
        break;

      case "supervisor_quran":
      case "supervisor_subjects":
        roleData = await Supervisor.findOne({ user: user._id })
          .populate()
          .lean();
        break;

      default:
        break;
    }

    res.json({
      user,
      ...(roleData && { details: roleData }),
    });
  } catch (err) {
    console.error("Error in getMe:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.registerFirstAdmin = async (req, res) => {
  const {
    name,
    email,
    password,
    gender,
    phoneNumber,
    address,
    profilePicture,
    permissions,
  } = req.body;

  if (!name || !email || !password || !gender) {
    return res
      .status(400)
      .json({ msg: "Name, email, password, and gender are required." });
  }

  try {
    let existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Admin already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      gender,
      role: "admin",
      phoneNumber,
      address,
      profilePicture,
      permissions,
    });

    await newAdmin.save();

    const payload = {
      user: {
        id: newAdmin.id,
        role: newAdmin.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: newAdmin,
          msg: "Super admin registered successfully",
        });
      }
    );
  } catch (err) {
    console.error("Error in registerFirstAdmin:", err.message);
    res.status(500).send("Server error");
  }
};

// exports.changePassword = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   const { currentPassword, newPassword } = req.body;

//   try {
//     const user = await User.findById(req.user.id);

//     const isMatch = await bcrypt.compare(currentPassword, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ msg: "Current password is incorrect" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);
//     user.updatedAt = Date.now();

//     await user.save();

//     res.json({ msg: "Password updated successfully" });
//   } catch (err) {
//     console.error("Error in changePassword:", err.message);
//     res.status(500).send("Server error");
//   }
// };
// exports.tempAdminSignup = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { name, email, password, phoneNumber, profilePicture,gender } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (user) {
//       return res.status(400).json({ msg: "Admin already exists" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     user = new User({
//       name,
//       email,
//       password: hashedPassword,
//       phoneNumber,
//       profilePicture,
//       role: "admin",
//       isActive: true,
//     });

//     await user.save();

//     const payload = {
//       user: {
//         id: user.id,
//         role: user.role,
//       },
//     };

//     jwt.sign(
//       payload,
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" },
//       (err, token) => {
//         if (err) throw err;
//         res.json({ token, user, result: "User Created Successfully!" });
//       }
//     );
//   } catch (err) {
//     console.error("Error in tempAdminSignup:", err.message);
//     res.status(500).send("Server error");
//   }
// };
