const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
const httpServer = createServer(app);

// Configure CORS for both REST and WebSocket
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://pprotz.org',
  'https://ppro-backend.vercel.app',
];

// CORS for Express
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://ppro-backend.vercel.app', 'https://pprotz.org'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Update these environment variables
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtpout.secureserver.net';
const EMAIL_PORT = process.env.EMAIL_PORT || 465;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

app.use(bodyParser.json());

// Counter Schema for auto-incrementing IDs
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Define admin rights
const ADMIN_RIGHTS = {
  RESET_PASSWORD: 'reset_password',
  EDIT_RIDER: 'edit_rider',
  DELETE_RIDER: 'delete_rider',
  ADD_RIDER: 'add_rider',
  MANAGE_USER: 'manage_users',
  MANAGE_BOBODASMART: 'manage_bobodasmart',
  MANAGE_WEBSITE: 'manage_website',
  MANAGE_LEADERSHIP: 'manage_leadership',
  MANAGE_DENTAL: 'manage_dental'
};

// Default admin rights array
const DEFAULT_ADMIN_RIGHTS = Object.values(ADMIN_RIGHTS);

// Enhanced Bike Rider Schema with better validation
const bikeRiderSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be longer than 50 characters']
  },
  middleName: { 
    type: String, 
    trim: true,
    maxlength: [50, 'Middle name cannot be longer than 50 characters']
  },
  surname: { 
    type: String, 
    required: [true, 'Surname is required'],
    trim: true,
    maxlength: [50, 'Surname cannot be longer than 50 characters']
  },
  gender: { 
    type: String, 
    enum: {
      values: ['Male', 'Female'],
      message: 'Gender must be either Male or Female'
    }, 
    required: [true, 'Gender is required'] 
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! Must be 10 digits.`
    },
    trim: true
  },
  region: { 
    type: String, 
    required: [true, 'Region is required'],
    trim: true,
    maxlength: [100, 'Region cannot be longer than 100 characters']
  },
  district: { 
    type: String, 
    required: [true, 'District is required'],
    trim: true,
    maxlength: [100, 'District cannot be longer than 100 characters']
  },
  ward: { 
    type: String, 
    required: [true, 'Ward is required'],
    trim: true,
    maxlength: [100, 'Ward cannot be longer than 100 characters']
  },
  village: { 
    type: String, 
    required: [true, 'Village is required'],
    trim: true,
    maxlength: [100, 'Village cannot be longer than 100 characters']
  },
  bikeStation: { 
    type: String, 
    required: [true, 'Bike station is required'],
    trim: true,
    maxlength: [100, 'Bike station cannot be longer than 100 characters']
  },
  bikeNumber: { 
    type: String, 
    required: [true, 'Bike number is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'Bike number cannot be longer than 20 characters']
  },
  license: { 
    type: String, 
    required: [true, 'License is required'],
    unique: true,
    trim: true,
    maxlength: [20, 'License cannot be longer than 20 characters']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
bikeRiderSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.surname}`;
});

const BikeRider = mongoose.model('BikeRider', bikeRiderSchema);

// Admin Schema and Model
const adminSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  middleName: { type: String, default: '' },
  department: { type: String, required: true },
  position: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  location: { type: String, default: 'Dar es Salaam, Tanzania' },
  rights: [{ type: String }],
  joinDate: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'locked'],
    default: 'active'
  },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  requirePasswordChange: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Virtual for full name
adminSchema.virtual('fullName').get(function() {
  const names = [this.firstName, this.surname];
  if (this.middleName) names.splice(1, 0, this.middleName);
  return names.join(' ');
});

// Ensure virtuals are included in JSON
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

adminSchema.methods.isAccountLocked = function() {
  return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
};

adminSchema.methods.incrementLoginAttempts = async function() {
  this.loginAttempts += 1;
  if (this.loginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  await this.save();
};

adminSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = null;
  await this.save();
};

const Admin = mongoose.model('Admin', adminSchema);

// Drop username index if it exists
mongoose.connection.on('connected', async () => {
  try {
    const collection = mongoose.connection.db.collection('admins');
    const indexes = await collection.indexes();
    
    // Check if username index exists
    const usernameIndex = indexes.find(index => index.name === 'username_1');
    if (usernameIndex) {
      await collection.dropIndex('username_1');
      console.log('Successfully dropped username index');
    }
  } catch (error) {
    // Ignore error if index doesn't exist
    if (error.code !== 27) { // 27 is the code for "IndexNotFound"
      console.error('Error dropping index:', error);
    }
  }
});

// Ride Schema
const rideSchema = new mongoose.Schema({
  riderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BikeRider', 
    required: [true, 'Rider ID is required'] 
  },
  startTime: { 
    type: Date, 
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: { 
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },
  duration: { 
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  status: { 
    type: String, 
    enum: {
      values: ['active', 'completed', 'cancelled'],
      message: 'Status must be active, completed, or cancelled'
    }, 
    default: 'active' 
  },
  vehicleType: {
    type: String,
    enum: ['Motorcycle', 'Bicycle', 'Other'],
    default: 'Motorcycle'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Ride = mongoose.model('Ride', rideSchema);

// Post Schema
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

// Social Stats Schema
const socialStatsSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  followers: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const SocialStats = mongoose.model('SocialStats', socialStatsSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['inbox', 'trash', 'spam', 'archive'],
    default: 'inbox'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', messageSchema);

// Add this schema near your other mongoose schemas
const websiteVisitSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  page: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number },
  referrer: { type: String },
  userAgent: { type: String },
  ip: { type: String }
});

const WebsiteVisit = mongoose.model('WebsiteVisit', websiteVisitSchema);

// Add this schema near your other mongoose schemas
const leadershipRegistrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  middleName: {
    type: String,
    trim: true
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female']
  },
  region: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  leadershipGoals: {
    type: String,
    required: [true, 'Leadership goals are required']
  },
  howDidYouHear: String,
  additionalComments: String,
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
});

