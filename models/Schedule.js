const mongoose = require('mongoose');
const { Schema } = mongoose;

// Class Schedule Schema
const scheduleSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  teacher: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subject: { 
    type: Schema.Types.ObjectId, 
    ref: 'Subject', 
    required: true 
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: { 
    type: String, 
    required: true 
  }, // Format: "HH:MM"
  endTime: { 
    type: String, 
    required: true 
  },   // Format: "HH:MM"
  status: { 
    type: String, 
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  lessons: [{
    title: { 
      type: String 
    },
    description: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'in-progress'] 
    },
    remarks: { 
      type: String 
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Permissions - Who can create/edit this schedule
  createdByRole: {
    type: String,
    enum: ['admin', 'supervisor_quran', 'supervisor_subjects'],
    required: true
  },
  // For recurring schedules
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly']
    },
    endDate: {
      type: Date
    }
  }
}, { 
  timestamps: true 
});

// Ensure only admins and supervisors can create/update schedules
scheduleSchema.pre('save', function(next) {
  if (this.isNew && !['admin', 'supervisor_quran', 'supervisor_subjects'].includes(this.createdByRole)) {
    const error = new Error('Only admins and supervisors can create schedules');
    return next(error);
  }
  next();
});

// Create Schedule model
const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;