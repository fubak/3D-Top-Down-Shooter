# Stellar Vanguard

A 3D top-down vertical scrolling space shooter built with Phaser and Three.js.

## Description

Stellar Vanguard is a web-based space shooter game that combines classic vertical scrolling gameplay with modern 3D graphics. The game features a player-controlled ship that can be moved with mouse clicks and drags, enemies that spawn from the top of the screen, and a scoring system.

## Features

- 3D graphics rendered with Three.js integrated with Phaser's 2D game engine
- Smooth player ship movement with mouse click and drag
- Automatic shooting mechanics
- Enemy spawning system with increasing difficulty
- Score and health tracking
- Damage feedback with screen flash effects
- Game over and victory screens
- Firebase integration for user authentication and high score tracking (optional)

## How to Play

1. Move your ship by clicking or dragging the mouse
2. Your ship automatically fires bullets upward
3. Destroy enemy ships to earn points
4. Avoid enemy bullets to maintain your health
5. Reach 100 points to win the game

## Prerequisites

- A modern web browser with WebGL support
- A local web server for development (e.g., http-server)

## Setup

1. Clone this repository
2. Install dependencies with `npm install`
3. Start the local server with `npm start`
4. Open your browser to http://localhost:8080

## Project Structure

```
├── assets/
│   ├── images/     # 2D game assets
│   ├── audio/      # Sound effects and music
│   └── models/     # 3D models
├── src/
│   ├── scenes/     # Phaser scene classes
│   │   └── GameplayScene.js  # Main gameplay scene
│   ├── entities/   # Game entity classes
│   │   ├── Player.js  # Player ship implementation
│   │   └── Enemy.js   # Enemy ship implementation
│   └── utils/      # Utility functions and classes
│       ├── ThreeJSManager.js  # Three.js integration
│       └── FirebaseManager.js # Firebase integration
├── index.html      # Main entry point
└── README.md       # This file
```

## Technologies Used

- Phaser 3.70.0 - 2D game framework
- Three.js - 3D graphics library
- HTML5/JavaScript (ES6+)
- Firebase (optional) - User authentication and high score tracking

## Development Status

The game is currently in a playable state with the following features implemented:
- Player movement with mouse click and drag
- 3D rendering of player and enemy ships
- Automatic shooting mechanics
- Enemy spawning system
- Collision detection
- Score and health tracking
- Game over and victory conditions

## Known Issues

- Firebase connectivity may be intermittent
- Audio context requires user interaction to start

## Future Enhancements

- Additional enemy types
- Power-ups and special weapons
- Mobile touch controls optimization
- More detailed 3D models
- Background music and improved sound effects 