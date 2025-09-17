import React, { useState } from 'react';
import '../styles/PlaybackControls.css';

const PlaybackControls = ({ 
  currentTrack, 
  isPlaying, 
  isLoading,
  onPlay, 
  onPause, 
  onNext, 
  onPrev,
  onMouseEnter,
  onMouseLeave
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
    <div 
      className={`playback-controls ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="controls-background"></div>
      
      <div className="track-info">
        <div className="track-title">{currentTrack?.title || 'Loading...'}</div>
        <div className="track-artist">{currentTrack?.artist || ''}</div>
      </div>

      <div className="control-buttons">
        <button 
          className="control-btn prev-btn"
          onClick={onPrev}
          disabled={isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        <button 
          className="control-btn play-pause-btn"
          onClick={handlePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        <button 
          className="control-btn next-btn"
          onClick={onNext}
          disabled={isLoading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>

      <div className="controls-glow"></div>
    </div>
  );
};

export default PlaybackControls; 