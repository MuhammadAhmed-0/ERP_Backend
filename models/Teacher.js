const mongoose = require('mongoose');
const User = require('./User');
const { Schema } = mongoose;

// Teacher Schema
const teacherSchema = new Schema({
  qualification: { 
    type: String 
  },
  joiningDate: { 
    type: Date, 
    default: Date.now 
  },
  expertise: [{ 
    type: String 
  }],
  subjects: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Subject' 
  }],
  salary: { 
    type: Number, 
    required: true 
  },
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: { 
      type: String 
    }, // Format: "HH:MM"
    endTime: { 
      type: String 
    }    // Format: "HH:MM"
  },
  attendance: [{
    date: { 
      type: Date 
    },
    status: { 
      type: String, 
      enum: ['present', 'absent', 'leave'] 
    },
    markedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    remarks: { 
      type: String 
    }
  }],
  salaryHistory: [{
    month: { 
      type: String 
    }, // Format: "YYYY-MM"
    amount: { 
      type: Number 
    },
    bonusAmount: { 
      type: Number, 
      default: 0 
    },
    paymentDate: { 
      type: Date 
    },
    status: { 
      type: String, 
      enum: ['paid', 'pending'] 
    },
    remarks: { 
      type: String 
    },
    processedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  }]
});

// Create Teacher model using User discriminator
const Teacher = User.discriminator('teacher', teacherSchema);

module.exports = Teacher;