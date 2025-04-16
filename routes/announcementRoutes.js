const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");

router.post(
  "/add",
  auth,
  checkRole("admin"),
  announcementController.createAnnouncement
);
router.get("/view", auth, announcementController.getAnnouncements);
router.put(
  "/update/:id",
  auth,
  checkRole("admin"),
  announcementController.updateAnnouncement
);
router.delete(
  "/delete/:id",
  auth,
  checkRole("admin"),
  announcementController.deleteAnnouncement
);

module.exports = router;
