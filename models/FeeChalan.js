const mongoose = require('mongoose');
const { Schema } = mongoose;

// Fee Chalan Schema
const feeChalanSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  month: { 
    type: String 
  }, // Format: "YYYY-MM"
  issueDate: { 
    type: Date, 
    default: Date.now 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['paid', 'pending', 'overdue'], 
    default: 'pending' 
  },
  paymentDate: { 
    type: Date 
  },
  paymentMethod: { 
    type: String 
  },
  transactionId: { 
    type: String 
  },
  remarks: { 
    type: String 
  },
  issuedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  paymentHistory: [{
    amount: {
      type: Number
    },
    date: {
      type: Date
    },
    method: {
      type: String
    },
    receivedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, { 
  timestamps: true 
});

// Ensure only admin can issue fee chalans
feeChalanSchema.pre('save', function(next) {
  if (this.isNew) {
    // This validation would be better in the route handler
    // where we have access to the user's role
    next();
  } else {
    next();
  }
});

// Create FeeChalan model
const FeeChalan = mongoose.model('FeeChalan', feeChalanSchema);

module.exports = FeeChalan;