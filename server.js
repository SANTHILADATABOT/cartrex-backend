// server.js
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require("path");

dotenv.config();

const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient, ServerApiVersion } = require('mongodb');
const AdminRole=require('./models/AdminRoles')
const AdminUsers=require('./models/AdminUsers')
const bid=require('./models/Bid');
const booking=require('./models/Booking');
const carrier=require('./models/Carrier');
const complaints=require('./models/Complaint');
const master=require('./models/MasterVehicleType');
const messages=require('./models/Messages');
const notifications=require('./models/NotificationTemplate');
const paymentMethod=require('./models/PaymentMethod');
const reviews=require('./models/Reviews');
const route=require('./models/Route');
const settings=require('./models/Settings');
const shipper=require('./models/Shipper');
const space=require('./models/Space');
const truck=require('./models/Truck');
const user=require('./models/User');
const usernotifications=require('./models/UsernotificationSettings');
const MongoStore = require('connect-mongo');

// Load environment variables


const app = express();
const server = http.createServer(app);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      const allowedOrigins = [
        process.env.ADMIN_FRONTEND_URL,
        process.env.WEB_FRONTEND_URL, 
        process.env.MOBILE_FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://localhost:3000',
        'http://192.168.1.46:5173',
        'http://192.168.1.46:5174',
      ];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed from this origin'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// CORS Configuration
const allowedOrigins = [
  process.env.ADMIN_FRONTEND_URL,
  process.env.WEB_FRONTEND_URL,
  process.env.MOBILE_FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5000',
  'http://192.168.1.46:5173',
  'http://192.168.1.46:5174',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey', // keep this in .env
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // session expires in 14 days
  }),
  cookie: {
    httpOnly: true,
    secure: false, // change to true if you use HTTPS
    sameSite: 'lax',
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

// Rate Limiting - Different limits for different clients
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Lower for auth endpoints
  message: 'Too many authentication attempts, please try again later.'
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Higher for admin
  message: 'Too many admin requests, please try again later.'
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/auth/', authLimiter);

// Database connection
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log("Connected to MongoDB Atlas via Mongoose"))
.catch(err => console.error("MongoDB connection error:", err));

// Socket.io connection handling with namespaces
const setupWebSocketNamespaces = () => {
  // Admin namespace
  const adminNamespace = io.of('/admin');
  adminNamespace.on('connection', (socket) => {
    socket.on('join_admin', (adminId) => {
      socket.join(`admin:${adminId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Admin disconnected:', socket.id);
    });
  });

  // Web app namespace
  const webNamespace = io.of('/web');
  webNamespace.on('connection', (socket) => {
    console.log('Web client connected:', socket.id);
    
    socket.on('join_user', (userId) => {
      socket.join(`user:${userId}`);
    });
    
    socket.on('join_shipment', (shipmentId) => {
      socket.join(`shipment:${shipmentId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Web client disconnected:', socket.id);
    });
  });

  // Mobile app namespace
  const mobileNamespace = io.of('/mobile');
  mobileNamespace.on('connection', (socket) => {
    console.log('Mobile client connected:', socket.id);
    
    socket.on('join_user', (userId) => {
      socket.join(`user:${userId}`);
    });
    
    socket.on('track_shipment', (shipmentId) => {
      socket.join(`tracking:${shipmentId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Mobile client disconnected:', socket.id);
    });
  });
};

setupWebSocketNamespaces();

// Make io accessible to routes
app.set('io', io);

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const masterRoutes = require('./routes/admin/masterRoutes');
const spaceListRoutes = require('./routes/admin/spaceListingRoutes');
const carrierListRoutes = require('./routes/admin/carrierListingRoutes');
const shipperListRoutes = require('./routes/admin/shipperListingRoutes');
const truckListRoutes = require("./routes/admin/truckListingRoutes");
const bookingListRoutes = require("./routes/admin/bookingListRoutes");
const routeListRoutes = require('./routes/admin/routeListingRoutes')
const bidListRoutes = require('./routes/admin/bidListingRoutes');
const adminUserlistRoutes = require('./routes/admin/adminUserlistRoutes');
const masterRoleRoutes = require('./routes/admin/masterRoleRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dashboardRoutes = require('./routes/dashboard');

const webRoutes = require('./routes/web');
const spaceRoutes = require('./routes/web/spaces');
const bidRoutes = require('./routes/web/bid');
const bookingRoutes =require('./routes/web/bookings');
const locationRoutes =require('./routes/admin/locationListRoutes');
const reviewRoutes =require('./routes/reviewRoutes');
// const mobileRoutes = require('./routes/mobile');
// const sharedRoutes = require('./routes/shared');

// Route configuration
app.use('/auth', authLimiter, authRoutes); // Authentication routes

// Admin routes (with admin rate limiting)

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/admin',adminLimiter, adminRoutes);           // → /admin/api/*
app.use('/masters', masterRoutes);
app.use('/spacelisting', spaceListRoutes);
app.use('/carrierlisting', carrierListRoutes); 
app.use('/shipperlisting', shipperListRoutes);
app.use('/trucklisting', truckListRoutes);
app.use('/bookinglist', bookingListRoutes);
app.use('/routelisting', routeListRoutes);
app.use('/bidlisting',bidListRoutes);
app.use('/adminuserlist',adminUserlistRoutes);
app.use('/masterRoleRoutes',masterRoleRoutes);
app.use('/location',locationRoutes);
app.use('/review',reviewRoutes);

app.use("/uploads", uploadRoutes);
app.use("/dashboard", dashboardRoutes);
// Web application routes
app.use('/api/web', webRoutes);
app.use('/space',spaceRoutes);
app.use('/bid',bidRoutes);
app.use('/bookings',bookingRoutes);



// Mobile API routes
// app.use('/api/v1/mobile', mobileRoutes);

// Shared routes (common for all clients)
// app.use('/api/shared', sharedRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Logistics API Server'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };