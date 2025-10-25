class ChampionService {
  // Champion database with music preferences
  static championDatabase = {
    'yasuo': {
      name: 'Yasuo',
      title: 'The Unforgiven',
      theme: 'samurai',
      mood: 'melancholic',
      energy: 'high',
      genre: 'japanese',
      tempo: 'fast',
      instruments: ['shamisen', 'flute', 'taiko'],
      cultural: 'japanese',
      complexity: 'high',
      lore: 'A wandering swordsman seeking redemption',
      playstyle: 'aggressive',
      musicPreferences: {
        primaryGenre: 'j-pop',
        secondaryGenre: 'japanese rock',
        mood: 'melancholic',
        energy: 'high',
        instruments: ['shamisen', 'flute', 'taiko'],
        cultural: 'japanese',
        themes: ['honor', 'redemption', 'wind', 'sword']
      }
    },
    'jinx': {
      name: 'Jinx',
      title: 'The Loose Cannon',
      theme: 'chaos',
      mood: 'chaotic',
      energy: 'extreme',
      genre: 'punk',
      tempo: 'extreme',
      instruments: ['electric guitar', 'drums', 'synthesizer'],
      cultural: 'modern',
      complexity: 'medium',
      lore: 'A chaotic criminal with a love for destruction',
      playstyle: 'chaotic',
      musicPreferences: {
        primaryGenre: 'punk rock',
        secondaryGenre: 'electronic',
        mood: 'chaotic',
        energy: 'extreme',
        instruments: ['electric guitar', 'drums', 'synthesizer'],
        cultural: 'modern',
        themes: ['chaos', 'destruction', 'anarchy', 'explosions']
      }
    },
    'thresh': {
      name: 'Thresh',
      title: 'The Chain Warden',
      theme: 'dark',
      mood: 'sinister',
      energy: 'medium',
      genre: 'dark-ambient',
      tempo: 'slow',
      instruments: ['organ', 'strings', 'choir'],
      cultural: 'gothic',
      complexity: 'high',
      lore: 'A sadistic spirit who collects souls',
      playstyle: 'supportive',
      musicPreferences: {
        primaryGenre: 'dark ambient',
        secondaryGenre: 'gothic',
        mood: 'sinister',
        energy: 'medium',
        instruments: ['organ', 'strings', 'choir'],
        cultural: 'gothic',
        themes: ['darkness', 'souls', 'chains', 'torment']
      }
    },
    'darius': {
      name: 'Darius',
      title: 'The Hand of Noxus',
      theme: 'military',
      mood: 'aggressive',
      energy: 'high',
      genre: 'metal',
      tempo: 'fast',
      instruments: ['guitar', 'drums', 'brass'],
      cultural: 'military',
      complexity: 'medium',
      lore: 'A brutal warrior of Noxus',
      playstyle: 'aggressive',
      musicPreferences: {
        primaryGenre: 'metal',
        secondaryGenre: 'military',
        mood: 'aggressive',
        energy: 'high',
        instruments: ['guitar', 'drums', 'brass'],
        cultural: 'military',
        themes: ['war', 'conquest', 'strength', 'honor']
      }
    },
    'ahri': {
      name: 'Ahri',
      title: 'The Nine-Tailed Fox',
      theme: 'mystical',
      mood: 'seductive',
      energy: 'medium',
      genre: 'k-pop',
      tempo: 'medium',
      instruments: ['synthesizer', 'vocal', 'strings'],
      cultural: 'korean',
      complexity: 'high',
      lore: 'A mystical fox spirit',
      playstyle: 'magical',
      musicPreferences: {
        primaryGenre: 'k-pop',
        secondaryGenre: 'electronic',
        mood: 'seductive',
        energy: 'medium',
        instruments: ['synthesizer', 'vocal', 'strings'],
        cultural: 'korean',
        themes: ['mysticism', 'beauty', 'magic', 'fox']
      }
    },
    'lux': {
      name: 'Lux',
      title: 'The Lady of Luminosity',
      theme: 'light',
      mood: 'uplifting',
      energy: 'medium',
      genre: 'pop',
      tempo: 'medium',
      instruments: ['piano', 'strings', 'vocal'],
      cultural: 'modern',
      complexity: 'medium',
      lore: 'A bright mage of Demacia',
      playstyle: 'supportive',
      musicPreferences: {
        primaryGenre: 'pop',
        secondaryGenre: 'orchestral',
        mood: 'uplifting',
        energy: 'medium',
        instruments: ['piano', 'strings', 'vocal'],
        cultural: 'modern',
        themes: ['light', 'hope', 'magic', 'brightness']
      }
    },
    'zed': {
      name: 'Zed',
      title: 'The Master of Shadows',
      theme: 'ninja',
      mood: 'mysterious',
      energy: 'high',
      genre: 'electronic',
      tempo: 'fast',
      instruments: ['synthesizer', 'drums', 'strings'],
      cultural: 'japanese',
      complexity: 'high',
      lore: 'A shadow ninja master',
      playstyle: 'assassin',
      musicPreferences: {
        primaryGenre: 'electronic',
        secondaryGenre: 'ambient',
        mood: 'mysterious',
        energy: 'high',
        instruments: ['synthesizer', 'drums', 'strings'],
        cultural: 'japanese',
        themes: ['shadows', 'stealth', 'ninja', 'darkness']
      }
    },
    'vayne': {
      name: 'Vayne',
      title: 'The Night Hunter',
      theme: 'hunter',
      mood: 'focused',
      energy: 'medium',
      genre: 'dark-ambient',
      tempo: 'medium',
      instruments: ['strings', 'piano', 'choir'],
      cultural: 'gothic',
      complexity: 'high',
      lore: 'A monster hunter seeking vengeance',
      playstyle: 'precise',
      musicPreferences: {
        primaryGenre: 'dark ambient',
        secondaryGenre: 'orchestral',
        mood: 'focused',
        energy: 'medium',
        instruments: ['strings', 'piano', 'choir'],
        cultural: 'gothic',
        themes: ['hunting', 'vengeance', 'darkness', 'monsters']
      }
    },
    'leona': {
      name: 'Leona',
      title: 'The Radiant Dawn',
      theme: 'solar',
      mood: 'heroic',
      energy: 'high',
      genre: 'orchestral',
      tempo: 'fast',
      instruments: ['brass', 'strings', 'choir'],
      cultural: 'classical',
      complexity: 'medium',
      lore: 'A solar warrior of the Solari',
      playstyle: 'tank',
      musicPreferences: {
        primaryGenre: 'orchestral',
        secondaryGenre: 'epic',
        mood: 'heroic',
        energy: 'high',
        instruments: ['brass', 'strings', 'choir'],
        cultural: 'classical',
        themes: ['sun', 'light', 'heroism', 'dawn']
      }
    },
    'garen': {
      name: 'Garen',
      title: 'The Might of Demacia',
      theme: 'knight',
      mood: 'noble',
      energy: 'high',
      genre: 'orchestral',
      tempo: 'fast',
      instruments: ['brass', 'strings', 'drums'],
      cultural: 'medieval',
      complexity: 'medium',
      lore: 'A noble knight of Demacia',
      playstyle: 'tank',
      musicPreferences: {
        primaryGenre: 'orchestral',
        secondaryGenre: 'epic',
        mood: 'noble',
        energy: 'high',
        instruments: ['brass', 'strings', 'drums'],
        cultural: 'medieval',
        themes: ['honor', 'justice', 'knight', 'demacia']
      }
    },
    'kha-zix': {
      name: 'Kha\'Zix',
      title: 'The Voidreaver',
      theme: 'alien',
      mood: 'predatory',
      energy: 'high',
      genre: 'electronic',
      tempo: 'fast',
      instruments: ['synthesizer', 'drums', 'bass'],
      cultural: 'alien',
      complexity: 'high',
      lore: 'A void creature that evolves',
      playstyle: 'assassin',
      musicPreferences: {
        primaryGenre: 'electronic',
        secondaryGenre: 'ambient',
        mood: 'predatory',
        energy: 'high',
        instruments: ['synthesizer', 'drums', 'bass'],
        cultural: 'alien',
        themes: ['evolution', 'void', 'predator', 'alien']
      }
    }
  };

  // Get champion data
  static getChampionData(champion) {
    const championKey = champion.toLowerCase();
    return this.championDatabase[championKey] || this.getDefaultChampionData(champion);
  }

  // Get music preferences for champion and role combination
  static getMusicPreferences(champion, role) {
    const championData = this.getChampionData(champion);
    const roleModifiers = this.getRoleModifiers(role);
    
    return {
      ...championData.musicPreferences,
      ...roleModifiers,
      champion: champion,
      role: role
    };
  }

  // Get role-specific modifiers
  static getRoleModifiers(role) {
    const roleModifiers = {
      'top': {
        energy: 'high',
        mood: 'focused',
        themes: ['isolation', 'dueling', 'strength'],
        instruments: ['guitar', 'drums', 'brass']
      },
      'jungle': {
        energy: 'extreme',
        mood: 'hunter',
        themes: ['wild', 'hunting', 'stealth'],
        instruments: ['drums', 'synthesizer', 'bass']
      },
      'mid': {
        energy: 'high',
        mood: 'confident',
        themes: ['carry', 'magic', 'power'],
        instruments: ['synthesizer', 'strings', 'piano']
      },
      'adc': {
        energy: 'medium',
        mood: 'calculated',
        themes: ['precision', 'ranged', 'teamwork'],
        instruments: ['strings', 'piano', 'vocal']
      },
      'support': {
        energy: 'medium',
        mood: 'supportive',
        themes: ['teamwork', 'protection', 'healing'],
        instruments: ['strings', 'choir', 'piano']
      }
    };

    return roleModifiers[role] || {};
  }

  // Get default champion data for unknown champions
  static getDefaultChampionData(champion) {
    return {
      name: champion,
      title: 'The Unknown',
      theme: 'mysterious',
      mood: 'neutral',
      energy: 'medium',
      genre: 'electronic',
      tempo: 'medium',
      instruments: ['synthesizer', 'drums'],
      cultural: 'modern',
      complexity: 'medium',
      lore: 'A mysterious champion',
      playstyle: 'unknown',
      musicPreferences: {
        primaryGenre: 'electronic',
        secondaryGenre: 'ambient',
        mood: 'neutral',
        energy: 'medium',
        instruments: ['synthesizer', 'drums'],
        cultural: 'modern',
        themes: ['mystery', 'unknown', 'adventure']
      }
    };
  }

  // Get all available champions
  static getAllChampions() {
    return Object.keys(this.championDatabase).map(key => ({
      value: key,
      label: `${this.championDatabase[key].name} - ${this.championDatabase[key].title}`,
      role: this.getChampionRole(key)
    }));
  }

  // Get champion's primary role
  static getChampionRole(champion) {
    const championData = this.getChampionData(champion);
    
    // Simple role mapping based on champion characteristics
    if (championData.playstyle === 'assassin') return 'mid';
    if (championData.playstyle === 'tank') return 'top';
    if (championData.playstyle === 'supportive') return 'support';
    if (championData.energy === 'extreme') return 'jungle';
    if (championData.energy === 'medium') return 'adc';
    
    return 'mid'; // Default
  }

  // Get champion recommendations based on music preferences
  static getChampionRecommendations(musicPreferences) {
    const { genre, mood, energy, cultural } = musicPreferences;
    
    const recommendations = Object.entries(this.championDatabase)
      .filter(([key, data]) => {
        return data.musicPreferences.primaryGenre === genre ||
               data.musicPreferences.mood === mood ||
               data.musicPreferences.energy === energy ||
               data.musicPreferences.cultural === cultural;
      })
      .map(([key, data]) => ({
        champion: key,
        name: data.name,
        title: data.title,
        matchScore: this.calculateMatchScore(data.musicPreferences, musicPreferences)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return recommendations;
  }

  // Calculate match score between preferences
  static calculateMatchScore(championPrefs, userPrefs) {
    let score = 0;
    
    if (championPrefs.primaryGenre === userPrefs.genre) score += 3;
    if (championPrefs.mood === userPrefs.mood) score += 2;
    if (championPrefs.energy === userPrefs.energy) score += 2;
    if (championPrefs.cultural === userPrefs.cultural) score += 1;
    
    return score;
  }
}

module.exports = ChampionService;
