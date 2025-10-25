import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { FaSearch, FaSpinner } from 'react-icons/fa';

const ChampionSelectContainer = styled.div`
  margin-bottom: 30px;
`;

const Label = styled.label`
  display: block;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 1.1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  padding: 20px;
`;

const ChampionPreview = styled(motion.div)`
  background: rgba(10, 20, 40, 0.6);
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 15px;
  padding: 20px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const ChampionImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.primary};
  box-shadow: 0 4px 15px rgba(200, 155, 60, 0.3);
`;

const ChampionInfo = styled.div`
  flex: 1;
  
  h3 {
    color: ${props => props.theme.colors.primary};
    margin: 0 0 5px 0;
    font-size: 1.2rem;
  }
  
  p {
    color: ${props => props.theme.colors.text};
    margin: 0 0 8px 0;
    opacity: 0.8;
  }
`;

const ChampionTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: rgba(200, 155, 60, 0.2);
  color: ${props => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgba(10, 20, 40, 0.8)',
    border: `2px solid ${state.isFocused ? '#C89B3C' : '#A09B8C'}`,
    borderRadius: '10px',
    boxShadow: 'none',
    minHeight: '50px',
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
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#F0E6D2',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }),
  input: (provided) => ({
    ...provided,
    color: '#F0E6D2'
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#A09B8C'
  })
};

const ChampionOption = ({ data, innerProps, innerRef }) => (
  <div {...innerProps} ref={innerRef} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <img 
      src={data.image} 
      alt={data.name}
      style={{ width: '30px', height: '30px', borderRadius: '50%' }}
    />
    <div>
      <div style={{ fontWeight: '600', color: '#C89B3C' }}>{data.name}</div>
      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{data.title}</div>
    </div>
  </div>
);

function ChampionSelect({ selectedChampion, onChampionChange, label = "Select Champion" }) {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChampions();
  }, []);

  const loadChampions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8001/api/champion');
      
      if (!response.ok) {
        throw new Error('Failed to load champions');
      }
      
      const data = await response.json();
      setChampions(data.champions || []);
    } catch (err) {
      console.error('Error loading champions:', err);
      setError('Failed to load champions');
    } finally {
      setLoading(false);
    }
  };

  const handleChampionChange = (selectedOption) => {
    onChampionChange(selectedOption);
  };

  if (loading) {
    return (
      <ChampionSelectContainer>
        <Label>{label}</Label>
        <LoadingContainer>
          <FaSpinner className="fa-spin" />
          Loading champions from Riot API...
        </LoadingContainer>
      </ChampionSelectContainer>
    );
  }

  if (error) {
    return (
      <ChampionSelectContainer>
        <Label>{label}</Label>
        <div style={{ color: '#FF6B6B', textAlign: 'center', padding: '20px' }}>
          {error}
        </div>
      </ChampionSelectContainer>
    );
  }

  return (
    <ChampionSelectContainer>
      <Label>{label}</Label>
      <Select
        value={selectedChampion}
        onChange={handleChampionChange}
        options={champions}
        styles={customSelectStyles}
        placeholder="Search for a champion..."
        isSearchable
        isClearable
        components={{
          Option: ChampionOption
        }}
        formatOptionLabel={(option) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={option.image} 
              alt={option.name}
              style={{ width: '30px', height: '30px', borderRadius: '50%' }}
            />
            <div>
              <div style={{ fontWeight: '600' }}>{option.name}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{option.title}</div>
            </div>
          </div>
        )}
      />
      
      {selectedChampion && (
        <ChampionPreview
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ChampionImage 
            src={selectedChampion.image} 
            alt={selectedChampion.name}
          />
          <ChampionInfo>
            <h3>{selectedChampion.name}</h3>
            <p>{selectedChampion.title}</p>
            <ChampionTags>
              {selectedChampion.tags?.map((tag, index) => (
                <Tag key={index}>{tag}</Tag>
              ))}
            </ChampionTags>
          </ChampionInfo>
        </ChampionPreview>
      )}
    </ChampionSelectContainer>
  );
}

export default ChampionSelect;
