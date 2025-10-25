const axios = require('axios');

class RiotApiService {
  constructor() {
    this.apiKey = process.env.RIOT_API_KEY;
    this.baseUrl = process.env.RIOT_BASE_URL || 'https://ddragon.leagueoflegends.com/cdn';
    this.version = null;
    this.champions = null;
  }

  // Get latest game version
  async getLatestVersion() {
    try {
      const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
      this.version = response.data[0];
      return this.version;
    } catch (error) {
      console.error('Error fetching game version:', error);
      return '13.24.1'; // Fallback version
    }
  }

  // Get all champions from Riot API
  async getAllChampions() {
    try {
      if (!this.version) {
        await this.getLatestVersion();
      }

      const response = await axios.get(
        `${this.baseUrl}/${this.version}/data/en_US/champion.json`
      );

      const championsData = response.data.data;
      const champions = [];

      for (const [key, champion] of Object.entries(championsData)) {
        champions.push({
          id: champion.id,
          key: champion.key,
          name: champion.name,
          title: champion.title,
          tags: champion.tags,
          image: `${this.baseUrl}/${this.version}/img/champion/${champion.image.full}`,
          splash: `${this.baseUrl}/img/champion/splash/${champion.id}_0.jpg`,
          loading: `${this.baseUrl}/img/champion/loading/${champion.id}_0.jpg`
        });
      }

      this.champions = champions;
      return champions;
    } catch (error) {
      console.error('Error fetching champions:', error);
      return this.getFallbackChampions();
    }
  }

  // Get champion details by ID
  async getChampionDetails(championId) {
    try {
      if (!this.version) {
        await this.getLatestVersion();
      }

      const response = await axios.get(
        `${this.baseUrl}/${this.version}/data/en_US/champion/${championId}.json`
      );

      const championData = response.data.data[championId];
      return {
        id: championData.id,
        key: championData.key,
        name: championData.name,
        title: championData.title,
        lore: championData.lore,
        tags: championData.tags,
        stats: championData.stats,
        spells: championData.spells,
        passive: championData.passive,
        image: `${this.baseUrl}/${this.version}/img/champion/${championData.image.full}`,
        splash: `${this.baseUrl}/img/champion/splash/${championData.id}_0.jpg`
      };
    } catch (error) {
      console.error(`Error fetching champion ${championId}:`, error);
      return null;
    }
  }

