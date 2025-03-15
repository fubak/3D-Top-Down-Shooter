# Phaser Game Development Rules

## Scene Management

### Scene Structure (Priority: High)
- Extend `Phaser.Scene` for all game scenes
- Implement required lifecycle methods: `preload`, `create`, and `update`
- Each scene should handle a specific game state (menu, gameplay, etc.)
- Use scene transitions for smooth state changes

### Asset Management (Priority: High)
- Preload all assets in the initial scene's `preload` method
- Organize assets in type-based folders:
  - `assets/images/`
  - `assets/audio/`
  - `assets/models/`
- Use consistent, descriptive keys for asset references

### Example Scene Structure
```javascript
export class GameplayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameplayScene' });
    }

    preload() {
        this.load.image('player', 'assets/images/player.png');
        this.load.audio('bgm', 'assets/audio/background.mp3');
    }

    create() {
        // Scene setup code
    }

    update() {
        // Game loop logic
    }
}
```

### Best Practices
- Keep scenes focused and single-purpose
- Use scene data to pass information between scenes
- Clean up resources when scenes are destroyed
- Implement proper loading screens for asset preloading 