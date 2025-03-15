# Stellar Vanguard Architecture

## Project Structure
```
stellar-vanguard/
├── src/
│   ├── main.js           # Game entry point and configuration
│   ├── scenes/
│   │   ├── BootScene.js  # Initial loading scene
│   │   └── MainMenuScene.js # Main menu interface
│   └── utils/
│       └── ThreeJSManager.js # Three.js integration manager
├── assets/               # Game assets (images, audio, models)
├── lib/                  # External libraries
├── index.html           # Main HTML entry point
└── package.json         # Node.js project configuration
```

## Core Components

### Entry Points
- **index.html**
  - Main HTML container
  - Handles module imports via import maps
  - Sets up game container and styling
  - Loads external dependencies (Phaser, Three.js)

- **main.js**
  - Initializes Phaser game instance
  - Configures game settings (resolution, physics, scenes)
  - Sets up scene management
  - Entry point for game logic

### Scene Management
- **BootScene.js**
  - First scene to load in the game
  - Will handle asset preloading (in next step)
  - Currently displays loading indicator
  - Will transition to MainMenuScene (to be implemented)

- **MainMenuScene.js**
  - Primary responsibility: Main menu interface and game entry point
  - Features:
    - Displays game title and background
    - Provides interactive play button with hover effects
    - Manages scene transition to GameplayScene
  - Implementation details:
    - Uses loaded background asset from BootScene
    - Implements responsive UI elements with proper centering
    - Uses Phaser's text objects with interactive capabilities
    - Follows clean code practices with modular event handling
    - Maintains separation of concerns between UI and logic

### Three.js Integration
- **ThreeJSManager.js**
  - Primary responsibility: Manages 3D rendering and integration with Phaser
  - Features:
    - WebGL renderer with alpha channel for transparency
    - Scene and camera management
    - 3D model loading via GLTFLoader
    - Lighting system with ambient and directional lights
  - Implementation details:
    - Canvas positioning for proper overlay with Phaser
    - Resource management and cleanup
    - Responsive design support
    - Utility methods for scene object manipulation

### Technical Integration
- **Renderer Layering**
  - Three.js canvas positioned absolutely over Phaser canvas
  - Alpha channel enabled for transparent background
  - Proper z-index management for layer visibility

- **Resource Management**
  - Efficient model loading with GLTFLoader
  - Proper cleanup of 3D resources
  - Memory management best practices

- **Performance Optimization**
  - Shared WebGL context considerations
  - Efficient render loop integration
  - Resource disposal patterns

## Technical Decisions

### Module System
- Using ES6 modules for better code organization
- Import maps for clean module resolution
- CDN-based dependencies for faster development

### Development Environment
- Node.js-based development server
- No build step for rapid iteration
- Browser-native ES modules for simplicity

### Rendering
- **Hybrid Rendering Approach**
  - Phaser.AUTO renderer for 2D elements
  - Three.js WebGLRenderer for 3D elements
  - Transparent overlay system for seamless integration
  - Proper canvas management and positioning

### Physics
- Arcade Physics system
  - Lightweight and suitable for 2D gameplay
  - Zero gravity configuration for top-down perspective
  - Debug mode available but disabled by default

## Future Considerations
1. Asset loading system
2. Scene transitions
3. Input management
4. Game state management
5. Performance optimization for mobile devices
6. Advanced 3D effects and particle systems
7. Model optimization and LOD implementation

# Game Architecture Documentation

## Scene Management
The game uses Phaser's scene management system with the following structure:

### BootScene (`src/scenes/BootScene.js`)
- Primary responsibility: Asset loading and initialization
- Features:
  - Loads game assets (images, audio, etc.)
  - Displays loading progress
  - Manages transition to MainMenuScene
- Implementation details:
  - Uses Phaser's loader system with progress events
  - Implements loading bar for visual feedback
  - Handles asset loading errors gracefully

### MainMenuScene (`src/scenes/MainMenuScene.js`)
- Primary responsibility: Main menu interface and game entry point
- Features:
  - Displays game title and background
  - Provides interactive play button with hover effects
  - Manages scene transition to GameplayScene
- Implementation details:
  - Uses loaded background asset from BootScene
  - Implements responsive UI elements with proper centering
  - Uses Phaser's text objects with interactive capabilities
  - Follows clean code practices with modular event handling
  - Maintains separation of concerns between UI and logic

## Asset Management
- Assets are organized in the `assets/` directory:
  - `images/`: Contains game graphics (e.g., background.png)
  - `audio/`: Reserved for sound files (to be implemented)
  - `models/`: Reserved for 3D models (to be implemented)

## Scene Configuration
The game's scene configuration is managed in `src/main.js`:
- Implements Phaser game instance
- Registers all game scenes
- Configures physics system
- Sets up display properties (800x600 resolution)
