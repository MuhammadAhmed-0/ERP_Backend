const mongoose = require('mongoose');
const User = require('./User');
const { Schema } = mongoose;

// Base Supervisor Schema
const supervisorSchema = new Schema({
  department: { 
    type: String, 
    enum: ['quran', 'subjects'], 
    required: true 
  },
  subjects: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Subject' 
  }],
  joiningDate: { 
    type: Date, 
    default: Date.now 
  }
});

// Create Supervisor models for both types using User discriminator
const SupervisorQuran = User.discriminator('supervisor_quran', supervisorSchema);
const SupervisorSubjects = User.discriminator('supervisor_subjects', supervisorSchema);

module.exports = {
  SupervisorQuran,
  SupervisorSubjects
};