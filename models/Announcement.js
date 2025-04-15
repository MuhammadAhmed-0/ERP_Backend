const mongoose = require('mongoose');
const { Schema } = mongoose;

// Announcement Schema
const announcementSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  sender: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  recipients: {
    role: [{ 
      type: String, 
      enum: ['student', 'teacher', 'supervisor_quran', 'supervisor_subjects', 'admin', 'all'] 
    }],
    specificUsers: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }]
  },
  readBy: [{ 
    user: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    readAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  // Ensure only admins can send announcements
  senderRole: {
    type: String,
    enum: ['admin'],
    required: true
  }
}, { 
  timestamps: true 
});

// Create Announcement model
const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;