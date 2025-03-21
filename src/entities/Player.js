import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default class Player {
    constructor(scene, x, y) {
        try {
            this.debugMode = true; // Enable debug mode
            this.debugLog("Initializing Player");
            
            this.scene = scene;
            this.threeManager = scene.threeManager;
            
            // Store initial position in Phaser coordinates
            this.x = x;
            this.y = y;
            
            // Convert initial position to Three.js coordinates
            const threeCoords = this.threeManager.convertPhaserToThreeCoords(x, y);
            this.debugLog(`Initial position - Phaser: (${x}, ${y}), Three.js: (${threeCoords.x}, ${threeCoords.y})`);
            
            // Set up player properties
            this.speed = 10;
            this.health = 100;
            this.isAlive = true;
            this.isMoving = false;
            
            // Create bullet group
            this.bullets = this.scene.physics.add.group();
            this.lastFired = 0;
            this.fireRate = 200; // ms between shots
            
            // Create physics body for collision detection (same size as enemy ships)
            this.body = scene.physics.add.sprite(x, y, 'bullet');
            this.body.setVisible(false); // Hide the sprite since we're using 3D model
            this.body.setCircle(15); // Larger collision circle for better detection
            this.body.setCollideWorldBounds(true); // Keep player within game bounds
            this.body.setBounce(0); // No bounce
            this.body.setImmovable(false); // Allow movement
            
            // Debug logging for physics body
            console.log(`Player physics body created at (${x}, ${y}) with radius 15`);
            
            // Load the GLTF model instead of creating a temporary model
            this.loadPlayerModel();
            
            // Set up input handling - we'll let the scene handle this now
            // The scene will call moveToPointer when needed
            
            this.debugLog("Player initialization complete");
        } catch (error) {
            console.error("Error in Player constructor:", error);
        }
    }
    
    debugLog(message) {
        if (this.debugMode) {
            console.log(`[Player Debug] ${message}`);
        }
    }
    
    loadPlayerModel() {
        try {
            this.debugLog("Loading player GLTF model");
            
            // Create a temporary model while the GLTF is loading
            this.createTemporaryModel();
            
            // Path to the GLTF model
            const modelPath = 'assets/models/low_poly_space_ship/scene.gltf';
            
            // Use the global GLTFLoader since it's loaded via script tag
            const loader = new GLTFLoader();
            loader.load(
                modelPath,
                (gltf) => {
                    this.debugLog("GLTF model loaded successfully");
                    
                    // Remove the temporary model if it exists
                    if (this.model) {
                        this.threeManager.remove(this.model);
                    }
                    
                    // Get the model from the loaded GLTF
                    this.model = gltf.scene;
                    
                    // Scale the model appropriately (smaller than before)
                    this.model.scale.set(15, 15, 15);
                    
                    // Rotate the model to point towards the top of the screen
                    this.model.rotation.x = -Math.PI / 2; // -90 degrees around X axis (instead of 90)
                    this.model.rotation.y = 0;
                    this.model.rotation.z = Math.PI; // 180 degrees around Z axis to flip it right-side up
                    
                    // Position the model at the player's position
                    const threeCoords = this.threeManager.convertPhaserToThreeCoords(this.x, this.y);
                    this.model.position.set(threeCoords.x, threeCoords.y, 0);
                    
                    // Add the model to the scene
                    this.threeManager.add(this.model);
                    
                    this.debugLog(`GLTF model added to scene at position: ${threeCoords.x}, ${threeCoords.y}, 0`);
                },
                (progress) => {
                    if (progress.lengthComputable) {
                        const percentComplete = (progress.loaded / progress.total) * 100;
                        this.debugLog(`Model loading progress: ${Math.round(percentComplete)}%`);
                    }
                },
                (error) => {
                    console.error("Error loading GLTF model:", error);
                    this.debugLog("Failed to load GLTF model, using temporary model instead");
                }
            );
        } catch (error) {
            console.error("Error in loadPlayerModel:", error);
            this.debugLog("Error loading GLTF model, using temporary model instead");
        }
    }
    
    createTemporaryModel() {
        try {
            this.debugLog("Creating temporary player model");
            
            // Create a simple ship model
            const geometry = new THREE.ConeGeometry(15, 30, 3);
            geometry.rotateX(Math.PI); // Rotate to point forward
            
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x3333ff,
                emissive: 0x111133,
                specular: 0x111111,
                shininess: 30
            });
            
            this.model = new THREE.Mesh(geometry, material);
            
            // Convert initial Phaser coordinates to Three.js coordinates
            const threeCoords = this.threeManager.convertPhaserToThreeCoords(this.x, this.y);
            
            // Set the model's position
            this.model.position.set(threeCoords.x, threeCoords.y, 0);
            
            // Add to the Three.js scene
            this.threeManager.add(this.model);
            
            this.debugLog(`Temporary model created at position: ${this.model.position.x}, ${this.model.position.y}, ${this.model.position.z}`);
        } catch (error) {
            console.error("Error creating temporary player model:", error);
        }
    }
    
    onPointerDown(pointer) {
        try {
            if (!pointer) {
                this.debugLog("Error: Pointer is undefined in onPointerDown");
                return;
            }
            
            this.debugLog(`Pointer down at: ${pointer.x}, ${pointer.y}`);
            this.moveToPointer(pointer);
        } catch (error) {
            console.error("Error in onPointerDown:", error);
        }
    }
    
    moveToPointer(pointer) {
        try {
            if (!pointer) {
                this.debugLog("Pointer is null in moveToPointer");
                return;
            }
            
            this.debugLog(`Moving to pointer at Phaser coords: (${pointer.x}, ${pointer.y})`);
            
            // Update Phaser position
            this.x = pointer.x;
            this.y = pointer.y;
            
            // Update physics body position
            if (this.body) {
                this.body.x = pointer.x;
                this.body.y = pointer.y;
            }
            
            // Convert to Three.js coordinates and update model
            if (this.model) {
                const threeCoords = this.threeManager.convertPhaserToThreeCoords(pointer.x, pointer.y);
                this.model.position.set(threeCoords.x, threeCoords.y, 0);
                this.debugLog(`Updated model position to Three.js coords: (${threeCoords.x}, ${threeCoords.y})`);
            } else {
                this.debugLog("Model is null in moveToPointer");
            }
        } catch (error) {
            console.error("Error in moveToPointer:", error);
        }
    }
    
    update() {
        try {
            // Make sure physics body is active and positioned correctly
            if (this.body) {
                this.body.active = true;
                this.body.enable = true;
                this.body.x = this.x;
                this.body.y = this.y;
                
                // Debug body position occasionally
                if (Math.random() < 0.01) { // Log roughly 1% of the time
                    console.log(`Player body at (${this.body.x}, ${this.body.y}), active: ${this.body.active}, enabled: ${this.body.enable}`);
                }
            }
            
            // Update bullets
            this.updateBullets();
            
            // Shoot automatically
            const time = this.scene.time.now;
            if (time > this.lastFired + this.fireRate) {
                this.shoot();
                this.lastFired = time;
            }
        } catch (error) {
            console.error("Error in update method:", error);
        }
    }
    
    updateBullets() {
        try {
            this.bullets.getChildren().forEach(bullet => {
                // Update 3D model position based on Phaser bullet position
                if (bullet.active && bullet.threeModel) {
                    const threeCoords = this.threeManager.convertPhaserToThreeCoords(bullet.x, bullet.y);
                    bullet.threeModel.position.set(threeCoords.x, threeCoords.y, 0);
                }
                
                // Remove bullets that go off screen
                if (bullet.y < -50) {
                    if (bullet.threeModel) {
                        this.threeManager.remove(bullet.threeModel);
                    }
                    bullet.destroy();
                }
            });
        } catch (error) {
            console.error("Error updating bullets:", error);
        }
    }
    
    shoot() {
        try {
            this.debugLog("Attempting to shoot");
            const time = this.scene.time.now;
            
            if (time > this.lastFired + this.fireRate) {
                this.debugLog("Creating bullet");
                
                // Create bullet in Phaser world
                const bullet = this.bullets.create(this.x, this.y - 20, 'bullet');
                
                if (bullet) {
                    bullet.setVelocity(0, -300);
                    bullet.setActive(true);
                    bullet.setVisible(true);
                    
                    // Create 3D representation of bullet
                    const bulletGeometry = new THREE.SphereGeometry(5, 8, 8);
                    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                    const bulletModel = new THREE.Mesh(bulletGeometry, bulletMaterial);
                    
                    // Convert Phaser coordinates to Three.js coordinates for the bullet
                    const threeCoords = this.threeManager.convertPhaserToThreeCoords(this.x, this.y - 20);
                    bulletModel.position.set(threeCoords.x, threeCoords.y, 0);
                    
                    // Add to Three.js scene
                    this.threeManager.add(bulletModel);
                    
                    // Store reference to 3D model in bullet object
                    bullet.threeModel = bulletModel;
                    
                    this.debugLog(`Bullet created at Phaser: (${this.x}, ${this.y - 20}), Three.js: (${threeCoords.x}, ${threeCoords.y})`);
                    
                    this.lastFired = time;
                } else {
                    this.debugLog("Failed to create bullet");
                }
            }
        } catch (error) {
            console.error("Error in shoot method:", error);
        }
    }
    
    takeDamage(amount) {
        try {
            const oldHealth = this.health;
            this.health -= amount;
            
            // Debug logging with more details
            console.log(`Player takeDamage: ${amount} damage taken. Health: ${oldHealth} -> ${this.health}`);
            this.debugLog(`Player took ${amount} damage. Health: ${oldHealth} -> ${this.health}`);
            
            if (this.health <= 0) {
                this.health = 0;
                this.isAlive = false;
                this.debugLog("Player died");
            }
            
            // Make sure the physics body is still active and properly positioned
            if (this.body) {
                // Ensure the body is active
                this.body.active = true;
                
                // Make sure body position matches the player's position
                this.body.x = this.x;
                this.body.y = this.y;
                
                // Ensure the body is enabled for physics
                this.body.enable = true;
            }
            
            // Flash the model red to indicate damage
            if (this.model) {
                // For GLTF models, we need to traverse all meshes
                if (this.model.traverse) {
                    // Store original colors
                    const originalColors = [];
                    
                    // Set all materials to red
                    this.model.traverse((child) => {
                        if (child.isMesh && child.material) {
                            // Store original color
                            if (child.material.color) {
                                originalColors.push({
                                    mesh: child,
                                    color: child.material.color.clone()
                                });
                                
                                // Set to red
                                child.material.color.set(0xff0000);
                            }
                        }
                    });
                    
                    // Reset colors after a short delay
                    setTimeout(() => {
                        originalColors.forEach(item => {
                            if (item.mesh && item.mesh.material && item.mesh.material.color) {
                                item.mesh.material.color.copy(item.color);
                            }
                        });
                    }, 100);
                } 
                // For simple models with a single material
                else if (this.model.material) {
                    const originalColor = this.model.material.color.clone();
                    this.model.material.color.set(0xff0000);
                    
                    // Reset color after a short delay
                    setTimeout(() => {
                        if (this.model && this.model.material) {
                            this.model.material.color.copy(originalColor);
                        }
                    }, 100);
                }
            }
            
            return this.isAlive;
        } catch (error) {
            console.error("Error in takeDamage:", error);
            return true; // Default to alive if there's an error
        }
    }
    
    destroy() {
        try {
            this.debugLog("Destroying player");
            
            // Remove the 3D model from the scene
            if (this.model) {
                // If it's a GLTF model (has children), traverse and dispose all geometries and materials
                if (this.model.traverse) {
                    this.model.traverse((child) => {
                        if (child.isMesh) {
                            if (child.geometry) {
                                child.geometry.dispose();
                            }
                            
                            if (child.material) {
                                if (Array.isArray(child.material)) {
                                    child.material.forEach(material => material.dispose());
                                } else {
                                    child.material.dispose();
                                }
                            }
                        }
                    });
                }
                
                this.threeManager.remove(this.model);
                this.model = null;
                this.debugLog("3D model removed from scene");
            }
            
            // Destroy the physics body
            if (this.body) {
                this.body.destroy();
                this.body = null;
                this.debugLog("Physics body destroyed");
            }
            
            // Clear bullets
            if (this.bullets) {
                this.bullets.clear(true, true);
                this.bullets = null;
                this.debugLog("Bullets cleared");
            }
        } catch (error) {
            console.error("Error in destroy:", error);
        }
    }
} 