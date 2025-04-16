const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.get("/student/challans", auth, paymentController.getOwnChallans);
router.get(
  "/admin/challans",
  auth,
  checkRole("admin"),
  paymentController.getAllChallans
);
router.get(
  "/admin/salary-invoices",
  auth,
  checkRole("admin"),
  paymentController.getAllSalaryInvoices
);
router.get(
  "/employee/salary-invoice",
  auth,
  paymentController.getOwnSalaryInvoices
);

module.exports = router;
