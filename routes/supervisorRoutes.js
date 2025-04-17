const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const supervisorController = require("../controllers/supervisorController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

// Supervisor routes (both Quran and Subjects)
// router.get(
//   "/schedule",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.getSchedule
// );
// router.post(
//   "/schedule",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.createSchedule
// );
// router.put(
//   "/schedule/:id",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.updateSchedule
// );
// router.delete(
//   "/schedule/:id",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.deleteSchedule
// );

// router.get(
//   "/students",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.getAllStudents
// );
// router.get(
//   "/teachers",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.getAllTeachers
// );
// router.get(
//   "/teachers/attendance",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.getTeachersAttendance
// );
// router.get(
//   "/classes/status",
//   auth,
//   checkRole(["supervisor_quran", "supervisor_subjects"]),
//   supervisorController.getClassesStatus
// );

router.get(
  "/quran-teachers",
  auth,
  checkRole("supervisor_quran"),
  supervisorController.getQuranTeachersForSupervisor
);

router.get(
  "/subject-teachers",
  auth,
  checkRole("supervisor_subjects"),
  supervisorController.getSubjectTeachersForSupervisor
);


router.get(
  "/students/quran",
  auth,
  checkRole("supervisor_quran"),
  supervisorController.getStudentsForQuranSupervisor
);

router.get(
  "/students/subjects",
  auth,
  checkRole("supervisor_subjects"),
  supervisorController.getStudentsForSubjectSupervisor
);
module.exports = router;
