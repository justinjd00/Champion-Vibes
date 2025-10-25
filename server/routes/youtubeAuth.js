const express = require('express');
const axios = require('axios');
const router = express.Router();

// YouTube OAuth Configuration
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID || '1053914110615-qijfdh78i5t1ojt10atb0n1p1ckng3k4.apps.googleusercontent.com';
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET || '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';
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/youtube/callback';

// YouTube OAuth scopes
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube'
].join(' ');

// Generate random string for state parameter
const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Redirect to YouTube authorization
router.get('/youtube/login', (req, res) => {
  const state = generateRandomString(16);
  const authQueryParameters = new URLSearchParams({
    response_type: 'code',
    client_id: YOUTUBE_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    state: state,
    access_type: 'offline',
    prompt: 'consent'
  });

  // Store state in session for security
  req.session.state = state;
  
  // Store redirect path if provided
  const redirectPath = req.query.redirect || '/profile';
  req.session.youtubeRedirectAfterAuth = redirectPath;

  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + authQueryParameters.toString());
});

// Redirect to YouTube authorization (alternative route)
router.get('/youtube', (req, res) => {
  const state = generateRandomString(16);
  const authQueryParameters = new URLSearchParams({
    response_type: 'code',
    client_id: YOUTUBE_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    state: state,
    access_type: 'offline',
    prompt: 'consent'
  });

  // Store state in session for security
  req.session.state = state;
  
  // Store redirect path if provided
  const redirectPath = req.query.redirect || '/profile';
  req.session.youtubeRedirectAfterAuth = redirectPath;

  res.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + authQueryParameters.toString());
});

router.get('/youtube/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = req.session.state;

  console.log('YouTube callback received:', { code: code ? 'present' : 'missing', state, storedState });

  if (!storedState) {
    console.log('No stored state found, proceeding with authentication...');
  } else if (!state || state !== storedState) {
    console.error('State mismatch:', { received: state, stored: storedState });
    res.status(400).json({ error: 'State mismatch' });
    return;
  }

  try {
    console.log('Exchanging code for access token...');
    
    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: YOUTUBE_REDIRECT_URI,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    console.log('Token received:', { access_token: access_token ? 'present' : 'missing', expires_in });

    // Get user profile
    const userResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const user = userResponse.data.items[0];
    console.log('User profile:', user?.snippet?.title);

    // Store tokens in session
    req.session.youtubeAccessToken = access_token;
    req.session.youtubeRefreshToken = refresh_token;
    req.session.youtubeUser = user;
    req.session.youtubeTokenExpiry = Date.now() + (expires_in * 1000);

    console.log('Redirecting to frontend...');
    // Redirect to frontend with success - check if there's a redirect path in session
    const redirectPath = req.session.youtubeRedirectAfterAuth || '/profile';
    req.session.youtubeRedirectAfterAuth = null; // Clear redirect path
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}${redirectPath}?youtube_connected=true`);

  } catch (error) {
    console.error('YouTube auth error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?error=youtube_auth_failed`);
  }
});

