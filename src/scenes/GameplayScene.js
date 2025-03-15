import { Scene } from 'phaser';
import ThreeJSManager from '../utils/ThreeJSManager.js';

export default class GameplayScene extends Scene {
    constructor() {
        super({ key: 'GameplayScene' });
        this.threeJSManager = null;
        this.background = null;
    }

    create() {
        // Add the scrolling background as a tile sprite
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
        
        // Initialize Three.js manager
        this.threeJSManager = new ThreeJSManager();
    }

    update() {
        // Scroll the background
        this.background.tilePositionY -= 2; // Adjust speed as needed

        // Update Three.js scene
        if (this.threeJSManager) {
            this.threeJSManager.update();
        }
    }

    destroy() {
        if (this.threeJSManager) {
            this.threeJSManager.destroy();
            this.threeJSManager = null;
        }
        super.destroy();
    }
} 