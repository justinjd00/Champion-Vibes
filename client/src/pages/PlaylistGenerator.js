import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaSpinner, FaCheck, FaRandom } from 'react-icons/fa';
import Select from 'react-select';
import ChampionSelect from '../components/ChampionSelect';

const GeneratorContainer = styled.div`
  min-height: 100vh;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GeneratorCard = styled(motion.div)`
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

const FormSection = styled.div`
  margin-bottom: 30px;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 1.1rem;
`;

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgba(10, 20, 40, 0.8)',
    border: `2px solid ${state.isFocused ? '#C89B3C' : '#A09B8C'}`,
    borderRadius: '10px',
    boxShadow: 'none',
    '&:hover': {
      border: '2px solid #C89B3C'
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#C89B3C' 
      : state.isFocused 
        ? 'rgba(200, 155, 60, 0.2)' 
        : 'rgba(10, 20, 40, 0.9)',
    color: state.isSelected ? '#0A1428' : '#F0E6D2',
    padding: '12px 16px'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#F0E6D2'
  }),
  input: (provided) => ({
    ...provided,
    color: '#F0E6D2'
  })
};

const GenerateButton = styled(motion.button)`
  width: 100%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.dark};
  border: none;
  padding: 18px 36px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 8px 30px rgba(200, 155, 60, 0.4);
  transition: all 0.3s ease;
  margin-top: 30px;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(200, 155, 60, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
`;

const SuccessMessage = styled(motion.div)`
  background: rgba(0, 212, 170, 0.1);
  border: 2px solid ${props => props.theme.colors.success};
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(255, 107, 107, 0.1);
  border: 2px solid ${props => props.theme.colors.warning};
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  margin-top: 20px;
  color: ${props => props.theme.colors.warning};
`;

const RandomButton = styled(motion.button)`
  background: rgba(200, 155, 60, 0.1);
  border: 2px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(200, 155, 60, 0.2);
    transform: translateY(-2px);
  }
`;

// Champion und Role Daten
const champions = [
  { value: 'yasuo', label: 'Yasuo - The Unforgiven', role: 'mid' },
  { value: 'jinx', label: 'Jinx - The Loose Cannon', role: 'adc' },
  { value: 'thresh', label: 'Thresh - The Chain Warden', role: 'support' },
  { value: 'darius', label: 'Darius - The Hand of Noxus', role: 'top' },
  { value: 'lee-sin', label: 'Lee Sin - The Blind Monk', role: 'jungle' },
  { value: 'ahri', label: 'Ahri - The Nine-Tailed Fox', role: 'mid' },
  { value: 'lux', label: 'Lux - The Lady of Luminosity', role: 'mid' },
  { value: 'zed', label: 'Zed - The Master of Shadows', role: 'mid' },
  { value: 'vayne', label: 'Vayne - The Night Hunter', role: 'adc' },
  { value: 'leona', label: 'Leona - The Radiant Dawn', role: 'support' },
  { value: 'garen', label: 'Garen - The Might of Demacia', role: 'top' },
  { value: 'kha-zix', label: 'Kha\'Zix - The Voidreaver', role: 'jungle' }
];

const roles = [
  { value: 'top', label: 'Top Lane - The Island' },
  { value: 'jungle', label: 'Jungle - The Wild Card' },
  { value: 'mid', label: 'Mid Lane - The Carry' },
  { value: 'adc', label: 'ADC - The Marksman' },
  { value: 'support', label: 'Support - The Guardian' }
];

// 🎵 Music Tags für bessere Filterung
const musicTags = [
  { value: 'NCS', label: '🎵 NCS (NoCopyrightSounds)', category: 'channel' },
  { value: 'Monstercat', label: '🎶 Monstercat', category: 'channel' },
  { value: 'Epic Music', label: '⚔️ Epic/Cinematic', category: 'genre' },
  { value: 'Electronic', label: '🎹 Electronic/EDM', category: 'genre' },
  { value: 'Rock', label: '🎸 Rock/Metal', category: 'genre' },
  { value: 'Chill', label: '😌 Chill/Relaxing', category: 'mood' },
  { value: 'Intense', label: '🔥 Intense/Aggressive', category: 'mood' },
  { value: 'Focus', label: '🎯 Focus/Concentration', category: 'mood' },
  { value: 'Upbeat', label: '⚡ Upbeat/Energetic', category: 'mood' },
  { value: 'Trap Nation', label: '🎵 Trap Nation', category: 'channel' },
  { value: 'Anime', label: '🎌 Anime/J-Pop', category: 'genre' },
  { value: 'Orchestral', label: '🎻 Orchestral', category: 'genre' }
];

