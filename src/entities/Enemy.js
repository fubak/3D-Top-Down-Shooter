import * as THREE from 'three';

export default class Enemy {
    constructor(scene, threeJSManager, x = 0) {
        this.scene = scene;
        this.threeJSManager = threeJSManager;
        this.lastShot = 0;
        this.shootInterval = 2000; // Shoot every 2 seconds
        this.speed = 1; // Movement speed
        
        // Create a simple cube as placeholder for the enemy model
        const geometry = new THREE.BoxGeometry(20, 20, 20);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        this.model = new THREE.Mesh(geometry, material);
        
        // Position the enemy at the top of the screen with random x coordinate
        this.model.position.set(x, 300, 0);
        
        // Add to Three.js scene
        this.threeJSManager.scene.add(this.model);
        
        // Create physics body for collision detection
        this.body = scene.physics.add.sprite(
            x + 400, // Convert Three.js coordinates to Phaser coordinates
            0, // Start at top of screen
            'bullet' // Reuse bullet sprite as collision body
        );
        this.body.setVisible(false); // Hide the sprite since we're using 3D model
    }

    update(time) {
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
    }

    shoot() {
        // Create enemy bullet
        const bullet = this.scene.physics.add.sprite(
            this.body.x,
            this.body.y + 20,
            'bullet'
        );
        bullet.setTint(0xff0000); // Red tint for enemy bullets
        bullet.setVelocityY(300); // Move downward
        
        // Destroy bullet when it goes off screen
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
        
        return bullet;
    }

    destroy() {
        // Remove from Three.js scene
        this.threeJSManager.scene.remove(this.model);
        this.model.geometry.dispose();
        this.model.material.dispose();
        
        // Remove physics body
        this.body.destroy();
    }
} 