const LeadershipRegistration = mongoose.model('LeadershipRegistration', leadershipRegistrationSchema);

// Add this schema near your other mongoose schemas (after the WebsiteVisit schema)
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

// Create sample data
async function createSampleRides() {
  try {
    // Check if we already have data
    const existingRiders = await BikeRider.countDocuments();
    if (existingRiders > 0) {
      console.log('Database already contains data, skipping sample data creation');
      return;
    }

    console.log('Creating sample data...');
    
    // Create sample riders
    const riders = await BikeRider.insertMany([
      {
        firstName: 'John',
        surname: 'Doe',
        gender: 'Male',
        phoneNumber: '0712345678',
        region: 'Sample Region',
        district: 'Sample District',
        ward: 'Sample Ward',
        village: 'Sample Village',
        bikeStation: 'Sample Station',
        bikeNumber: 'BIKE001',
        license: 'LIC001'
      },
      {
        firstName: 'Jane',
        surname: 'Smith',
        gender: 'Female',
        phoneNumber: '0787654321',
        region: 'Sample Region',
        district: 'Sample District',
        ward: 'Sample Ward',
        village: 'Sample Village',
        bikeStation: 'Sample Station',
        bikeNumber: 'BIKE002',
        license: 'LIC002'
      }
    ]);
    console.log('Created sample riders:', riders.length);

    // Create sample rides
    const rides = [];
    const now = new Date();
    const vehicleTypes = ['Motorcycle', 'Bicycle', 'Other'];
    const statuses = ['completed', 'active', 'cancelled'];
    
    for (const rider of riders) {
      // Create 10 rides per rider over the last week
      for (let i = 0; i < 10; i++) {
        const startTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const duration = Math.floor(Math.random() * 120) + 30; // 30-150 minutes
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        rides.push({
          riderId: rider._id,
          startTime,
          endTime,
          duration,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
        });
      }
    }

    await Ride.insertMany(rides);
    console.log('Created sample rides:', rides.length);
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Initialize database if needed
async function setupDatabase() {
  try {
    console.log('Checking database setup...');
    
    // Check if default admin already exists
    const defaultAdmin = await Admin.findOne({ userId: '10000' });
    if (defaultAdmin) {
      console.log('Default admin already exists, skipping initialization');
      await createSampleRides(); // Add this line to create sample rides
      return;
    }
    
    console.log('Setting up database for first time...');
    
    // Create counter if it doesn't exist
    const counter = await Counter.findOne({ _id: 'userId' });
    if (!counter) {
      await Counter.create({ _id: 'userId', seq: 0 });
    }
    
    // Create default admin with ID 10000
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const newDefaultAdmin = new Admin({
      userId: '10000',
      firstName: 'PPRO',
      surname: 'Super',
      middleName: 'Admin',
      department: 'ICT',
      position: 'Senior ICT Officer',
      email: 'admin@ppro.com',
      phoneNumber: '0123456789',
      status: 'active',
      password: hashedPassword,
      rights: DEFAULT_ADMIN_RIGHTS
    });
    await newDefaultAdmin.save();
    console.log('Default admin created with ID: 10000');
    
    await createSampleRides(); // Add this line to create sample rides
    console.log('Database setup complete');

    // Initialize counters if they don't exist
    await Counter.findOneAndUpdate(
      { _id: 'patientId' },
      { $setOnInsert: { seq: 0 } },
      { upsert: true, new: true }
    );

    await Counter.findOneAndUpdate(
      { _id: 'appointmentId' },
      { $setOnInsert: { seq: 0 } },
      { upsert: true, new: true }
    );

    console.log('Counters initialized');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Function to get next sequence value with smart ID reuse
const getNextUserId = async () => {
  try {
    console.log('Generating new user ID...');
    
    // Find the highest active user ID
    const highestUser = await Admin.findOne({}, { userId: 1 })
      .sort({ userId: -1 });
    
    if (!highestUser) {
      // No users exist (except default admin), start from 10001
      console.log('No users exist, starting from 10001');
      await Counter.findByIdAndUpdate(
        'userId',
        { seq: 1 },
        { upsert: true }
      );
      return '10001';
    }

    const highestId = parseInt(highestUser.userId);
    console.log('Current highest user ID:', highestId);

    // Find any gaps in the sequence up to the highest ID
    const allUsers = await Admin.find({
      userId: { 
        $gt: '10000',  // Greater than default admin
        $lt: highestUser.userId // Less than highest ID
      }
    }).sort({ userId: 1 });

    // Create an array of all existing IDs
    const existingIds = allUsers.map(u => parseInt(u.userId));
    
    // Find the first gap in the sequence
    let nextId = 10001;
    while (nextId < highestId) {
      if (!existingIds.includes(nextId)) {
        // Found a gap, but only use it if it's the highest available ID
        const higherUsers = await Admin.findOne({
          userId: { $gt: String(nextId) }
        });
        
        if (!higherUsers) {
          console.log('Reusing ID:', nextId);
          await Counter.findByIdAndUpdate(
            'userId',
            { seq: nextId - 10000 },
            { upsert: true }
          );
          return String(nextId).padStart(5, '0');
        }
      }
      nextId++;
    }

    // No reusable gaps found, increment the highest ID
    const newSeq = highestId - 10000 + 1;
    console.log('Using next sequential ID:', 10000 + newSeq);
    await Counter.findByIdAndUpdate(
      'userId',
      { seq: newSeq },
      { upsert: true }
    );
    return String(10000 + newSeq).padStart(5, '0');
  } catch (error) {
    console.error('Error generating user ID:', error);
    throw error;
  }
};

// Auth Middleware with role checks
const authenticateToken = async (req, res, next) => {
  try {
    console.log('Authenticating token...');
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token found');
      return res.status(401).json({ error: 'Access denied' });
    }
    
    console.log('Verifying token...');
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('Token verified:', verified);

    console.log('Finding admin...');
    const admin = await Admin.findById(verified.id);
    if (!admin) {
      console.log('Admin not found');
      return res.status(401).json({ error: 'Admin not found' });
    }
    
    console.log('Admin found:', admin);
    req.user = admin;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Rights-based middleware
const checkRights = (requiredRights) => {
  return (req, res, next) => {
    const admin = req.user;
    if (!admin) return res.status(403).json({ error: 'Admin not found' });

    const hasAllRights = requiredRights.every(right => admin.rights.includes(right));
    if (!hasAllRights) {
      return res.status(403).json({ error: 'Insufficient rights' });
    }
    next();
  };
};

// Add this new middleware for website management
const checkWebsiteAccess = async (req, res, next) => {
  try {
    const admin = req.user;
    if (!admin.rights.includes(ADMIN_RIGHTS.MANAGE_WEBSITE)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Requires website management rights.' 
      });
    }
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }
};

// Add this new middleware for BobodaSmart management
const checkBobodaAccess = async (req, res, next) => {
  try {
    const admin = req.user;
    if (!admin.rights.includes(ADMIN_RIGHTS.MANAGE_BOBODASMART)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Requires BobodaSmart management rights.' 
      });
    }
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }
};

// Add this new middleware for leadership management
const checkLeadershipAccess = async (req, res, next) => {
  try {
    const admin = req.user;
    if (!admin.rights.includes(ADMIN_RIGHTS.MANAGE_LEADERSHIP)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Requires leadership management rights.' 
      });
    }
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }
};

