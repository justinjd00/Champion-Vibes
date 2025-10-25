const express = require('express');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'user_123',
      name: 'Champion Vibes User',
      email: 'user@championvibes.com',
      createdAt: new Date().toISOString()
    }
  });
});

// Update user profile
router.put('/profile', (req, res) => {
  const { name, email, preferences } = req.body;
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: 'user_123',
      name: name || 'Champion Vibes User',
      email: email || 'user@championvibes.com',
      preferences: preferences || {},
      updatedAt: new Date().toISOString()
    }
  });
});

// Get user's playlists
router.get('/playlists', (req, res) => {
  res.json({
    success: true,
    playlists: [
      {
        id: 'playlist_1',
        title: 'Yasuo Mid Vibes',
        champion: 'yasuo',
        role: 'mid',
        duration: '2h 45m',
        tracks: 45,
        createdAt: new Date().toISOString()
      },
      {
        id: 'playlist_2',
        title: 'Jinx ADC Chaos',
        champion: 'jinx',
        role: 'adc',
        duration: '3h 12m',
        tracks: 52,
        createdAt: new Date().toISOString()
      }
    ]
  });
});

// Delete user playlist
router.delete('/playlists/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: `Playlist ${id} deleted successfully`
  });
});

module.exports = router;
