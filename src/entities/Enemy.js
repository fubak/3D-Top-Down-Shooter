import * as THREE from 'three';

export default class Enemy {
    constructor(scene, threeJSManager, x = 0) {
        try {
            this.scene = scene;
            this.threeJSManager = threeJSManager;
            this.lastShot = 0;
            this.shootInterval = 1000; // Reduced from 2000 to 1000 (shoot every 1 second)
            this.speed = 1.5; // Increased from 1 to 1.5 (50% faster movement)
            
            // Create a simple cube as placeholder for the enemy model
            const geometry = new THREE.BoxGeometry(20, 20, 20);
            const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
            this.model = new THREE.Mesh(geometry, material);
            
            // Position the enemy at the top of the screen with random x coordinate
            this.model.position.set(x, 300, 0);
            
            // Add to Three.js scene - use the add method instead of directly accessing scene
            this.threeJSManager.add(this.model);
            
            // Create physics body for collision detection
            this.body = scene.physics.add.sprite(
                x + 400, // Convert Three.js coordinates to Phaser coordinates
                0, // Start at top of screen
                'bullet' // Reuse bullet sprite as collision body
            );
            this.body.setVisible(false); // Hide the sprite since we're using 3D model
            this.body.setCircle(10); // Set collision circle size
        } catch (error) {
            console.error("Error in Enemy constructor:", error);
        }
    }

    update(time) {
        try {
            // Check if model and body exist
            if (!this.model || !this.body) {
                console.error("Model or body not available in Enemy.update");
                return false;
            }
            
            // Move downward
            this.model.position.y -= this.speed;
            
            // Update physics body position to match 3D model
            this.body.x = this.model.position.x + 400; // Convert Three.js coordinates to Phaser
            this.body.y = (-this.model.position.y) + 300; // Convert and invert Y coordinate
            
            // Shoot periodically
            if (time - this.lastShot >= this.shootInterval) {
                this.shoot();
                this.lastShot = time;
            }
            
            // Return true if enemy is still on screen, false if it should be destroyed
            return this.model.position.y > -350;
        } catch (error) {
            console.error("Error in Enemy update:", error);
            return false;
        }
    }

    shoot() {
        try {
            // Check if scene and physics exist
            if (!this.scene || !this.scene.physics) {
                console.error("Scene or physics not available in Enemy.shoot");
                return null;
            }
            
            // Check if body exists
            if (!this.body) {
                console.error("Body not available in Enemy.shoot");
                return null;
            }
            
            // Create enemy bullet
            const bullet = this.scene.physics.add.sprite(
                this.body.x,
                this.body.y + 20,
                'bullet'
            );
            
            // Configure bullet properties
            bullet.setTint(0xff0000); // Red tint for enemy bullets
            
            // Ensure the bullet has velocity and keeps it
            bullet.body.velocity.y = 350; // Increased from 300 to 350 (faster bullets)
            bullet.body.allowGravity = false;
            
            // Add bullet to the enemyBullets group for collision detection
            if (this.scene.enemyBullets) {
                this.scene.enemyBullets.add(bullet);
            }
            
            // Set up world bounds for automatic cleanup
            bullet.checkWorldBounds = true;
            bullet.outOfBoundsKill = true;
            
            return bullet;
        } catch (error) {
            console.error("Error in Enemy shoot:", error);
            return null;
        }
    }

    destroy() {
        try {
            // Remove from Three.js scene using the remove method
            if (this.model && this.threeJSManager) {
                this.threeJSManager.remove(this.model);
                
                // Clean up geometry and material
                if (this.model.geometry) this.model.geometry.dispose();
                if (this.model.material) this.model.material.dispose();
                this.model = null;
            }
            
            // Remove physics body
            if (this.body) {
                this.body.destroy();
                this.body = null;
            }
        } catch (error) {
            console.error("Error in Enemy destroy:", error);
        }
    }
} 