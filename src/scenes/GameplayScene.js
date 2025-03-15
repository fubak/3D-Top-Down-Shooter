import { Scene } from 'phaser';
import ThreeJSManager from '../utils/ThreeJSManager.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import firebaseManager from '../utils/FirebaseManager.js';

export default class GameplayScene extends Scene {
    constructor() {
        super({ key: 'GameplayScene' });
        this.threeJSManager = null;
        this.background = null;
        this.player = null;
        this.isPointerDown = false;
        this.enemies = [];
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = 3000; // Spawn enemy every 3 seconds
        this.enemyBullets = null; // Group for enemy bullets
        this.playerHealth = 100; // Player health
        this.score = 0; // Initialize score
        this.scoreText = null; // Text object to display score
        this.health = 100;
        this.healthText = null;
        this.currentUser = null;
    }

    preload() {
        // Create a simple bullet sprite if it doesn't exist
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffff00, 1); // Yellow color
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('bullet', 8, 8);
        graphics.destroy();
    }

    create() {
        // Get current user
        this.currentUser = firebaseManager.getCurrentUser();
        if (!this.currentUser) {
            console.warn('No authenticated user found, returning to main menu');
            this.scene.start('MainMenuScene');
            return;
        }

        // Enable physics
        this.physics.world.setBounds(0, 0, 800, 600);
        
        // Add the scrolling background as a tile sprite
        this.background = this.add.tileSprite(400, 300, 800, 600, 'background');
        
        // Initialize Three.js manager
        this.threeJSManager = new ThreeJSManager();

        // Create player
        this.player = new Player(this, this.threeJSManager);

        // Create a group for enemy bullets with physics
        this.enemyBullets = this.physics.add.group({
            allowGravity: false,
            velocityY: 300
        });

        // Add score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        // Add health text
        this.healthText = this.add.text(16, 50, 'Health: 100', {
            fontSize: '24px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });
        
        // Add user info text
        if (this.currentUser) {
            this.add.text(16, 84, `User: ${this.currentUser.email}`, {
                fontSize: '16px',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 3
            });
        }

        // Create an invisible rectangle for input handling
        const inputRect = this.add.rectangle(400, 300, 800, 600, 0x000000, 0);
        inputRect.setInteractive();

        inputRect.on('pointerdown', (pointer) => {
            console.log('Pointer down:', pointer.x, pointer.y);
            this.isPointerDown = true;
            if (this.player) {
                this.player.onPointerDown(pointer);
            }
        });

        inputRect.on('pointerup', () => {
            console.log('Pointer up');
            this.isPointerDown = false;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isPointerDown && this.player) {
                console.log('Pointer move:', pointer.x, pointer.y);
                this.player.update(pointer);
            }
        });

        // Debug: Log canvas position
        const canvas = this.game.canvas;
        const rect = canvas.getBoundingClientRect();
        console.log('Canvas position:', rect.left, rect.top, rect.width, rect.height);
    }

    spawnEnemy() {
        // Random x position between -300 and 300 (in Three.js coordinates)
        const x = (Math.random() * 600) - 300;
        const enemy = new Enemy(this, this.threeJSManager, x);
        this.enemies.push(enemy);
    }

    update(time) {
        // Scroll the background
        this.background.tilePositionY -= 2;

        // Update Three.js scene
        if (this.threeJSManager) {
            this.threeJSManager.update();
        }

        // Update player (for continuous shooting)
        if (this.player) {
            this.player.update(this.input.activePointer);
        }

        // Spawn enemies
        if (time - this.lastEnemySpawn >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawn = time;
        }

        // Update enemies and remove those that are off screen
        this.enemies = this.enemies.filter(enemy => {
            const isAlive = enemy.update(time);
            if (!isAlive) {
                enemy.destroy();
            }
            return isAlive;
        });

        // Clean up enemy bullets that are off screen
        if (this.enemyBullets) {
            this.enemyBullets.children.each(bullet => {
                if (bullet.y > 650) {
                    bullet.destroy();
                }
                
                // Ensure bullets are moving
                if (bullet.body && bullet.body.velocity.y < 10) {
                    bullet.body.velocity.y = 300;
                }
            });
        }

        // Check for collisions between player bullets and enemies
        if (this.player && this.player.bullets) {
            this.enemies.forEach(enemy => {
                this.physics.overlap(
                    this.player.bullets,
                    enemy.body,
                    (bullet, enemyBody) => this.handlePlayerBulletEnemyCollision(bullet, enemy),
                    null,
                    this
                );
            });
        }

        // Check for collisions between enemy bullets and player
        if (this.player && this.player.body) {
            this.physics.overlap(
                this.enemyBullets,
                this.player.body,
                this.handleEnemyBulletPlayerCollision,
                null,
                this
            );
        }
    }

    handlePlayerBulletEnemyCollision(bullet, enemy) {
        // Destroy the bullet
        bullet.destroy();
        
        // Remove the enemy
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
            enemy.destroy();
            console.log('Enemy destroyed by player bullet');
            
            // Increment score
            this.score += 10;
            // Update score text
            if (this.scoreText) {
                this.scoreText.setText('Score: ' + this.score);
            }
        }
    }

    handleEnemyBulletPlayerCollision(bullet, playerBody) {
        // Destroy the bullet
        bullet.destroy();
        
        // Reduce player health
        this.health -= 10;
        
        // Update health text
        if (this.healthText) {
            this.healthText.setText(`Health: ${this.health}`);
        }
        
        // Check for game over
        if (this.health <= 0) {
            this.gameOver();
        }
    }

    gameOver() {
        console.log('Game Over!');
        
        // Save high score to Firebase if user is authenticated
        if (this.currentUser && this.score > 0) {
            this.saveHighScore();
        }
        
        // Display game over text
        this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Add restart button
        const restartButton = this.add.text(400, 400, 'Play Again', {
            fontSize: '32px',
            fill: '#FFFFFF',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();
        
        // Add hover effect
        restartButton.on('pointerover', () => {
            restartButton.setStyle({ fill: '#ff0' });
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setStyle({ fill: '#FFFFFF' });
        });
        
        // Add click handler
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
        
        // Add main menu button
        const menuButton = this.add.text(400, 470, 'Main Menu', {
            fontSize: '32px',
            fill: '#FFFFFF',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();
        
        // Add hover effect
        menuButton.on('pointerover', () => {
            menuButton.setStyle({ fill: '#ff0' });
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setStyle({ fill: '#FFFFFF' });
        });
        
        // Add click handler
        menuButton.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        // Stop the game
        this.scene.pause();
    }
    
    saveHighScore() {
        if (!this.currentUser || !firebaseManager.db) {
            console.error('Cannot save score: User not authenticated or database not available');
            return;
        }
        
        const userId = this.currentUser.uid;
        const userScoreRef = firebaseManager.db.ref(`users/${userId}`);
        
        // First get the current high score
        userScoreRef.once('value')
            .then((snapshot) => {
                const userData = snapshot.val() || {};
                const currentHighScore = userData.highScore || 0;
                
                // Only update if the new score is higher
                if (this.score > currentHighScore) {
                    return userScoreRef.update({
                        highScore: this.score,
                        lastPlayed: new Date().toISOString()
                    });
                }
                
                return Promise.resolve();
            })
            .then(() => {
                console.log('High score saved successfully');
            })
            .catch((error) => {
                console.error('Error saving high score:', error);
            });
    }

    destroy() {
        // Clean up enemies
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];

        // Clean up all enemy bullets
        if (this.enemyBullets) {
            this.enemyBullets.clear(true, true);
        }

        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        if (this.threeJSManager) {
            this.threeJSManager.destroy();
            this.threeJSManager = null;
        }
        super.destroy();
    }
} 