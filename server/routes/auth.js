const express = require('express');
const axios = require('axios');
const router = express.Router();

// Spotify OAuth Configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/spotify/callback';

// Generate random string for state parameter
const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Spotify OAuth scopes
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-library-modify'
].join(' ');

// Redirect to Spotify authorization
router.get('/spotify', (req, res) => {
  const state = generateRandomString(16);
  const authQueryParameters = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state
  });

  // Store state in session for security
  req.session.state = state;

  res.redirect('https://accounts.spotify.com/authorize/?' + authQueryParameters.toString());
});

// Handle Spotify callback
router.get('/spotify/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const storedState = req.session.state;

  if (!state || state !== storedState) {
    res.status(400).json({ error: 'State mismatch' });
    return;
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Get user profile
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const user = userResponse.data;

    // Store tokens in session
    req.session.spotifyAccessToken = access_token;
    req.session.spotifyRefreshToken = refresh_token;
    req.session.spotifyUser = user;
    req.session.tokenExpiry = Date.now() + (expires_in * 1000);

    // Redirect to frontend with success
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?spotify_connected=true`);

  } catch (error) {
    console.error('Spotify auth error:', error.response?.data || error.message);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/profile?error=spotify_auth_failed`);
  }
});

// Get current user's Spotify profile
router.get('/spotify/me', async (req, res) => {
  try {
    if (!req.session.spotifyAccessToken) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    // Check if token is expired
    if (Date.now() >= req.session.tokenExpiry) {
      // Try to refresh token
      const refreshed = await refreshSpotifyToken(req);
      if (!refreshed) {
        return res.status(401).json({ error: 'Spotify token expired' });
      }
    }

    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${req.session.spotifyAccessToken}`
      }
    });

    res.json({
      success: true,
      user: response.data
    });

  } catch (error) {
    console.error('Get Spotify profile error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get Spotify profile'
    });
  }
});

// Create playlist in user's Spotify account
router.post('/spotify/create-playlist', async (req, res) => {
  try {
    if (!req.session.spotifyAccessToken) {
      return res.status(401).json({ error: 'Not authenticated with Spotify' });
    }

    const { name, description, tracks } = req.body;
    const userId = req.session.spotifyUser.id;

    // Create playlist
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: name,
        description: description,
        public: false
      },
      {
        headers: {
          'Authorization': `Bearer ${req.session.spotifyAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const playlist = playlistResponse.data;

    // Add tracks to playlist
    if (tracks && tracks.length > 0) {
      const trackUris = tracks.map(track => track.spotify_uri).filter(Boolean);
      
      if (trackUris.length > 0) {
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            uris: trackUris
          },
          {
            headers: {
              'Authorization': `Bearer ${req.session.spotifyAccessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
    }

    res.json({
      success: true,
      playlist: {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        url: playlist.external_urls.spotify,
        tracks: tracks?.length || 0
      }
    });

  } catch (error) {
    console.error('Create Spotify playlist error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create Spotify playlist'
    });
  }
});

// Refresh Spotify token
async function refreshSpotifyToken(req) {
  try {
    if (!req.session.spotifyRefreshToken) {
      return false;
    }

    const response = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: req.session.spotifyRefreshToken,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, expires_in } = response.data;
    
    req.session.spotifyAccessToken = access_token;
    req.session.tokenExpiry = Date.now() + (expires_in * 1000);
    
    return true;
  } catch (error) {
    console.error('Refresh token error:', error);
    return false;
  }
}

// Logout from Spotify
router.post('/spotify/logout', (req, res) => {
  req.session.spotifyAccessToken = null;
  req.session.spotifyRefreshToken = null;
  req.session.spotifyUser = null;
  req.session.tokenExpiry = null;

  res.json({
    success: true,
    message: 'Logged out from Spotify'
  });
});

module.exports = router;
