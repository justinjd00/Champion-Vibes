import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaMusic, FaGamepad, FaUser, FaBars, FaTimes, FaYoutube } from 'react-icons/fa';

const HeaderContainer = styled(motion.header)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 20, 40, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid ${props => props.theme.colors.primary};
  box-shadow: 0 4px 20px rgba(200, 155, 60, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: ${props => props.theme.colors.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-weight: 700;
  font-size: 24px;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.theme.colors.secondary};
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(200, 155, 60, 0.3);
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(10, 20, 40, 0.98);
    backdrop-filter: blur(15px);
    flex-direction: column;
    padding: 20px;
    border-top: 1px solid ${props => props.theme.colors.primary};
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: ${props => props.theme.colors.text};
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(200, 155, 60, 0.1);
  }

  &.active {
    color: ${props => props.theme.colors.primary};
    background: rgba(200, 155, 60, 0.15);
  }

  &.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 2px;
    background: ${props => props.theme.colors.primary};
    border-radius: 1px;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(200, 155, 60, 0.1);
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: block;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: ${props => props.theme.colors.dark};
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(200, 155, 60, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(200, 155, 60, 0.4);
  }
`;

const YouTubeStatus = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$connected ? 
    'rgba(255, 0, 0, 0.15)' : 
    'rgba(200, 155, 60, 0.1)'
  };
  border: 2px solid ${props => props.$connected ? 
    'rgba(255, 0, 0, 0.4)' : 
    'rgba(200, 155, 60, 0.3)'
  };
  color: ${props => props.$connected ? '#FF0000' : props.theme.colors.text};

  &:hover {
    transform: translateY(-2px);
    background: ${props => props.$connected ? 
      'rgba(255, 0, 0, 0.25)' : 
      'rgba(200, 155, 60, 0.2)'
    };
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
`;

const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$connected ? '#00FF00' : '#FF6B6B'};
  box-shadow: 0 0 10px ${props => props.$connected ? '#00FF00' : '#FF6B6B'};
  animation: ${props => props.$connected ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeLoading, setYoutubeLoading] = useState(true);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // 🎵 Check YouTube connection status on mount and periodically
  useEffect(() => {
    const checkYouTubeStatus = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/auth/youtube/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setYoutubeConnected(!!data.user);
        } else {
          setYoutubeConnected(false);
        }
      } catch (error) {
        console.error('Error checking YouTube status:', error);
        setYoutubeConnected(false);
      } finally {
        setYoutubeLoading(false);
      }
    };

    checkYouTubeStatus();

    // Recheck every 30 seconds
    const interval = setInterval(checkYouTubeStatus, 30000);

    return () => clearInterval(interval);
  }, [location]); // Re-check when location changes

  const handleYouTubeClick = () => {
    if (youtubeConnected) {
      // Navigate to profile to manage connection
      window.location.href = '/profile';
    } else {
      // Connect to YouTube
      window.location.href = 'http://localhost:8001/api/auth/youtube/login';
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: FaGamepad },
    { path: '/generate', label: 'Generate', icon: FaMusic },
    { path: '/profile', label: 'Profile', icon: FaUser }
  ];

  return (
    <HeaderContainer
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <HeaderContent>
        <Logo to="/">
          <LogoIcon>
            <FaMusic />
          </LogoIcon>
          Champion Vibes
        </Logo>

        <Nav isOpen={isMenuOpen}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={location.pathname === path ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </Nav>

        <UserSection>
          {!youtubeLoading && (
            <YouTubeStatus
              $connected={youtubeConnected}
              onClick={handleYouTubeClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={youtubeConnected ? 'YouTube connected - Click to manage' : 'Click to connect YouTube'}
            >
              <StatusDot $connected={youtubeConnected} />
              <FaYoutube />
              <span style={{ display: window.innerWidth < 768 ? 'none' : 'inline' }}>
                {youtubeConnected ? 'Connected' : 'Connect'}
              </span>
            </YouTubeStatus>
          )}

          <UserButton>
            <FaUser />
            Login
          </UserButton>
          
          <MobileMenuButton onClick={toggleMenu}>
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </MobileMenuButton>
        </UserSection>
      </HeaderContent>
    </HeaderContainer>
  );
}

export default Header;
