import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create a loading text
        const loadingText = this.add.text(400, 300, 'Loading...', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Load the background image
        this.load.image('background', 'assets/images/SeagullThor_Martino_5149.jpg');

        // Loading progress events
        this.load.on('progress', (value) => {
            loadingText.setText(`Loading: ${Math.round(value * 100)}%`);
        });

        this.load.on('complete', () => {
            loadingText.setText('Load Complete!');
        });
    }

    create() {
        // Transition to MainMenuScene after a short delay
        this.time.delayedCall(1000, () => {
            this.scene.start('MainMenuScene');
        });
    }
} 