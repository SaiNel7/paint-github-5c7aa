import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="loading-orb"></div>
          <div className="loading-orb"></div>
          <div className="loading-orb"></div>
        </div>
        <h1 className="loading-title">DigArt</h1>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
        <p className="loading-text">entering the atmosphere...</p>
      </div>
      <div className="loading-particles">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen; 