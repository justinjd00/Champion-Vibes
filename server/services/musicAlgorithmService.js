const MusicService = require('./musicService');
const RiotApiService = require('./riotApiService');

class MusicAlgorithmService {
  constructor() {
    this.musicTags = {
      // Energy levels
      'low': ['chill', 'ambient', 'relaxing', 'calm', 'peaceful'],
      'medium': ['moderate', 'balanced', 'steady', 'smooth'],
      'high': ['energetic', 'intense', 'powerful', 'dynamic', 'pumping'],
      'extreme': ['extreme', 'chaotic', 'aggressive', 'brutal', 'insane'],
      
      // Moods
      'melancholic': ['sad', 'melancholy', 'emotional', 'touching', 'heartfelt'],
      'aggressive': ['angry', 'rage', 'fury', 'brutal', 'intense'],
      'uplifting': ['happy', 'joyful', 'positive', 'inspiring', 'motivational'],
      'mysterious': ['mysterious', 'dark', 'sinister', 'eerie', 'haunting'],
      'heroic': ['epic', 'heroic', 'noble', 'triumphant', 'glorious'],
      'sinister': ['evil', 'dark', 'sinister', 'malevolent', 'wicked'],
      'protective': ['guardian', 'shield', 'defensive', 'protective', 'safe'],
      'mystical': ['magical', 'mystical', 'enchanting', 'spellbinding', 'mysterious'],
      
      // Themes
      'dark': ['dark', 'gothic', 'shadow', 'night', 'black'],
      'light': ['light', 'bright', 'radiant', 'sunshine', 'golden'],
      'beast': ['wild', 'animal', 'primal', 'savage', 'feral'],
      'mechanical': ['robot', 'machine', 'tech', 'cyber', 'mechanical'],
      'ice': ['ice', 'cold', 'frost', 'frozen', 'winter'],
      'fire': ['fire', 'flame', 'burning', 'hot', 'blaze'],
      'stealth': ['stealth', 'ninja', 'shadow', 'silent', 'hidden'],
      'fortress': ['strong', 'tank', 'defensive', 'wall', 'shield'],
      'mystical': ['magic', 'mystical', 'enchanting', 'spell', 'arcane'],
      'precision': ['precise', 'accurate', 'surgical', 'calculated', 'exact'],
      'guardian': ['protector', 'guardian', 'defender', 'shield', 'savior'],
      
      // Genres
      'j-pop': ['j-pop', 'japanese', 'anime', 'kawaii', 'tokyo'],
      'k-pop': ['k-pop', 'korean', 'seoul', 'idol', 'korean pop'],
      'dark-ambient': ['dark ambient', 'atmospheric', 'dungeon', 'gothic', 'haunting'],
      'electronic': ['electronic', 'edm', 'synth', 'techno', 'digital'],
      'metal': ['metal', 'heavy metal', 'rock', 'guitar', 'distorted'],
      'ambient': ['ambient', 'atmospheric', 'chill', 'relaxing', 'peaceful'],
      'tribal': ['tribal', 'primal', 'drum', 'rhythm', 'primitive'],
      'orchestral': ['orchestral', 'classical', 'symphony', 'orchestra', 'epic'],
      
      // Instruments
      'shamisen': ['shamisen', 'japanese', 'traditional', 'string'],
      'flute': ['flute', 'woodwind', 'melodic', 'soft'],
      'taiko': ['taiko', 'drum', 'japanese', 'rhythm', 'percussion'],
      'organ': ['organ', 'church', 'gothic', 'dark', 'atmospheric'],
      'strings': ['strings', 'violin', 'cello', 'orchestra', 'classical'],
      'choir': ['choir', 'vocal', 'singing', 'harmony', 'voices'],
      'synthesizer': ['synthesizer', 'synth', 'electronic', 'digital', 'modern'],
      'drums': ['drums', 'percussion', 'rhythm', 'beat', 'pulse'],
      'bass': ['bass', 'low', 'deep', 'heavy', 'thumping'],
      'guitar': ['guitar', 'electric', 'distorted', 'rock', 'metal'],
      'brass': ['brass', 'trumpet', 'horn', 'military', 'marching'],
      'piano': ['piano', 'keys', 'melodic', 'soft', 'gentle'],
      'bells': ['bells', 'chimes', 'crystalline', 'delicate', 'magical']
    };
  }

