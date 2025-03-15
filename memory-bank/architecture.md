# Stellar Vanguard Architecture

## Project Structure
```
stellar-vanguard/
├── src/
│   ├── main.js           # Game entry point and configuration
│   └── scenes/
│       └── BootScene.js  # Initial loading scene
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
- Phaser.AUTO renderer selection
  - Automatically chooses WebGL when available
  - Falls back to Canvas when needed
- Prepared for Three.js integration
  - CDN loaded
  - Will be used for 3D elements

### Physics
- Arcade Physics system
  - Lightweight and suitable for 2D gameplay
  - Zero gravity configuration for top-down perspective
  - Debug mode available but disabled by default

## Future Considerations
1. Asset loading system (Step 3)
2. Scene transitions
3. Three.js integration for 3D elements
4. Input management
5. Game state management

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
- Primary responsibility: Main menu interface
- Features:
  - Displays game title and background
  - Provides interactive play button
  - Manages scene transitions
- Implementation details:
  - Uses loaded background asset
  - Implements interactive UI elements
  - Handles scene transition to GameplayScene (to be implemented)

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