const TagButton = styled(motion.button)`
  background: ${props => props.$selected ? 
    'linear-gradient(135deg, #C89B3C, #8B7340)' : 
    'rgba(200, 155, 60, 0.1)'
  };
  border: 2px solid ${props => props.$selected ? '#C89B3C' : 'rgba(200, 155, 60, 0.3)'};
  color: ${props => props.$selected ? '#0A1428' : '#C89B3C'};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #C89B3C;
    background: ${props => props.$selected ? 
      'linear-gradient(135deg, #8B7340, #C89B3C)' : 
      'rgba(200, 155, 60, 0.2)'
    };
  }
`;

const TagGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
`;

function PlaylistGenerator() {
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [playlistId, setPlaylistId] = useState(null);

  const toggleTag = (tagValue) => {
    setSelectedTags(prev => 
      prev.includes(tagValue)
        ? prev.filter(t => t !== tagValue)
        : [...prev, tagValue]
    );
  };

  const handleGenerate = async () => {
    if (!selectedChampion || !selectedRole) {
      setError('Bitte wähle einen Champion und eine Rolle aus!');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsSuccess(false);

    try {
      const response = await fetch('http://localhost:8001/api/playlist/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          champion: selectedChampion.value,
          role: selectedRole.value,
          playstyle: 'balanced',
          musicTags: selectedTags // 🎵 Sende ausgewählte Music Tags
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate playlist');
      }

      const data = await response.json();
      setPlaylistId(data.playlist.id);
      setIsSuccess(true);
      
      // Save playlist to localStorage for PlaylistViewer
      localStorage.setItem('currentPlaylist', JSON.stringify(data.playlist));
    } catch (err) {
      console.error('Playlist generation error:', err);
      setError('Fehler beim Generieren der Playlist. Bitte versuche es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRandom = () => {
    const randomChampion = champions[Math.floor(Math.random() * champions.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    setSelectedChampion(randomChampion);
    setSelectedRole(randomRole);
    setError(null);
  };

  const handleSuccessClick = () => {
    if (playlistId) {
      window.location.href = `/playlist/${playlistId}`;
    }
  };

  return (
    <GeneratorContainer>
      <GeneratorCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Create Your Playlist</Title>
        <Subtitle>
          Choose your champion and role to get a personalized 2-3 hour music playlist
        </Subtitle>

        <RandomButton
          onClick={handleRandom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRandom />
          Random Selection
        </RandomButton>

        <ChampionSelect
          selectedChampion={selectedChampion}
          onChampionChange={setSelectedChampion}
          label="Select Champion"
        />

        <FormSection>
          <Label>Select Role</Label>
          <Select
            value={selectedRole}
            onChange={setSelectedRole}
            options={roles}
            styles={customSelectStyles}
            placeholder="Choose your role..."
          />
        </FormSection>

        <FormSection>
          <Label>🎵 Music Tags (Optional - für bessere Filterung)</Label>
          <Subtitle style={{ fontSize: '0.9rem', marginBottom: '10px', marginTop: '5px' }}>
            Wähle Tags aus, um die Musik-Suche zu verbessern
          </Subtitle>
          <TagGrid>
            {musicTags.map(tag => (
              <TagButton
                key={tag.value}
                $selected={selectedTags.includes(tag.value)}
                onClick={() => toggleTag(tag.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag.label}
              </TagButton>
            ))}
          </TagGrid>
          {selectedTags.length > 0 && (
            <Subtitle style={{ fontSize: '0.85rem', marginTop: '10px', color: '#C89B3C' }}>
              ✅ {selectedTags.length} Tag(s) ausgewählt
            </Subtitle>
          )}
        </FormSection>

        <GenerateButton
          onClick={handleGenerate}
          disabled={isGenerating || !selectedChampion || !selectedRole}
          whileHover={{ scale: isGenerating ? 1 : 1.05 }}
          whileTap={{ scale: isGenerating ? 1 : 0.95 }}
        >
          {isGenerating ? (
            <LoadingSpinner
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <FaSpinner />
              Generating Playlist...
            </LoadingSpinner>
          ) : (
            <>
              <FaPlay />
              Generate Playlist
            </>
          )}
        </GenerateButton>

        <AnimatePresence>
          {isSuccess && (
            <SuccessMessage
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={handleSuccessClick}
              style={{ cursor: 'pointer' }}
            >
              <FaCheck style={{ fontSize: '24px', marginBottom: '10px' }} />
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                Playlist Generated Successfully!
              </div>
              <div style={{ opacity: 0.8 }}>
                Click here to view your personalized playlist
              </div>
            </SuccessMessage>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {error}
            </ErrorMessage>
          )}
        </AnimatePresence>
      </GeneratorCard>
    </GeneratorContainer>
  );
}

export default PlaylistGenerator;
