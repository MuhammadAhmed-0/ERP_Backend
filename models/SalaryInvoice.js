const mongoose = require("mongoose");
const { Schema } = mongoose;

const salaryInvoiceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: [
        "teacher_quran",
        "teacher_subjects",
        "supervisor_quran",
        "supervisor_subjects",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    bonus: {
      amount: {
        type: Number,
        default: 0,
      },
      reason: {
        type: String,
      },
      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    month: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending"],
      default: "paid",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SalaryInvoice", salaryInvoiceSchema);
