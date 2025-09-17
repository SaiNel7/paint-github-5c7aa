import { useState, useEffect, useRef, useCallback } from 'react';

export const useMouseTracker = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [normalizedPosition, setNormalizedPosition] = useState({ x: 0.5, y: 0.5 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [trail, setTrail] = useState([]);
  
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(Date.now());
  const movementTimeoutRef = useRef(null);

  const updateMousePosition = useCallback((event) => {
    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;
    
    const newPosition = {
      x: event.clientX,
      y: event.clientY
    };

    // Calculate velocity
    const deltaX = newPosition.x - lastPositionRef.current.x;
    const deltaY = newPosition.y - lastPositionRef.current.y;
    
    const newVelocity = {
      x: deltaTime > 0 ? deltaX / deltaTime : 0,
      y: deltaTime > 0 ? deltaY / deltaTime : 0
    };

    // Normalize position (0-1 range)
    const normalizedPos = {
      x: newPosition.x / window.innerWidth,
      y: newPosition.y / window.innerHeight
    };

    // Update trail
    setTrail(prevTrail => {
      const newTrail = [...prevTrail, {
        x: newPosition.x,
        y: newPosition.y,
        timestamp: now,
        opacity: 1
      }];
      
      // Keep only recent trail points (last 500ms)
      return newTrail.filter(point => now - point.timestamp < 500);
    });

    setMousePosition(newPosition);
    setNormalizedPosition(normalizedPos);
    setVelocity(newVelocity);
    setIsMoving(true);

    // Clear existing timeout
    if (movementTimeoutRef.current) {
      clearTimeout(movementTimeoutRef.current);
    }

    // Set timeout to detect when mouse stops moving
    movementTimeoutRef.current = setTimeout(() => {
      setIsMoving(false);
      setVelocity({ x: 0, y: 0 });
    }, 100);

    lastPositionRef.current = newPosition;
    lastTimeRef.current = now;
  }, []);

  // Calculate ripple effects based on mouse interaction
  const getRippleEffect = useCallback((centerX, centerY, intensity = 1) => {
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - centerX, 2) + 
      Math.pow(mousePosition.y - centerY, 2)
    );
    
    const maxDistance = Math.sqrt(
      Math.pow(window.innerWidth, 2) + 
      Math.pow(window.innerHeight, 2)
    );
    
    const normalizedDistance = distance / maxDistance;
    const rippleStrength = Math.max(0, 1 - normalizedDistance) * intensity;
    
    // Add velocity influence
    const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    const velocityInfluence = Math.min(velocityMagnitude * 0.1, 1);
    
    return {
      strength: rippleStrength,
      distance: normalizedDistance,
      velocityInfluence
    };
  }, [mousePosition, velocity]);

  // Get attraction/repulsion force for particles
  const getForceField = useCallback((particleX, particleY, attractionStrength = 1) => {
    const dx = mousePosition.x - particleX;
    const dy = mousePosition.y - particleY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { fx: 0, fy: 0 };
    
    const force = attractionStrength / (distance * 0.01);
    const normalizedForce = Math.min(force, 50); // Limit maximum force
    
    return {
      fx: (dx / distance) * normalizedForce,
      fy: (dy / distance) * normalizedForce,
      distance
    };
  }, [mousePosition]);

  // Get color influence based on mouse position and movement
  const getColorInfluence = useCallback(() => {
    const hue = (normalizedPosition.x * 360 + normalizedPosition.y * 180) % 360;
    const saturation = 0.7 + (normalizedPosition.y * 0.3);
    const lightness = 0.4 + (normalizedPosition.x * 0.3);
    
    const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    const intensity = Math.min(velocityMagnitude * 10 + 0.3, 1);
    
    return {
      hue,
      saturation,
      lightness,
      intensity,
      isActive: isMoving
    };
  }, [normalizedPosition, velocity, isMoving]);

  // Update trail opacity over time
  useEffect(() => {
    const updateTrail = () => {
      const now = Date.now();
      setTrail(prevTrail => 
        prevTrail.map(point => ({
          ...point,
          opacity: Math.max(0, 1 - (now - point.timestamp) / 500)
        })).filter(point => point.opacity > 0)
      );
    };

    const trailInterval = setInterval(updateTrail, 16); // ~60fps
    return () => clearInterval(trailInterval);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition);
    
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      if (movementTimeoutRef.current) {
        clearTimeout(movementTimeoutRef.current);
      }
    };
  }, [updateMousePosition]);

  return {
    mousePosition,
    normalizedPosition,
    velocity,
    isMoving,
    trail,
    getRippleEffect,
    getForceField,
    getColorInfluence
  };
}; 