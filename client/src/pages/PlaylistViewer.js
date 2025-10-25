import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSpotify, FaYoutube, FaCheck, FaTimes } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import SongPreview from '../components/SongPreview';

const PlaylistContainer = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlaylistCard = styled(motion.div)`
  background: rgba(10, 20, 40, 0.8);
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
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

const TrackList = styled.div`
  margin-top: 30px;
`;

const TrackItem = styled(motion.div)`
  background: rgba(10, 20, 40, 0.6);
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(200, 155, 60, 0.2);
  }
`;

const TrackActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
`;

const SelectButton = styled(motion.button)`
  background: ${props => props.selected ? 
    'linear-gradient(135deg, #1DB954, #1ed760)' : 
    'rgba(200, 155, 60, 0.2)'
  };
  color: ${props => props.selected ? 'white' : props.theme.colors.primary};
  border: 1px solid ${props => props.selected ? '#1DB954' : props.theme.colors.primary};
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const PlatformBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${props => 
    props.platform === 'youtube' ? 'rgba(255, 0, 0, 0.2)' : 
    props.platform === 'spotify' ? 'rgba(30, 215, 96, 0.2)' : 
    'rgba(100, 100, 100, 0.2)'
  };
  color: ${props => 
    props.platform === 'youtube' ? '#FF0000' : 
    props.platform === 'spotify' ? '#1DB954' : 
    '#FFFFFF'
  };
  border: 1px solid ${props => 
    props.platform === 'youtube' ? 'rgba(255, 0, 0, 0.4)' : 
    props.platform === 'spotify' ? 'rgba(30, 215, 96, 0.4)' : 
    'rgba(100, 100, 100, 0.4)'
  };
  margin-left: 8px;
  text-transform: uppercase;
`;

const SelectedCount = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.dark};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
`;

const TrackInfo = styled.div`
  flex: 1;
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin: 0 0 5px 0;
    font-size: 1.1rem;
  }
  
  p {
    color: ${props => props.theme.colors.text};
    margin: 0;
    opacity: 0.8;
    font-size: 0.9rem;
  }
`;

const TrackDuration = styled.span`
  color: ${props => props.theme.colors.text};
  opacity: 0.7;
  font-size: 0.9rem;
`;

const ExportButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 30px;
  justify-content: center;
`;

const ExportButton = styled(motion.button)`
  background: ${props => props.platform === 'spotify' ? 
    'linear-gradient(135deg, #1DB954, #1ed760)' :
    'linear-gradient(135deg, #FF0000, #FF4444)'
  };
  color: white;
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
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
`;

