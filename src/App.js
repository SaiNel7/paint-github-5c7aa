import React, { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';
import MobileFallback from './components/MobileFallback';
import ClickToStart from './components/ClickToStart';
import AudioVisualizer from './components/AudioVisualizer';
import './styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|blackberry|iemobile|ipad|iphone|ipod|opera|tablet/i.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(loadingTimer);
    };
  }, []);

  const handleStart = () => {
    setHasStarted(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isMobile) {
    return <MobileFallback />;
  }

  if (!hasStarted) {
    return <ClickToStart onStart={handleStart} />;
  }

  return <AudioVisualizer />;
}

export default App; 