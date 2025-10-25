import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const CallbackCard = styled(motion.div)`
  background: rgba(10, 20, 40, 0.8);
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  padding: 60px 40px;
  max-width: 500px;
  width: 100%;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 40px rgba(200, 155, 60, 0.1);
  text-align: center;
`;

const IconWrapper = styled(motion.div)`
  font-size: 64px;
  margin-bottom: 20px;
  color: ${props => props.$success ? props.theme.colors.success : props.$error ? props.theme.colors.warning : props.theme.colors.primary};
`;

const Title = styled.h1`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 2rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 15px;
`;

const Message = styled.p`
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
`;

function YouTubeCallback() {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('YouTube-Verbindung wird verarbeitet...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Parse URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      console.log('YouTube callback received:', { code: code ? 'present' : 'missing', state, error });

      if (error) {
        setStatus('error');
        setMessage(`Fehler bei der YouTube-Authentifizierung: ${error}`);
        setTimeout(() => navigate('/profile'), 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Kein Autorisierungscode erhalten. Bitte versuche es erneut.');
        setTimeout(() => navigate('/profile'), 3000);
        return;
      }

      try {
        // Send code to backend
        console.log('Sending code to backend...');
        const response = await fetch('http://localhost:8001/api/auth/youtube/process-callback', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            state: state
          })
        });

        const result = await response.json();
        console.log('Backend response:', result);

        if (response.ok && result.success) {
          setStatus('success');
          setMessage('✅ YouTube erfolgreich verbunden!');
          
          // Check if there's a pending export
          const pendingExport = localStorage.getItem('pendingYouTubeExport');
          
          if (pendingExport) {
            setMessage('✅ YouTube verbunden! Erstelle jetzt deine Playlist...');
            
            // Wait a moment, then redirect to playlist page
            setTimeout(() => {
              const exportData = JSON.parse(pendingExport);
              // Navigate to the playlist page with youtube_connected parameter
              navigate(`/playlist/${exportData.playlistId || 'current'}?youtube_connected=true`);
            }, 2000);
          } else {
            // No pending export, just go to profile
            setTimeout(() => {
              navigate('/profile?youtube_connected=true');
            }, 2000);
          }
          
        } else {
          throw new Error(result.error || 'Unbekannter Fehler');
        }

      } catch (error) {
        console.error('Error processing callback:', error);
        setStatus('error');
        setMessage(`Fehler beim Verarbeiten der Authentifizierung: ${error.message}`);
        setTimeout(() => navigate('/profile?error=youtube_auth_failed'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <CallbackContainer>
      <CallbackCard
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <IconWrapper
          $success={status === 'success'}
          $error={status === 'error'}
          animate={status === 'processing' ? { rotate: 360 } : {}}
          transition={status === 'processing' ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          {status === 'processing' && <FaSpinner />}
          {status === 'success' && <FaCheck />}
          {status === 'error' && <FaTimes />}
        </IconWrapper>

        <Title>
          {status === 'processing' && 'Verarbeite...'}
          {status === 'success' && 'Erfolgreich!'}
          {status === 'error' && 'Fehler'}
        </Title>

        <Message>{message}</Message>
      </CallbackCard>
    </CallbackContainer>
  );
}

export default YouTubeCallback;

