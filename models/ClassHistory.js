const mongoose = require('mongoose');
const { Schema } = mongoose;

// Class History Schema - To track changes in class schedules, especially teacher replacements
const classHistorySchema = new Schema({
  schedule: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  originalTeacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  replacementTeacher: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['as-scheduled', 'teacher-changed', 'cancelled', 'rescheduled'],
    default: 'as-scheduled'
  },
  reason: {
    type: String
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  attendance: {
    teacherStatus: {
      type: String,
      enum: ['present', 'absent', 'leave'],
      default: 'present'
    },
    studentStatus: {
      type: String,
      enum: ['present', 'absent', 'leave'],
      default: 'present'
    },
    markedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    markedAt: {
      type: Date
    }
  },
  lessonCovered: {
    title: {
      type: String
    },
    description: {
      type: String
    },
    status: {
      type: String,
      enum: ['completed', 'partial', 'not-covered']
    },
    notes: {
      type: String
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Create ClassHistory model
const ClassHistory = mongoose.model('ClassHistory', classHistorySchema);

module.exports = ClassHistory;