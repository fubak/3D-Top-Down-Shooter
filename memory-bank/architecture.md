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

# Game Architecture

## File Structure and Responsibilities

### src/entities/Player.js
- Manages the player ship's 3D model using Three.js
- Handles player movement with pointer input
- Controls the automatic shooting system:
  - Manages bullet group using Phaser's physics system
  - Handles bullet creation and cleanup
  - Converts coordinates between Three.js and Phaser coordinate systems
- Maintains boundaries for player movement

### src/scenes/GameplayScene.js
- Main game scene implementation
- Manages game state and updates
- Creates and manages the scrolling background
- Initializes the physics system
- Handles input events for player control
- Generates and manages game assets (e.g., bullet sprites)
- Coordinates updates between Phaser and Three.js systems

### Coordinate Systems
The game uses two different coordinate systems that need to be carefully managed:
1. Three.js (3D World)
   - Center origin (0,0)
   - X: -400 to +400
   - Y: -300 to +300 (positive is up)
   - Used for player ship model

2. Phaser (2D World)
   - Top-left origin (0,0)
   - X: 0 to 800
   - Y: 0 to 600 (positive is down)
   - Used for bullets and UI elements

Coordinate conversion formulas:
- Three.js to Phaser:
  - X = threeJS.x + 400
  - Y = -threeJS.y + 300
- Phaser to Three.js:
  - X = phaser.x - 400
  - Y = -(phaser.y - 300)

### Enemy System

#### Enemy Class (`src/entities/Enemy.js`)
The `Enemy` class represents hostile entities in the game with the following responsibilities:
- Creates and manages a 3D model representation using Three.js
- Maintains a physics body for collision detection using Phaser's physics system
- Handles autonomous movement (downward scrolling)
- Manages periodic shooting behavior
- Provides cleanup methods for proper resource management

Key components:
- `model`: Three.js mesh representing the enemy in 3D space
- `body`: Invisible Phaser sprite for physics calculations
- `shootInterval`: Time between enemy shots (2000ms)
- `speed`: Movement speed for downward scrolling

#### Enemy Integration in GameplayScene
The `GameplayScene` manages the enemy system through:
- `enemies`: Array tracking all active enemy instances
- `lastEnemySpawn`: Timestamp of last enemy spawn
- `enemySpawnInterval`: Time between enemy spawns (3000ms)
- `spawnEnemy()`: Creates new enemies at random x-coordinates
- Enemy lifecycle management in the `update()` loop

Coordinate System Integration:
- Three.js coordinates: Centered at (0,0), range: (-300 to 300, -300 to 300)
- Phaser coordinates: Top-left origin (0,0), range: (0 to 800, 0 to 600)
- Conversion handled in Enemy class for seamless integration

### Collision Detection System

The game implements a hybrid collision detection system that bridges the gap between the 3D visual representation (Three.js) and the 2D physics system (Phaser). This approach allows for visually appealing 3D models while maintaining efficient collision detection.

#### Core Components

1. **Physics Bodies**
   - **Player**: Invisible circular physics body (radius: 15px) that follows the player's 3D model
   - **Enemies**: Invisible circular physics bodies (radius: 10px) that follow each enemy's 3D model
   - **Bullets**: Small circular sprites (8x8px) with physics properties

2. **Collision Groups**
   - **Player Bullets**: Managed by the Player class as a Phaser physics group
   - **Enemy Bullets**: Managed by GameplayScene as a separate physics group
   - Groups enable efficient collision detection and memory management

3. **Collision Detection Logic**
   - Located in GameplayScene's update method
   - Uses Phaser's `physics.overlap()` method for efficient detection
   - Separate overlap checks for:
     - Player bullets vs. enemy bodies
     - Enemy bullets vs. player body

4. **Collision Handlers**
   - `handlePlayerBulletEnemyCollision()`: Destroys both bullet and enemy
   - `handleEnemyBulletPlayerCollision()`: Destroys bullet and damages player

#### Coordinate System Management

A critical aspect of the collision system is the proper conversion between coordinate systems:

1. **Three.js (3D World)**
   - Center origin (0,0)
   - X: -400 to +400
   - Y: -300 to +300 (positive is up)

2. **Phaser (2D World)**
   - Top-left origin (0,0)
   - X: 0 to 800
   - Y: 0 to 600 (positive is down)

Conversion formulas implemented in the codebase:
- Three.js to Phaser:
  - X = threeJS.x + 400
  - Y = -threeJS.y + 300
- Phaser to Three.js:
  - X = phaser.x - 400
  - Y = -(phaser.y - 300)

#### Bullet Management

The system includes specialized handling for bullets:
- **Player Bullets**: Travel upward, managed by Player class
- **Enemy Bullets**: Travel downward, managed by GameplayScene
- Both use Phaser's group system for efficient object pooling
- Automatic cleanup when bullets leave the screen:
  - Using `checkWorldBounds` and `outOfBoundsKill` properties
  - Additional cleanup in update loops for reliability

