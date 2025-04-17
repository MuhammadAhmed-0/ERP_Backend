const mongoose = require("mongoose");
const { Schema } = mongoose;

const supervisorSchema = new Schema({
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
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  salary: {
    type: Number,
    required: true,
  },
  salaryHistory: [
    {
      month: { type: String },
      amount: { type: Number },
      bonusAmount: { type: Number, default: 0 },
      paymentDate: { type: Date },
      status: { type: String, enum: ["paid", "pending"] },
      remarks: { type: String },
      processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

module.exports = mongoose.model("Supervisor", supervisorSchema);
