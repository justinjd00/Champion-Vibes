const axios = require('axios');

class MusicService {
  constructor() {
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.spotifyAccessToken = null;
  }

  // Search YouTube for music tracks
  static async searchYouTube(query, maxResults = 10) {
    try {
      if (!process.env.YOUTUBE_API_KEY) {
        console.warn('YouTube API key not configured');
        return this.getMockYouTubeResults(query, maxResults);
      }

      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          videoCategoryId: '10', // Music category
          relevance,
          key: process.env.YOUTUBE_API_KEY
        }
      });

      return response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: this.extractArtistFromTitle(item.snippet.title),
        duration: this.estimateDuration(item.snippet.title),
        platform: 'youtube',
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: item.snippet.thumbnails.medium?.url,
        genre: this.extractGenreFromTitle(item.snippet.title),
        mood: this.extractMoodFromTitle(item.snippet.title),
        energy: this.extractEnergyFromTitle(item.snippet.title)
      }));

    } catch (error) {
      console.error('YouTube search error:', error);
      return this.getMockYouTubeResults(query, maxResults);
    }
  }

  // Search Spotify for music tracks
  static async searchSpotify(query, limit = 10) {
    try {
      if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
        console.warn('Spotify API credentials not configured');
        return this.getMockSpotifyResults(query, limit);
      }

      // Get access token
      const accessToken = await this.getSpotifyAccessToken();
      if (!accessToken) {
        return this.getMockSpotifyResults(query, limit);
      }

      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        params: {
          q: query,
          type: 'track',
          limit
        }
      });

      return response.data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        duration: track.duration_ms,
        platform: 'spotify',
        url: track.external_urls.spotify,
        thumbnail: track.album.images[0]?.url,
        genre: this.extractGenreFromSpotifyData(track),
        mood: this.extractMoodFromSpotifyData(track),
        energy: this.extractEnergyFromSpotifyData(track)
      }));

    } catch (error) {
      console.error('Spotify search error:', error);
      return this.getMockSpotifyResults(query, limit);
    }
  }

  // Get Spotify access token
  static async getSpotifyAccessToken() {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Spotify token error:', error);
      return null;
    }
  }

  // Extract artist name from YouTube title
  static extractArtistFromTitle(title) {
    // Common patterns: "Artist - Song", "Artist: Song", "Artist | Song"
    const patterns = [
      /^([^-|:]+)[-|:]\s*(.+)$/,
      /^([^|]+)\|\s*(.+)$/
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Unknown Artist';
  }

  // Estimate duration from title (placeholder)
  static estimateDuration(title) {
    // Look for duration in title like "[3:45]", "(4:20)", etc.
    const durationMatch = title.match(/\[(\d+):(\d+)\]/) || title.match(/\((\d+):(\d+)\)/);
    if (durationMatch) {
      const minutes = parseInt(durationMatch[1]);
      const seconds = parseInt(durationMatch[2]);
      return (minutes * 60 + seconds) * 1000; // Convert to milliseconds
    }

    // Default duration based on title length (rough estimate)
    const baseDuration = 180000; // 3 minutes
    const titleLength = title.length;
    const variation = (titleLength % 100) * 1000; // 0-99 seconds variation
    return baseDuration + variation;
  }

  // Extract genre from title
  static extractGenreFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    const genreKeywords = {
      'electronic': ['electronic', 'edm', 'synth', 'techno', 'house'],
      'rock': ['rock', 'metal', 'punk', 'alternative'],
      'pop': ['pop', 'mainstream', 'hit'],
      'hip-hop': ['hip hop', 'rap', 'trap'],
      'jazz': ['jazz', 'blues', 'soul'],
      'classical': ['classical', 'orchestra', 'symphony'],
      'ambient': ['ambient', 'chill', 'relaxing'],
      'j-pop': ['j-pop', 'japanese', 'anime'],
      'k-pop': ['k-pop', 'korean']
    };

    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return genre;
      }
    }

    return 'electronic'; // Default
  }

  // Extract mood from title
  static extractMoodFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    const moodKeywords = {
      'happy': ['happy', 'joy', 'upbeat', 'cheerful', 'bright'],
      'sad': ['sad', 'melancholy', 'depressed', 'sorrow'],
      'angry': ['angry', 'rage', 'furious', 'aggressive'],
      'calm': ['calm', 'peaceful', 'serene', 'tranquil'],
      'energetic': ['energetic', 'pumping', 'intense', 'powerful'],
      'mysterious': ['mysterious', 'dark', 'sinister', 'eerie'],
      'romantic': ['romantic', 'love', 'passionate', 'intimate']
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return mood;
      }
    }

    return 'neutral'; // Default
  }

  // Extract energy from title
  static extractEnergyFromTitle(title) {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('extreme') || titleLower.includes('intense') || titleLower.includes('pumping')) {
      return 'extreme';
    }
    if (titleLower.includes('high') || titleLower.includes('fast') || titleLower.includes('energetic')) {
      return 'high';
    }
    if (titleLower.includes('low') || titleLower.includes('slow') || titleLower.includes('chill')) {
      return 'low';
    }
    
    return 'medium'; // Default
  }

  // Extract genre from Spotify track data
  static extractGenreFromSpotifyData(track) {
    // Spotify doesn't provide genre in track data, so we'll use artist genres or make educated guesses
    if (track.artists[0]?.genres && track.artists[0].genres.length > 0) {
      return track.artists[0].genres[0];
    }
    
    // Fallback to title analysis
    return this.extractGenreFromTitle(track.name);
  }

  // Extract mood from Spotify track data
  static extractMoodFromSpotifyData(track) {
    // Use audio features if available, otherwise fallback to title analysis
    if (track.audio_features) {
      const { valence, energy } = track.audio_features;
      
      if (valence > 0.7) return 'happy';
      if (valence < 0.3) return 'sad';
      if (energy > 0.7) return 'energetic';
      if (energy < 0.3) return 'calm';
    }
    
    return this.extractMoodFromTitle(track.name);
  }

  // Extract energy from Spotify track data
  static extractEnergyFromSpotifyData(track) {
    // Use audio features if available
    if (track.audio_features) {
      const { energy } = track.audio_features;
      
      if (energy > 0.8) return 'extreme';
      if (energy > 0.6) return 'high';
      if (energy > 0.4) return 'medium';
      return 'low';
    }
    
    return this.extractEnergyFromTitle(track.name);
  }

  // Mock YouTube results for development - Hochwertige Gaming-Musik
  static getMockYouTubeResults(query, maxResults) {
    // Realistische Gaming-Music Kanäle und Titel
    const gamingArtists = [
      'NoCopyrightSounds',
      'Monstercat',
      'Trap Nation',
      'Bass Boosted',
      'Gaming Music Mix',
      'Epic Music World',
      'Proximity',
      'xKito Music',
      'MrSuicideSheep',
      'TheFatRat'
    ];
    
    const musicStyles = [
      'Epic Gaming Mix',
      'Best Gaming Music',
      'Electronic Gaming Music',
      'League of Legends Music',
      'Gaming Beats',
      'Focus Music',
      'Intense Gaming',
      'EDM Gaming Mix',
      'Powerful Gaming Soundtrack',
      'Energetic Gaming Music'
    ];
    
    const mockTracks = [];
    for (let i = 0; i < maxResults; i++) {
      const artist = gamingArtists[Math.floor(Math.random() * gamingArtists.length)];
      const style = musicStyles[Math.floor(Math.random() * musicStyles.length)];
      
      mockTracks.push({
        id: `mock_${Math.random().toString(36).substr(2, 9)}`,
        title: `${style} - ${query}`,
        artist: artist,
        duration: 180000 + Math.random() * 120000, // 3-5 minutes
        platform: 'youtube',
        url: `https://www.youtube.com/watch?v=mock_${Math.random().toString(36).substr(2, 9)}`,
        thumbnail: 'https://via.placeholder.com/320x180',
        genre: this.extractGenreFromTitle(query),
        mood: this.extractMoodFromTitle(query),
        energy: this.extractEnergyFromTitle(query)
      });
    }

    return mockTracks;
  }

  // Mock Spotify results for development
  static getMockSpotifyResults(query, limit) {
    const mockTracks = [
      {
        id: `spotify_mock_${Math.random().toString(36).substr(2, 9)}`,
        title: `${query} - Gaming Mix`,
        artist: 'Spotify Gaming',
        duration: 200000 + Math.random() * 100000, // 3-5 minutes
        platform: 'spotify',
        url: `https://open.spotify.com/track/mock_${Math.random().toString(36).substr(2, 9)}`,
        thumbnail: 'https://via.placeholder.com/320x320',
        genre: this.extractGenreFromTitle(query),
        mood: this.extractMoodFromTitle(query),
        energy: this.extractEnergyFromTitle(query)
      }
    ];

    return mockTracks.slice(0, limit);
  }
}

module.exports = MusicService;
