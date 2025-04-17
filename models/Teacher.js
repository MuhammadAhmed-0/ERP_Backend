// models/Teacher.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const teacherSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String },
  department: {
    type: String,
    enum: ["quran", "subjects"],
    required: true,
  },
  qualification: {
    type: String,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  expertise: [
    {
      type: String,
    },
  ],
  subjects: [
    {
      _id: { type: Schema.Types.ObjectId, ref: "Subject" },
      name: { type: String },
    },
  ],
  salary: {
    type: Number,
    required: true,
  },
  availability: {
    days: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],
    startTime: {
      type: String,
    },
    endTime: {
      type: String,
    },
  },
  attendance: [
    {
      date: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["present", "absent", "leave"],
      },
      markedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      remarks: {
        type: String,
      },
    },
  ],
  salaryHistory: [
    {
      month: {
        type: String,
      },
      amount: {
        type: Number,
      },
      bonusAmount: {
        type: Number,
        default: 0,
      },
      paymentDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["paid", "pending"],
      },
      remarks: {
        type: String,
      },
      processedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

module.exports = mongoose.model("Teacher", teacherSchema);
