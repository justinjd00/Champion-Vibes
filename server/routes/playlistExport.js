const express = require('express');
const axios = require('axios');
const router = express.Router();

// YouTube API Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyA9K9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z';
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;

/**
 * Refresh YouTube token wenn abgelaufen
 */
async function refreshYouTubeToken(req) {
  try {
    if (!req.session.youtubeRefreshToken) {
      return false;
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', 
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: req.session.youtubeRefreshToken,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in } = response.data;
    
    req.session.youtubeAccessToken = access_token;
    req.session.youtubeTokenExpiry = Date.now() + (expires_in * 1000);
    
    console.log('✅ Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ Refresh YouTube token error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Generiert Such-Strategien basierend auf:
 * 1. RELEVANZ (Passgenauigkeit)
 * 2. QUALITÄT (Sortierung)
 * 3. VARIETÄT (Zeit + Länge)
 */
function generateSearchStrategies(title, artist) {
  // Bereinige Titel und Künstler
  const cleanTitle = title.replace(/[^\w\s-]/g, '').trim();
  const cleanArtist = artist.replace(/[^\w\s-]/g, '').trim();
  const baseQuery = `${cleanTitle} ${cleanArtist} music`;
  
  // 📅 Datum für "Letzte 6 Monate"
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const publishedAfter = sixMonthsAgo.toISOString();
  
  return [
    // 🔥 TAKTIK A: "Frische Hits" - Beliebte neue Songs
    {
      name: 'Frische Hits',
      query: `${baseQuery} official audio`,
      params: {
        order: 'viewCount',          // Beliebteste zuerst
        videoDuration: 'medium',      // 4-20 Min (einzelne Songs)
        publishedAfter: publishedAfter // Nur letzte 6 Monate
      }
    },
    
    // 🎧 TAKTIK B: "Best Match" - Relevanteste Ergebnisse
    {
      name: 'Best Match',
      query: `${baseQuery} official`,
      params: {
        order: 'relevance',           // YouTubes bester Algorithmus
        videoDuration: 'medium',      // 4-20 Min
        // Kein Zeitfilter - alle Zeiträume
      }
    },
    
    // ✨ TAKTIK C: "Geheimtipps" - Hochwertige versteckte Perlen
    {
      name: 'Geheimtipps',
      query: `${baseQuery} audio`,
      params: {
        order: 'rating',              // Best bewertet
        videoDuration: 'any',         // Alle Längen
        // Kein Zeitfilter
      }
    },
    
    // 🎵 TAKTIK D: "Topic Channels" - Auto-generierte offizielle Musik
    {
      name: 'Topic',
      query: `${cleanTitle} ${cleanArtist} topic`,
      params: {
        order: 'relevance',
        videoDuration: 'medium'
      }
    }
  ];
}

/**
 * 🎯 INTELLIGENTER FILTER: Filtert unerwünschte Videos aus
 * Basierend auf Ausschluss-Keywords und Qualitäts-Indikatoren
 */
function isValidMusicVideo(video) {
  const title = video.snippet.title.toLowerCase();
  const channelTitle = video.snippet.channelTitle.toLowerCase();
  const description = (video.snippet.description || '').toLowerCase();
  
  // 🚫 AUSSCHLUSS-KEYWORDS (Hard Filter)
  const excludeKeywords = [
    // Shorts & Clips
    '#shorts', 'short', '#short',
    
    // Tutorials & Reactions
    'tutorial', 'how to', 'reaction', 'react to', 'review',
    
    // Covers & Remixes (oft schlechter als Original)
    'cover version', 'acoustic cover', 'piano cover', 'guitar cover',
    'drum cover', 'bass cover', 'vocal cover', 'nightcore',
    
    // Karaoke & Lyrics-Only
    'karaoke', 'lyrics video', 'lyrics only', 'lyric video',
    
    // Modifizierte Versionen
    'speed up', 'sped up', 'slowed', 'reverb', '8d audio', 'bass boosted',
    
    // Loops & Extended
    '1 hour', '10 hours', '24 hours', 'extended', 'loop', '10h', '1h',
    
    // Gaming-Content (kein Musik-Video)
    'gameplay', 'fortnite', 'tiktok', 'roblox', 'minecraft',
    
    // Compilations & Mashups
    'compilation', 'mashup', 'megamix', 'best of 2024'
  ];
  
  // Prüfe Ausschluss-Keywords
  for (const keyword of excludeKeywords) {
    if (title.includes(keyword)) {
      console.log(`  ⊗ Filtered: ${video.snippet.title.substring(0, 60)}... (${keyword})`);
      return false;
    }
  }
  
  // ✅ QUALITÄTS-INDIKATOREN
  
  // 1️⃣ Bevorzugte Musik-Kanäle (Auto-Accept)
  const trustedChannels = [
    'vevo',           // Major Label Official
    'topic',          // YouTube Auto-Generated
    'official',       // Official Artist Channels
    'records',        // Record Labels
    'ncs',            // NoCopyrightSounds
    'nocopyrightsounds',
    'monstercat',     // EDM Label
    'trap nation',
    'proximity',
    'magic music',
    'selected',
    'mrsuicidesheep'
  ];
  
  const isTrustedChannel = trustedChannels.some(pattern => 
    channelTitle.includes(pattern)
  );
  
  if (isTrustedChannel) {
    return true;
  }
  
  // 2️⃣ Musik-Indikatoren im Titel (Soft Accept)
  const qualityIndicators = [
    'official audio',
    'official video',
    'official music video',
    'audio only',
    'full song',
    'hd audio',
    'music video'
  ];
  
  const hasQualityIndicator = qualityIndicators.some(indicator => 
    title.includes(indicator)
  );
  
  if (hasQualityIndicator) {
    return true;
  }
  
  // 3️⃣ Wenn nichts davon zutrifft: Reject
  console.log(`  ⊗ Filtered: ${video.snippet.title.substring(0, 60)}... (no quality indicator)`);
  return false;
}

/**
 * 🎯 SMARTER ALGORITHMUS: Multi-Taktik-Suche
 * Kombiniert RELEVANZ + QUALITÄT + VARIETÄT
 */
async function searchYouTubeVideo(title, artist, accessToken) {
  try {
    console.log(`\n🔍 Searching: "${title}" by "${artist}"`);
    
    const strategies = generateSearchStrategies(title, artist);
    const allFoundVideos = [];
    
    // 🎲 Versuche jede Strategie parallel (für maximale Varietät)
    for (const strategy of strategies) {
      try {
        console.log(`  📋 Trying: ${strategy.name}...`);
        
        // Baue API-Parameter
        const searchParams = {
          part: 'snippet',
          q: strategy.query,
          type: 'video',
          maxResults: 5,                 // Hole mehrere für Filterung
          videoCategoryId: '10',         // 🎵 MUSIK-KATEGORIE (wichtigster Filter!)
          safeSearch: 'none',
          ...strategy.params              // Füge strategie-spezifische Parameter hinzu
        };
        
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: searchParams,
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.data.items && response.data.items.length > 0) {
          // Filtere Videos durch Qualitäts-Check
          const validVideos = response.data.items.filter(isValidMusicVideo);
          
          if (validVideos.length > 0) {
            const video = validVideos[0];
            console.log(`  ✅ [${strategy.name}] Found: ${video.snippet.title.substring(0, 60)}...`);
            console.log(`     Channel: ${video.snippet.channelTitle}`);
            
            // Speichere Video mit Strategie-Info
            allFoundVideos.push({
              videoId: video.id.videoId,
              title: video.snippet.title,
              thumbnail: video.snippet.thumbnails.default.url,
              channelTitle: video.snippet.channelTitle,
              strategy: strategy.name
            });
            
            // ⚡ OPTIMIERUNG: Wenn "Best Match" oder "Topic" einen Treffer hat, nimm ihn sofort
            if (strategy.name === 'Best Match' || strategy.name === 'Topic') {
              console.log(`  🎯 Using ${strategy.name} result immediately`);
              return allFoundVideos[allFoundVideos.length - 1];
            }
          } else {
            console.log(`  ⚠️ [${strategy.name}] No valid videos after filtering`);
          }
        } else {
          console.log(`  ⚠️ [${strategy.name}] No results`);
        }
        
      } catch (searchError) {
        console.error(`  ❌ [${strategy.name}] Error:`, searchError.message);
        continue;
      }
    }
    
    // Wenn wir hier sind: Nimm das beste gefundene Video (erstes in der Liste)
    if (allFoundVideos.length > 0) {
      const bestVideo = allFoundVideos[0];
      console.log(`  🏆 Best result: ${bestVideo.title.substring(0, 60)}... [${bestVideo.strategy}]`);
      return bestVideo;
    }
    
    // Wenn alle Strategien fehlschlagen
    console.log(`  ❌ No valid video found for: ${title} by ${artist}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Fatal error searching for ${title} by ${artist}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Erstellt eine YouTube-Playlist mit Videos
 * POST /api/export/youtube/create-full-playlist
 */
router.post('/youtube/create-full-playlist', async (req, res) => {
  try {
    const { playlistTitle, playlistDescription, tracks } = req.body;
    
    console.log(`📝 Creating YouTube playlist: ${playlistTitle}`);
    console.log(`🎵 Number of tracks: ${tracks.length}`);

    // Schritt 1: Prüfe YouTube-Authentifizierung
    if (!req.session.youtubeAccessToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated with YouTube',
        authUrl: `http://localhost:8001/api/auth/youtube/login?redirect=/api/export/youtube/callback`
      });
    }

    // 🔄 Auto-refresh wenn Token abgelaufen oder bald abläuft (5 Minuten)
    const tokenExpiry = req.session.youtubeTokenExpiry || 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now >= tokenExpiry - fiveMinutes) {
      console.log('🔄 Token expired or expiring soon, refreshing...');
      const refreshed = await refreshYouTubeToken(req);
      if (!refreshed) {
        console.log('❌ Token refresh failed, user needs to re-authenticate');
        return res.status(401).json({
          success: false,
          error: 'YouTube token expired, please reconnect',
          needsAuth: true
        });
      }
    }

      // Schritt 2: Suche YouTube-Videos für jeden Track (SMART ALGORITHMUS)
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 SMART SEARCH: Multi-Taktik-Algorithmus');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      const videoPromises = tracks.map(track =>
        searchYouTubeVideo(track.title, track.artist, req.session.youtubeAccessToken)
      );
      const videos = await Promise.all(videoPromises);
      const validVideos = videos.filter(v => v !== null);

      // 🔒 Entferne Duplikate basierend auf videoId
      const uniqueVideos = [];
      const seenVideoIds = new Set();
      
      for (const video of validVideos) {
        if (!seenVideoIds.has(video.videoId)) {
          uniqueVideos.push(video);
          seenVideoIds.add(video.videoId);
        } else {
          console.log(`  ⊗ Duplicate removed: ${video.title}`);
        }
      }

      console.log(`✅ Found ${uniqueVideos.length} unique videos out of ${tracks.length} tracks (${validVideos.length - uniqueVideos.length} duplicates removed)`);

    if (uniqueVideos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No videos found for the provided tracks'
      });
    }

    // Schritt 3: Erstelle YouTube-Playlist
    console.log('📋 Creating YouTube playlist...');
    const playlistResponse = await axios.post(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
      {
        snippet: {
          title: playlistTitle,
          description: playlistDescription || 'Created by Champion Vibes'
        },
        status: {
          privacyStatus: 'private'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${req.session.youtubeAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const playlistId = playlistResponse.data.id;
    console.log(`✅ Playlist created: ${playlistId}`);

    // Schritt 4: Füge Videos zur Playlist hinzu
    console.log('🎬 Adding videos to playlist...');
    let addedCount = 0;
    for (const video of uniqueVideos) {
      try {
        await axios.post(
          'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
          {
            snippet: {
              playlistId: playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId: video.videoId
              }
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${req.session.youtubeAccessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        addedCount++;
        console.log(`  ✓ Added: ${video.title}`);
      } catch (error) {
        console.error(`  ✗ Failed to add video ${video.videoId}:`, error.response?.data?.error?.message || error.message);
      }
    }

    console.log(`🎉 Successfully added ${addedCount} videos to playlist`);

    res.json({
      success: true,
      playlist: {
        id: playlistId,
        title: playlistTitle,
        url: `https://www.youtube.com/playlist?list=${playlistId}`,
        videosFound: uniqueVideos.length,
        videosAdded: addedCount,
        videos: uniqueVideos.map(v => ({
          id: v.videoId,
          title: v.title,
          url: `https://www.youtube.com/watch?v=${v.videoId}`
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error creating YouTube playlist:', error.response?.data || error.message);
    
    // Check if token is expired
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'YouTube authentication expired',
        authUrl: `http://localhost:8001/api/auth/youtube/login`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create YouTube playlist',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

/**
 * Sucht YouTube-Videos für Tracks (ohne Playlist zu erstellen)
 * POST /api/export/youtube/search-videos
 */
router.post('/youtube/search-videos', async (req, res) => {
  try {
    const { tracks } = req.body;
    
    console.log(`🔍 Searching YouTube videos for ${tracks.length} tracks`);

    const videoPromises = tracks.map(track => 
      searchYouTubeVideo(track.title, track.artist)
    );
    const videos = await Promise.all(videoPromises);
    const validVideos = videos.filter(v => v !== null);

    res.json({
      success: true,
      found: validVideos.length,
      total: tracks.length,
      videos: validVideos
    });

  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search YouTube videos'
    });
  }
});

/**
 * Erstellt eine öffentliche YouTube-Playlist-URL (ohne Account)
 * POST /api/export/youtube/generate-playlist-url
 */
router.post('/youtube/generate-playlist-url', async (req, res) => {
  try {
    const { tracks } = req.body;
    
    console.log(`🔗 Generating YouTube playlist URL for ${tracks.length} tracks`);

    // Suche Videos
    const videoPromises = tracks.map(track => 
      searchYouTubeVideo(track.title, track.artist)
    );
    const videos = await Promise.all(videoPromises);
    const validVideos = videos.filter(v => v !== null);

    if (validVideos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No videos found'
      });
    }

    // Erstelle eine URL, die alle Videos als Playlist abspielt
    const videoIds = validVideos.map(v => v.videoId).join(',');
    const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds}`;

    res.json({
      success: true,
      found: validVideos.length,
      total: tracks.length,
      playlistUrl: playlistUrl,
      videos: validVideos.map(v => ({
        id: v.videoId,
        title: v.title,
        url: `https://www.youtube.com/watch?v=${v.videoId}`,
        thumbnail: v.thumbnail
      }))
    });

  } catch (error) {
    console.error('Error generating playlist URL:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate playlist URL'
    });
  }
});

module.exports = router;

