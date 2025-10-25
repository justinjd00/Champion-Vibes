import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlay, FaMusic, FaGamepad, FaRocket, FaHeart } from 'react-icons/fa';

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const HeroSection = styled(motion.section)`
  max-width: 800px;
  margin-bottom: 80px;
`;

const HeroTitle = styled(motion.h1)`
  font-family: ${props => props.theme.fonts.primary};
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 20px;
  text-shadow: 0 0 30px rgba(200, 155, 60, 0.3);
  line-height: 1.1;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  color: ${props => props.theme.colors.text};
  margin-bottom: 40px;
  line-height: 1.6;
  opacity: 0.9;
`;

const CTAButton = styled(motion(Link))`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.dark};
  text-decoration: none;
  padding: 18px 36px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 8px 30px rgba(200, 155, 60, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 40px rgba(200, 155, 60, 0.5);
  }
`;

const FeaturesSection = styled(motion.section)`
  max-width: 1200px;
  width: 100%;
  margin-bottom: 80px;
`;

const FeaturesTitle = styled.h2`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 60px;
  text-align: center;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
`;

const FeatureCard = styled(motion.div)`
  background: rgba(10, 20, 40, 0.6);
  border: 2px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(200, 155, 60, 0.2);
    border-color: ${props => props.theme.colors.secondary};
  }
`;

const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
  color: ${props => props.theme.colors.dark};
  box-shadow: 0 8px 25px rgba(200, 155, 60, 0.3);
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 15px;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.text};
  line-height: 1.6;
  opacity: 0.9;
`;

const StatsSection = styled(motion.section)`
  max-width: 800px;
  width: 100%;
  text-align: center;
`;

const StatsTitle = styled.h2`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 2.5rem;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 40px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
`;

const StatCard = styled(motion.div)`
  background: rgba(10, 20, 40, 0.6);
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 15px;
  padding: 30px 20px;
  backdrop-filter: blur(10px);
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text};
  font-weight: 500;
`;

function Home() {
  const features = [
    {
      icon: FaGamepad,
      title: "Champion-Based",
      description: "Select your favorite League champion and role to get a perfectly curated playlist that matches your playstyle."
    },
    {
      icon: FaMusic,
      title: "AI-Powered",
      description: "Our advanced algorithm analyzes champion themes, abilities, and lore to create the perfect musical atmosphere."
    },
    {
      icon: FaRocket,
      title: "2-3 Hour Playlists",
      description: "Get extended playlists perfect for long gaming sessions, streaming, or just enjoying your favorite music."
    }
  ];

  const stats = [
    { number: "150+", label: "Champions Supported" },
    { number: "10K+", label: "Playlists Generated" },
    { number: "2-3hrs", label: "Average Duration" },
    { number: "99%", label: "User Satisfaction" }
  ];

  return (
    <HomeContainer>
      <HeroSection
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <HeroTitle
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Champion Vibes
        </HeroTitle>
        <HeroSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Discover your perfect gaming soundtrack based on your League of Legends champion and role.
          Get personalized 2-3 hour playlists that match your champion's vibe and your playstyle.
        </HeroSubtitle>
        <CTAButton
          to="/generate"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlay />
          Create Your Playlist
        </CTAButton>
      </HeroSection>

      <FeaturesSection
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <FeaturesTitle>Why Champion Vibes?</FeaturesTitle>
        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <FeatureIcon>
                <feature.icon />
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>

      <StatsSection
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
      >
        <StatsTitle>Join the Community</StatsTitle>
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 + index * 0.1 }}
            >
              <StatNumber>{stat.number}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>
        <CTAButton
          to="/generate"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaHeart />
          Start Your Journey
        </CTAButton>
      </StatsSection>
    </HomeContainer>
  );
}

export default Home;
