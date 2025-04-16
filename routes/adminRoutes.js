const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const adminController = require("../controllers/adminController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.post("/users", auth, checkRole("admin"), adminController.addUser);
router.put(
  "/users/:userId",
  auth,
  checkRole("admin"),
  adminController.updateUser
);

router.get("/users", auth, checkRole("admin"), adminController.getAllUsers);
router.get(
  "/users/:role",
  auth,
  checkRole("admin"),
  adminController.getUsersByRole
);
router.put(
  "/permissions/:userId",
  auth,
  checkRole("admin"),
  adminController.updatePermissions
);

router.post(
  "/fees/challan/:userId",
  auth,
  checkRole("admin"),
  adminController.generateFeeChallan
);
router.put(
  "/fees/challan/:challanId",
  auth,
  checkRole("admin"),
  adminController.updateFeeChallan
);
router.post(
  "/salary/:userId",
  auth,
  checkRole("admin"),
  adminController.generateSalaryInvoice
);
router.put(
  "/users/soft-delete/:userId",
  auth,
  checkRole("admin"),
  adminController.softDeleteUser
);
router.delete(
  "/users/hard-delete/:userId",
  auth,
  checkRole("admin"),
  adminController.hardDeleteUser
);

module.exports = router;