#### Bullet Physics Implementation

The game uses a robust approach to ensure consistent bullet movement:

1. **Direct Velocity Setting**
   - Enemy bullets: `bullet.body.velocity.y = 300` directly sets the physics body velocity
   - Player bullets: `bullet.setVelocityY(-400)` uses Phaser's helper method
   - Direct velocity setting ensures the physics engine properly tracks the bullet

2. **Physics Group Configuration**
   - Enemy bullets group is configured with default physics properties:
   ```javascript
   this.enemyBullets = this.physics.add.group({
       allowGravity: false,
       velocityY: 300
   });
   ```
   - This ensures new bullets added to the group inherit these properties

3. **Velocity Maintenance**
   - The update loop includes velocity checks to ensure bullets maintain movement:
   ```javascript
   if (bullet.body && bullet.body.velocity.y < 10) {
       bullet.body.velocity.y = 300;
   }
   ```
   - This prevents bullets from stopping due to physics anomalies

4. **Gravity Disabling**
   - `bullet.body.allowGravity = false` ensures bullets aren't affected by the physics world gravity
   - This maintains consistent velocity regardless of other physics settings

This multi-layered approach ensures bullets behave predictably even when the entities that created them are destroyed.

#### Health System

The collision system integrates with a simple health system:
- Player starts with 100 health points
- Each enemy bullet hit reduces health by 10 points
- Game over condition triggered when health reaches 0
- Currently logs game over state (to be expanded in future steps)

### Scoring System

The game implements a straightforward scoring system that rewards players for destroying enemy ships:

#### Core Components
- **Score Variable**: Maintained in GameplayScene as an integer value
- **Score Display**: Text object positioned at the top-left corner of the screen
- **Score Increment**: 10 points awarded for each enemy destroyed

#### Implementation Details
- **Initialization**: Score starts at 0 when GameplayScene is created
- **Visual Representation**: 
  - White text with black outline for visibility against any background
  - 24px Arial font for clear readability during fast-paced gameplay
  - Positioned at coordinates (16, 16) to avoid interfering with gameplay
- **Update Mechanism**: 
  - Score increments in the handlePlayerBulletEnemyCollision method
  - Text display updates immediately after score changes
  - Null checks ensure robustness if text object is not available

#### Integration with Game Systems
- **Enemy Destruction**: Score only increases when an enemy is successfully destroyed by player bullets
- **Persistence**: Score maintains its value throughout the gameplay session
- **Future Expansion**: The scoring system is designed to be easily extended for:
  - Different point values for different enemy types
  - Combo or multiplier systems
  - High score tracking and persistence

This scoring system provides immediate feedback to players about their performance and creates a measurable goal for gameplay sessions.

### Firebase Integration

The game integrates with Firebase to provide authentication and data persistence capabilities. This integration follows a service-oriented architecture pattern with the following components:

#### FirebaseManager (`src/utils/FirebaseManager.js`)
A singleton service class that encapsulates all Firebase-related functionality:

- **Initialization**
  - Configures and initializes Firebase with application credentials
  - Sets up authentication and database services
  - Initializes authentication providers (email/password and Google)

- **Authentication Services**
  - `authenticate(email, password)`: Handles email/password authentication
  - `signInWithGoogle()`: Manages Google OAuth authentication flow
  - `createAccount(email, password)`: Handles new user registration
  - `signOut()`: Manages user logout process
  - `getCurrentUser()`: Provides access to the currently authenticated user

- **Database Services**
  - Provides reference to Firebase Realtime Database
  - Will be extended in Step 14 to handle high score persistence

- **Error Handling**
  - Implements comprehensive error handling for all Firebase operations
  - Provides meaningful error messages for authentication failures
  - Handles edge cases like missing Firebase SDK

#### Authentication Flow

1. **User Authentication**
   - MainMenuScene presents login options (email/password or Google)
   - User credentials are passed to FirebaseManager
   - Authentication result is returned to MainMenuScene
   - UI updates based on authentication success/failure

2. **Session Management**
   - Firebase handles session persistence automatically
   - Application checks for existing session on startup
   - User remains logged in across page refreshes

3. **Security**
   - Authentication is required to access the game
   - Play button is disabled until successful authentication
   - GameplayScene verifies authentication before allowing play

#### UI Integration

The authentication UI is implemented using DOM elements that overlay the Phaser canvas:

- **Login Form**
  - Created dynamically in MainMenuScene
  - Positioned absolutely over the game canvas
  - Styled for consistency with game aesthetics
  - Includes email/password fields and authentication buttons

- **Form Management**
  - Form elements are created on scene initialization
  - Event listeners handle user interactions
  - Form is properly removed during scene transitions
  - Status messages provide feedback on authentication progress

This architecture provides a clean separation of concerns, with Firebase-specific code isolated in the FirebaseManager service, while the game scenes focus on UI presentation and game logic.
