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
    }

    update(pointer) {
        this.updatePosition(pointer);
    }

    destroy() {
        if (this.model) {
            this.threeJSManager.remove(this.model);
            this.model.geometry.dispose();
            this.model.material.dispose();
            this.model = null;
        }
    }
} 