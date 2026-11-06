require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./server/config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security & Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth',          require('./server/routes/auth'));
app.use('/api/users',         require('./server/routes/users'));
app.use('/api/students',      require('./server/routes/students'));
app.use('/api/hostels',       require('./server/routes/hostels'));
app.use('/api/blocks',        require('./server/routes/blocks'));
app.use('/api/rooms',         require('./server/routes/rooms'));
app.use('/api/allocations',   require('./server/routes/allocations'));
app.use('/api/outpasses',     require('./server/routes/outpasses'));
app.use('/api/complaints',    require('./server/routes/complaints'));
app.use('/api/fees',          require('./server/routes/fees'));
app.use('/api/payments',      require('./server/routes/payments'));
app.use('/api/announcements', require('./server/routes/announcements'));
app.use('/api/notifications', require('./server/routes/notifications'));
app.use('/api/mess',          require('./server/routes/mess'));
app.use('/api/staff',         require('./server/routes/staff'));
app.use('/api/analytics',     require('./server/routes/analytics'));

// SPA fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'API route not found' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Vignan Hostel Management System`);
  console.log(`   Server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
