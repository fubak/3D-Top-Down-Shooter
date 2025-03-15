import * as Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    create() {
        // Add background
        this.add.image(400, 300, 'background');

        // Add title text
        this.add.text(400, 200, 'Stellar Vanguard', {
            font: '48px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Add play button
        const playButton = this.add.text(400, 300, 'Play Game', {
            font: '32px Arial',
            fill: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Add hover effect
        playButton.on('pointerover', () => {
            playButton.setStyle({ fill: '#ff0' });
        });

        playButton.on('pointerout', () => {
            playButton.setStyle({ fill: '#ffffff' });
        });

        // Add click handler (we'll implement GameplayScene later)
        playButton.on('pointerdown', () => {
            this.scene.start('GameplayScene');
        });
    }
} 