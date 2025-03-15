import { Scene } from 'phaser';
import ThreeJSManager from '../utils/ThreeJSManager.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import firebaseManager from '../utils/FirebaseManager.js';

export default class GameplayScene extends Scene {
    constructor() {
        super({ key: 'GameplayScene' });
        this.threeManager = null;
        this.background = null;
        this.player = null;
        this.isPointerDown = false;
        this.enemies = [];
        this.lastEnemySpawn = 0;
        this.enemySpawnInterval = 1500; // Reduced from 3000 to 1500 (spawn enemy every 1.5 seconds)
        this.enemyBullets = null; // Group for enemy bullets
        this.health = 100; // Player health
        this.score = 0; // Initialize score
        this.scoreText = null; // Text object to display score
        this.healthText = null; // Text object to display health
        this.currentUser = null;
        this.damageFlash = null; // Reference to the damage flash overlay
        this.debugMode = true; // Enable debug mode
    }

    debugLog(message) {
        if (this.debugMode) {
            console.log(`[GameplayScene Debug] ${message}`);
        }
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
        try {
            this.debugLog("Creating GameplayScene");
            
            // Initialize ThreeJS Manager
            this.threeManager = new ThreeJSManager(this.game.canvas);
            this.debugLog("ThreeJSManager initialized");
            
            // Create a tiled background
            this.background = this.add.tileSprite(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                'background'
            );
            
            // If the background texture doesn't exist, create a simple one
            if (!this.textures.exists('background')) {
                const graphics = this.add.graphics();
                graphics.fillGradientStyle(0x000033, 0x000033, 0x000066, 0x000066);
                graphics.fillRect(0, 0, 256, 256);
                
                // Add some stars
                for (let i = 0; i < 100; i++) {
                    const x = Math.random() * 256;
                    const y = Math.random() * 256;
                    const size = Math.random() * 2 + 1;
                    graphics.fillStyle(0xffffff, Math.random() * 0.5 + 0.5);
                    graphics.fillCircle(x, y, size);
                }
                
                graphics.generateTexture('background', 256, 256);
                graphics.destroy();
                
                // Update the background with the new texture
                this.background.setTexture('background');
            }
            
            // Create player at the center bottom of the screen
            const centerX = this.cameras.main.width / 2;
            const centerY = this.cameras.main.height - 100;
            this.player = new Player(this, centerX, centerY);
            this.debugLog(`Player created at (${centerX}, ${centerY})`);
            
            // Initialize enemy bullets group
            this.enemyBullets = this.physics.add.group();
            this.debugLog("Enemy bullets group initialized");
            
            // Add UI elements
            this.createUI();
            
            // Set up input handling
            this.input.on('pointerdown', (pointer) => {
                try {
                    this.debugLog(`Pointer down at: ${pointer.x}, ${pointer.y}`);
                    this.isPointerDown = true;
                    
                    // Move player to pointer position on click
                    if (this.player) {
                        this.player.moveToPointer(pointer);
                    }
                } catch (error) {
                    console.error("Error in pointerdown handler:", error);
                }
            });
            
            this.input.on('pointermove', (pointer) => {
                try {
                    // Only move if pointer is down (dragging)
                    if (this.isPointerDown && this.player) {
                        this.debugLog(`Pointer move while down at: ${pointer.x}, ${pointer.y}`);
                        this.player.moveToPointer(pointer);
                    }
                } catch (error) {
                    console.error("Error in pointermove handler:", error);
                }
            });
            
            this.input.on('pointerup', (pointer) => {
                try {
                    this.debugLog(`Pointer up at: ${pointer.x}, ${pointer.y}`);
                    this.isPointerDown = false;
                } catch (error) {
                    console.error("Error in pointerup handler:", error);
                }
            });
            
            // Handle pointer leaving the game canvas
            this.input.on('pointerout', (pointer) => {
                try {
                    this.debugLog(`Pointer left game canvas`);
                    this.isPointerDown = false;
                } catch (error) {
                    console.error("Error in pointerout handler:", error);
                }
            });
            
            this.debugLog("GameplayScene creation complete");
        } catch (error) {
            console.error("Error in create method:", error);
        }
    }

