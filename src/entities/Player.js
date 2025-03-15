import * as THREE from 'three';

export default class Player {
    constructor(scene, threeJSManager) {
        this.scene = scene;
        this.threeJSManager = threeJSManager;
        this.model = null;
        this.position = { x: 0, y: -200, z: 0 };
        this.speed = 5;
        this.boundaries = {
            x: { min: -400, max: 400 },
            y: { min: -300, max: 300 }
        };
        
        // Add shooting properties
        this.lastShootTime = 0;
        this.shootDelay = 200; // 0.2 seconds between shots
        this.bullets = this.scene.physics.add.group();
        
        // Create physics body for collision detection
        this.body = scene.physics.add.sprite(
            this.position.x + 400, // Convert Three.js coordinates to Phaser coordinates
            -this.position.y + 300, // Convert Three.js coordinates to Phaser coordinates
            'bullet' // Reuse bullet sprite as collision body
        );
        this.body.setVisible(false); // Hide the sprite since we're using 3D model
        this.body.setCircle(15); // Set collision circle size
        
        this.createTemporaryModel();
    }

    createTemporaryModel() {
        // Create a simple geometric shape for the player ship
        const geometry = new THREE.ConeGeometry(15, 30, 3);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            flatShading: true,
            shininess: 100
        });
        this.model = new THREE.Mesh(geometry, material);
        
        // Rotate to point upward
        this.model.rotation.x = Math.PI;
        
        // Set initial position
        this.model.position.set(this.position.x, this.position.y, this.position.z);
        
        // Add to the Three.js scene
        this.model.visible = true;
        this.threeJSManager.add(this.model);

        console.log('Model created at:', this.position.x, this.position.y, this.position.z);
    }

    onPointerDown(pointer) {
        console.log('onPointerDown:', pointer.x, pointer.y);
        this.updatePosition(pointer);
    }

    updatePosition(pointer) {
        // Convert Phaser coordinates to Three.js coordinates
        const targetX = pointer.x - 400;
        const targetY = -(pointer.y - 300);

        // Update position
        this.position.x = targetX;
        this.position.y = targetY;

        // Clamp position within boundaries
        this.position.x = Math.max(this.boundaries.x.min, Math.min(this.boundaries.x.max, this.position.x));
        this.position.y = Math.max(this.boundaries.y.min, Math.min(this.boundaries.y.max, this.position.y));

        // Update model position
        if (this.model) {
            this.model.position.set(this.position.x, this.position.y, this.position.z);
        }
        
        // Update physics body position
        if (this.body) {
            this.body.x = this.position.x + 400;
            this.body.y = -this.position.y + 300;
        }
    }

    update(pointer) {
        // Only update position if pointer is down
        if (this.scene.isPointerDown) {
            this.updatePosition(pointer);
        }
        // Always try to shoot
        this.shoot();
    }

    shoot() {
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastShootTime >= this.shootDelay) {
            // Convert Three.js coordinates back to Phaser coordinates
            const phaserX = this.model.position.x + 400; // Center offset
            const phaserY = -this.model.position.y + 300; // Center offset and flip Y
            
            // Create a bullet at the player's position
            const bullet = this.bullets.create(phaserX, phaserY, 'bullet');
            if (bullet) {
                bullet.setVelocityY(-400);
                this.lastShootTime = currentTime;
            }
        }

        // Clean up bullets that are off screen
        this.bullets.children.each((bullet) => {
            if (bullet.y < -50) {
                bullet.destroy();
            }
        });
    }

    destroy() {
        if (this.model) {
            this.threeJSManager.remove(this.model);
            this.model.geometry.dispose();
            this.model.material.dispose();
            this.model = null;
        }
        
        if (this.body) {
            this.body.destroy();
            this.body = null;
        }
    }
} 