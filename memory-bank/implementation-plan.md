## Implementation Plan for Stellar Vanguard Base Game

This plan outlines the steps to implement the base version of "Stellar Vanguard," focusing on core gameplay mechanics and essential integrations as per the Game Design Document (GDD) and Cursor rules.

---

### Step 1: Set Up Project Structure
- Create a new project directory and initialize a Git repository.
- Set up the following folder structure:
  - `src/`: For JavaScript source code.
    - `scenes/`: For Phaser scene classes.
    - `entities/`: For game entities like player and enemies.
    - `utils/`: For utility classes, e.g., Three.js manager.
  - `assets/`: For game assets.
    - `images/`: 2D images (e.g., background.png).
    - `audio/`: Sound files (optional for base game).
    - `models/`: 3D models (e.g., simple ship and enemy models).
  - `lib/`: For external libraries (if not using CDN).
- Create `index.html` with:
  - Basic HTML5 structure (<!DOCTYPE html>, <html>, <head>, <body>).
  - A `<canvas>` element for the game.
  - Script tags to include Phaser and Three.js via CDN (e.g., from unpkg.com) or local files in `lib/`.
- Create `src/main.js` as the entry point for the game, using ES6 module syntax.

**Test**: Open `index.html` in a browser; it should load without errors, displaying a blank page.

---

### Step 2: Initialize Phaser Game
- In `src/main.js`, import Phaser and create a new `Phaser.Game` instance with:
  - `width: 800` and `height: 600` (or similar resolution).
  - `type: Phaser.AUTO` (to support WebGL or Canvas fallback).
  - `scene: [BootScene]` (an array of scenes to load).
- Import `BootScene` from `src/scenes/BootScene.js` using ES6 `import` syntax.

**Test**: The game should start, and `BootScene` should be loaded (even if it does nothing yet), with no console errors.

---

### Step 3: Implement BootScene for Asset Loading
- In `src/scenes/BootScene.js`, define `BootScene` extending `Phaser.Scene` with key `'BootScene'`.
- Implement `preload()` to load a background image (e.g., `this.load.image('background', 'assets/images/background.png');`).
- Implement `create()` to transition to `MainMenuScene` using `this.scene.start('MainMenuScene');`.

**Test**: The game should load the background image and transition to `MainMenuScene` without errors.

---

### Step 4: Create MainMenuScene
- In `src/scenes/MainMenuScene.js`, define `MainMenuScene` extending `Phaser.Scene` with key `'MainMenuScene'`.
- In `create()`:
  - Add the background image using `this.add.image(400, 300, 'background');` (centered on an 800x600 canvas).
  - Add a "Play" button using Phaser text (e.g., `this.add.text()` with `setInteractive()`).
  - On button click, start `GameplayScene` using `this.scene.start('GameplayScene');`.

**Test**: The main menu should display the background and a clickable "Play" button; clicking it should transition to `GameplayScene`.

---

### Step 5: Set Up Three.js Integration
- In `src/utils/ThreeJSManager.js`, create a `ThreeJSManager` class using ES6 module syntax.
- Initialize:
  - `THREE.WebGLRenderer` with `{ alpha: true }` for transparency over Phaser.
  - Renderer size matching the game canvas (e.g., 800x600).
  - Append the renderer's DOM element to the document body, positioned absolutely over the Phaser canvas (use CSS: `position: absolute; top: 0; left: 0;`).
  - `THREE.Scene` for 3D objects.
  - `THREE.PerspectiveCamera` with a field of view of 75, aspect ratio matching the canvas, and near/far planes (e.g., 0.1, 1000).
- Add an `update()` method to render the scene and camera.

**Test**: The Three.js canvas should overlay the Phaser canvas; both should render without obstructing each other (e.g., the main menu background remains visible).

---

### Step 6: Implement GameplayScene Structure
- In `src/scenes/GameplayScene.js`, define `GameplayScene` extending `Phaser.Scene` with key `'GameplayScene'`.
- In `create()`:
  - Add the 2D background using `this.add.image(400, 300, 'background');`.
  - Initialize an instance of `ThreeJSManager`.
- In `update()`, call `threeJSManager.update()` to render the 3D scene.

**Test**: The gameplay scene should display the 2D background and an empty 3D scene overlay, with no errors.

---

### Step 7: Implement Vertical Scrolling Background
- In `GameplayScene`:
  - Replace the static background with a tile sprite (e.g., `this.add.tileSprite(400, 300, 800, 600, 'background');`).
  - In `update()`, increment the tile sprite’s `tilePositionY` by a small value (e.g., 1) to scroll downward.
- Adjust the tile sprite size if needed to ensure seamless scrolling.

