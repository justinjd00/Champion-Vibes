import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSpotify, FaYoutube, FaMusic, FaPlay, FaCheck, FaTimes } from 'react-icons/fa';

const ProfileContainer = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileCard = styled(motion.div)`
  background: rgba(10, 20, 40, 0.8);
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(200, 155, 60, 0.1);
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  text-align: center;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: 40px;
  opacity: 0.9;
`;

const ConnectionSection = styled.div`
  margin-bottom: 30px;
`;

const ConnectionCard = styled(motion.div)`
  background: rgba(10, 20, 40, 0.6);
  border: 2px solid ${props => props.connected ? props.theme.colors.success : props.theme.colors.primary};
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ConnectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ConnectionIcon = styled.div`
  width: 50px;
  height: 50px;
  background: ${props => props.$connected ? 
    `linear-gradient(135deg, ${props.theme.colors.success}, ${props.theme.colors.secondary})` :
    `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})`
  };
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: ${props => props.theme.colors.dark};
`;

const ConnectionText = styled.div`
  h3 {
    color: ${props => props.theme.colors.primary};
    margin-bottom: 5px;
    font-size: 1.2rem;
  }
  
  p {
    color: ${props => props.theme.colors.text};
    opacity: 0.8;
    font-size: 0.9rem;
  }
`;

const ConnectionButton = styled(motion.button)`
  background: ${props => props.connected ? 
    `linear-gradient(135deg, ${props.theme.colors.warning}, #FF8C42)` :
    `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})`
  };
  color: ${props => props.theme.colors.dark};
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(200, 155, 60, 0.4);
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.$connected ? props.theme.colors.success : props.theme.colors.warning};
  font-weight: 600;
`;

const PlaylistSection = styled.div`
  margin-top: 40px;
`;

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const PlaylistCard = styled(motion.div)`
  background: rgba(10, 20, 40, 0.6);
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(200, 155, 60, 0.2);
  }
`;

const PlaylistTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 10px;
  font-size: 1.1rem;
`;

const PlaylistInfo = styled.p`
  color: ${props => props.theme.colors.text};
  opacity: 0.8;
  font-size: 0.9rem;
  margin-bottom: 15px;
`;

const PlaylistButton = styled(motion.button)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.dark};
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  margin: 0 auto;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const AlertMessage = styled(motion.div)`
  background: ${props => props.type === 'success' ? 
    'rgba(0, 212, 170, 0.1)' : 
    'rgba(255, 107, 107, 0.1)'
  };
  border: 2px solid ${props => props.type === 'success' ? 
    props.theme.colors.success : 
    props.theme.colors.warning
  };
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  margin-bottom: 30px;
  color: ${props => props.type === 'success' ? 
    props.theme.colors.success : 
    props.theme.colors.warning
  };
`;

