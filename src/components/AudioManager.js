import { useState, useEffect, useRef, useCallback } from 'react';
import { playlist } from '../assets/playlist';

export const useAudioManager = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioData, setAudioData] = useState({
    bass: 0,
    mids: 0,
    treble: 0,
    volume: 0,
    frequencyData: new Uint8Array(256)
  });
  const [autoAdvance, setAutoAdvance] = useState(true);
  
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);

  // Initialize Web Audio API
  const initializeAudio = useCallback(async () => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Create audio element
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      
      // Create source node and connect to analyser
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      // Set up event listeners
      audioRef.current.addEventListener('ended', handleTrackEnd);
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplaythrough', () => setIsLoading(false));
      
      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      return false;
    }
  }, []);

  // Analyze audio frequency data
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate frequency ranges
    const bass = dataArray.slice(0, 60).reduce((sum, val) => sum + val, 0) / 60;
    const mids = dataArray.slice(60, 170).reduce((sum, val) => sum + val, 0) / 110;
    const treble = dataArray.slice(170, 256).reduce((sum, val) => sum + val, 0) / 86;
    const volume = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;

    setAudioData({
      bass: bass / 255,
      mids: mids / 255,
      treble: treble / 255,
      volume: volume / 255,
      frequencyData: dataArray
    });

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, []);

  // Load and play track
  const loadTrack = useCallback(async (trackIndex) => {
    if (!audioRef.current) return;

    const track = playlist[trackIndex];
    setIsLoading(true);
    
    try {
      audioRef.current.src = track.file;
      await audioRef.current.load();
    } catch (error) {
      console.error('Error loading track:', error);
      // Use a fallback or silent audio for demo purposes
      audioRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmITC0JhMSe5e7hbAAAAAElFTkSuQmCC";
    }
    
    setIsLoading(false);
  }, []);

  // Play/pause functions
  const play = useCallback(async () => {
    if (!audioRef.current || !audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      await audioRef.current.play();
      setIsPlaying(true);
      
      // Start audio analysis
      if (!animationFrameRef.current) {
        analyzeAudio();
      }
      
      // Start auto-advance timer if enabled
      if (autoAdvance) {
        startAutoAdvanceTimer();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [analyzeAudio, autoAdvance]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    setIsPlaying(false);
    
    // Stop auto-advance timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  // Auto-advance timer
  const startAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    
    autoAdvanceTimerRef.current = setTimeout(() => {
      if (autoAdvance && isPlaying) {
        nextTrack();
      }
    }, 30000); // 30 seconds
  }, [autoAdvance, isPlaying]);

  // Track navigation
  const nextTrack = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    loadTrack(nextIndex).then(() => {
      if (isPlaying) {
        play();
      }
    });
  }, [currentTrackIndex, isPlaying, loadTrack, play]);

  const prevTrack = useCallback(() => {
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    loadTrack(prevIndex).then(() => {
      if (isPlaying) {
        play();
      }
    });
  }, [currentTrackIndex, isPlaying, loadTrack, play]);

  const handleTrackEnd = useCallback(() => {
    nextTrack();
  }, [nextTrack]);

  // Disable auto-advance temporarily
  const pauseAutoAdvance = useCallback(() => {
    setAutoAdvance(false);
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const resumeAutoAdvance = useCallback(() => {
    setAutoAdvance(true);
    if (isPlaying) {
      startAutoAdvanceTimer();
    }
  }, [isPlaying, startAutoAdvanceTimer]);

  // Initialize on mount
  useEffect(() => {
    initializeAudio().then((success) => {
      if (success) {
        loadTrack(0);
      }
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [initializeAudio, loadTrack]);

  return {
    currentTrack: playlist[currentTrackIndex],
    isPlaying,
    isLoading,
    audioData,
    autoAdvance,
    play,
    pause,
    nextTrack,
    prevTrack,
    pauseAutoAdvance,
    resumeAutoAdvance
  };
}; 