Below is a Game Design Document (GDD) in markdown format for a 3D top-down, vertical scrolling space shooter that meets the specified requirements. The game is designed to be HTML/JS based, uses Firebase for storage, draws inspiration from *Ikaruga* and *Danmaku Unlimited*, and is mobile-friendly with many levels, powerups, enemy types, and visually appealing special effects.

---

# Game Design Document: Stellar Vanguard

## 1. Game Overview

- **Title**: Stellar Vanguard
- **Genre**: 3D Top-Down Vertical Scrolling Space Shooter
- **Platform**: Web (HTML/JS), optimized for mobile and desktop
- **Target Audience**: Arcade shooter enthusiasts, casual gamers
- **Unique Selling Points**:
  - Stunning 3D visuals in a top-down perspective
  - Strategic polarity mechanic inspired by *Ikaruga*
  - Bullet hell elements reminiscent of *Danmaku Unlimited*
  - Mobile-friendly touch controls
  - Extensive level progression with varied powerups and enemies

## 2. Story and Setting

In the year 3025, humanity has colonized distant star systems, but a menacing alien force known as the "Void Swarm" emerges to threaten the galaxy. You are a pilot in the Stellar Vanguard, an elite squadron tasked with traversing hostile space sectors, repelling the alien invasion, and uncovering the origins of the Void Swarm.

- **Setting**: Diverse space environments, including nebulae, asteroid fields, and planetary orbits, depicted with vibrant 2D backgrounds and 3D ship models.

## 3. Gameplay Mechanics

### Controls
- **Mobile**: 
  - Touch and drag to move the ship.
  - Tap with a second finger to activate special abilities.
- **Desktop**: 
  - Mouse movement to control the ship.
  - Left-click for primary fire (if not automatic), right-click for special abilities.

### Ship Movement
- The game features a vertical scrolling background, with the ship continuously moving upward.
- Players can maneuver the ship left, right, up, and down within the screen boundaries.

### Shooting
- The ship fires its primary weapon automatically.
- Weapon behavior can change via powerups (e.g., rapid fire, spread shots, lasers).

### Polarity Mechanic
- Inspired by *Ikaruga*, the player can switch between two polarities: **Red** and **Blue**.
  - Enemies and bullets are color-coded (Red or Blue).
  - In Red polarity: Absorb Red bullets, deal extra damage to Blue enemies.
  - In Blue polarity: Absorb Blue bullets, deal extra damage to Red enemies.
  - Switching polarity has a brief cooldown (e.g., 1 second) to encourage strategic timing.

### Bullet Hell Elements
- Certain levels and bosses feature dense bullet patterns, requiring precise dodging and polarity switches, drawing from *Danmaku Unlimited*'s intensity.

### Powerups
- Dropped by enemies or found in destructible objects:
  - **Weapon Upgrade**: Enhances fire rate or switches to new weapon types (e.g., spread shot, laser).
  - **Shield**: Grants a one-hit shield or temporary invincibility.
  - **Speed Boost**: Increases movement speed for a short duration.
  - **Special Weapon**: Provides a one-time use of a powerful attack (e.g., screen-clearing bomb).

### Special Abilities
- Player-activated abilities (e.g., a temporary shield or a massive laser blast), triggered via tap (mobile) or right-click (desktop).

## 4. Level Design

- **Structure**: Organized into multiple **sectors**, each containing several **levels**.
- **Level Features**:
  - Unique 2D backgrounds (e.g., starry skies, nebulae, space stations).
  - Waves of enemies with increasing difficulty.
  - Environmental hazards like asteroids or debris.
- **Boss Fights**: Each sector ends with a boss encounter featuring multiple phases and evolving attack patterns.
- **Progression**: Difficulty ramps up with more enemies, faster bullets, and complex patterns.

## 5. Enemies

- **Basic Drones**: Small, fast enemies with simple bullet spreads.
- **Heavy Fighters**: Larger ships with more health, firing homing missiles or beams.
- **Turrets**: Stationary enemies with predictable, patterned attacks.
- **Mini-Bosses**: Mid-level challenges with unique behaviors.
- **Bosses**: Massive enemies with multi-phase attacks, combining polarity-based bullets and bullet hell patterns.

## 6. Powerups and Upgrades

- **Powerups** (temporary, collected in-game):
  - Weapon Upgrade
  - Shield
  - Speed Boost
  - Special Weapon
- **Upgrades** (persistent, unlocked via progression):
  - Unlockable ship customizations (e.g., starting weapon, speed).
  - Purchased with in-game currency earned from defeated enemies or completed levels.

## 7. Visuals and Audio

### Art Style
- **3D Elements**: Ships, enemies, and bosses use 3D models with detailed textures and animations.
- **2D Elements**: Parallax scrolling backgrounds depict space scenery (nebulae, stars, planets).

### Special Effects
- Particle systems for:
  - Explosions
  - Bullet trails
  - Engine exhausts
- Shader effects for:
  - Laser beams
  - Polarity switches (e.g., a glowing aura around the ship).

### Sound Effects
- High-quality audio for:
  - Weapon fire
  - Explosions
  - Powerup pickups
  - Enemy destruction

### Music
- Upbeat, electronic synthwave tracks that escalate with gameplay intensity, enhancing the space theme.

## 8. Progression and Saving

- **Progression**: Levels unlock sequentially as players complete them.
- **Replayability**: High scores tracked per level, saved via Firebase.
- **Saving**: 
  - Firebase stores:
    - Completed levels
    - High scores
    - Unlocked upgrades and ships
    - Player preferences (e.g., control settings)
- **Customization**: Players can select unlocked ships or upgrades before starting a level.

## 9. Monetization

- **Model**: Free-to-play with optional monetization.
- **Options**:
  - Ads between levels (skippable with a purchase).
  - In-game purchases for cosmetic ship skins or starting powerups (e.g., extra lives).

## 10. Technical Details

- **Development**:
  - Built with **HTML5** and **JavaScript**.
  - **Phaser**: Handles 2D game logic and rendering.
  - **Three.js**: Renders 3D models for ships and enemies.
- **Storage**: 
  - **Firebase** manages user authentication, game saves, and leaderboards.
- **Mobile Optimization**: 
  - Touch controls designed for simplicity.
  - Performance optimized for smooth gameplay on low-end devices.

---

This GDD outlines a visually stunning, mechanically rich space shooter that blends *Ikaruga*'s polarity system with *Danmaku Unlimited*'s bullet hell intensity. Built for the web with HTML/JS and Firebase, it ensures accessibility and persistence while catering to both mobile and desktop players with engaging levels, powerups, and enemy variety.