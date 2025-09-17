import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useAudioManager } from './AudioManager';
import { useMouseTracker } from './MouseTracker';
import PlaybackControls from './PlaybackControls';
import '../styles/AudioVisualizer.css';

const AudioVisualizer = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const timeRef = useRef(0);
  
  const [controlsVisible, setControlsVisible] = useState(true);
  const [mouseIdleTimer, setMouseIdleTimer] = useState(null);

  const {
    currentTrack,
    isPlaying,
    isLoading,
    audioData,
    play,
    pause,
    nextTrack,
    prevTrack,
    pauseAutoAdvance,
    resumeAutoAdvance
  } = useAudioManager();

  const {
    mousePosition,
    normalizedPosition,
    velocity,
    isMoving,
    trail,
    getRippleEffect,
    getForceField,
    getColorInfluence
  } = useMouseTracker();

  // Initialize canvas
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    contextRef.current = context;
    
    // Initialize particles
    particlesRef.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      life: Math.random() * 100 + 100,
      maxLife: 200,
      hue: Math.random() * 360,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, []);

  // Color palette based on chill beats aesthetic
  const getColorPalette = useCallback((time, audioData, mouseInfluence) => {
    const { bass, mids, treble } = audioData;
    const { hue, intensity } = mouseInfluence;
    
    // Base colors: warm purples, deep blues, soft oranges, neon pinks
    const baseHue = (time * 0.02 + hue * 0.3) % 360;
    const bassInfluence = bass * 60;
    const midsInfluence = mids * 40;
    const trebleInfluence = treble * 80;
    
    return {
      primary: `hsl(${(baseHue + bassInfluence) % 360}, ${70 + mids * 30}%, ${40 + treble * 20}%)`,
      secondary: `hsl(${(baseHue + 120 + midsInfluence) % 360}, ${60 + bass * 40}%, ${35 + mids * 25}%)`,
      accent: `hsl(${(baseHue + 240 + trebleInfluence) % 360}, ${80 + treble * 20}%, ${50 + bass * 30}%)`,
      background: `hsl(${baseHue}, ${20 + bass * 30}%, ${5 + mids * 10}%)`
    };
  }, []);

  // Draw organic flowing shapes
  const drawFlowingShapes = useCallback((context, colors, time, audioData) => {
    const { bass, mids, treble } = audioData;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Main flowing shape
    context.save();
    context.globalCompositeOperation = 'screen';
    
    const gradient = context.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, Math.max(window.innerWidth, window.innerHeight) * 0.6
    );
    
    // Convert HSL to HSLA with proper alpha values
    const getColorWithAlpha = (hslColor, alpha) => {
      const hslMatch = hslColor.match(/hsl\(([^)]+)\)/);
      if (hslMatch) {
        return `hsla(${hslMatch[1]}, ${alpha})`;
      }
      return `rgba(255, 255, 255, ${alpha})`;
    };
    
    gradient.addColorStop(0, getColorWithAlpha(colors.primary, '0.5'));
    gradient.addColorStop(0.5, getColorWithAlpha(colors.secondary, '0.25'));
    gradient.addColorStop(1, 'transparent');
    
    context.fillStyle = gradient;
    context.beginPath();
    
    const vertices = 12;
    const baseRadius = 200 + bass * 300;
    
    for (let i = 0; i <= vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2;
      const radius = baseRadius + 
        Math.sin(time * 0.003 + angle * 3) * (50 + mids * 100) +
        Math.cos(time * 0.005 + angle * 2) * (30 + treble * 80);
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    
    context.closePath();
    context.fill();
    context.restore();
  }, []);

  // Draw particle system
  const drawParticles = useCallback((context, colors, time, audioData, mouseInfluence) => {
    const { bass, mids, treble, volume } = audioData;
    const particles = particlesRef.current;
    
    particles.forEach((particle, index) => {
      // Update particle physics
      const force = getForceField(particle.x, particle.y, 0.5);
      const attraction = mouseInfluence.isActive ? 1 : 0.3;
      
      particle.vx += force.fx * 0.01 * attraction;
      particle.vy += force.fy * 0.01 * attraction;
      
      // Audio influence on movement
      particle.vx += (Math.sin(time * 0.001 + index) * bass * 2);
      particle.vy += (Math.cos(time * 0.0015 + index) * mids * 2);
      
      // Apply velocity with damping
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.995;
      particle.vy *= 0.995;
      
      // Boundary wrapping
      if (particle.x < 0) particle.x = window.innerWidth;
      if (particle.x > window.innerWidth) particle.x = 0;
      if (particle.y < 0) particle.y = window.innerHeight;
      if (particle.y > window.innerHeight) particle.y = 0;
      
      // Update particle properties
      particle.hue = (particle.hue + treble * 2) % 360;
      particle.size = Math.max(0.5, particle.size + (volume - 0.5) * 0.1);
      particle.life -= 1;
      
      // Respawn particle if needed
      if (particle.life <= 0) {
        particle.x = Math.random() * window.innerWidth;
        particle.y = Math.random() * window.innerHeight;
        particle.life = particle.maxLife;
        particle.hue = Math.random() * 360;
      }
      
      // Draw particle
      const alpha = (particle.life / particle.maxLife) * particle.opacity * (0.3 + volume * 0.7);
      context.save();
      context.globalCompositeOperation = 'screen';
      context.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${alpha})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
  }, [getForceField]);

  // Draw mouse trail and ripples
  const drawMouseEffects = useCallback((context, colors, mouseInfluence) => {
    // Draw mouse trail
    trail.forEach((point, index) => {
      const alpha = point.opacity * 0.3;
      const size = (1 - index / trail.length) * 8;
      
      context.save();
      context.globalCompositeOperation = 'screen';
      // Convert HSL to HSLA with proper alpha
      const hslMatch = colors.accent.match(/hsl\(([^)]+)\)/);
      const accentColor = hslMatch ? `hsla(${hslMatch[1]}, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
      context.fillStyle = accentColor;
      context.beginPath();
      context.arc(point.x, point.y, size, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
    
    // Draw ripple effect
    if (mouseInfluence.isActive) {
      const rippleRadius = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * 50 + 20;
      
      context.save();
      context.globalCompositeOperation = 'screen';
      // Convert HSL to HSLA for ripple effect
      const hslMatch = colors.accent.match(/hsl\(([^)]+)\)/);
      const rippleColor = hslMatch ? `hsla(${hslMatch[1]}, 0.38)` : 'rgba(255, 255, 255, 0.38)';
      context.strokeStyle = rippleColor;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(mousePosition.x, mousePosition.y, rippleRadius, 0, Math.PI * 2);
      context.stroke();
      context.restore();
    }
  }, [trail, velocity, mousePosition]);

  // Draw gradient washes responsive to bass
  const drawGradientWashes = useCallback((context, colors, time, audioData) => {
    const { bass, mids } = audioData;
    
    // Convert HSL colors to HSLA with alpha values
    const getColorWithAlpha = (hslColor, alpha) => {
      // Extract HSL values and convert to HSLA
      const hslMatch = hslColor.match(/hsl\(([^)]+)\)/);
      if (hslMatch) {
        return `hsla(${hslMatch[1]}, ${alpha})`;
      }
      return `rgba(255, 255, 255, ${alpha})`; // Fallback
    };
    
    // Bass-responsive background gradient
    const gradient1 = context.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
    gradient1.addColorStop(0, getColorWithAlpha(colors.background, (bass * 0.4 + 0.08).toFixed(2)));
    gradient1.addColorStop(0.5, getColorWithAlpha(colors.primary, (bass * 0.24 + 0.04).toFixed(2)));
    gradient1.addColorStop(1, getColorWithAlpha(colors.secondary, (bass * 0.32 + 0.06).toFixed(2)));
    
    context.save();
    context.globalCompositeOperation = 'multiply';
    context.fillStyle = gradient1;
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.restore();
    
    // Mids-responsive overlay
    const gradient2 = context.createRadialGradient(
      window.innerWidth * (0.3 + Math.sin(time * 0.001) * 0.2),
      window.innerHeight * (0.3 + Math.cos(time * 0.0015) * 0.2),
      0,
      window.innerWidth * 0.5,
      window.innerHeight * 0.5,
      Math.max(window.innerWidth, window.innerHeight) * 0.8
    );
    gradient2.addColorStop(0, getColorWithAlpha(colors.accent, (mids * 0.16 + 0.04).toFixed(2)));
    gradient2.addColorStop(1, 'transparent');
    
    context.save();
    context.globalCompositeOperation = 'screen';
    context.fillStyle = gradient2;
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.restore();
  }, []);

  // Main render loop
  const render = useCallback(() => {
    const context = contextRef.current;
    if (!context) return;
    
    timeRef.current += 16; // Approximate 60fps
    const time = timeRef.current;
    
    // Clear canvas with fade effect
    context.save();
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = 'rgba(0, 0, 0, 0.05)';
    context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    context.restore();
    
    // Get current color palette and mouse influence
    const mouseInfluence = getColorInfluence();
    const colors = getColorPalette(time, audioData, mouseInfluence);
    
    // Draw all visual elements
    drawGradientWashes(context, colors, time, audioData);
    drawFlowingShapes(context, colors, time, audioData);
    drawParticles(context, colors, time, audioData, mouseInfluence);
    drawMouseEffects(context, colors, mouseInfluence);
    
    animationFrameRef.current = requestAnimationFrame(render);
  }, [audioData, getColorInfluence, getColorPalette, drawGradientWashes, drawFlowingShapes, drawParticles, drawMouseEffects]);

  // Handle controls visibility
  const handleControlsMouseEnter = () => {
    pauseAutoAdvance();
    setControlsVisible(true);
    if (mouseIdleTimer) {
      clearTimeout(mouseIdleTimer);
      setMouseIdleTimer(null);
    }
  };

  const handleControlsMouseLeave = () => {
    resumeAutoAdvance();
    const timer = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
    setMouseIdleTimer(timer);
  };

  // Auto-start playback when component mounts
  useEffect(() => {
    const startPlayback = async () => {
      try {
        await play();
      } catch (error) {
        console.log('Auto-play prevented by browser, user interaction required');
      }
    };
    
    const timer = setTimeout(startPlayback, 1000);
    return () => clearTimeout(timer);
  }, [play]);

  // Initialize canvas and start render loop
  useEffect(() => {
    initializeCanvas();
    render();

    const handleResize = () => {
      initializeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [initializeCanvas, render]);

  return (
    <div className="audio-visualizer">
      <canvas 
        ref={canvasRef}
        className="visualizer-canvas"
      />
      
      <PlaybackControls
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isLoading={isLoading}
        onPlay={play}
        onPause={pause}
        onNext={nextTrack}
        onPrev={prevTrack}
        onMouseEnter={handleControlsMouseEnter}
        onMouseLeave={handleControlsMouseLeave}
      />
    </div>
  );
};

export default AudioVisualizer; 