// models/Student.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String },
  guardianName: { type: String, required: true },
  guardianContact: { type: String, required: true },
  dateOfBirth: { type: Date },
  grade: { type: String },
  enrollmentDate: { type: Date, default: Date.now },
  isTrailBased: { type: Boolean, default: true },
  trailEndDate: { type: Date },
  subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
  assignedTeachers: [
    {
      teacher: {
        _id: { type: Schema.Types.ObjectId, ref: "User" },
        name: String,
      },
      subject: {
        _id: { type: Schema.Types.ObjectId, ref: "Subject" },
        name: String,
      },
      isTemporary: { type: Boolean, default: false },
      startDate: Date,
      endDate: Date,
      assignedBy: { type: Schema.Types.ObjectId, ref: "User" },
      assignedAt: { type: Date, default: Date.now },
    },
  ],
  attendance: [
    {
      date: { type: Date },
      status: { type: String, enum: ["present", "absent", "leave"] },
      class: { type: Schema.Types.ObjectId, ref: "Schedule" },
      markedBy: { type: Schema.Types.ObjectId, ref: "User" },
      remarks: { type: String },
    },
  ],
  feeHistory: [
    {
      challanId: { type: Schema.Types.ObjectId, ref: "FeeChalan" },
      status: { type: String, enum: ["paid", "pending", "overdue"] },
      dueDate: { type: Date },
      amount: { type: Number },
      paymentDate: { type: Date },
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
