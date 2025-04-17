const Subject = require("../models/Subject");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const User = require("../models/User");

exports.addSubject = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    const subject = new Subject({
      name,
      description,
      type,
      createdBy: req.user.id,
    });

    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ msg: "Error adding subject", error: err.message });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    let subjects;

    if (role === "student") {
      const student = await Student.findOne({ user: userId }).populate(
        "subjects"
      );
      subjects = student ? student.subjects : [];
    } else if (role === "teacher_quran" || role === "teacher_subjects") {
      const teacher = await Teacher.findOne({ user: userId }).populate(
        "subjects"
      );
      subjects = teacher ? teacher.subjects : [];
    } else {
      subjects = await Subject.find().populate("createdBy", "name role");
    }

    res.status(200).json(subjects);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching subjects", error: err.message });
  }
};

exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ msg: "Subject not found" });
    }

    res.status(200).json(subject);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching subject", error: err.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ msg: "Subject not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ msg: "Error updating subject", error: err.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ msg: "Subject not found" });
    }

    res.status(200).json({ msg: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting subject", error: err.message });
  }
};
