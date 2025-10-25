const MusicService = require('./musicService');
const ChampionService = require('./championService');

class PlaylistService {
  // AI-powered playlist generation algorithm
  static async generatePlaylist({ champion, role, championData, musicPreferences, preferences }) {
    try {
      console.log(`🎵 Generating playlist for ${champion} (${role})`);
      
      // 1. Analyze champion characteristics
      const championAnalysis = await this.analyzeChampion(champion, championData);
      
      // 2. Determine music style based on champion + role
      const musicStyle = await this.determineMusicStyle(championAnalysis, role);
      
      // 3. Calculate playlist duration (2-3 hours)
      const targetDuration = this.calculateTargetDuration(preferences);
      
      // 4. Generate track list using music APIs
      const tracks = await this.generateTrackList(musicStyle, targetDuration);
      
      // 5. Create playlist metadata
      const playlist = {
        id: this.generatePlaylistId(),
        champion,
        role,
        title: `${champion} ${role} Vibes`,
        description: this.generateDescription(champion, role, championAnalysis),
        duration: this.calculateTotalDuration(tracks),
        trackCount: tracks.length,
        tracks,
        style: musicStyle,
        createdAt: new Date(),
        updatedAt: new Date(),
        popularity: 0,
        tags: this.generateTags(champion, role, musicStyle)
      };

      return playlist;
      
    } catch (error) {
      console.error('Playlist generation error:', error);
      throw new Error(`Failed to generate playlist: ${error.message}`);
    }
  }

  // Analyze champion characteristics for music matching
  static async analyzeChampion(champion, championData) {
    const analysis = {
      theme: championData.theme || 'epic',
      mood: championData.mood || 'intense',
      energy: championData.energy || 'high',
      genre: championData.genre || 'electronic',
      tempo: championData.tempo || 'fast',
      instruments: championData.instruments || ['synthesizer', 'drums'],
      cultural: championData.cultural || 'modern',
      complexity: championData.complexity || 'medium'
    };

    // Champion-specific adjustments
    const championAdjustments = {
      'yasuo': { theme: 'samurai', mood: 'melancholic', genre: 'japanese', instruments: ['shamisen', 'flute'] },
      'jinx': { theme: 'chaos', mood: 'chaotic', energy: 'extreme', genre: 'punk' },
      'thresh': { theme: 'dark', mood: 'sinister', genre: 'dark-ambient', instruments: ['organ', 'strings'] },
      'darius': { theme: 'military', mood: 'aggressive', genre: 'metal', instruments: ['guitar', 'drums'] },
      'ahri': { theme: 'mystical', mood: 'seductive', genre: 'k-pop', instruments: ['synthesizer', 'vocal'] },
      'lux': { theme: 'light', mood: 'uplifting', genre: 'pop', instruments: ['piano', 'strings'] }
    };

    return { ...analysis, ...championAdjustments[champion] };
  }

  // Determine music style based on champion analysis and role
  static async determineMusicStyle(championAnalysis, role) {
    const roleModifiers = {
      'top': { energy: 'high', theme: 'isolation', mood: 'focused' },
      'jungle': { energy: 'extreme', theme: 'wild', mood: 'hunter' },
      'mid': { energy: 'high', theme: 'carry', mood: 'confident' },
      'adc': { energy: 'medium', theme: 'precision', mood: 'calculated' },
      'support': { energy: 'medium', theme: 'teamwork', mood: 'supportive' }
    };

    const roleModifier = roleModifiers[role] || {};
    const combinedStyle = { ...championAnalysis, ...roleModifier };

    // Map to music genres and styles
    const musicStyle = {
      primaryGenre: this.mapToMusicGenre(combinedStyle.genre),
      secondaryGenre: this.getSecondaryGenre(combinedStyle.genre),
      tempo: this.mapToTempo(combinedStyle.tempo),
      mood: combinedStyle.mood,
      energy: combinedStyle.energy,
      instruments: combinedStyle.instruments,
      cultural: combinedStyle.cultural,
      complexity: combinedStyle.complexity
    };

    return musicStyle;
  }

  // Generate track list using music APIs
  static async generateTrackList(musicStyle, targetDuration) {
    const tracks = [];
    const targetDurationMs = targetDuration * 60 * 1000; // Convert to milliseconds
    let currentDuration = 0;

    // Search for tracks based on style
    const searchQueries = this.generateSearchQueries(musicStyle);
    
    for (const query of searchQueries) {
      if (currentDuration >= targetDurationMs) break;
      
      try {
        // Search YouTube for tracks
        const youtubeResults = await MusicService.searchYouTube(query);
        
        // Search Spotify for tracks
        const spotifyResults = await MusicService.searchSpotify(query);
        
        // Combine and filter results
        const combinedResults = [...youtubeResults, ...spotifyResults];
        const filteredTracks = this.filterTracks(combinedResults, musicStyle);
        
        // Add tracks to playlist
        for (const track of filteredTracks) {
          if (currentDuration >= targetDurationMs) break;
          
          tracks.push({
            id: track.id,
            title: track.title,
            artist: track.artist,
            duration: track.duration,
            platform: track.platform,
            url: track.url,
            thumbnail: track.thumbnail,
            genre: track.genre,
            mood: track.mood,
            energy: track.energy
          });
          
          currentDuration += track.duration;
        }
        
      } catch (error) {
        console.error(`Error searching for query "${query}":`, error);
        continue;
      }
    }

    // Sort tracks for optimal flow
    return this.sortTracksForFlow(tracks);
  }

