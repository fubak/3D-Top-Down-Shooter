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
        this.gameIsOver = false; // Added to track game over state
    }

    debugLog(message) {
        if (this.debugMode) {
            console.log(`[GameplayScene Debug] ${message}`);
        }
    }

    init(data) {
        // Receive data from previous scene
        if (data && data.currentUser) {
            this.currentUser = data.currentUser;
            this.debugLog(`Received user from previous scene: ${this.currentUser.uid}`);
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
            
            // Get the current user from Firebase
            this.currentUser = firebaseManager.getCurrentUser();
            this.debugLog(this.currentUser ? `User authenticated: ${this.currentUser.uid}` : "No authenticated user");
            
            // Initialize ThreeJS Manager
            this.threeManager = new ThreeJSManager(this.game.canvas);
            this.debugLog("ThreeJSManager initialized");
            
            // Create a static background using the SeagullThor image
            this.background = this.add.image(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                'background'
            );
            
            // Maintain aspect ratio, fit width to canvas, and center vertically
            const scaleX = this.cameras.main.width / this.background.width;
            this.background.setScale(scaleX);
            
            // Center the image vertically
            this.background.y = this.cameras.main.height / 2;
            
            // Create a scrolling starfield layer above the background
            this.createStarfield();
            
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

    createStarfield() {
        try {
            this.debugLog("Creating starfield");
            
            // Create a new graphics object for the starfield
            const starfieldGraphics = this.add.graphics();
            
            // Create a texture for the starfield
            starfieldGraphics.fillStyle(0x000000, 0); // Transparent background
            starfieldGraphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
            
            // Generate random stars with different sizes and brightness
            // Reduce number of stars for less density
            const numStars = 100; // Reduced from 200
            
            for (let i = 0; i < numStars; i++) {
                const x = Math.random() * this.cameras.main.width;
                const y = Math.random() * this.cameras.main.height;
                
                // Make stars smaller
                const size = Math.random() * 1.2 + 0.3; // Smaller size range (0.3 to 1.5)
                
                // More varied brightness with some very dim stars for realism
                const brightness = Math.random() * Math.random() * 0.7 + 0.3; // Non-linear distribution favoring dimmer stars
                
                // More realistic star colors (mostly white/blue with occasional yellow/red for distant stars)
                // Realistic space colors with proper distribution
                let color;
                const colorRoll = Math.random();
                if (colorRoll < 0.7) {
                    // Majority are white to slightly blue-white (main sequence stars)
                    color = 0xf8f8ff; // White with slight blue tint
                } else if (colorRoll < 0.85) {
                    // Some are slightly yellow (G-type stars like our sun)
                    color = 0xfff8e0;
                } else if (colorRoll < 0.95) {
                    // Few are blue (hot, young stars)
                    color = 0xe0e8ff;
                } else {
                    // Very few are reddish (red giants, distant stars)
                    color = 0xffe0e0;
                }
                
                starfieldGraphics.fillStyle(color, brightness);
                starfieldGraphics.fillCircle(x, y, size);
            }
            
            // Generate the texture
            starfieldGraphics.generateTexture('starfield', this.cameras.main.width, this.cameras.main.height);
            starfieldGraphics.destroy();
            
            // Create a tileSprite using the generated texture
            this.starfield = this.add.tileSprite(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                this.cameras.main.width,
                this.cameras.main.height,
                'starfield'
            );
            
            // Set the starfield to be above the background
            this.starfield.setDepth(1);
            
            this.debugLog("Starfield created successfully");
        } catch (error) {
            console.error("Error creating starfield:", error);
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
            // Skip update if game is over or victory has been achieved
            if (!this.player || this.gameIsOver) {
                return;
            }
            
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
                return; // Exit early if player doesn't exist
            }

            // Scroll the starfield (not the background)
            if (this.starfield) {
                this.starfield.tilePositionY -= 2;
            }

            // Spawn enemies
            if (time - this.lastEnemySpawn >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.lastEnemySpawn = time;
            }

            // Update enemies and remove those that are off screen
            if (this.enemies && this.enemies.length > 0) {
                this.enemies = this.enemies.filter(enemy => {
                    if (!enemy) return false;
                    const isAlive = enemy.update(time);
                    if (!isAlive) {
                        enemy.destroy();
                    }
                    return isAlive;
                });
            }

            // Clean up enemy bullets that are off screen
            if (this.enemyBullets && this.enemyBullets.children) {
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
            if (this.player && this.player.bullets && this.enemies && this.enemies.length > 0) {
                this.enemies.forEach(enemy => {
                    if (!enemy || !enemy.body) return;
                    
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
            if (this.player && this.player.body && this.enemyBullets) {
                // Make sure player body is active and visible
                if (this.player.body) {
                    this.player.body.active = true;
                    this.player.body.enable = true;
                    
                    // Debug logging for player body
                    console.log(`Player body status - Active: ${this.player.body.active}, Enabled: ${this.player.body.enable}, Position: (${this.player.body.x}, ${this.player.body.y}), Health: ${this.player.health}`);
                }
                
                // Debug logging for enemy bullets
                const activeBullets = this.enemyBullets.getChildren().filter(bullet => bullet.active);
                console.log(`Active enemy bullets: ${activeBullets.length}`);
                
                // Use Phaser's built-in physics overlap for collision detection
                this.physics.overlap(
                    this.enemyBullets,
                    this.player.body,
                    (bullet, playerBody) => {
                        // Log collision for debugging
                        console.log("Physics overlap detected: Enemy bullet hit player!");
                        this.handleEnemyBulletPlayerCollision(bullet, playerBody);
                    },
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
            // Get the enemy's position before destroying it
            const enemyPosition = {
                x: enemy.model.position.x,
                y: enemy.model.position.y,
                z: enemy.model.position.z
            };
            
            // Remove from array and destroy
            this.enemies.splice(index, 1);
            enemy.destroy();
            console.log('Enemy destroyed by player bullet');
            
            // Create explosion effect at the enemy's position
            if (this.threeManager) {
                this.threeManager.createExplosion(
                    enemyPosition.x,
                    enemyPosition.y,
                    enemyPosition.z,
                    {
                        particleCount: 40,
                        colors: [0xff4500, 0xff6000, 0xff7f00, 0xffbf00]
                    }
                );
            }
            
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
        // Prevent processing the same bullet twice
        if (!bullet || !bullet.active) {
            return;
        }
        
        // Destroy the bullet
        bullet.destroy();
        
        // Log collision for debugging
        console.log("Enemy bullet hit player!");
        
        // Reduce player health using the player's takeDamage method
        if (this.player) {
            // Log player health before damage
            console.log(`Before takeDamage: Player health = ${this.player.health}, Scene health = ${this.health}`);
            
            this.player.takeDamage(10);
            
            // Update our local health tracking to match the player's health
            this.health = this.player.health;
            
            // Log player health after damage
            console.log(`After takeDamage: Player health = ${this.player.health}, Scene health = ${this.health}`);
        } else {
            // Fallback if player reference is missing
            this.health -= 10;
            console.log(`Fallback damage: Scene health = ${this.health}`);
        }
        
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
        
        // Flash the player model red to indicate damage is now handled by the player's takeDamage method
        
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
        if (this.enemies && this.enemies.length > 0) {
            console.log(`Cleaning up ${this.enemies.length} enemies`);
            this.enemies.forEach(enemy => {
                if (enemy) enemy.destroy();
            });
            this.enemies = [];
        }
        
        // Clean up all enemy bullets
        if (this.enemyBullets) {
            console.log("Cleaning up enemy bullets");
            this.enemyBullets.clear(true, true);
        }
        
        // Clean up player bullets
        if (this.player && this.player.bullets) {
            console.log("Cleaning up player bullets");
            this.player.bullets.clear(true, true);
        }
        
        // Stop player shooting
        if (this.player) {
            console.log("Stopping player shooting");
            this.player.stopShooting = true;
            
            // Destroy the player object
            this.player.destroy();
            this.player = null;
        }
        
        // Clear any active tweens
        this.tweens.killAll();
        
        // Clear any active timers
        this.time.removeAllEvents();
        
        // Clear any physics bodies
        this.physics.world.colliders.destroy();
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
        
        // Set flag to indicate game is over
        this.gameIsOver = true;
        
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
        
        // Set a flag to indicate game is over
        this.gameIsOver = true;
        
        // Clean up game elements thoroughly
        this.cleanupGameElements();
        
        // Additional cleanup to ensure everything is removed
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }
        
        if (this.threeManager) {
            this.threeManager.clear(); // Clear all 3D objects
        }
        
        // Create a semi-transparent overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        overlay.setDepth(999);
        
        // Create a container for victory UI
        const victoryContainer = this.add.container(0, 0);
        victoryContainer.setDepth(1000);
        
        // Display victory text
        victoryContainer.add(this.add.text(400, 120, 'VICTORY!', {
            fontSize: '64px',
            fill: '#00FF00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5));
        
        // Display score
        victoryContainer.add(this.add.text(400, 190, `Final Score: ${this.score}`, {
            fontSize: '32px',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5));
        
        // Create name input field (positioned higher)
        this.createNameInput();
        
        // Add buttons in a better layout
        // Leaderboard button
        const leaderboardButton = this.add.text(400, 420, 'View Leaderboard', {
            fontSize: '28px',
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
        const restartButton = this.add.text(250, 490, 'Play Again', {
            fontSize: '28px',
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
        const menuButton = this.add.text(550, 490, 'Main Menu', {
            fontSize: '28px',
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
    }
    
    createNameInput() {
        // Clean up any existing name input first
        this.cleanupNameInput();
        
        // Create container for name input
        const nameInputContainer = document.createElement('div');
        nameInputContainer.style.position = 'absolute';
        nameInputContainer.style.top = '230px';
        nameInputContainer.style.left = '50%';
        nameInputContainer.style.transform = 'translateX(-50%)';
        nameInputContainer.style.display = 'flex';
        nameInputContainer.style.flexDirection = 'column';
        nameInputContainer.style.alignItems = 'center';
        nameInputContainer.style.zIndex = '1001'; // Higher than other UI elements
        
        // Create label
        const nameLabel = document.createElement('div');
        nameLabel.textContent = 'Enter Your Name:';
        nameLabel.style.color = 'white';
        nameLabel.style.fontFamily = 'Arial';
        nameLabel.style.fontSize = '20px';
        nameLabel.style.marginBottom = '10px';
        nameLabel.style.textShadow = '2px 2px 2px black';
        
        // Create the input field
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'player-name-input';
        nameInput.style.width = '300px';
        nameInput.style.padding = '10px';
        nameInput.style.fontSize = '18px';
        nameInput.style.borderRadius = '5px';
        nameInput.style.border = '2px solid #4CAF50';
        nameInput.style.textAlign = 'center';
        nameInput.style.marginBottom = '10px';
        nameInput.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
        
        // Create save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Name';
        saveButton.style.padding = '8px 20px';
        saveButton.style.fontSize = '16px';
        saveButton.style.backgroundColor = '#4CAF50';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';
        saveButton.style.marginTop = '10px';
        saveButton.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
        
        // Add click handler for save button
        saveButton.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
                this.saveNameAndScore(name);
            } else {
                alert('Please enter a name');
            }
        });
        
        // Add elements to the container
        nameInputContainer.appendChild(nameLabel);
        nameInputContainer.appendChild(nameInput);
        nameInputContainer.appendChild(saveButton);
        
        // Add container to the DOM
        document.body.appendChild(nameInputContainer);
        
        // Store references for cleanup
        this.nameInputContainer = nameInputContainer;
        this.nameInput = nameInput;
        
        // Focus the input field
        nameInput.focus();
    }
    
    saveNameAndScore(name) {
        if (name && name.trim()) {
            // Check if we have a current user, if not try to get it again
            if (!this.currentUser) {
                this.currentUser = firebaseManager.getCurrentUser();
                console.log("Re-checking authentication status:", this.currentUser ? "Authenticated" : "Not authenticated");
            }
            
            // Save the name immediately
            const userId = this.currentUser ? this.currentUser.uid : null;
            if (userId) {
                console.log(`Saving name "${name}" for user ${userId}`);
                
                // Update the display name in Firebase
                firebaseManager.updateUserDisplayName(userId, name)
                    .then(() => {
                        console.log('Display name updated successfully');
                        
                        // Save high score with the name
                        return firebaseManager.saveHighScoreWithName(userId, this.score, name);
                    })
                    .then(() => {
                        console.log('High score saved successfully');
                        
                        // Clean up the input field
                        this.cleanupNameInput();
                        
                        // Show the leaderboard
                        this.displayLeaderboard();
                    })
                    .catch(error => {
                        console.error('Error saving name or score:', error);
                        alert('Error saving your name. Please try again.');
                    });
            } else {
                console.error('Cannot save name: User not authenticated');
                alert('You must be logged in to save your name. Please return to the main menu and log in.');
                
                // Add a button to return to main menu
                this.addReturnToMenuButton();
            }
        } else {
            alert('Please enter a valid name');
        }
    }
    
    addReturnToMenuButton() {
        // Create a button to return to main menu
        const menuButton = this.add.text(400, 350, 'Return to Main Menu to Log In', {
            fontSize: '24px',
            fill: '#FFFFFF',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(2000);
        
        // Add hover effect
        menuButton.on('pointerover', () => {
            menuButton.setStyle({ fill: '#ff0' });
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setStyle({ fill: '#FFFFFF' });
        });
        
        // Add click handler
        menuButton.on('pointerdown', () => {
            this.cleanupNameInput();
            this.startMainMenu();
        });
    }
    
    displayLeaderboard() {
        // Create a semi-transparent overlay for the leaderboard
        const leaderboardOverlay = this.add.rectangle(400, 300, 600, 400, 0x000033, 0.9);
        leaderboardOverlay.setStrokeStyle(2, 0x4444ff);
        leaderboardOverlay.setDepth(1001);
        
        // Create a container for the leaderboard
        const leaderboardContainer = this.add.container(0, 0);
        leaderboardContainer.setDepth(1002);
        
        // Add title
        const title = this.add.text(400, 150, 'LEADERBOARD', {
            fontSize: '32px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        leaderboardContainer.add(title);
        
        // Add loading text
        const loadingText = this.add.text(400, 300, 'Loading leaderboard...', {
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        leaderboardContainer.add(loadingText);
        
        // Fetch leaderboard data
        firebaseManager.getLeaderboard(10)
            .then(leaderboardData => {
                // Remove loading text
                loadingText.destroy();
                
                if (leaderboardData.length === 0) {
                    const noScoresText = this.add.text(400, 300, 'No scores yet. Be the first!', {
                        fontSize: '20px',
                        fill: '#ffffff'
                    }).setOrigin(0.5);
                    leaderboardContainer.add(noScoresText);
                } else {
                    // Create header
                    const rankHeader = this.add.text(200, 200, 'Rank', {
                        fontSize: '22px',
                        fill: '#ffff00'
                    }).setOrigin(0.5);
                    
                    const nameHeader = this.add.text(350, 200, 'Player', {
                        fontSize: '22px',
                        fill: '#ffff00'
                    }).setOrigin(0.5);
                    
                    const scoreHeader = this.add.text(500, 200, 'Score', {
                        fontSize: '22px',
                        fill: '#ffff00'
                    }).setOrigin(0.5);
                    
                    leaderboardContainer.add(rankHeader);
                    leaderboardContainer.add(nameHeader);
                    leaderboardContainer.add(scoreHeader);
                    
                    // Display entries
                    const startY = 240;
                    const spacing = 30;
                    
                    leaderboardData.forEach((entry, index) => {
                        // Highlight current user
                        const isCurrentUser = this.currentUser && entry.userId === this.currentUser.uid;
                        const textColor = isCurrentUser ? '#4CAF50' : '#ffffff';
                        
                        // Rank with medal for top 3
                        let rankText = `${index + 1}`;
                        let rankColor = textColor;
                        
                        if (index === 0) {
                            rankText = '🥇 ' + rankText;
                            rankColor = '#FFD700'; // Gold
                        } else if (index === 1) {
                            rankText = '🥈 ' + rankText;
                            rankColor = '#C0C0C0'; // Silver
                        } else if (index === 2) {
                            rankText = '🥉 ' + rankText;
                            rankColor = '#CD7F32'; // Bronze
                        }
                        
                        const rank = this.add.text(200, startY + index * spacing, rankText, {
                            fontSize: '20px',
                            fill: rankColor
                        }).setOrigin(0.5);
                        
                        const name = this.add.text(350, startY + index * spacing, entry.displayName || 'Anonymous', {
                            fontSize: '20px',
                            fill: textColor
                        }).setOrigin(0.5);
                        
                        const score = this.add.text(500, startY + index * spacing, entry.highScore.toString(), {
                            fontSize: '20px',
                            fill: textColor
                        }).setOrigin(0.5);
                        
                        leaderboardContainer.add(rank);
                        leaderboardContainer.add(name);
                        leaderboardContainer.add(score);
                    });
                }
                
                // Add close button
                const closeButton = this.add.text(400, 450, 'Close', {
                    fontSize: '24px',
                    fill: '#ffffff',
                    backgroundColor: '#4a4a4a',
                    padding: { x: 20, y: 10 }
                })
                .setOrigin(0.5)
                .setInteractive();
                
                // Add hover effect
                closeButton.on('pointerover', () => {
                    closeButton.setStyle({ fill: '#ff0' });
                });
                
                closeButton.on('pointerout', () => {
                    closeButton.setStyle({ fill: '#ffffff' });
                });
                
                // Add click handler
                closeButton.on('pointerdown', () => {
                    leaderboardContainer.destroy();
                    leaderboardOverlay.destroy();
                });
                
                leaderboardContainer.add(closeButton);
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
                loadingText.setText('Error loading leaderboard. Please try again.');
            });
    }
    
    cleanupNameInput() {
        // Remove the name input elements from the DOM
        if (this.nameInputContainer && this.nameInputContainer.parentNode) {
            this.nameInputContainer.parentNode.removeChild(this.nameInputContainer);
            this.nameInputContainer = null; // Clear the reference
        }
        
        // Also check for any orphaned elements with this ID
        const existingInputs = document.querySelectorAll('#player-name-input');
        existingInputs.forEach(input => {
            if (input.parentNode) {
                input.parentNode.removeChild(input);
            }
        });
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