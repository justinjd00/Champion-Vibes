const express = require('express');
const router = express.Router();
const PlaylistService = require('../services/playlistService');
const MusicAlgorithmService = require('../services/musicAlgorithmService');
const RiotApiService = require('../services/riotApiService');
const MusicService = require('../services/musicService');
const ChampionService = require('../services/championService');

// Generate new playlist with intelligent algorithm
router.post('/generate', async (req, res) => {
  try {
    const { champion, role, playstyle = 'balanced', musicTags = [] } = req.body;
    
    if (!champion || !role) {
      return res.status(400).json({
        success: false,
        error: 'Champion and role are required'
      });
    }
    
    console.log(`🎵 Generating playlist for ${champion} ${role} with ${playstyle} playstyle${musicTags.length > 0 ? ` and tags: ${musicTags.join(', ')}` : ''}`);
    
    // Get champion data from Riot API
    const championData = await RiotApiService.getChampionDetails(champion);
    
    if (!championData) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found'
      });
    }
    
    // Generate playlist using intelligent algorithm with music tags
    const playlist = await MusicAlgorithmService.generatePlaylist(championData, role, playstyle, musicTags);
    
    res.json({
      success: true,
      playlist
    });
  } catch (error) {
    console.error('Generate playlist error:', error);
    res.status(500).json({
      success: false,
      error: `Failed to generate playlist: ${error.message}`
    });
  }
});

// Get playlist by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playlist = await PlaylistService.getPlaylistById(id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    res.json({
      success: true,
      playlist
    });

  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get playlist',
      message: error.message
    });
  }
});

// Get user's playlists
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const playlists = await PlaylistService.getUserPlaylists(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      playlists: playlists.data,
      pagination: playlists.pagination
    });

  } catch (error) {
    console.error('Get user playlists error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user playlists',
      message: error.message
    });
  }
});

// Update playlist
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedPlaylist = await PlaylistService.updatePlaylist(id, updates);

    res.json({
      success: true,
      playlist: updatedPlaylist
    });

  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update playlist',
      message: error.message
    });
  }
});

// Delete playlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await PlaylistService.deletePlaylist(id);

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });

  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete playlist',
      message: error.message
    });
  }
});

// Get playlist tracks
router.get('/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    const tracks = await PlaylistService.getPlaylistTracks(id);

    res.json({
      success: true,
      tracks
    });

  } catch (error) {
    console.error('Get playlist tracks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get playlist tracks',
      message: error.message
    });
  }
});

// Export playlist to external platform
router.post('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, credentials } = req.body; // platform: 'spotify', 'youtube'
    
    const exportResult = await PlaylistService.exportPlaylist(id, platform, credentials);

    res.json({
      success: true,
      export: exportResult
    });

  } catch (error) {
    console.error('Export playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export playlist',
      message: error.message
    });
  }
});

// Get popular playlists
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10, champion, role } = req.query;
    
    const playlists = await PlaylistService.getPopularPlaylists({
      limit: parseInt(limit),
      champion,
      role
    });

    res.json({
      success: true,
      playlists
    });

  } catch (error) {
    console.error('Get popular playlists error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular playlists',
      message: error.message
    });
  }
});

module.exports = router;
