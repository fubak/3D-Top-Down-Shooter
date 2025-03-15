import { Scene } from 'phaser';
import ThreeJSManager from '../utils/ThreeJSManager.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

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
        }
    }

    handleEnemyBulletPlayerCollision(bullet, playerBody) {
        // Destroy the bullet
        bullet.destroy();
        
        // Damage the player
        this.playerHealth -= 10;
        console.log('Player hit! Health:', this.playerHealth);
        
        // Check if player is defeated
        if (this.playerHealth <= 0) {
            console.log('Player defeated!');
            // For now, just log the defeat. In a full game, we would handle game over here.
        }
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