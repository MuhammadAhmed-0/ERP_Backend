const mongoose = require('mongoose');
const { Schema } = mongoose;

// Client/Parent Schema
const clientSchema = new Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  address: { 
    type: String 
  },
  students: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }], // Reference to students
  isTrailBased: { 
    type: Boolean, 
    default: false 
  },
  trailEndDate: { 
    type: Date 
  },
  notes: { 
    type: String 
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true 
});

// Create Client model
const Client = mongoose.model('Client', clientSchema);

module.exports = Client;