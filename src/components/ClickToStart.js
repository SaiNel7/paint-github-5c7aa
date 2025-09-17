import React from 'react';
import '../styles/ClickToStart.css';

const ClickToStart = ({ onStart }) => {
  const handleClick = () => {
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
    
    // Start the visualizer
    onStart();
  };

  return (
    <div className="click-to-start">
      <div className="start-content">
        <div className="start-orbs">
          <div className="start-orb"></div>
          <div className="start-orb"></div>
          <div className="start-orb"></div>
          <div className="start-orb"></div>
        </div>
        <h1 className="start-title">DigArt</h1>
        <p className="start-subtitle">Audio Visualizer</p>
        <button 
          className="start-button"
          onClick={handleClick}
        >
          Enter the Experience
        </button>
        <p className="start-hint">Click to begin your sonic journey</p>
      </div>
      <div className="start-background">
        <div className="bg-gradient"></div>
        <div className="floating-particles">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="bg-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClickToStart; 