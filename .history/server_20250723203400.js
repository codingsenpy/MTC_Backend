console.log('SERVER.JS RUNNING');
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supervisorRoutes from './routes/supervisorRoutes.js';
import hadiyaRoutes from './routes/hadiyaRoutes.js'; // Added
import guestRoutes from './routes/guestRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true
  }));
app.use(express.json());
app.use(morgan('dev'));

// Mount API routes
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supervisor',supervisorRoutes);
app.use('/api/hadiya', hadiyaRoutes); // Added
app.use('/api/guest', guestRoutes);
app.use('/api/announcements', announcementRoutes);
app.user
app.use('/api', apiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
