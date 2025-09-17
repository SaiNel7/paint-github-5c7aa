# DigArt - Interactive Audio Visualizer

An immersive fullscreen interactive audio visualizer React application that serves as a digital art piece. Experience rich, abstract visuals that respond to both audio frequency data and mouse movement with a chill beats aesthetic inspired by artists like Mac Miller, ASAP Rocky, Frank Ocean, and Yung Lean.

## Features

- **Fullscreen Immersive Experience**: Launches into a fullscreen visualizer with rich, textured visuals
- **Audio-Reactive Graphics**: Real-time frequency analysis drives visual elements including organic shapes, particle systems, and gradient washes
- **Interactive Mouse Effects**: Mouse movement creates ripple effects and influences particle flow and colors
- **Auto-Advancing Playlist**: Cycles through 8 audio tracks every 30 seconds with smart pause on user interaction
- **Minimal Playback Controls**: Subtle controls that don't interfere with the immersive experience
- **Mobile Fallback**: Clean fallback page for mobile devices with link back to main site
- **Performance Optimized**: 60fps animations with optimized canvas operations

## Visual Elements

- **Organic Flowing Shapes**: Smooth morphing forms that flow like smoke or liquid
- **Particle Systems**: Dreamy particle movement that responds to audio and mouse interaction
- **Gradient Washes**: Color palettes using warm purples, deep blues, soft oranges, and neon pinks
- **Real-time Audio Analysis**: Bass, mids, and treble frequency separation for targeted visual responses
- **Mouse Trails**: Fluid trailing effects that integrate with the atmospheric visuals

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digart-audio-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your audio files** (see Audio Setup section below)

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Audio Setup

### Adding Your Audio Files

1. **Create the audio directory**
   ```bash
   mkdir -p public/assets/audio
   ```

2. **Add your 8 MP3 files**
   - Name them `track1.mp3` through `track8.mp3`
   - Place them in `public/assets/audio/`
   - Recommended: Use high-quality MP3s (320kbps) for best frequency analysis

3. **Update track information**
   - Edit `src/assets/playlist.js`
   - Update artist names and song titles to match your tracks
   - Adjust file paths if using different naming

### Recommended Audio

For the best chill beats experience, use tracks that feature:
- Rich bass frequencies for shape morphing effects
- Clear mid-range for particle movement
- Crisp highs for color variations
- Dynamic range for engaging visual responses

## Project Structure

```
src/
├── components/
│   ├── AudioManager.js      # Web Audio API integration & playlist management
│   ├── AudioVisualizer.js   # Main canvas visualizer component
│   ├── ClickToStart.js      # Entry point with fullscreen launch
│   ├── LoadingScreen.js     # Reusable loading component
│   ├── MobileFallback.js    # Mobile device fallback page
│   ├── MouseTracker.js      # Mouse interaction & trail effects
│   └── PlaybackControls.js  # Minimal audio controls
├── styles/                  # Component-specific CSS files
├── assets/
│   └── playlist.js          # Audio track configuration
├── App.js                   # Main application router
└── index.js                 # React entry point
```

## Usage

1. **Loading**: The app starts with an animated loading screen
2. **Click to Start**: Single button to enter the fullscreen experience
3. **Immersive Mode**: Move your mouse to interact with the visuals
4. **Auto-Advance**: Tracks change every 30 seconds automatically
5. **Manual Control**: Hover over the bottom controls to pause auto-advance
6. **Navigation**: Use previous/next buttons or let the playlist cycle

## Browser Compatibility

- **Chrome**: Full support with hardware acceleration
- **Firefox**: Full support
- **Safari**: Full support (may require user interaction for audio)
- **Edge**: Full support

### Audio Autoplay

Modern browsers prevent audio autoplay without user interaction. The app handles this gracefully:
- Initial audio may require a click to start
- Once started, tracks will auto-advance normally
- All controls remain functional regardless of autoplay restrictions

## Performance Optimization

The visualizer is optimized for smooth 60fps performance:

- Hardware-accelerated canvas rendering
- Efficient particle system management
- Optimized frequency analysis
- Responsive design for different screen sizes
- Memory management for long-running sessions

## Customization

### Visual Themes
- Edit color palettes in `AudioVisualizer.js` > `getColorPalette()`
- Adjust particle counts in `initializeCanvas()`
- Modify shape morphing in `drawFlowingShapes()`

### Audio Analysis
- Adjust frequency ranges in `AudioManager.js` > `analyzeAudio()`
- Modify responsiveness in drawing functions
- Change auto-advance timing (currently 30 seconds)

### Mobile Fallback
- Customize the mobile page in `MobileFallback.js`
- Update the "go back home" link destination
- Match your site's existing design system

## Deployment

For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Serve from a web server**
   - The app requires a web server for audio file loading
   - Cannot be run directly from file:// protocol

3. **Audio file considerations**
   - Ensure MP3 files are web-optimized
   - Consider using a CDN for better performance
   - Test CORS settings if serving from different domains

## License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## Contributing

Contributions are welcome! Areas for improvement:
- Additional visual effects
- More audio analysis features
- Performance optimizations
- Mobile visualizer implementation
- Additional audio format support

---

**Note**: This application is designed for desktop/laptop experiences. The immersive nature of the visualizer with mouse interaction and audio analysis works best on larger screens with proper audio output. 