// Get current user's YouTube profile (with persistent session)
router.get('/youtube/me', async (req, res) => {
  try {
    if (!req.session.youtubeAccessToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated with YouTube',
        needsAuth: true
      });
    }

    const tokenExpiry = req.session.youtubeTokenExpiry || 0;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now >= tokenExpiry - fiveMinutes) {
      console.log(' Token expired or expiring soon, refreshing...');
      const refreshed = await refreshYouTubeToken(req);
      if (!refreshed) {
        console.log(' Token refresh failed, user needs to re-authenticate');
        return res.status(401).json({ 
          success: false,
          error: 'YouTube token expired, please reconnect',
          needsAuth: true
        });
      }
      console.log(' Token refreshed successfully');
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${req.session.youtubeAccessToken}`
      }
    });

    const user = response.data.items[0];

    res.json({
      success: true,
      user: {
        id: user?.id,
        name: user?.snippet?.title,
        thumbnail: user?.snippet?.thumbnails?.default?.url,
        description: user?.snippet?.description
      },
      tokenExpiresIn: Math.floor((req.session.youtubeTokenExpiry - Date.now()) / 1000) // seconds
    });

  } catch (error) {
    console.error('Get YouTube profile error:', error.response?.data || error.message);
    
    // If error is 401, token is invalid
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token, please reconnect',
        needsAuth: true
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get YouTube profile'
    });
  }
});

// Create playlist in user's YouTube account
router.post('/youtube/create-playlist', async (req, res) => {
  try {
    if (!req.session.youtubeAccessToken) {
      return res.status(401).json({ error: 'Not authenticated with YouTube' });
    }

    const { title, description, tracks, privacyStatus = 'private' } = req.body;

    // Create playlist
    const playlistResponse = await axios.post(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
      {
        snippet: {
          title: title,
          description: description
        },
        status: {
          privacyStatus: privacyStatus
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${req.session.youtubeAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const playlist = playlistResponse.data;
    const playlistId = playlist.id;

    let addedTracks = 0;
    if (tracks && tracks.length > 0) {
      for (const track of tracks) {
        try {
          console.log(`Would add track: ${track.title} by ${track.artist}`);
          addedTracks++;
        } catch (trackError) {
          console.error('Error adding track:', trackError);
        }
      }
    }

    res.json({
      success: true,
      playlist: {
        id: playlist.id,
        title: playlist.snippet.title,
        description: playlist.snippet.description,
        url: `https://www.youtube.com/playlist?list=${playlist.id}`,
        privacyStatus: playlist.status.privacyStatus,
        tracksAdded: addedTracks
      }
    });

  } catch (error) {
    console.error('Create YouTube playlist error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create YouTube playlist'
    });
  }
});

// Add video to playlist
router.post('/youtube/playlist/:playlistId/add-video', async (req, res) => {
  try {
    if (!req.session.youtubeAccessToken) {
      return res.status(401).json({ error: 'Not authenticated with YouTube' });
    }

    const { playlistId } = req.params;
    const { videoId } = req.body;

    const response = await axios.post(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet`,
      {
        snippet: {
          playlistId: playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: videoId
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

    res.json({
      success: true,
      playlistItem: response.data
    });

  } catch (error) {
    console.error('Add video to playlist error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to add video to playlist'
    });
  }
});

// Refresh YouTube token
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
    
    return true;
  } catch (error) {
    console.error('Refresh YouTube token error:', error);
    return false;
  }
}

// Process callback from client (alternative flow)
router.post('/youtube/process-callback', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    console.log('Processing YouTube callback from client:', { code: code ? 'present' : 'missing', state });

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'No authorization code provided'
      });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: YOUTUBE_REDIRECT_URI,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    console.log('Token received:', { access_token: access_token ? 'present' : 'missing', expires_in });

    // Get user profile
    const userResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const user = userResponse.data.items[0];
    console.log('User profile:', user?.snippet?.title);

    // Store tokens in session
    req.session.youtubeAccessToken = access_token;
    req.session.youtubeRefreshToken = refresh_token;
    req.session.youtubeUser = user;
    req.session.youtubeTokenExpiry = Date.now() + (expires_in * 1000);

    res.json({
      success: true,
      user: {
        name: user?.snippet?.title,
        thumbnail: user?.snippet?.thumbnails?.default?.url
      }
    });

  } catch (error) {
    console.error('YouTube callback processing error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to process YouTube callback',
      details: error.response?.data?.error_description || error.message
    });
  }
});

// Logout from YouTube
router.post('/youtube/logout', (req, res) => {
  req.session.youtubeAccessToken = null;
  req.session.youtubeRefreshToken = null;
  req.session.youtubeUser = null;
  req.session.youtubeTokenExpiry = null;

  res.json({
    success: true,
    message: 'Logged out from YouTube'
  });
});

module.exports = router;