  // Get champion by name
  async getChampionByName(name) {
    try {
      const champions = await this.getAllChampions();
      return champions.find(champ => 
        champ.name.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error(`Error finding champion ${name}:`, error);
      return null;
    }
  }

  // Analyze champion for music preferences
  analyzeChampionForMusic(champion) {
    const analysis = {
      theme: this.determineTheme(champion),
      mood: this.determineMood(champion),
      energy: this.determineEnergy(champion),
      genre: this.determineGenre(champion),
      tempo: this.determineTempo(champion),
      instruments: this.determineInstruments(champion),
      cultural: this.determineCultural(champion),
      complexity: this.determineComplexity(champion)
    };

    return analysis;
  }

  // Theme analysis based on champion lore and tags
  determineTheme(champion) {
    const lore = champion.lore?.toLowerCase() || '';
    const tags = champion.tags || [];
    
    if (lore.includes('demon') || lore.includes('shadow') || lore.includes('dark')) {
      return 'dark';
    }
    if (lore.includes('angel') || lore.includes('light') || lore.includes('holy')) {
      return 'light';
    }
    if (lore.includes('dragon') || lore.includes('beast') || lore.includes('wild')) {
      return 'beast';
    }
    if (lore.includes('machine') || lore.includes('robot') || lore.includes('tech')) {
      return 'mechanical';
    }
    if (lore.includes('ice') || lore.includes('frost') || lore.includes('cold')) {
      return 'ice';
    }
    if (lore.includes('fire') || lore.includes('flame') || lore.includes('burn')) {
      return 'fire';
    }
    if (tags.includes('Assassin')) {
      return 'stealth';
    }
    if (tags.includes('Tank')) {
      return 'fortress';
    }
    if (tags.includes('Mage')) {
      return 'mystical';
    }
    if (tags.includes('Marksman')) {
      return 'precision';
    }
    if (tags.includes('Support')) {
      return 'guardian';
    }
    
    return 'epic';
  }

  // Mood analysis
  determineMood(champion) {
    const lore = champion.lore?.toLowerCase() || '';
    const tags = champion.tags || [];
    
    if (lore.includes('sad') || lore.includes('tragic') || lore.includes('lonely')) {
      return 'melancholic';
    }
    if (lore.includes('angry') || lore.includes('rage') || lore.includes('fury')) {
      return 'aggressive';
    }
    if (lore.includes('happy') || lore.includes('joy') || lore.includes('cheerful')) {
      return 'uplifting';
    }
    if (lore.includes('mysterious') || lore.includes('secret') || lore.includes('hidden')) {
      return 'mysterious';
    }
    if (lore.includes('noble') || lore.includes('honor') || lore.includes('justice')) {
      return 'heroic';
    }
    if (tags.includes('Assassin')) {
      return 'sinister';
    }
    if (tags.includes('Tank')) {
      return 'protective';
    }
    if (tags.includes('Mage')) {
      return 'mystical';
    }
    
    return 'neutral';
  }

  // Energy analysis
  determineEnergy(champion) {
    const tags = champion.tags || [];
    const stats = champion.stats || {};
    
    if (tags.includes('Assassin')) {
      return 'high';
    }
    if (tags.includes('Tank')) {
      return 'medium';
    }
    if (tags.includes('Mage')) {
      return stats.attackdamage > 60 ? 'high' : 'medium';
    }
    if (tags.includes('Marksman')) {
      return 'medium';
    }
    if (tags.includes('Support')) {
      return 'low';
    }
    
    return 'medium';
  }

  // Genre analysis
  determineGenre(champion) {
    const theme = this.determineTheme(champion);
    const cultural = this.determineCultural(champion);
    
    if (cultural === 'japanese') {
      return 'j-pop';
    }
    if (cultural === 'korean') {
      return 'k-pop';
    }
    if (theme === 'dark') {
      return 'dark-ambient';
    }
    if (theme === 'mechanical') {
      return 'electronic';
    }
    if (theme === 'fire') {
      return 'metal';
    }
    if (theme === 'ice') {
      return 'ambient';
    }
    if (theme === 'beast') {
      return 'tribal';
    }
    if (theme === 'light') {
      return 'orchestral';
    }
    
    return 'electronic';
  }

  // Tempo analysis
  determineTempo(champion) {
    const energy = this.determineEnergy(champion);
    const tags = champion.tags || [];
    
    if (energy === 'high' || tags.includes('Assassin')) {
      return 'fast';
    }
    if (energy === 'low' || tags.includes('Support')) {
      return 'slow';
    }
    
    return 'medium';
  }

  // Instruments analysis
  determineInstruments(champion) {
    const theme = this.determineTheme(champion);
    const cultural = this.determineCultural(champion);
    
    if (cultural === 'japanese') {
      return ['shamisen', 'flute', 'taiko'];
    }
    if (cultural === 'korean') {
      return ['synthesizer', 'vocal', 'strings'];
    }
    if (theme === 'dark') {
      return ['organ', 'strings', 'choir'];
    }
    if (theme === 'mechanical') {
      return ['synthesizer', 'drums', 'bass'];
    }
    if (theme === 'fire') {
      return ['guitar', 'drums', 'brass'];
    }
    if (theme === 'ice') {
      return ['piano', 'strings', 'bells'];
    }
    if (theme === 'beast') {
      return ['drums', 'flute', 'percussion'];
    }
    if (theme === 'light') {
      return ['piano', 'strings', 'choir'];
    }
    
    return ['synthesizer', 'drums', 'strings'];
  }

  // Cultural analysis
  determineCultural(champion) {
    const lore = champion.lore?.toLowerCase() || '';
    const name = champion.name.toLowerCase();
    
    if (lore.includes('ionia') || lore.includes('japanese') || name.includes('yasuo') || name.includes('ahri')) {
      return 'japanese';
    }
    if (lore.includes('korean') || name.includes('jinx') || name.includes('vi')) {
      return 'korean';
    }
    if (lore.includes('noxus') || lore.includes('military') || name.includes('darius')) {
      return 'military';
    }
    if (lore.includes('demacia') || lore.includes('noble') || name.includes('garen')) {
      return 'medieval';
    }
    if (lore.includes('void') || lore.includes('alien') || name.includes('kha')) {
      return 'alien';
    }
    if (lore.includes('shadow') || lore.includes('dark') || name.includes('zed')) {
      return 'gothic';
    }
    
    return 'modern';
  }

  // Complexity analysis
  determineComplexity(champion) {
    const tags = champion.tags || [];
    const spells = champion.spells || [];
    
    if (tags.includes('Assassin') && spells.length > 3) {
      return 'high';
    }
    if (tags.includes('Tank')) {
      return 'low';
    }
    if (tags.includes('Mage') && spells.length > 3) {
      return 'high';
    }
    if (tags.includes('Support')) {
      return 'medium';
    }
    
    return 'medium';
  }

  // Fallback champions if API fails
  getFallbackChampions() {
    return [
      {
        id: 'Yasuo',
        key: '157',
        name: 'Yasuo',
        title: 'The Unforgiven',
        tags: ['Fighter', 'Assassin'],
        image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png',
        splash: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg'
      },
      {
        id: 'Jinx',
        key: '222',
        name: 'Jinx',
        title: 'The Loose Cannon',
        tags: ['Marksman'],
        image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png',
        splash: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg'
      },
      {
        id: 'Thresh',
        key: '412',
        name: 'Thresh',
        title: 'The Chain Warden',
        tags: ['Support', 'Fighter'],
        image: 'https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Thresh.png',
        splash: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Thresh_0.jpg'
      }
    ];
  }
}

module.exports = new RiotApiService();