  // Main algorithm to generate playlist
  async generatePlaylist(champion, role, playstyle = 'balanced', musicTags = []) {
    try {
      console.log(`🎵 Generating playlist for ${champion.name} (${role}) with ${playstyle} playstyle${musicTags.length > 0 ? ` [Tags: ${musicTags.join(', ')}]` : ''}`);
      
      // Get champion analysis
      const championAnalysis = RiotApiService.analyzeChampionForMusic(champion);
      
      // Get role modifiers
      const roleModifiers = this.getRoleModifiers(role);
      
      // Get playstyle modifiers
      const playstyleModifiers = this.getPlaystyleModifiers(playstyle);
      
      // Combine all modifiers
      const musicProfile = this.combineMusicProfile(championAnalysis, roleModifiers, playstyleModifiers);
      
      // 🎵 Integriere User-selected Music Tags
      if (musicTags.length > 0) {
        musicProfile.userTags = musicTags;
        console.log(`  🏷️ User selected tags: ${musicTags.join(', ')}`);
      }
      
      // Generate search queries (now with user tags)
      const searchQueries = this.generateSearchQueries(musicProfile);
      
      // Calculate target duration (2-3 hours)
      const targetDuration = this.calculateTargetDuration();
      
      // Search for tracks
      const tracks = await this.searchForTracks(searchQueries, targetDuration);
      
      // Optimize playlist flow
      const optimizedTracks = this.optimizePlaylistFlow(tracks, musicProfile);
      
      // Create final playlist
      const playlist = {
        id: this.generatePlaylistId(),
        champion: champion.name,
        role: role,
        playstyle: playstyle,
        title: `${champion.name} ${role} ${playstyle} Vibes`,
        description: this.generateDescription(champion, role, playstyle, musicProfile),
        duration: this.calculateTotalDuration(optimizedTracks),
        trackCount: optimizedTracks.length,
        tracks: optimizedTracks,
        musicProfile: musicProfile,
        createdAt: new Date(),
        tags: this.generateTags(champion, role, playstyle, musicProfile)
      };

      return playlist;
      
    } catch (error) {
      console.error('Playlist generation error:', error);
      throw new Error(`Failed to generate playlist: ${error.message}`);
    }
  }

  // Get role-specific modifiers
  getRoleModifiers(role) {
    const roleModifiers = {
      'top': {
        energy: 'high',
        mood: 'focused',
        themes: ['isolation', 'dueling', 'strength', 'endurance'],
        instruments: ['guitar', 'drums', 'brass'],
        tags: ['solo', 'duel', 'strength', 'endurance', 'isolation']
      },
      'jungle': {
        energy: 'extreme',
        mood: 'hunter',
        themes: ['wild', 'hunting', 'stealth', 'predator'],
        instruments: ['drums', 'synthesizer', 'bass'],
        tags: ['hunt', 'wild', 'stealth', 'predator', 'jungle']
      },
      'mid': {
        energy: 'high',
        mood: 'confident',
        themes: ['carry', 'magic', 'power', 'dominance'],
        instruments: ['synthesizer', 'strings', 'piano'],
        tags: ['carry', 'magic', 'power', 'dominance', 'mid']
      },
      'adc': {
        energy: 'medium',
        mood: 'calculated',
        themes: ['precision', 'ranged', 'teamwork', 'positioning'],
        instruments: ['strings', 'piano', 'vocal'],
        tags: ['precision', 'ranged', 'teamwork', 'positioning', 'marksman']
      },
      'support': {
        energy: 'medium',
        mood: 'supportive',
        themes: ['teamwork', 'protection', 'healing', 'utility'],
        instruments: ['strings', 'choir', 'piano'],
        tags: ['support', 'teamwork', 'protection', 'healing', 'utility']
      }
    };

    return roleModifiers[role] || {};
  }

