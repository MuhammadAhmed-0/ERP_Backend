const mongoose = require("mongoose");
const { Schema } = mongoose;

// Fee Chalan Schema
const feeChalanSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "overdue"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    remarks: {
      type: String,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    paymentHistory: [
      {
        amount: {
          type: Number,
        },
        date: {
          type: Date,
        },
        method: {
          type: String,
        },
        receivedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

feeChalanSchema.pre("save", function (next) {
  if (this.isNew) {
    next();
  } else {
    next();
  }
});

const FeeChalan = mongoose.model("FeeChalan", feeChalanSchema);

module.exports = FeeChalan;