function PlaylistViewer() {
  const { id: playlistId } = useParams();
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load playlist from localStorage or API
  React.useEffect(() => {
    const loadPlaylist = () => {
      try {
        // Try to get playlist from localStorage first
        const savedPlaylist = localStorage.getItem('currentPlaylist');
        if (savedPlaylist) {
          const parsedPlaylist = JSON.parse(savedPlaylist);
          setPlaylist(parsedPlaylist);
          setLoading(false);
          return;
        }

        // If no saved playlist, show message
        setPlaylist({
          id: 'no_playlist',
          title: 'No Playlist Generated',
          description: 'Please generate a playlist first',
          champion: '',
          role: '',
          duration: '0m',
          tracks: []
        });
        setLoading(false);
      } catch (error) {
        console.error('Error loading playlist:', error);
        setLoading(false);
      }
    };

    loadPlaylist();
  }, []);

  // Check for pending YouTube export after authentication
  React.useEffect(() => {
    const handlePendingExport = async () => {
      // Check URL for youtube_connected parameter
      const urlParams = new URLSearchParams(window.location.search);
      const youtubeConnected = urlParams.get('youtube_connected');
      
      if (youtubeConnected === 'true') {
        // Check if there's a pending export
        const pendingExport = localStorage.getItem('pendingYouTubeExport');
        
        if (pendingExport && playlist) {
          try {
            const exportData = JSON.parse(pendingExport);
            
            // Restore selected tracks
            const trackIds = new Set(exportData.selectedTracks);
            setSelectedTracks(trackIds);
            
            // Wait a moment for the UI to update
            setTimeout(async () => {
              alert('YouTube connection successful! Creating your playlist now...');
              
              // Get selected tracks from current playlist
              const selectedTracksList = playlist.tracks.filter(track => trackIds.has(track.id));
              
              if (selectedTracksList.length === 0) {
                alert('No tracks found to export.');
                localStorage.removeItem('pendingYouTubeExport');
                return;
              }

              // Create YouTube playlist with new API
              const response = await fetch('http://localhost:8001/api/export/youtube/create-full-playlist', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  playlistTitle: `${exportData.playlistTitle} - Exported`,
                  playlistDescription: `Exported from Champion Vibes: ${exportData.playlistDescription}`,
                  tracks: selectedTracksList.map(track => ({
                    title: track.title,
                    artist: track.artist
                  }))
                })
              });

              const result = await response.json();

              if (response.ok && result.success) {
                const videosAdded = result.playlist.videosAdded;
                const videosFound = result.playlist.videosFound;
                const playlistUrl = result.playlist.url;
                
                alert(`✅ YouTube playlist created successfully!\n\n` +
                      `📋 Playlist: ${result.playlist.title}\n` +
                      `🎵 Videos found: ${videosFound}\n` +
                      `✓ Videos added: ${videosAdded}\n\n` +
                      `🔗 YouTube Link: ${playlistUrl}\n\n` +
                      `Opening playlist now...`);
                
                // Open playlist
                window.open(playlistUrl, '_blank');
              } else {
                alert(`❌ YouTube export failed: ${result.error}`);
              }
              
              // Clean up
              localStorage.removeItem('pendingYouTubeExport');
              // Remove query parameter from URL
              window.history.replaceState({}, document.title, window.location.pathname);
              
            }, 1000);
            
          } catch (error) {
            console.error('Error processing pending export:', error);
            localStorage.removeItem('pendingYouTubeExport');
          }
        }
      }
    };

    if (playlist && playlist.tracks && playlist.tracks.length > 0) {
      handlePendingExport();
    }
  }, [playlist]);

  const handleTrackSelect = (trackId) => {
    console.log('Selecting track:', trackId);
    console.log('Current selected tracks:', Array.from(selectedTracks));
    
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
      console.log('Removed track:', trackId);
    } else {
      newSelected.add(trackId);
      console.log('Added track:', trackId);
    }
    console.log('New selected tracks:', Array.from(newSelected));
    setSelectedTracks(newSelected);
  };

  const handleExportToSpotify = async () => {
    console.log('Export to Spotify - Selected tracks:', Array.from(selectedTracks));
    console.log('All tracks:', playlist.tracks.map(t => t.id));
    
    const selectedTracksList = playlist.tracks.filter(track => selectedTracks.has(track.id));
    console.log('Filtered tracks:', selectedTracksList);
    
    if (selectedTracksList.length === 0) {
      alert('Please select at least one track!');
      return;
    }

    try {
      // Check if user is authenticated with Spotify
      const authResponse = await fetch('http://localhost:8001/api/auth/spotify/me');
      if (!authResponse.ok) {
        // Redirect to Spotify OAuth
        window.location.href = 'http://localhost:8001/api/auth/spotify/login';
        return;
      }

      // Create Spotify playlist
      const response = await fetch('http://localhost:8001/api/auth/spotify/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: `${playlist.title} - Exported`,
          description: `Exported from Champion Vibes: ${playlist.description}`,
          tracks: selectedTracksList.map(track => ({
            title: track.title,
            artist: track.artist,
            url: track.url
          }))
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${selectedTracksList.length} tracks successfully exported to Spotify!\n\nPlaylist: ${result.playlistName}\nSpotify Link: ${result.playlistUrl}`);
      } else {
        const error = await response.json();
        alert(`❌ Spotify export failed: ${error.message}`);
      }
      
    } catch (error) {
      console.error('Spotify export error:', error);
      alert('❌ Error exporting to Spotify. Please try again.');
    }
  };

  const handleExportToYouTube = async () => {
    console.log('Export to YouTube - Selected tracks:', Array.from(selectedTracks));
    
    const selectedTracksList = playlist.tracks.filter(track => selectedTracks.has(track.id));
    console.log('Filtered tracks:', selectedTracksList);
    
    if (selectedTracksList.length === 0) {
      alert('Please select at least one track!');
      return;
    }

    // Filter YouTube-compatible songs only (no Spotify songs)
    const youtubeCompatibleTracks = selectedTracksList.filter(track => 
      track.platform !== 'spotify'
    );

    if (youtubeCompatibleTracks.length === 0) {
      alert('⚠️ No YouTube-compatible songs selected!\n\nAll selected songs are from Spotify and cannot be exported to YouTube.\n\nPlease select songs from YouTube.');
      return;
    }

    if (youtubeCompatibleTracks.length < selectedTracksList.length) {
      const spotifyCount = selectedTracksList.length - youtubeCompatibleTracks.length;
      const confirmExport = window.confirm(
        `⚠️ ${spotifyCount} Spotify song(s) will be skipped\n\n` +
        `Only ${youtubeCompatibleTracks.length} YouTube-compatible song(s) will be exported.\n\n` +
        `Do you want to continue?`
      );
      
      if (!confirmExport) {
        return;
      }
    }

    try {
      console.log(`Starting YouTube export with ${youtubeCompatibleTracks.length} song(s)...`);
      
      // Use new export API with YouTube-compatible songs only
      const response = await fetch('http://localhost:8001/api/export/youtube/create-full-playlist', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playlistTitle: `${playlist.title} - Exported`,
          playlistDescription: `Exported from Champion Vibes: ${playlist.description}`,
          tracks: youtubeCompatibleTracks.map(track => ({
            title: track.title,
            artist: track.artist
          }))
        })
      });

      const result = await response.json();

      if (response.status === 401) {
        // User is not authenticated - save state and redirect
        console.log('Not authenticated - redirecting to login...');
        localStorage.setItem('pendingYouTubeExport', JSON.stringify({
          playlistTitle: playlist.title,
          playlistDescription: playlist.description,
          selectedTracks: Array.from(selectedTracks),
          playlistId: playlistId,
          timestamp: Date.now()
        }));
        
        alert('You need to connect with YouTube first. You will be redirected...');
        setTimeout(() => {
          window.location.href = 'http://localhost:8001/api/auth/youtube/login';
        }, 1000);
        return;
      }

      if (response.ok && result.success) {
        const videosAdded = result.playlist.videosAdded;
        const videosFound = result.playlist.videosFound;
        const playlistUrl = result.playlist.url;
        
        alert(`✅ YouTube playlist created successfully!\n\n` +
              `📋 Playlist: ${result.playlist.title}\n` +
              `🎵 Videos found: ${videosFound}\n` +
              `✓ Videos added: ${videosAdded}\n\n` +
              `🔗 YouTube Link: ${playlistUrl}\n\n` +
              `Opening playlist now...`);
        
        // Clear any pending export
        localStorage.removeItem('pendingYouTubeExport');
        
        // Open playlist in new tab
        window.open(playlistUrl, '_blank');
      } else {
        alert(`❌ YouTube export failed: ${result.error || 'Unknown error'}\n\n${result.details || ''}`);
      }
      
    } catch (error) {
      console.error('YouTube export error:', error);
      alert('❌ Error exporting to YouTube. Please try again.');
    }
  };

  if (loading) {
    return (
      <PlaylistContainer>
        <PlaylistCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>Loading Playlist...</Title>
        </PlaylistCard>
      </PlaylistContainer>
    );
  }

  if (!playlist || playlist.tracks.length === 0) {
    return (
      <PlaylistContainer>
        <PlaylistCard
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>No Playlist Found</Title>
          <Subtitle>Please generate a playlist first</Subtitle>
        </PlaylistCard>
      </PlaylistContainer>
    );
  }

  // Format duration from milliseconds to hours and minutes
  const formatDuration = (durationMs) => {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <PlaylistContainer>
      <PlaylistCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>{playlist.title}</Title>
        <Subtitle>{playlist.description}</Subtitle>
        <Subtitle>Duration: {formatDuration(playlist.duration)} | {playlist.trackCount} Tracks</Subtitle>
        
        {selectedTracks.size > 0 && (
          <SelectedCount>
            {selectedTracks.size} Track{selectedTracks.size !== 1 ? 's' : ''} Selected
          </SelectedCount>
        )}

        <TrackList>
          {playlist.tracks.map((track, index) => (
            <TrackItem
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <TrackInfo>
                <h3>
                  {track.title}
                  <PlatformBadge platform={track.platform}>
                    {track.platform === 'youtube' ? (
                      <>
                        <FaYoutube /> YT
                      </>
                    ) : track.platform === 'spotify' ? (
                      <>
                        <FaSpotify /> Spotify
                      </>
                    ) : (
                      track.platform
                    )}
                  </PlatformBadge>
                </h3>
                <p>{track.artist}</p>
              </TrackInfo>
              
              <TrackDuration>{Math.floor(track.duration / 60000)}:{(Math.floor(track.duration / 1000) % 60).toString().padStart(2, '0')}</TrackDuration>

              <TrackActions>
                <SongPreview track={track} />
                
                <SelectButton
                  selected={selectedTracks.has(track.id)}
                  onClick={() => handleTrackSelect(track.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {selectedTracks.has(track.id) ? (
                    <>
                      <FaCheck />
                      Selected
                    </>
                  ) : (
                    <>
                      <FaTimes />
                      Select
                    </>
                  )}
                </SelectButton>
              </TrackActions>
            </TrackItem>
          ))}
        </TrackList>

        <Subtitle style={{ marginTop: '20px', fontSize: '0.85rem', opacity: 0.8 }}>
          💡 <strong>Tip:</strong> When exporting to YouTube, only YouTube songs (with <FaYoutube style={{ display: 'inline', marginLeft: '3px', marginRight: '3px' }} /> YT badge) are used. Spotify songs are automatically skipped.
        </Subtitle>

        <ExportButtons>
          <ExportButton
            platform="spotify"
            onClick={handleExportToSpotify}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSpotify />
            Export to Spotify
          </ExportButton>
          
          <ExportButton
            platform="youtube"
            onClick={handleExportToYouTube}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaYoutube />
            Export to YouTube
          </ExportButton>
        </ExportButtons>
      </PlaylistCard>
    </PlaylistContainer>
  );
}

export default PlaylistViewer;
