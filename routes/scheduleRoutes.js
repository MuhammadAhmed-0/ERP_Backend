const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.post(
  "/create",
  auth,
  checkRole("supervisor_quran", "supervisor_subjects"),
  scheduleController.createSchedule
);

router.get(
  "/list",
  auth,
  checkRole("supervisor_quran", "supervisor_subjects"),
  scheduleController.getSchedulesForSupervisor
);

router.put(
  "/update/:id",
  auth,
  checkRole("supervisor_quran", "supervisor_subjects"),
  scheduleController.updateSchedule
);

router.delete(
  "/delete/:id",
  auth,
  checkRole("supervisor_quran", "supervisor_subjects"),
  scheduleController.deleteSchedule
);

// router.get(
//   "/teacher/my-schedules",
//   auth,
//   checkRole("teacher_quran", "teacher_subjects"),
//   scheduleController.getMySchedulesAsTeacher
// );

module.exports = router;
