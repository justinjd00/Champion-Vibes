import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';

// Components
import Header from './components/Header';
import Home from './pages/Home';
import PlaylistGenerator from './pages/PlaylistGenerator';
import PlaylistViewer from './pages/PlaylistViewer';
import Profile from './pages/Profile';
import YouTubeCallback from './pages/YouTubeCallback';

// Theme
const theme = {
  colors: {
    primary: '#C89B3C', // League Gold
    secondary: '#0AC8B9', // League Cyan
    accent: '#F0E6D2', // League Cream
    dark: '#0A1428', // League Dark Blue
    darker: '#010A13', // League Black
    success: '#00D4AA',
    warning: '#FF6B6B',
    text: '#F0E6D2',
    textSecondary: '#A09B8C'
  },
  fonts: {
    primary: "'Beaufort for LOL', 'Inter', sans-serif",
    secondary: "'Inter', sans-serif"
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${props => props.theme.fonts.secondary};
    background: linear-gradient(135deg, ${props => props.theme.colors.darker} 0%, ${props => props.theme.colors.dark} 100%);
    color: ${props => props.theme.colors.text};
    min-height: 100vh;
    overflow-x: hidden;
  }

  #root {
    min-height: 100vh;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.dark};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.secondary};
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled(motion.main)`
  flex: 1;
  padding-top: 80px; // Account for fixed header
`;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AppContainer>
          <Header />
          <MainContent
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/generate" element={<PlaylistGenerator />} />
              <Route path="/playlist/:id" element={<PlaylistViewer />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/youtube/callback" element={<YouTubeCallback />} />
            </Routes>
          </MainContent>
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
}

export default App;