  // Get playstyle modifiers
  getPlaystyleModifiers(playstyle) {
    const playstyleModifiers = {
      'aggressive': {
        energy: 'extreme',
        mood: 'aggressive',
        tempo: 'fast',
        tags: ['aggressive', 'intense', 'brutal', 'dominating']
      },
      'defensive': {
        energy: 'low',
        mood: 'protective',
        tempo: 'slow',
        tags: ['defensive', 'patient', 'strategic', 'calculated']
      },
      'balanced': {
        energy: 'medium',
        mood: 'neutral',
        tempo: 'medium',
        tags: ['balanced', 'versatile', 'adaptive', 'flexible']
      },
      'teamfight': {
        energy: 'high',
        mood: 'heroic',
        tempo: 'fast',
        tags: ['teamfight', 'coordination', 'synergy', 'unity']
      },
      'splitpush': {
        energy: 'medium',
        mood: 'focused',
        tempo: 'medium',
        tags: ['splitpush', 'pressure', 'map control', 'strategy']
      }
    };

    return playstyleModifiers[playstyle] || {};
  }

  // Combine all music profile modifiers
  combineMusicProfile(championAnalysis, roleModifiers, playstyleModifiers) {
    return {
      theme: roleModifiers.themes?.[0] || championAnalysis.theme,
      mood: playstyleModifiers.mood || roleModifiers.mood || championAnalysis.mood,
      energy: playstyleModifiers.energy || roleModifiers.energy || championAnalysis.energy,
      genre: championAnalysis.genre,
      tempo: playstyleModifiers.tempo || championAnalysis.tempo,
      instruments: [...new Set([
        ...(championAnalysis.instruments || []),
        ...(roleModifiers.instruments || [])
      ])],
      tags: [...new Set([
        ...(championAnalysis.tags || []),
        ...(roleModifiers.tags || []),
        ...(playstyleModifiers.tags || [])
      ])],
      cultural: championAnalysis.cultural,
      complexity: championAnalysis.complexity
    };
  }

  // Generate search queries based on music profile
  generateSearchQueries(musicProfile) {
    const queries = [];
    
    // 🏷️ PRIORITÄRE USER TAGS - wenn vorhanden, verwende sie zuerst!
    if (musicProfile.userTags && musicProfile.userTags.length > 0) {
      console.log(`  🎯 Using user-selected tags for queries: ${musicProfile.userTags.join(', ')}`);
      
      // Erstelle Queries basierend auf User Tags
      musicProfile.userTags.forEach(tag => {
        queries.push(`${tag} gaming music`);
        queries.push(`${tag} ${musicProfile.mood}`);
        queries.push(`${tag} ${musicProfile.energy} energy`);
        queries.push(`best ${tag} music`);
      });
      
      // Kombiniere User Tags mit Mood/Energy
      if (musicProfile.userTags.length >= 2) {
        const primaryTag = musicProfile.userTags[0];
        const secondaryTag = musicProfile.userTags[1];
        queries.push(`${primaryTag} ${secondaryTag} gaming music`);
      }
    }
    
    // 🎯 OPTIMIERT: Hochwertige Gaming-Musik Keywords
    const qualityKeywords = ['NCS', 'no copyright', 'official audio', 'best gaming music'];
    
    // 🎮 Genre-spezifische Kanäle
    const genreChannels = {
      'electronic': ['NCS', 'Monstercat', 'Trap Nation', 'electronic gaming'],
      'rock': ['epic rock', 'gaming rock', 'rock gaming music'],
      'orchestral': ['epic music', 'cinematic music', 'orchestral gaming'],
      'hip-hop': ['trap gaming', 'hip hop gaming', 'gaming beats'],
      'ambient': ['ambient gaming', 'chill gaming', 'focus music'],
      'j-pop': ['anime music', 'japanese gaming', 'jpop gaming'],
      'k-pop': ['kpop gaming', 'korean gaming music'],
      'metal': ['metal gaming', 'heavy gaming music', 'gaming metal']
    };
    
    const channelKeywords = genreChannels[musicProfile.genre] || ['gaming music'];
    
    // 🔥 BESTE Queries: Genre + Mood + NCS/Quality
    channelKeywords.forEach(channel => {
      queries.push(`${channel} ${musicProfile.mood}`);
      queries.push(`${channel} ${musicProfile.energy} energy`);
    });
    
    // Mood + Energy + Quality
    queries.push(`${musicProfile.mood} ${musicProfile.energy} gaming music NCS`);
    queries.push(`${musicProfile.genre} ${musicProfile.mood} no copyright`);
    queries.push(`best ${musicProfile.genre} gaming music`);
    
    // League of Legends spezifisch
    queries.push(`League of Legends ${musicProfile.genre} music`);
    queries.push('LoL gaming music');
    
    // Energy-Level spezifisch - OPTIMIERT
    if (musicProfile.energy === 'extreme') {
      queries.push('extreme gaming music NCS');
      queries.push('intense battle music epic');
      queries.push('adrenaline gaming music');
      queries.push('hardcore gaming soundtrack Monstercat');
    } else if (musicProfile.energy === 'high') {
      queries.push('energetic gaming music NCS');
      queries.push('upbeat gaming music');
      queries.push('powerful gaming soundtrack');
      queries.push('high energy EDM gaming');
    } else if (musicProfile.energy === 'low') {
      queries.push('chill gaming music NCS');
      queries.push('focus gaming music');
      queries.push('relaxing gaming soundtrack');
      queries.push('lofi gaming beats');
    } else {
      queries.push('balanced gaming music NCS');
      queries.push('gaming focus music Monstercat');
    }
    
    // Theme-basiert (nur die besten)
    if (musicProfile.theme && musicProfile.theme !== 'balanced') {
      queries.push(`${musicProfile.theme} epic gaming music`);
    }
    
    // Instrument-based (nur für spezielle Genres)
    if (musicProfile.instruments && musicProfile.instruments.length > 0) {
      const mainInstrument = musicProfile.instruments[0];
      queries.push(`${mainInstrument} ${musicProfile.genre} gaming`);
    }
    
    // Entferne Duplikate und limitiere auf die besten 12 Queries
    return [...new Set(queries)].slice(0, 12);
  }

