const express = require('express');
const router = express.Router();
const ChampionService = require('../services/championService');
const RiotApiService = require('../services/riotApiService');

// Get all champions from Riot API
router.get('/', async (req, res) => {
  try {
    const champions = await RiotApiService.getAllChampions();
    
    res.json({
      success: true,
      champions: champions.map(champ => ({
        value: champ.id,
        label: `${champ.name} - ${champ.title}`,
        name: champ.name,
        title: champ.title,
        tags: champ.tags,
        image: champ.image,
        splash: champ.splash
      }))
    });
  } catch (error) {
    console.error('Get champions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get champions'
    });
  }
});

// Get champion data from Riot API
router.get('/:champion', async (req, res) => {
  try {
    const { champion } = req.params;
    const championData = await RiotApiService.getChampionDetails(champion);
    
    if (!championData) {
      return res.status(404).json({
        success: false,
        error: 'Champion not found'
      });
    }
    
    // Analyze champion for music preferences
    const musicAnalysis = RiotApiService.analyzeChampionForMusic(championData);
    
    res.json({
      success: true,
      champion: {
        ...championData,
        musicAnalysis
      }
    });
  } catch (error) {
    console.error('Get champion data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get champion data'
    });
  }
});

// Get champion music preferences
router.get('/:champion/music-preferences', (req, res) => {
  try {
    const { champion } = req.params;
    const { role } = req.query;
    
    const preferences = ChampionService.getMusicPreferences(champion, role);
    
    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Get champion music preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get champion music preferences'
    });
  }
});

// Get champion recommendations based on music preferences
router.post('/recommendations', (req, res) => {
  try {
    const { musicPreferences } = req.body;
    
    const recommendations = ChampionService.getChampionRecommendations(musicPreferences);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Get champion recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get champion recommendations'
    });
  }
});

module.exports = router;
