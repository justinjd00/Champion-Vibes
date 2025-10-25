const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth - PERSISTENT für 7 Tage
app.use(session({
  secret: process.env.JWT_SECRET || 'champion_vibes_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Tage persistent!
    sameSite: 'lax'
  },
  rolling: true // Session wird bei jeder Anfrage erneuert
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Import routes
const playlistRoutes = require('./routes/playlist');
const userRoutes = require('./routes/user');
const championRoutes = require('./routes/champion');
const authRoutes = require('./routes/auth');
const youtubeAuthRoutes = require('./routes/youtubeAuth');
const playlistExportRoutes = require('./routes/playlistExport');

// Routes
app.use('/api/playlist', playlistRoutes);
app.use('/api/user', userRoutes);
app.use('/api/champion', championRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', youtubeAuthRoutes);
app.use('/api/export', playlistExportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Champion Vibes Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎵 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
