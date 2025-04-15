const mongoose = require('mongoose');
const { Schema } = mongoose;

// Base User Schema
const userSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String 
  },
  address: { 
    type: String 
  },
  profilePicture: { 
    type: String 
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'supervisor_quran', 'supervisor_subjects', 'admin'],
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { 
  discriminatorKey: 'role',
  timestamps: true 
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;