  // Search for tracks using multiple queries
  async searchForTracks(searchQueries, targetDuration) {
    const allTracks = [];
    const targetDurationMs = targetDuration * 60 * 1000; // Convert to milliseconds
    let currentDuration = 0;
    
    // Generate realistic mock tracks for now (will be replaced with real API calls)
    for (const query of searchQueries) {
      if (currentDuration >= targetDurationMs) break;
      
      try {
        // Generate 3-5 tracks per query
        const tracksPerQuery = Math.floor(Math.random() * 3) + 3; // 3-5 tracks
        
        for (let i = 0; i < tracksPerQuery; i++) {
          if (currentDuration >= targetDurationMs) break;
          
          const duration = Math.floor(Math.random() * (300000 - 180000 + 1)) + 180000; // 3-5 minutes in ms
          const platform = Math.random() > 0.5 ? 'youtube' : 'spotify';
          const id = `${platform}_${Math.random().toString(36).substr(2, 9)}`;
          
          // 🎵 OPTIMIERT: Realistische Künstlernamen
          const youtubeArtists = [
            'NoCopyrightSounds',
            'Monstercat',
            'Trap Nation',
            'Bass Boosted',
            'TheFatRat',
            'Alan Walker',
            'Tobu',
            'Elektronomia',
            'Different Heaven',
            'Janji'
          ];
          
          const spotifyArtists = [
            'League of Legends',
            'Riot Games Music',
            'Pentakill',
            'K/DA',
            'True Damage',
            'Imagine Dragons',
            'The Glitch Mob',
            'Two Steps From Hell',
            'Audiomachine',
            'Position Music'
          ];
          
          const artist = platform === 'youtube' 
            ? youtubeArtists[Math.floor(Math.random() * youtubeArtists.length)]
            : spotifyArtists[Math.floor(Math.random() * spotifyArtists.length)];
          
          // Erstelle besseren Titel basierend auf Query
          const titleParts = query.split(' ').filter(word => 
            !['music', 'gaming', 'the', 'a', 'and', 'or'].includes(word.toLowerCase())
          );
          const mainKeyword = titleParts[0] || 'Gaming';
          const trackTitle = `${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} Beats`;
          
          const track = {
            id: id,
            title: trackTitle,
            artist: artist,
            duration: duration,
            platform: platform,
            url: platform === 'youtube' ? 
              `https://www.youtube.com/watch?v=${Math.random().toString(36).substr(2, 11)}` : 
              `https://open.spotify.com/track/${Math.random().toString(36).substr(2, 22)}`,
            previewUrl: `https://example.com/preview${Math.random().toString(36).substr(2, 9)}.mp3`,
            thumbnail: platform === 'youtube' ? 
              'https://via.placeholder.com/320x180' : 
              'https://via.placeholder.com/320x320',
            genre: query.split(' ')[0],
            mood: query.split(' ')[1] || 'neutral',
            energy: query.includes('extreme') ? 'extreme' : 
                   query.includes('high') ? 'high' : 
                   query.includes('low') ? 'low' : 'medium'
          };
          
          // Avoid duplicates
          if (allTracks.find(t => t.id === track.id)) continue;
          
          allTracks.push(track);
          currentDuration += track.duration;
        }
        
      } catch (error) {
        console.error(`Error generating tracks for query "${query}":`, error);
        continue;
      }
    }
    
    return allTracks;
  }

