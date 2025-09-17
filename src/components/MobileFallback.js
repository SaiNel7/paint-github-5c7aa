import React from 'react';
import '../styles/MobileFallback.css';

const MobileFallback = () => {
  const handleGoHome = () => {
    // You can customize this to navigate to your main site
    window.location.href = '/';
  };

  return (
    <div className="mobile-fallback">
      <div className="mobile-content">
        <div className="mobile-icon">
          <div className="mobile-orb"></div>
        </div>
        <h1 className="mobile-title">DigArt</h1>
        <p className="mobile-message">
          This immersive audio visualizer experience is not available on mobile devices.
        </p>
        <p className="mobile-submessage">
          Please visit on a desktop or laptop for the full experience.
        </p>
        <button 
          className="mobile-link"
          onClick={handleGoHome}
        >
          go back home
        </button>
      </div>
      <div className="mobile-gradient"></div>
    </div>
  );
};

export default MobileFallback; 