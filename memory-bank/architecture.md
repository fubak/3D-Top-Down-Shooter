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
The game uses Phaser's scene management system with three main scenes:
- `BootScene`: Handles initial asset loading and displays loading progress
- `MainMenuScene`: Displays the game title and play button with static background
- `GameplayScene`: Main game scene with scrolling background and 3D overlay

### Utility Classes

#### ThreeJSManager (`src/utils/ThreeJSManager.js`)
Manages the 3D rendering layer of the game:
- Creates and manages WebGL renderer with transparent background
- Sets up 3D scene, camera, and lighting
- Handles model loading (prepared for future steps)
- Provides methods for scene manipulation (add/remove objects)
- Implements proper resource cleanup
- Key methods:
  - `constructor()`: Sets up renderer, scene, camera, and lights
  - `update()`: Renders the current frame
  - `destroy()`: Cleans up resources
  - `loadModel()`: Async method for loading 3D models (to be used in Step 8)

### Technical Integration
- **Layered Rendering**: Uses Phaser for 2D elements (UI, background) and Three.js for 3D elements
- **Canvas Stacking**: Three.js canvas is positioned absolutely over Phaser's canvas
- **Module System**: Uses ES6 modules with import maps for clean dependency management
- **Resource Management**: Implements proper cleanup to prevent memory leaks during scene transitions

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

### GameplayScene (`src/scenes/GameplayScene.js`)
- Primary responsibility: Main gameplay rendering and logic
- Features:
  - Hybrid rendering system combining Phaser 2D and Three.js 3D
  - Background layer management
  - Integration with ThreeJSManager for 3D elements
- Implementation details:
  - Uses Phaser's Scene system for lifecycle management
  - Implements continuous update loop for 3D rendering
  - Maintains proper layering between 2D and 3D elements
  - Follows component-based architecture for extensibility
  - Implements null safety checks for ThreeJSManager

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