function Profile() {
  const [searchParams] = useSearchParams();
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState(null);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Check for URL parameters
    const spotifyConnectedParam = searchParams.get('spotify_connected');
    const youtubeConnectedParam = searchParams.get('youtube_connected');
    const error = searchParams.get('error');

    if (spotifyConnectedParam === 'true') {
      setAlert({ type: 'success', message: 'Successfully connected to Spotify!' });
      setSpotifyConnected(true);
    } else if (youtubeConnectedParam === 'true') {
      setAlert({ type: 'success', message: 'Successfully connected to YouTube!' });
      setYoutubeConnected(true);
    } else if (error === 'spotify_auth_failed') {
      setAlert({ type: 'error', message: 'Failed to connect to Spotify. Please try again.' });
    } else if (error === 'youtube_auth_failed') {
      setAlert({ type: 'error', message: 'Failed to connect to YouTube. Please try again.' });
    }

    // Check current connection status
    checkConnectionStatus();
  }, [searchParams]);

  const checkConnectionStatus = async () => {
    try {
      // Check Spotify connection
      const spotifyResponse = await fetch('http://localhost:8001/api/auth/spotify/me', {
        credentials: 'include'
      });
      if (spotifyResponse.ok) {
        const data = await spotifyResponse.json();
        setSpotifyConnected(true);
        setSpotifyUser(data.user);
      }
    } catch (error) {
      console.log('Not connected to Spotify');
    }

    try {
      // Check YouTube connection
      const youtubeResponse = await fetch('http://localhost:8001/api/auth/youtube/me', {
        credentials: 'include'
      });
      if (youtubeResponse.ok) {
        const data = await youtubeResponse.json();
        setYoutubeConnected(true);
      }
    } catch (error) {
      console.log('Not connected to YouTube');
    }
  };

  const connectSpotify = () => {
    window.location.href = '/api/auth/spotify';
  };

  const disconnectSpotify = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/auth/spotify/logout', {
        method: 'POST'
      });

      if (response.ok) {
        setSpotifyConnected(false);
        setSpotifyUser(null);
        setAlert({ type: 'success', message: 'Disconnected from Spotify' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to disconnect from Spotify' });
    } finally {
      setLoading(false);
    }
  };

  const connectYouTube = () => {
    window.location.href = 'http://localhost:8001/api/auth/youtube/login';
  };

  const disconnectYouTube = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/auth/youtube/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setYoutubeConnected(false);
        setAlert({ type: 'success', message: 'Disconnected from YouTube' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to disconnect from YouTube' });
    } finally {
      setLoading(false);
    }
  };

  const createSpotifyPlaylist = async (playlistData) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/auth/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playlistData)
      });

      if (response.ok) {
        const result = await response.json();
        setAlert({ type: 'success', message: `Playlist "${result.playlist.name}" created in Spotify!` });
      } else {
        throw new Error('Failed to create playlist');
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to create Spotify playlist' });
    } finally {
      setLoading(false);
    }
  };

  // Mock playlists for demonstration
  const mockPlaylists = [
    {
      id: '1',
      title: 'Yasuo Mid Vibes',
      description: 'Samurai-themed playlist for Yasuo players',
      duration: '2h 45m',
      tracks: 45,
      created: '2 days ago'
    },
    {
      id: '2',
      title: 'Jinx ADC Chaos',
      description: 'Chaotic punk playlist for Jinx mains',
      duration: '3h 12m',
      tracks: 52,
      created: '1 week ago'
    },
    {
      id: '3',
      title: 'Thresh Support Dark',
      description: 'Dark ambient for Thresh support',
      duration: '2h 30m',
      tracks: 38,
      created: '3 days ago'
    }
  ];

  return (
    <ProfileContainer>
      <ProfileCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Your Profile</Title>
        <Subtitle>Connect your music services and manage your playlists</Subtitle>

        {alert && (
          <AlertMessage
            type={alert.type}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {alert.message}
          </AlertMessage>
        )}

        <ConnectionSection>
          <ConnectionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            $connected={spotifyConnected}
          >
            <ConnectionInfo>
              <ConnectionIcon $connected={spotifyConnected}>
                <FaSpotify />
              </ConnectionIcon>
              <ConnectionText>
                <h3>Spotify</h3>
                <p>
                  {spotifyConnected ? 
                    `Connected as ${spotifyUser?.display_name || 'User'}` : 
                    'Connect to create playlists in your Spotify account'
                  }
                </p>
              </ConnectionText>
            </ConnectionInfo>
            <ConnectionButton
              $connected={spotifyConnected}
              onClick={spotifyConnected ? disconnectSpotify : connectSpotify}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {spotifyConnected ? (
                <>
                  <FaTimes />
                  Disconnect
                </>
              ) : (
                <>
                  <FaSpotify />
                  Connect
                </>
              )}
            </ConnectionButton>
          </ConnectionCard>

          <ConnectionCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            $connected={youtubeConnected}
          >
            <ConnectionInfo>
              <ConnectionIcon $connected={youtubeConnected}>
                <FaYoutube />
              </ConnectionIcon>
              <ConnectionText>
                <h3>YouTube Music</h3>
                <p>
                  {youtubeConnected ? 
                    'Connected to YouTube Music' : 
                    'Connect to access YouTube Music playlists'
                  }
                </p>
              </ConnectionText>
            </ConnectionInfo>
            <ConnectionButton
              $connected={youtubeConnected}
              onClick={youtubeConnected ? disconnectYouTube : connectYouTube}
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {youtubeConnected ? (
                <>
                  <FaTimes />
                  Disconnect
                </>
              ) : (
                <>
                  <FaYoutube />
                  Connect
                </>
              )}
            </ConnectionButton>
          </ConnectionCard>
        </ConnectionSection>

        <PlaylistSection>
          <h2 style={{ color: '#C89B3C', marginBottom: '20px', textAlign: 'center' }}>
            Your Playlists
          </h2>
          
          <PlaylistGrid>
            {mockPlaylists.map((playlist, index) => (
              <PlaylistCard
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <PlaylistTitle>{playlist.title}</PlaylistTitle>
                <PlaylistInfo>{playlist.description}</PlaylistInfo>
                <PlaylistInfo>
                  {playlist.duration} • {playlist.tracks} tracks • {playlist.created}
                </PlaylistInfo>
                
                <PlaylistButton
                  onClick={() => createSpotifyPlaylist({
                    name: playlist.title,
                    description: playlist.description,
                    tracks: [] // Would contain actual track data
                  })}
                  disabled={!spotifyConnected}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlay />
                  {spotifyConnected ? 'Export to Spotify' : 'Connect Spotify First'}
                </PlaylistButton>
              </PlaylistCard>
            ))}
          </PlaylistGrid>
        </PlaylistSection>
      </ProfileCard>
    </ProfileContainer>
  );
}

export default Profile;
