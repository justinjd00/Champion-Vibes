import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const PreviewContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PreviewButton = styled(motion.button)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.dark};
  border: none;
  padding: 8px 12px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 40px;
  height: 40px;

  &:hover {
    transform: scale(1.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(200, 155, 60, 0.2);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: 2px;
`;

const TimeDisplay = styled.span`
  color: ${props => props.theme.colors.text};
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
`;

const VolumeButton = styled(motion.button)`
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.theme.colors.secondary};
  }
`;

const AudioElement = styled.audio`
  display: none;
`;

function SongPreview({ track, onPreviewEnd }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15); // 15 seconds preview
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        setIsPlaying(false);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else {
        setIsLoading(true);
        
        // Create a simple audio context for preview
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Generate a simple tone based on track genre
          const frequency = track.genre === 'electronic' ? 440 : 
                          track.genre === 'j-pop' ? 523 : 
                          track.genre === 'metal' ? 330 : 440;
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 15);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 15);
          
          setIsLoading(false);
          setIsPlaying(true);
          
          // Start progress tracking
          progressIntervalRef.current = setInterval(() => {
            setCurrentTime(prev => {
              const newTime = prev + 0.1;
              if (newTime >= duration) {
                handleStop();
                return duration;
              }
              return newTime;
            });
          }, 100);
          
        } catch (audioError) {
          console.log('Audio context not available, using simulation');
          // Fallback to simulation if audio context is not available
          setTimeout(() => {
            setIsLoading(false);
            setIsPlaying(true);
            
            progressIntervalRef.current = setInterval(() => {
              setCurrentTime(prev => {
                const newTime = prev + 0.1;
                if (newTime >= duration) {
                  handleStop();
                  return duration;
                }
                return newTime;
              });
            }, 100);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Preview error:', error);
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (onPreviewEnd) {
      onPreviewEnd();
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e) => {
    if (!isPlaying) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <PreviewContainer>
      <PreviewButton
        onClick={handlePlayPause}
        disabled={isLoading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⏳
          </motion.div>
        ) : isPlaying ? (
          <FaPause />
        ) : (
          <FaPlay />
        )}
      </PreviewButton>

      <ProgressBar onClick={handleProgressClick}>
        <ProgressFill
          style={{ width: `${progressPercentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.1 }}
        />
      </ProgressBar>

      <TimeDisplay>
        {formatTime(currentTime)} / {formatTime(duration)}
      </TimeDisplay>

      <VolumeButton
        onClick={handleVolumeToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </VolumeButton>

    </PreviewContainer>
  );
}

export default SongPreview;