  // Generate search queries based on music style
  static generateSearchQueries(musicStyle) {
    const queries = [];
    
    // Primary genre queries
    queries.push(`${musicStyle.primaryGenre} ${musicStyle.mood} music`);
    queries.push(`${musicStyle.primaryGenre} ${musicStyle.energy} ${musicStyle.tempo}`);
    
    // Instrument-based queries
    musicStyle.instruments.forEach(instrument => {
      queries.push(`${instrument} ${musicStyle.primaryGenre} music`);
    });
    
    // Cultural queries
    if (musicStyle.cultural !== 'modern') {
      queries.push(`${musicStyle.cultural} ${musicStyle.primaryGenre}`);
    }
    
    // Gaming-specific queries
    queries.push(`gaming music ${musicStyle.primaryGenre}`);
    queries.push(`league of legends ${musicStyle.primaryGenre}`);
    queries.push(`esports ${musicStyle.mood} music`);
    
    return queries;
  }

  // Filter tracks based on style criteria
  static filterTracks(tracks, musicStyle) {
    return tracks.filter(track => {
      // Duration filter (2-8 minutes)
      if (track.duration < 120000 || track.duration > 480000) return false;
      
      // Genre match
      if (track.genre && !this.genreMatches(track.genre, musicStyle.primaryGenre)) return false;
      
      // Energy match
      if (track.energy && !this.energyMatches(track.energy, musicStyle.energy)) return false;
      
      return true;
    });
  }

  // Sort tracks for optimal playlist flow
  static sortTracksForFlow(tracks) {
    // Group by energy level
    const energyGroups = {
      low: tracks.filter(t => t.energy === 'low'),
      medium: tracks.filter(t => t.energy === 'medium'),
      high: tracks.filter(t => t.energy === 'high')
    };
    
    // Create flow: start high, mix medium, end with high
    const flow = [
      ...energyGroups.high.slice(0, 3),
      ...energyGroups.medium.slice(0, 2),
      ...energyGroups.high.slice(3, 5),
      ...energyGroups.medium.slice(2, 4),
      ...energyGroups.high.slice(5)
    ];
    
    return flow;
  }

  // Helper methods
  static mapToMusicGenre(championGenre) {
    const genreMap = {
      'electronic': 'electronic',
      'japanese': 'j-pop',
      'punk': 'punk rock',
      'dark-ambient': 'dark ambient',
      'metal': 'metal',
      'k-pop': 'k-pop',
      'pop': 'pop'
    };
    return genreMap[championGenre] || 'electronic';
  }

  static getSecondaryGenre(primaryGenre) {
    const secondaryMap = {
      'electronic': 'ambient',
      'j-pop': 'japanese',
      'punk rock': 'alternative',
      'dark ambient': 'industrial',
      'metal': 'rock',
      'k-pop': 'pop',
      'pop': 'indie'
    };
    return secondaryMap[primaryGenre] || 'ambient';
  }

  static mapToTempo(tempo) {
    const tempoMap = {
      'slow': '60-80 bpm',
      'medium': '80-120 bpm',
      'fast': '120-160 bpm',
      'extreme': '160+ bpm'
    };
    return tempoMap[tempo] || '120-160 bpm';
  }

  static genreMatches(trackGenre, targetGenre) {
    return trackGenre.toLowerCase().includes(targetGenre.toLowerCase());
  }

  static energyMatches(trackEnergy, targetEnergy) {
    const energyLevels = { low: 1, medium: 2, high: 3, extreme: 4 };
    return Math.abs(energyLevels[trackEnergy] - energyLevels[targetEnergy]) <= 1;
  }

  static calculateTargetDuration(preferences) {
    const baseDuration = 150; // 2.5 hours in minutes
    const variation = Math.random() * 60; // 0-60 minutes variation
    return Math.floor(baseDuration + variation);
  }

  static calculateTotalDuration(tracks) {
    return tracks.reduce((total, track) => total + track.duration, 0);
  }

  static generatePlaylistId() {
    return Math.random().toString(36).substr(2, 9);
  }

  static generateDescription(champion, role, analysis) {
    return `A ${analysis.energy} ${analysis.mood} playlist perfect for ${champion} ${role} players. Featuring ${analysis.genre} music that matches ${champion}'s ${analysis.theme} theme.`;
  }

  static generateTags(champion, role, style) {
    return [champion, role, style.primaryGenre, style.mood, style.energy, 'gaming', 'league-of-legends'];
  }

  // Database operations (placeholder - would use real database)
  static async savePlaylist(playlist) {
    // In a real implementation, this would save to MongoDB/PostgreSQL
    console.log(`💾 Saving playlist: ${playlist.id}`);
    return playlist;
  }

  static async getPlaylistById(id) {
    // Placeholder - would query database
    return null;
  }

  static async getUserPlaylists(userId, options) {
    // Placeholder - would query database
    return { data: [], pagination: { page: 1, limit: 10, total: 0 } };
  }

  static async updatePlaylist(id, updates) {
    // Placeholder - would update database
    return { id, ...updates };
  }

  static async deletePlaylist(id) {
    // Placeholder - would delete from database
    console.log(`🗑️ Deleting playlist: ${id}`);
  }

  static async getPlaylistTracks(id) {
    // Placeholder - would query database
    return [];
  }

  static async exportPlaylist(id, platform, credentials) {
    // Placeholder - would export to external platform
    return { platform, exported: true, url: `https://${platform}.com/playlist/${id}` };
  }

  static async getPopularPlaylists(options) {
    // Placeholder - would query database
    return [];
  }
}

module.exports = PlaylistService;