**Test**: The background should scroll vertically downward, simulating the ship moving upward.

---

### Step 8: Add Player Ship
- In `src/entities/Player.js`, create a `Player` class using ES6 module syntax.
- In the constructor:
  - Use `ThreeJSManager.loadModel()` to load a simple 3D model (e.g., a cube or placeholder GLTF from `assets/models/player.glb`).
  - Add the model to the Three.js scene.
  - Position it at the bottom center (e.g., x: 0, y: -200, z: 0 in Three.js coordinates).
- In `GameplayScene`:
  - Instantiate the `Player` class in `create()`.
  - In `update()`, update the player’s position based on input:
    - Desktop: Use `this.input.activePointer.x` and `.y`, scaled to Three.js coordinates.
    - Mobile: Use `this.input.pointer1` for touch drag.
  - Clamp the position to stay within screen boundaries (e.g., x: -400 to 400, y: -300 to 300).

**Test**: The player ship should appear at the bottom center and move smoothly with mouse or touch input, staying on-screen.

---

### Step 9: Implement Automatic Shooting
- In `Player.js`:
  - Add a `shoot()` method to fire bullets every 0.2 seconds (use a timer or delta time check).
  - Create bullets as Phaser sprites (e.g., `this.scene.physics.add.sprite()` in `GameplayScene`) at the player’s position.
- In `GameplayScene`:
  - Set bullet velocity upward (e.g., `bullet.setVelocityY(-400);`).
  - Destroy bullets when they leave the screen.
- Expose the `shoot()` method and call it from `GameplayScene`’s `update()`.

**Test**: The player ship should continuously fire bullets upward, which disappear off-screen.

---

### Step 10: Add Basic Enemies
- In `src/entities/Enemy.js`, create an `Enemy` class using ES6 module syntax.
- In the constructor:
  - Load a simple 3D model (e.g., `assets/models/enemy.glb`) via `ThreeJSManager`.
  - Add the model to the Three.js scene.
  - Position it at a random x-coordinate at the top (e.g., x: random(-400, 400), y: 300, z: 0).
- In `GameplayScene`:
  - Spawn an enemy every few seconds in `update()` (use a timer).
  - Move enemies downward (e.g., decrease y by 1 each frame).
  - Add enemy shooting: Create Phaser bullet sprites moving downward (e.g., `setVelocityY(300)`).

**Test**: Enemies should spawn at the top, move downward, and shoot bullets downward at intervals.

---

### Step 11: Implement Collision Detection
- In `GameplayScene`:
  - Enable Arcade Physics in the Phaser config (`physics: { default: 'arcade' }` in `main.js`).
  - Add collision groups for player bullets vs. enemies and enemy bullets vs. player.
  - Use `this.physics.add.collider()` to detect collisions.
  - On collision:
    - Destroy player bullets and enemies, removing the enemy model from the Three.js scene.
    - Destroy enemy bullets and damage the player (e.g., log damage for now).

**Test**: Shooting an enemy should destroy it; enemy bullets hitting the player should trigger a detectable event.

---

### Step 12: Add Scoring System
- In `GameplayScene`:
  - Initialize a `score` variable to 0 in `create()`.
  - Increment `score` by 10 (or similar) when an enemy is destroyed in the collision handler.
  - Add a text object to display the score (e.g., `this.add.text(10, 10, 'Score: 0')`).
  - Update the text in `update()` with the current score.

**Test**: Destroying enemies should increase the displayed score.

---

### Step 13: Integrate Firebase Authentication
- Set up a Firebase project via the Firebase Console and obtain the configuration object.
- In `index.html`, include the Firebase SDK via CDN.
- In `src/utils/FirebaseManager.js`, create a `FirebaseManager` class:
  - Initialize Firebase with the config.
  - Add an `authenticate()` method using `firebase.auth().signInWithEmailAndPassword()`.
- In `MainMenuScene`:
  - Add login UI (e.g., text fields for email/password, a login button).
  - On login button click, call `FirebaseManager.authenticate()` and handle success/error.

**Test**: Players should be able to enter credentials and log in, with success reflected (e.g., a “Logged in” message).

---

### Step 14: Save High Scores to Firebase
- In `FirebaseManager.js`, add a `saveHighScore(userId, score)` method to save the score to `firebase.database().ref('users/' + userId + '/highScore')`.
- In `GameplayScene`, when the game ends (e.g., player “dies”), call `saveHighScore` with the current score.
- In `MainMenuScene`, retrieve and display the high score after login using `firebase.database().ref().once('value')`.

**Test**: After playing, the score should save to Firebase and display correctly in the main menu after reloading.