// Add this with other middleware functions
const checkDentalAccess = async (req, res, next) => {
  try {
    const hasRight = req.user.rights.includes('manage_dental');
    if (!hasRight) {
      return res.status(403).json({ message: 'Access denied to Dental Health Program' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking dental access rights' });
  }
};

// Add this to your routes section
app.use('/api/admin/dental/*', authenticateToken, checkDentalAccess);

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Enhanced Bike Rider Endpoints with better error handling

// Create a new bike rider
app.post('/api/admin/riders', authenticateToken, checkBobodaAccess, checkRights([ADMIN_RIGHTS.ADD_RIDER]), async (req, res) => {
  try {
    console.log('Received create rider request:', req.body);

    // First check for duplicates
    const duplicateCheck = await BikeRider.findOne({
      $or: [
        { license: req.body.license },
        { phoneNumber: req.body.phoneNumber },
        { bikeNumber: req.body.bikeNumber }
      ]
    });

    if (duplicateCheck) {
      let field = '';
      if (duplicateCheck.license === req.body.license) field = 'license';
      else if (duplicateCheck.phoneNumber === req.body.phoneNumber) field = 'phoneNumber';
      else if (duplicateCheck.bikeNumber === req.body.bikeNumber) field = 'bikeNumber';
      console.log('Duplicate found:', field);
      return res.status(400).json({ error: `This ${field} already exists` });
    }

    const newRider = new BikeRider(req.body);
    await newRider.save();
    console.log('New rider created:', newRider);
    io.emit('riderUpdate', { action: 'create', rider: newRider });
    res.status(201).json(newRider);
  } catch (err) {
    console.error('Error creating rider:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ error: `This ${field} already exists` });
    } else if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      res.status(400).json({ 
        error: 'Validation failed',
        details: errors 
      });
    } else {
      res.status(500).json({ error: 'Error creating rider' });
    }
  }
});

// Get all bike riders
app.get('/api/admin/riders', authenticateToken, checkBobodaAccess, async (req, res) => {
  try {
    const riders = await BikeRider.find();
    res.json(riders);
  } catch (err) {
    console.error('Error fetching riders:', err);
    res.status(500).json({ error: 'Error fetching riders' });
  }
});

// Get a single bike rider
app.get('/api/admin/riders/:id', authenticateToken, checkBobodaAccess, async (req, res) => {
  try {
    const rider = await BikeRider.findById(req.params.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    res.json(rider);
  } catch (err) {
    console.error('Error fetching rider:', err);
    res.status(500).json({ error: 'Error fetching rider' });
  }
});

// Update a bike rider
app.put('/api/admin/riders/:id', authenticateToken, checkBobodaAccess, checkRights([ADMIN_RIGHTS.EDIT_RIDER]), async (req, res) => {
  try {
    console.log('Updating rider:', req.params.id, req.body);

    // First check if the updated values would cause a duplicate
    const duplicateCheck = await BikeRider.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { license: req.body.license },
        { phoneNumber: req.body.phoneNumber },
        { bikeNumber: req.body.bikeNumber }
      ]
    });

    if (duplicateCheck) {
      let field = '';
      if (duplicateCheck.license === req.body.license) field = 'license';
      else if (duplicateCheck.phoneNumber === req.body.phoneNumber) field = 'phoneNumber';
      else if (duplicateCheck.bikeNumber === req.body.bikeNumber) field = 'bikeNumber';
      return res.status(400).json({ error: `This ${field} already exists` });
    }

    const rider = await BikeRider.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        surname: req.body.surname,
        gender: req.body.gender,
        phoneNumber: req.body.phoneNumber,
        region: req.body.region,
        district: req.body.district,
        ward: req.body.ward,
        village: req.body.village,
        bikeStation: req.body.bikeStation,
        bikeNumber: req.body.bikeNumber,
        license: req.body.license
      },
      { new: true, runValidators: true }
    );

    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }

    console.log('Rider updated successfully:', rider);
    res.json({ success: true, data: rider });
  } catch (err) {
    console.error('Error updating rider:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ error: `This ${field} already exists` });
    } else if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
      res.status(400).json({ 
        error: 'Validation failed',
        details: errors 
      });
    } else {
      res.status(500).json({ error: 'Error updating rider' });
    }
  }
});