    createUI() {
        try {
            // Create UI container
            this.uiContainer = this.add.container(0, 0);
            this.uiContainer.setDepth(100); // Ensure UI is on top
            
            // Add score text
            this.scoreText = this.add.text(16, 16, 'Score: 0', {
                fontSize: '24px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
            this.uiContainer.add(this.scoreText);
            
            // Add health text
            this.healthText = this.add.text(16, 50, 'Health: 100', {
                fontSize: '24px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            });
            this.uiContainer.add(this.healthText);
            
            // Add user info if available
            if (this.currentUser) {
                const username = this.currentUser.displayName || this.currentUser.email || 'Player';
                this.userText = this.add.text(this.cameras.main.width - 16, 16, `User: ${username}`, {
                    fontSize: '18px',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 3
                });
                this.userText.setOrigin(1, 0); // Align right
                this.uiContainer.add(this.userText);
            }
            
            // Add damage flash overlay
            this.damageFlash = this.add.rectangle(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                0xff0000
            );
            this.damageFlash.setAlpha(0);
            this.uiContainer.add(this.damageFlash);
        } catch (error) {
            console.error("Error in createUI:", error);
        }
    }

    spawnEnemy() {
        try {
            // Check if threeManager exists
            if (!this.threeManager) {
                this.debugLog("Cannot spawn enemy: threeManager is null");
                return;
            }
            
            // Random x position between -300 and 300 (in Three.js coordinates)
            const x = (Math.random() * 600) - 300;
            
            // Create enemy
            const enemy = new Enemy(this, this.threeManager, x);
            
            // Add to enemies array
            if (enemy) {
                this.enemies.push(enemy);
                this.debugLog(`Enemy spawned at x: ${x}`);
            }
        } catch (error) {
            console.error("Error in spawnEnemy:", error);
        }
    }

    update() {
        try {
            // Get the current time
            const time = this.time.now;
            
            // Update the ThreeJS manager
            if (this.threeManager) {
                this.threeManager.update();
            } else {
                this.debugLog("ThreeManager is null in update");
            }
            
            // Update player if it exists
            if (this.player) {
                // Just update the player without passing pointer
                // Pointer movement is handled by event handlers
                this.player.update();
            } else {
                this.debugLog("Player is null in update");
            }

            // Scroll the background
            if (this.background) {
                this.background.tilePositionY -= 2;
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
        } catch (error) {
            console.error("Error in update method:", error);
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
            
            // Check for victory condition (score of 100)
            if (this.score >= 100) {
                this.victory();
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
            
            // Add visual feedback for damage
            this.healthText.setStyle({ 
                fill: '#FF0000',
                stroke: '#000000',
                strokeThickness: 4
            });
            
            // Reset color after a short delay
            this.time.delayedCall(300, () => {
                if (this.healthText) {
                    this.healthText.setStyle({ 
                        fill: '#FFFFFF',
                        stroke: '#000000',
                        strokeThickness: 4
                    });
                }
            });
        }
        
        // Flash the player model red to indicate damage
        if (this.player && this.player.model) {
            // Store original color
            const originalColor = this.player.model.material.color.getHex();
            
            // Set to red
            this.player.model.material.color.setHex(0xff0000);
            
            // Reset after a short delay
            this.time.delayedCall(200, () => {
                if (this.player && this.player.model) {
                    this.player.model.material.color.setHex(originalColor);
                }
            });
        }
        
        // Screen flash effect
        if (this.damageFlash) {
            this.damageFlash.setAlpha(0.3);
            this.tweens.add({
                targets: this.damageFlash,
                alpha: 0,
                duration: 200,
                ease: 'Power2'
            });
        }
        
        // Check for game over
        if (this.health <= 0) {
            this.gameOver();
        }
    }

    // Add a method to clean up all game elements
    cleanupGameElements() {
        // Clean up enemies
        this.enemies.forEach(enemy => enemy.destroy());
        this.enemies = [];
        
        // Clean up all enemy bullets
        if (this.enemyBullets) {
            this.enemyBullets.clear(true, true);
        }
        
        // Clean up player bullets
        if (this.player && this.player.bullets) {
            this.player.bullets.clear(true, true);
        }
        
        // Stop player shooting
        if (this.player) {
            this.player.stopShooting = true;
        }
    }

    // Override the scene's shutdown method to ensure cleanup
    shutdown() {
        this.cleanupGameElements();
        super.shutdown();
    }

    // Update the scene start methods to ensure cleanup
    startLeaderboard() {
        this.cleanupGameElements();
        this.scene.start('LeaderboardScene');
    }
    
    startMainMenu() {
        this.cleanupGameElements();
        this.scene.start('MainMenuScene');
    }
    
    restartGame() {
        this.cleanupGameElements();
        this.scene.restart();
    }

    gameOver() {
        console.log('Game Over!');
        
        // Save high score to Firebase if user is authenticated
        if (this.currentUser && this.score > 0) {
            this.saveHighScore();
        }
        
        // Clean up game elements
        this.cleanupGameElements();
        
        // Create a semi-transparent overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        
        // Create a container for game over UI
        const gameOverContainer = this.add.container(0, 0);
        
        // Display game over text
        gameOverContainer.add(this.add.text(400, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#FF0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5));
        
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
            this.restartGame();
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
            this.startMainMenu();
        });
        
        // Add buttons to container
        gameOverContainer.add(restartButton);
        gameOverContainer.add(menuButton);
        
        // Bring container to top to ensure buttons are clickable
        gameOverContainer.setDepth(1000);
        overlay.setDepth(999);
    }
    
    victory() {
        console.log('Victory!');
        
        // Clean up game elements
        this.cleanupGameElements();
        
        // Create a semi-transparent overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        
        // Create a container for victory UI
        const victoryContainer = this.add.container(0, 0);
        
        // Display victory text
        victoryContainer.add(this.add.text(400, 150, 'VICTORY!', {
            fontSize: '64px',
            fill: '#00FF00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5));
        
        // Display score
        victoryContainer.add(this.add.text(400, 220, `Final Score: ${this.score}`, {
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5));
        
        // Create name input field
        this.createNameInput();
        
        // Add leaderboard button
        const leaderboardButton = this.add.text(400, 400, 'View Leaderboard', {
            fontSize: '32px',
            fill: '#FFFFFF',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();
        
        // Add hover effect
        leaderboardButton.on('pointerover', () => {
            leaderboardButton.setStyle({ fill: '#ff0' });
        });
        
        leaderboardButton.on('pointerout', () => {
            leaderboardButton.setStyle({ fill: '#FFFFFF' });
        });
        
        // Add click handler
        leaderboardButton.on('pointerdown', () => {
            this.startLeaderboard();
        });
        
        // Add play again button
        const restartButton = this.add.text(400, 470, 'Play Again', {
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
            this.saveHighScore();
            this.cleanupNameInput();
            this.restartGame();
        });
        
        // Add main menu button
        const menuButton = this.add.text(400, 540, 'Main Menu', {
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
            this.saveHighScore();
            this.cleanupNameInput();
            this.startMainMenu();
        });
        
        // Add all buttons to the container
        victoryContainer.add(leaderboardButton);
        victoryContainer.add(restartButton);
        victoryContainer.add(menuButton);
        
        // Bring container to top to ensure buttons are clickable
        victoryContainer.setDepth(1000);
    }
    
    createNameInput() {
        // Create a label for the input field
        const nameLabel = document.createElement('div');
        nameLabel.textContent = 'Enter your name for the leaderboard:';
        nameLabel.style.position = 'absolute';
        nameLabel.style.top = '280px';
        nameLabel.style.left = '50%';
        nameLabel.style.transform = 'translateX(-50%)';
        nameLabel.style.color = 'white';
        nameLabel.style.fontFamily = 'Arial';
        nameLabel.style.fontSize = '20px';
        nameLabel.style.textAlign = 'center';
        
        // Create the input field
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'player-name-input';
        nameInput.style.position = 'absolute';
        nameInput.style.top = '320px';
        nameInput.style.left = '50%';
        nameInput.style.transform = 'translateX(-50%)';
        nameInput.style.width = '300px';
        nameInput.style.padding = '10px';
        nameInput.style.fontSize = '18px';
        nameInput.style.borderRadius = '5px';
        nameInput.style.border = '2px solid #4CAF50';
        nameInput.style.textAlign = 'center';
        
        // Set default value to current user's display name or email if available
        if (this.currentUser) {
            nameInput.value = this.currentUser.displayName || this.currentUser.email || '';
        }
        
        // Add elements to the DOM
        document.body.appendChild(nameLabel);
        document.body.appendChild(nameInput);
        
        // Store references for cleanup
        this.nameLabel = nameLabel;
        this.nameInput = nameInput;
    }
    
    cleanupNameInput() {
        // Remove the name input elements from the DOM
        if (this.nameLabel && this.nameLabel.parentNode) {
            this.nameLabel.parentNode.removeChild(this.nameLabel);
        }
        
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.parentNode.removeChild(this.nameInput);
        }
    }
    
    saveHighScore() {
        if (!this.currentUser || !firebaseManager.db) {
            console.error('Cannot save score: User not authenticated or database not available');
            return;
        }
        
        const userId = this.currentUser.uid;
        
        // Get the player name from the input field
        let displayName = 'Anonymous';
        if (this.nameInput && this.nameInput.value.trim()) {
            displayName = this.nameInput.value.trim();
        }
        
        // Use the FirebaseManager's saveHighScore method with the display name
        firebaseManager.saveHighScoreWithName(userId, this.score, displayName)
            .then((updated) => {
                if (updated) {
                    console.log('High score updated successfully');
                } else {
                    console.log('Score not high enough to update high score');
                }
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
        if (this.threeManager) {
            this.threeManager.destroy();
            this.threeManager = null;
        }
        super.destroy();
    }
} 