  // Optimize playlist flow
  optimizePlaylistFlow(tracks, musicProfile) {
    // Group tracks by energy level
    const energyGroups = {
      low: tracks.filter(t => t.energy === 'low'),
      medium: tracks.filter(t => t.energy === 'medium'),
      high: tracks.filter(t => t.energy === 'high'),
      extreme: tracks.filter(t => t.energy === 'extreme')
    };
    
    // Create optimal flow based on champion and role
    let flow = [];
    
    if (musicProfile.energy === 'extreme') {
      // Start with extreme energy, mix with high
      flow = [
        ...energyGroups.extreme.slice(0, 5),
        ...energyGroups.high.slice(0, 3),
        ...energyGroups.extreme.slice(5, 8),
        ...energyGroups.high.slice(3, 6),
        ...energyGroups.extreme.slice(8)
      ];
    } else if (musicProfile.energy === 'high') {
      // Start high, mix with medium, end high
      flow = [
        ...energyGroups.high.slice(0, 4),
        ...energyGroups.medium.slice(0, 2),
        ...energyGroups.high.slice(4, 7),
        ...energyGroups.medium.slice(2, 4),
        ...energyGroups.high.slice(7)
      ];
    } else if (musicProfile.energy === 'low') {
      // Mostly low and medium energy
      flow = [
        ...energyGroups.low.slice(0, 3),
        ...energyGroups.medium.slice(0, 2),
        ...energyGroups.low.slice(3, 6),
        ...energyGroups.medium.slice(2, 4),
        ...energyGroups.low.slice(6)
      ];
    } else {
      // Balanced mix
      flow = [
        ...energyGroups.medium.slice(0, 3),
        ...energyGroups.high.slice(0, 2),
        ...energyGroups.medium.slice(3, 5),
        ...energyGroups.high.slice(2, 4),
        ...energyGroups.medium.slice(5)
      ];
    }
    
    return flow;
  }

  // Calculate target duration (2-3 hours)
  calculateTargetDuration() {
    const baseDuration = 150; // 2.5 hours in minutes
    const variation = Math.random() * 60; // 0-60 minutes variation
    return Math.floor(baseDuration + variation);
  }

  // Calculate total duration of tracks
  calculateTotalDuration(tracks) {
    return tracks.reduce((total, track) => total + track.duration, 0);
  }

  // Generate playlist ID
  generatePlaylistId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Generate playlist description
  generateDescription(champion, role, playstyle, musicProfile) {
    return `A ${musicProfile.energy} ${musicProfile.mood} playlist perfect for ${champion.name} ${role} players with ${playstyle} playstyle. Featuring ${musicProfile.genre} music that matches ${champion.name}'s ${musicProfile.theme} theme and ${role} role characteristics.`;
  }

  // Generate tags
  generateTags(champion, role, playstyle, musicProfile) {
    return [
      champion.name.toLowerCase(),
      role,
      playstyle,
      musicProfile.genre,
      musicProfile.mood,
      musicProfile.energy,
      musicProfile.theme,
      'gaming',
      'league-of-legends'
    ];
  }
}

module.exports = new MusicAlgorithmService();