// Delete a bike rider
app.delete('/api/admin/riders/:id', authenticateToken, checkBobodaAccess, checkRights([ADMIN_RIGHTS.DELETE_RIDER]), async (req, res) => {
  try {
    const rider = await BikeRider.findByIdAndDelete(req.params.id);
    if (!rider) {
      return res.status(404).json({ error: 'Rider not found' });
    }
    io.emit('riderUpdate', { action: 'delete', rider });
    res.json({ message: 'Rider deleted successfully' });
  } catch (err) {
    console.error('Error deleting rider:', err);
    res.status(500).json({ error: 'Error deleting rider' });
  }
});

// Admin Routes
app.post('/api/admin/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const admin = await Admin.findOne({ userId });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is administratively locked
    if (admin.isLocked && (!admin.lockUntil || admin.loginAttempts < 3)) {
      return res.status(403).json({ 
        message: 'This account has been locked by an administrator. Please contact support.',
        lockType: 'admin'
      });
    }

    // Check if account is locked due to failed attempts
    if (admin.isLocked && admin.lockUntil && admin.loginAttempts >= 3) {
      return res.status(403).json({ 
        message: 'This account has been locked due to invalid password. Please contact support.',
        lockType: 'password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      await admin.incrementLoginAttempts();
      
      if (admin.loginAttempts >= 3) {
        // Lock account after 3 failed attempts
        admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        admin.isLocked = true;
        await admin.save();
        
        return res.status(403).json({ 
          message: 'This account has been locked due to invalid password. Please contact support.',
          lockType: 'password'
        });
      }
      
      return res.status(401).json({ 
        message: `Invalid credentials. ${3 - admin.loginAttempts} attempts remaining.`
      });
    }

    // Reset login attempts on successful login
    await admin.resetLoginAttempts();

    if (admin.status === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // Add logging for rights
    console.log('User rights for', userId, ':', admin.rights);

    const token = jwt.sign(
      { 
        id: admin._id,
        userId: admin.userId,
        rights: admin.rights  // Make sure rights are included
      }, 
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        userId: admin.userId,
        fullName: admin.fullName,
        email: admin.email,
        position: admin.position,
        rights: admin.rights,  // Make sure rights are included
        requirePasswordChange: admin.requirePasswordChange
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/admin/users', authenticateToken, checkRights([ADMIN_RIGHTS.MANAGE_USER]), async (req, res) => {
  try {
    // Prevent creating another default admin
    if (req.body.userId === '10000') {
      return res.status(400).json({ message: 'Cannot create another default admin' });
    }

    const { firstName, surname, middleName, department, position, email, password, phoneNumber, rights } = req.body;

    // Validate required fields
    const requiredFields = {
      firstName,
      surname,
      department,
      position,
      email,
      password,
      phoneNumber
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Required fields are missing: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Check if email already exists
    const existingEmail = await Admin.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Check if phone number already exists
    const existingPhone = await Admin.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get next available user ID
    const userId = await getNextUserId();

    const newAdmin = new Admin({
      userId,
      firstName,
      surname,
      middleName: middleName || '',
      department,
      position,
      email,
      phoneNumber,
      status: 'active',
      password: hashedPassword,
      rights: rights || ['view_only']
    });

    await newAdmin.save();
    
    res.status(201).json({
      message: 'User created successfully',
      admin: {
        _id: newAdmin._id,
        userId: newAdmin.userId,
        firstName: newAdmin.firstName,
        surname: newAdmin.surname,
        middleName: newAdmin.middleName,
        department: newAdmin.department,
        position: newAdmin.position,
        email: newAdmin.email,
        phoneNumber: newAdmin.phoneNumber,
        rights: newAdmin.rights
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user: ' + error.message });
  }
});

app.get('/api/admin/users', authenticateToken, checkRights([ADMIN_RIGHTS.MANAGE_USER]), async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json(admins);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

app.get('/api/admin/users/search/:userId', authenticateToken, checkRights([ADMIN_RIGHTS.MANAGE_USER]), async (req, res) => {
  try {
    const user = await Admin.findOne({ userId: req.params.userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform the user data to ensure all required fields are included
    const userData = {
      _id: user._id,
      userId: user.userId,
      firstName: user.firstName || '',
      surname: user.surname || '',
      middleName: user.middleName || '',
      department: user.department || '',
      position: user.position || '',
      email: user.email,
      phoneNumber: user.phoneNumber,
      rights: user.rights,
      requirePasswordChange: user.requirePasswordChange,
      isLocked: user.isLocked,
      loginAttempts: user.loginAttempts,
      lockUntil: user.lockUntil
    };

    res.json(userData);
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({ message: 'Error searching user' });
  }
});

// Update admin user
app.put('/api/admin/users/:id', authenticateToken, checkRights([ADMIN_RIGHTS.MANAGE_USER]), async (req, res) => {
  try {
    // Prevent changing user ID for default admin
    if (req.body.userId) {
      const existingUser = await Admin.findById(req.params.id);
      if (existingUser && existingUser.userId === '10000' && req.body.userId !== '10000') {
        return res.status(400).json({ error: 'Cannot change default admin user ID' });
      }
    }

    const { firstName, surname, middleName, department, position, email, phoneNumber, status, rights } = req.body;
    const updates = { firstName, surname, middleName, department, position, email, phoneNumber, status, rights };

    // If password is provided, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    if (!admin) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(admin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user details endpoint
app.put('/api/admin/users/:userId/details', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Find user by userId
    const user = await Admin.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (updates.email && updates.email !== user.email) {
      const emailExists = await Admin.findOne({ email: updates.email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Check if phone number is being changed and if it's already in use
    if (updates.phoneNumber && updates.phoneNumber !== user.phoneNumber) {
      const phoneExists = await Admin.findOne({ phoneNumber: updates.phoneNumber });
      if (phoneExists) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
    }

    // Update user details
    const updatedUser = await Admin.findOneAndUpdate(
      { userId },
      {
        $set: {
          firstName: updates.firstName,
          surname: updates.surname,
          middleName: updates.middleName,
          department: updates.department,
          position: updates.position,
          email: updates.email,
          phoneNumber: updates.phoneNumber,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json({
      message: 'User details updated successfully',
      user: {
        userId: updatedUser.userId,
        firstName: updatedUser.firstName,
        surname: updatedUser.surname,
        middleName: updatedUser.middleName,
        department: updatedUser.department,
        position: updatedUser.position,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        rights: updatedUser.rights
      }
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Error updating user details' });
  }
});

// Change password endpoint
app.post('/api/admin/change-password', authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await Admin.updateOne(
      { _id: admin._id },
      { 
        $set: { 
          password: hashedPassword,
          requirePasswordChange: false,
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Password reset endpoint
app.post('/api/admin/users/:id/reset-password', authenticateToken, checkRights([ADMIN_RIGHTS.RESET_PASSWORD]), async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    // Validate input
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find the user
    const user = await Admin.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user
    const updatedUser = await Admin.findByIdAndUpdate(
      req.params.id,
      { 
        password: hashedPassword,
        requirePasswordChange: true,
        updatedAt: new Date(),
        loginAttempts: 0, // Reset login attempts
        isLocked: false, // Unlock account if it was locked
        lockUntil: null // Clear any lock timer
      },
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'Password reset successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ 
      message: 'Error resetting password',
      error: error.message 
    });
  }
});

// Delete user endpoint
app.delete('/api/admin/users/:userId', authenticateToken, checkRights([ADMIN_RIGHTS.MANAGE_USER]), async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by userId
    const user = await Admin.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting default admin
    if (user.userId === '10000') {
      return res.status(403).json({ message: 'Cannot delete default admin user' });
    }

    // Delete the user
    await Admin.deleteOne({ userId });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get user details endpoint
app.get('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by userId
    const user = await Admin.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User details retrieved successfully',
      user: {
        userId: user.userId,
        firstName: user.firstName,
        surname: user.surname,
        middleName: user.middleName || '',
        department: user.department,
        position: user.position,
        email: user.email,
        phoneNumber: user.phoneNumber,
        rights: user.rights
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
});

// Lock/Unlock user account
app.post('/api/admin/users/:id/:action', authenticateToken, checkRights([ADMIN_RIGHTS.MANAGE_USER]), async (req, res) => {
  try {
    const { id, action } = req.params;
    
    if (action !== 'lock' && action !== 'unlock') {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const user = await Admin.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent locking your own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot lock your own account' });
    }

    // Prevent locking/unlocking default admin
    if (user.userId === '10000') {
      return res.status(403).json({ message: 'Cannot modify default admin account status' });
    }

    // Update user lock status
    user.isLocked = action === 'lock';
    if (action === 'unlock') {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    await user.save();

    res.json({
      message: `Account ${action}ed successfully`,
      user: {
        _id: user._id,
        userId: user.userId,
        firstName: user.firstName,
        surname: user.surname,
        middleName: user.middleName,
        email: user.email,
        rights: user.rights,
        isLocked: user.isLocked,
        loginAttempts: user.loginAttempts,
        lockUntil: user.lockUntil
      }
    });
  } catch (error) {
    console.error(`Error ${req.params.action}ing account:`, error);
    res.status(500).json({ message: `Failed to ${req.params.action} account` });
  }
});

// Analytics endpoints
app.get('/api/admin/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'week';
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const [totalRiders, totalRides, completedRides] = await Promise.all([
      BikeRider.countDocuments(),
      Ride.countDocuments({ startTime: { $gte: startDate } }),
      Ride.countDocuments({ 
        startTime: { $gte: startDate },
        status: 'completed'
      })
    ]);

    const rideCompletionRate = totalRides > 0 ? (completedRides / totalRides) * 100 : 0;

    res.json({
      totalRiders,
      totalRides,
      completedRides,
      growth: Math.round(rideCompletionRate)
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/analytics/trends', authenticateToken, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'week';
    const now = new Date();
    let startDate;
    let interval = 'hour';
    let labels = [];

    switch (timeframe) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        for (let i = 0; i < 24; i++) {
          labels.push(`${i}:00`);
        }
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        interval = 'day';
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        interval = 'week';
        for (let i = 0; i < 4; i++) {
          labels.push(`Week ${i + 1}`);
        }
        break;
    }

    const pipeline = [
      { $match: { startTime: { $gte: startDate } } },
      { $group: {
        _id: { $dateTrunc: { date: '$startTime', unit: interval } },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ];

    const data = await Ride.aggregate(pipeline);
    
    res.json({
      labels,
      data: data.map(d => d.count)
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/analytics/categories', authenticateToken, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || 'week';
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const pipeline = [
      { 
        $match: { 
          startTime: { $gte: startDate }
        } 
      },
      { 
        $group: {
        _id: '$vehicleType',
        count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ];

    const data = await Ride.aggregate(pipeline);
    
    // Convert to expected format with default values
    const result = {
      motorcycle: 0,
      bicycle: 0,
      other: 0
    };

    data.forEach(item => {
      if (item._id) {
        result[item._id.toLowerCase()] = item.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/analytics/gender', authenticateToken, async (req, res) => {
  try {
    // Get all riders grouped by gender
    const pipeline = [
      {
        $group: {
        _id: '$gender',
        count: { $sum: 1 }
        }
      }
    ];

    const data = await BikeRider.aggregate(pipeline);
    
    // Convert to expected format with default values
    const result = {
      male: 0,
      female: 0
    };

    data.forEach(item => {
      if (item._id) {
        result[item._id.toLowerCase()] = item.count;
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching gender distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard endpoint
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
  try {
    console.log('Dashboard endpoint called');
    
    // Get total riders
    const totalRiders = await BikeRider.countDocuments();
    console.log('Total riders:', totalRiders);
    
    // Registration timeline
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeekStart = new Date();
    thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const thisYearStart = new Date(today.getFullYear(), 0, 1);
    
    const registrationsToday = await BikeRider.countDocuments({
      createdAt: { $gte: today }
    });
    
    const registrationsThisWeek = await BikeRider.countDocuments({
      createdAt: { $gte: thisWeekStart }
    });
    
    const registrationsThisMonth = await BikeRider.countDocuments({
      createdAt: { $gte: thisMonthStart }
    });
    
    const registrationsThisYear = await BikeRider.countDocuments({
      createdAt: { $gte: thisYearStart }
    });

    // Get new registrations (today) - already calculated above
    const newRegistrations = registrationsToday;

    // Get active riders (riders who have had a ride in the last 24 hours)
    const activeRidersCount = await Ride.distinct('riderId', {
      startTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).then(riders => riders.length);
    console.log('Active riders:', activeRidersCount);

    // Get gender distribution
    const genderDistribution = await BikeRider.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format gender distribution
    const genderStats = {
      male: 0,
      female: 0
    };
    genderDistribution.forEach(item => {
      if (item._id) {
        genderStats[item._id.toLowerCase()] = item.count;
      }
    });

    // Get region distribution
    const regionDistribution = await BikeRider.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get most common region
    let mostCommonRegion = "None";
    if (regionDistribution.length > 0) {
      mostCommonRegion = regionDistribution[0]._id;
    }
    
    // Get bike stations data
    const bikeStations = await BikeRider.aggregate([
      {
        $group: {
          _id: '$bikeStation',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get total stations and most common station
    const totalStations = bikeStations.length;
    let mostCommonStation = "None";
    if (bikeStations.length > 0) {
      mostCommonStation = bikeStations[0]._id;
    }

    const response = {
      totalRiders,
      newRegistrations,
      activeRiders: activeRidersCount,
      genderDistribution: genderStats,
      regionDistribution: regionDistribution.map(region => ({
        name: region._id,
        count: region.count
      })),
      // Add new data
      registrationTimeline: {
        today: registrationsToday,
        thisWeek: registrationsThisWeek,
        thisMonth: registrationsThisMonth,
        thisYear: registrationsThisYear
      },
      regions: {
        total: regionDistribution.length,
        mostCommon: mostCommonRegion
      },
      bikeStations: {
        total: totalStations,
        mostCommon: mostCommonStation
      }
    };
    
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send({ status: 'UP' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send({ 
    message: 'Welcome to the Bike Rider API!',
    timestamp: new Date().toISOString()
  });
});

// Contact Message Routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create new message
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      isRead: false
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Get all messages (protected route) with pagination
app.get('/api/admin/messages', authenticateToken, checkWebsiteAccess, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items
    const skip = (page - 1) * limit;

    console.log('Fetching messages with:', { page, limit, skip });

    const [messages, total] = await Promise.all([
      Message.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments()
    ]);

    console.log('Found messages:', messages.length);
    console.log('Total messages:', total);

    res.json({
      messages,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Mark message as read
app.put('/api/admin/messages/:id/read', authenticateToken, checkWebsiteAccess, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
});

// Delete message
app.delete('/api/admin/messages/:id', authenticateToken, checkWebsiteAccess, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// Get admin profile data
app.get('/api/admin/profile', authenticateToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    
    // Get recent activities
    const recentActivities = [
      { 
        type: 'login', 
        time: admin.lastLogin || new Date(), 
        description: 'Last login' 
      }
      // Add more activities as needed
    ];

    // Format the response data
    const responseData = {
      name: `${admin.firstName} ${admin.middleName ? admin.middleName + ' ' : ''}${admin.surname}`,
      email: admin.email,
      userId: admin.userId,
      phone: admin.phoneNumber,
      department: admin.department,
      position: admin.position,
      location: admin.location,
      rights: admin.rights,
      joinDate: admin.joinDate,
      lastLogin: admin.lastLogin,
      status: admin.status,
      recentActivities
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile data' 
    });
  }
});

// Update message status
app.put('/api/admin/messages/:id', authenticateToken, checkWebsiteAccess, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['inbox', 'trash', 'spam', 'archive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message status'
    });
  }
});

// Public tracking endpoints
app.post('/api/website/track-visit', async (req, res) => {
  try {
    const { visitorId, page, referrer } = req.body;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    const visit = new WebsiteVisit({
      visitorId,
      page,
      referrer,
      userAgent,
      ip,
      timestamp: new Date()
    });

    await visit.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

// Protected stats endpoint
app.get('/api/admin/website/stats', authenticateToken, async (req, res) => {
  try {
    const timeRange = req.query.range || 'all';
    let dateFilter = {};

    // Set date filter based on time range
    const now = new Date();
    switch (timeRange) {
      case 'today':
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter = {
          timestamp: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        };
        console.log('Today filter:', { startOfDay, endOfDay });
        break;
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { timestamp: { $gte: weekAgo } };
        console.log('Week filter:', { weekAgo });
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { timestamp: { $gte: monthAgo } };
        console.log('Month filter:', { monthAgo });
        break;
      default: // 'all'
        dateFilter = {};
        console.log('No date filter (all time)');
    }

    console.log('Applying date filter:', dateFilter);

    // Get visits based on time range
    const visits = await WebsiteVisit.find(dateFilter).sort({ timestamp: -1 });
    console.log(`Found ${visits.length} visits for ${timeRange}`);

    // Get unique visitors for this time range
    const uniqueVisitors = await WebsiteVisit.distinct('visitorId', dateFilter);
    console.log(`Found ${uniqueVisitors.length} unique visitors for ${timeRange}`);

    // Calculate page views
    const pageViews = {};
    visits.forEach(visit => {
      pageViews[visit.page] = (pageViews[visit.page] || 0) + 1;
    });

    // Calculate average time spent
    let totalDuration = 0;
    const visitsWithDuration = visits.filter(visit => visit.duration);
    visitsWithDuration.forEach(visit => {
      totalDuration += visit.duration;
    });
    const averageTimeSpent = visitsWithDuration.length > 0 
      ? Math.floor(totalDuration / visitsWithDuration.length)
      : 0;

    // Format average time
    const minutes = Math.floor(averageTimeSpent / 60000);
    const seconds = Math.floor((averageTimeSpent % 60000) / 1000);
    const formattedAvgTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Calculate bounce rate
    const bounceCount = visits.filter(visit => visit.duration < 30000).length; // Less than 30 seconds
    const bounceRate = visits.length > 0 
      ? Math.round((bounceCount / visits.length) * 100)
      : 0;

    // Group visits by date
    const visitsByDate = {};
    visits.forEach(visit => {
      const date = visit.timestamp.toISOString().split('T')[0];
      visitsByDate[date] = (visitsByDate[date] || 0) + 1;
    });

    res.json({
      visits: {
        totalVisits: visits.length,
        uniqueVisitors: uniqueVisitors.length,
        averageTimeSpent: formattedAvgTime,
        bounceRate: `${bounceRate}%`,
        pageViews,
        visitsByDate
      },
      recentVisits: visits.slice(0, 5).map(visit => ({
        page: visit.page,
        timestamp: visit.timestamp,
        duration: visit.duration,
        referrer: visit.referrer
      }))
    });

  } catch (error) {
    console.error('Error fetching website stats:', error);
    res.status(500).json({ error: 'Failed to fetch website stats' });
  }
});

// Add this temporary debug endpoint
app.get('/api/debug/visits', async (req, res) => {
  try {
    const visits = await WebsiteVisit.find().sort({ timestamp: -1 }).limit(10);
    const count = await WebsiteVisit.countDocuments();
    const uniqueVisitors = await WebsiteVisit.distinct('visitorId');
    
    res.json({
      totalVisits: count,
      uniqueVisitors: uniqueVisitors.length,
      recentVisits: visits
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Debug endpoint error' });
  }
});

// Add this endpoint to handle the form submission
app.post('/api/leadership-registration', async (req, res) => {
  try {
    const {
      firstName, middleName, surname, email, phone,
      gender, region, district, ward,
      experience, leadershipGoals, additionalComments
    } = req.body;

    const registration = new LeadershipRegistration({
      firstName,
      middleName,
      surname,
      email,
      phone,
      gender,
      region,
      district,
      ward,
      experience,
      leadershipGoals,
      additionalComments,
      status: 'pending',
      registrationDate: new Date()
    });

    await registration.save();
    res.json({ success: true, message: 'Registration submitted successfully' });
  } catch (error) {
    console.error('Error in leadership registration:', error);
    res.status(500).json({ success: false, message: 'Failed to submit registration' });
  }
});

// Get all leadership registrations (protected route)
app.get('/api/admin/leadership-registrations', authenticateToken, checkLeadershipAccess, async (req, res) => {
  try {
    const registrations = await LeadershipRegistration.find()
      .sort({ registrationDate: -1 });

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching leadership registrations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations'
    });
  }
});

// Update registration status
app.put('/api/admin/leadership-registrations/:id/status', authenticateToken, checkLeadershipAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const registration = await LeadershipRegistration.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration status'
    });
  }
});

// Add this endpoint for updating leadership registrations
app.put('/api/admin/leadership-registrations/:id', authenticateToken, checkLeadershipAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const registration = await LeadershipRegistration.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update registration'
    });
  }
});

// Add this endpoint for deleting leadership registrations
app.delete('/api/admin/leadership-registrations/:id', authenticateToken, checkLeadershipAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const registration = await LeadershipRegistration.findByIdAndDelete(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete registration'
    });
  }
});

// Get all subscribers (protected route)
app.get('/api/admin/subscribers', authenticateToken, checkWebsiteAccess, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscribers'
    });
  }
});

// Subscribe endpoint (public)
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check for existing subscriber
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed'
      });
    }

    // Create new subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // Send welcome email
    const mailOptions = {
      from: `"PPRO Tanzania" <${EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to PPRO Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to PPRO Newsletter!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive updates about our latest projects and initiatives.</p>
          <p>Stay connected with us and be part of our mission to reduce poverty.</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              If you didn't subscribe to this newsletter, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Error in subscribe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe'
    });
  }
});

// Delete subscriber (protected route)
app.delete('/api/admin/subscribers/:id', authenticateToken, checkWebsiteAccess, async (req, res) => {
  try {
    const result = await Subscriber.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscriber'
    });
  }
});

// Send message to subscribers (protected route)
app.post('/api/admin/subscribers/send-message', authenticateToken, checkWebsiteAccess, async (req, res) => {
  try {
    const { message, subject } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const subscribers = await Subscriber.find();
    
    // Send email to all subscribers
    const mailOptions = {
      from: `"PPRO Tanzania" <${EMAIL_USER}>`,
      bcc: subscribers.map(sub => sub.email),
      subject: subject || 'PPRO Newsletter Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${message}
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              You're receiving this email because you subscribed to PPRO newsletter.
              <br>
              To unsubscribe, please contact us.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Message sent to ${subscribers.length} subscribers`
    });
  } catch (error) {
    console.error('Error sending message to subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Create email transporter - add this after your environment variables
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true, // Use SSL
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Add email verification
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// MongoDB connection with better error handling
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(async () => {
  console.log('MongoDB connected!');
  await setupDatabase();
  console.log('Database initialization complete!');
  
  // Start the server
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Add these schemas after your existing schemas

// Patient Schema
const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  contactNumber: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  medicalHistory: [{
    condition: String,
    diagnosis: String,
    date: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
    default: 'Scheduled'
  },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Treatment Schema
const treatmentSchema = new mongoose.Schema({
  treatmentId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  appointmentId: { type: String, required: true },
  procedure: { type: String, required: true },
  diagnosis: String,
  notes: String,
  cost: { type: Number, required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Treatment = mongoose.model('Treatment', treatmentSchema);

// Dental API Routes
// Get dashboard statistics
app.get('/api/admin/dental/stats', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'Completed' });

    res.json({
      totalPatients,
      todayAppointments,
      totalAppointments,
      completedAppointments
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Patient Routes
app.post('/api/admin/dental/patients', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    // Get next sequence for patientId
    const getNextSequence = async (name) => {
      const counter = await Counter.findByIdAndUpdate(
        name,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      return counter.seq;
    };

    const patientId = await getNextSequence('patientId');
    
    // Create new patient with formatted ID
    const patient = new Patient({
      ...req.body,
      patientId: `PAT${String(patientId).padStart(4, '0')}`,
      dateOfBirth: new Date(req.body.dateOfBirth), // Convert string to Date
      medicalHistory: [], // Initialize empty medical history
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Validate required fields
    if (!patient.firstName || !patient.lastName || !patient.dateOfBirth || 
        !patient.gender || !patient.contactNumber || !patient.address) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: 'All fields marked with * are required'
      });
    }

    // Save the patient
    const savedPatient = await patient.save();
    console.log('Patient created:', savedPatient); // Add logging

    res.status(201).json(savedPatient);
  } catch (error) {
    console.error('Error creating patient:', error); // Add error logging
    res.status(500).json({ 
      message: 'Error creating patient',
      error: error.message 
    });
  }
});

app.get('/api/admin/dental/patients', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

// Add this helper function at the top level of your file (after the schema definitions)
const getNextSequence = async (name) => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

// Update the appointment creation route
app.post('/api/admin/dental/appointments', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    // Get next sequence for appointmentId
    const appointmentId = await getNextSequence('appointmentId');
    
    // Create new appointment with formatted ID
    const appointment = new Appointment({
      ...req.body,
      appointmentId: `APT${String(appointmentId).padStart(4, '0')}`,
      date: new Date(req.body.date), // Convert string to Date
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Scheduled' // Set default status
    });

    // Validate required fields
    if (!appointment.patientId || !appointment.date || !appointment.time || !appointment.type) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: 'All fields marked with * are required'
      });
    }

    // Validate that patient exists
    const patientExists = await Patient.findOne({ patientId: appointment.patientId });
    if (!patientExists) {
      return res.status(400).json({ 
        message: 'Invalid patient ID',
        details: 'The selected patient does not exist'
      });
    }

    // Save the appointment
    const savedAppointment = await appointment.save();
    console.log('Appointment created:', savedAppointment); // Add logging

    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error); // Add error logging
    res.status(500).json({ 
      message: 'Error creating appointment',
      error: error.message 
    });
  }
});

app.get('/api/admin/dental/appointments', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
});

// Add these routes to your server.js

// Update patient
app.put('/api/admin/dental/patients/:patientId', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const updatedPatient = await Patient.findOneAndUpdate(
      { patientId: req.params.patientId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(updatedPatient);
  } catch (error) {
    res.status(500).json({ message: 'Error updating patient' });
  }
});

// Delete patient
app.delete('/api/admin/dental/patients/:patientId', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const deletedPatient = await Patient.findOneAndDelete({ patientId: req.params.patientId });
    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting patient' });
  }
});

// Update appointment
app.put('/api/admin/dental/appointments/:appointmentId', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.appointmentId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

// Update appointment status
app.put('/api/admin/dental/appointments/:appointmentId/status', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { appointmentId: req.params.appointmentId },
      { status: req.body.status, updatedAt: new Date() },
      { new: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment status' });
  }
});

// Delete appointment
app.delete('/api/admin/dental/appointments/:appointmentId', authenticateToken, checkDentalAccess, async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findOneAndDelete({ appointmentId: req.params.appointmentId });
    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
});