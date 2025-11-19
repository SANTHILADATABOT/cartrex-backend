// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

//newly added start
const authRoutes = require('./routes/authRoutes');
const masterRoutes = require('./admin/adminRoutes/masterRoutes');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import socket.io
//end 

dotenv.config();
const MONGO_URI=process.env.MONGODB_URI

const app = express();
//newly added start
// Create HTTP server from express app
const server = http.createServer(app);
// Initialize socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173/',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
//End
// Middleware
app.use(helmet());
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173/',
//   credentials: true
// }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
//newly added start
app.use('/auth', authRoutes);
app.use('/master', masterRoutes);
//end
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection

const client = new MongoClient(MONGO_URI);

client.connect()
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error(err));
// Also connect mongoose separately
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas via Mongoose"))
  .catch(err => console.error("MongoDB connection error:", err));

// Socket.io connection handling
io.on('connection', (socket) => {

  // Example: Listen for a custom event from client
  socket.on('example_event', (data) => {
    console.log('Received example_event from client:', data);

    // Example: Emit a response event back to client
    socket.emit('example_response', { message: 'Hello from server!' });
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// mongoose.connect(MONGO_URI)
//   .then(async () => {
//     console.log("Connected to MongoDB Atlas via Mongoose");

//     // List existing collections
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     const existing = collections.map(c => c.name);

//     // Define all collections you want to ensure exist
//     const allModels = ['User', 'Carrier', 'Shipper', 'Truck','Route','Space','Booking','Bid','Reviews','Message','PaymentMethod','Complaint','NotificationTemplate','UserNotificationSettings','Master','Keys']; // add all your model collections

//     for (const c of allModels) {
//       if (!existing.includes(c)) {
//         await mongoose.connection.db.createCollection(c);
//         console.log(`Collection created: ${c}`);
//       }
//     }

//   })
//   .catch(err => console.error("MongoDB connection error:", err));


// // Routes
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const carrierRoutes = require('./routes/carriers');
// const shipperRoutes = require('./routes/shippers');
// const truckRoutes = require('./routes/trucks');
// const routeRoutes = require('./routes/routes');
// const spaceRoutes = require('./routes/spaces');
// const bookingRoutes = require('./routes/bookings');
// const bidRoutes = require('./routes/bids');
// const paymentRoutes = require('./routes/payments');
// const messageRoutes = require('./routes/messages');
// const complaintRoutes = require('./routes/complaints');
// const notificationRoutes = require('./routes/notifications');
// const masterRoutes = require('./routes/masters');
// const adminRoutes = require('./routes/admin');

// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/carriers', carrierRoutes);
// app.use('/api/shippers', shipperRoutes);
// app.use('/api/trucks', truckRoutes);
// app.use('/api/routes', routeRoutes);
// app.use('/api/spaces', spaceRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/bids', bidRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/complaints', complaintRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/masters', masterRoutes);
// app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
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
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('PORT', PORT);
});

module.exports = app;