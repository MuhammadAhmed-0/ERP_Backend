const Student = require('../models/Student');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// @desc    Add a new student (admin only)
// @route   POST /api/students
// @access  Private/Admin
exports.addStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    name,
    email,
    password,
    guardianName,
    guardianContact,
    phoneNumber,
    address,
    dateOfBirth,
    grade,
    isTrailBased,
    trailEndDate,
    subjects
  } = req.body;

  try {
    // Check if student email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new student
    const student = new Student({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      guardianName,
      guardianContact,
      dateOfBirth,
      grade,
      isTrailBased: isTrailBased || false,
      trailEndDate: isTrailBased ? trailEndDate : null,
      subjects: subjects || [],
      createdBy: req.user.id
    });

    await student.save();

    res.status(201).json({ 
      msg: 'Student created successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        guardianName: student.guardianName
      }
    });

  } catch (err) {
    console.error('Error in addStudent:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get all students (with role-based access control)
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    let students;
    let projection;
    
    // Different roles see different student data
    switch (req.user.role) {
      case 'admin':
        // Admin sees all data
        students = await Student.find().select('-password').populate('subjects', 'name type');
        break;

      case 'supervisor_quran':
      case 'supervisor_subjects':
        // Supervisors see limited data
        projection = 'name email grade subjects';
        students = await Student.find().select(projection).populate('subjects', 'name type');
        break;

      case 'teacher':
        // Teachers see only their assigned students with limited data
        projection = 'name email grade subjects';
        
        // Find students where this teacher is assigned
        students = await Student.find({ 
          'assignedTeachers.teacher': req.user.id 
        }).select(projection).populate('subjects', 'name type');
        break;

      default:
        return res.status(403).json({ msg: 'Unauthorized access to student list' });
    }

    res.json(students);
  } catch (err) {
    console.error('Error in getStudents:', err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get student by ID (with role-based access control)
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Access control based on role
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Not authorized to view this student' });
    }

    // For teachers, check if they're assigned to this student
    if (req.user.role === 'teacher') {
      const isAssigned = student.assignedTeachers.some(
        assignment => assignment.teacher.toString() === req.user.id
      );

      if (!isAssigned) {
        // Return limited data for non-assigned students
        return res.json({
          id: student._id,
          name: student.name,
          grade: student.grade
        });
      }
    }

    res.json(student);
  } catch (err) {
    console.error('Error in getStudentById:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Update student profile (admin or self)
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get fields to update
  const {
    name,
    phoneNumber,
    address,
    guardianName,
    guardianContact,
    grade,
    isTrailBased,
    trailEndDate
  } = req.body;

  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Authorization check: only admin or the student themselves can update
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Not authorized to update this student' });
    }

    // Build student update object
    const studentFields = {};
    if (name) studentFields.name = name;
    if (phoneNumber) studentFields.phoneNumber = phoneNumber;
    if (address) studentFields.address = address;
    
    // Admin only fields
    if (req.user.role === 'admin') {
      if (guardianName) studentFields.guardianName = guardianName;
      if (guardianContact) studentFields.guardianContact = guardianContact;
      if (grade) studentFields.grade = grade;
      if (isTrailBased !== undefined) studentFields.isTrailBased = isTrailBased;
      if (trailEndDate) studentFields.trailEndDate = trailEndDate;
    }

    studentFields.updatedAt = Date.now();

    // Update student
    student = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: studentFields },
      { new: true }
    ).select('-password');

    res.json(student);
  } catch (err) {
    console.error('Error in updateStudent:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    View student attendance
// @route   GET /api/students/:id/attendance
// @access  Private
exports.getStudentAttendance = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Authorization check
    if (
      req.user.role !== 'admin' && 
      req.user.role !== 'supervisor_quran' && 
      req.user.role !== 'supervisor_subjects' && 
      req.user.id !== req.params.id
    ) {
      // Check if teacher is assigned to this student
      if (req.user.role === 'teacher') {
        const isAssigned = student.assignedTeachers.some(
          assignment => assignment.teacher.toString() === req.user.id
        );

        if (!isAssigned) {
          return res.status(403).json({ msg: 'Not authorized to view this student\'s attendance' });
        }
      } else {
        return res.status(403).json({ msg: 'Not authorized to view this student\'s attendance' });
      }
    }

    // Get date filters from query params
    const { startDate, endDate } = req.query;
    let attendanceFilter = student.attendance;

    if (startDate) {
      const start = new Date(startDate);
      attendanceFilter = attendanceFilter.filter(record => 
        new Date(record.date) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      attendanceFilter = attendanceFilter.filter(record => 
        new Date(record.date) <= end
      );
    }

    res.json(attendanceFilter);
  } catch (err) {
    console.error('Error in getStudentAttendance:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    View student fee history
// @route   GET /api/students/:id/fees
// @access  Private
exports.getStudentFeeHistory = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Not authorized to view this student\'s fee history' });
    }

    // Get fees with detailed information
    const feeHistory = await Promise.all(
      student.feeHistory.map(async (fee) => {
        if (fee.challanId) {
          const feeChalan = await FeeChalan.findById(fee.challanId);
          if (feeChalan) {
            return {
              ...fee.toObject(),
              challan: {
                id: feeChalan._id,
                month: feeChalan.month,
                issueDate: feeChalan.issueDate,
                dueDate: feeChalan.dueDate
              }
            };
          }
        }
        return fee;
      })
    );

    res.json(feeHistory);
  } catch (err) {
    console.error('Error in getStudentFeeHistory:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Student not found' });
    }
    res.status(500).send('Server error');
  }
};