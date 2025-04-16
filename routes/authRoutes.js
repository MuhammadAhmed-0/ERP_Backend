const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.post(
  "/register",
  [
    auth,
    checkRole("admin"),
    [
      check("name", "Name is required").not().isEmpty(),
      check("email", "Please include a valid email").isEmail(),
      check("password", "Password must be 6 or more characters").isLength({
        min: 6,
      }),
      check("role", "Role is required").isIn([
        "student",
        "teacher",
        "supervisor_quran",
        "supervisor_subjects",
        "admin",
      ]),
    ],
  ],
  authController.registerUser
);

router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  authController.loginUser
);

router.get("/me", auth, authController.getMe);
router.post("/register-super-admin", authController.registerFirstAdmin);

// router.put(
//   "/change-password",
//   [
//     auth,
//     [
//       check("currentPassword", "Current password is required").exists(),
//       check(
//         "newPassword",
//         "New password must be 6 or more characters"
//       ).isLength({ min: 6 }),
//     ],
//   ],
//   authController.changePassword
// );
// router.post(
//   "/temp-admin",
//   [
//     check("name", "Name is required").not().isEmpty(),
//     check("email", "Valid email is required").isEmail(),
//     check("password", "Password must be 6 or more characters").isLength({
//       min: 6,
//     }),
//   ],
//   authController.tempAdminSignup
// );
module.exports = router;
