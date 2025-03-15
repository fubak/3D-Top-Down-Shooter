import * as THREE from 'three';

export default class ThreeJSManager {
    constructor() {
        // Initialize Three.js components
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(800, 600);
        
        // Center the renderer to match Phaser's canvas
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.left = '50%';
        this.renderer.domElement.style.top = '50%';
        this.renderer.domElement.style.transform = 'translate(-50%, -50%)';
        document.body.appendChild(this.renderer.domElement);

        // Create scene and camera
        this.scene = new THREE.Scene();
        // Use orthographic camera for 2D-like view
        const aspectRatio = 800 / 600;
        const viewSize = 600;
        this.camera = new THREE.OrthographicCamera(
            -viewSize * aspectRatio / 2,
            viewSize * aspectRatio / 2,
            viewSize / 2,
            -viewSize / 2,
            1,
            2000
        );
        this.camera.position.z = 1000;
        this.camera.lookAt(0, 0, 0);

        // Add some basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1000);
        this.scene.add(directionalLight);
    }

    // Method to load 3D models (will be used later)
    loadModel(path) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();
            loader.load(
                path,
                (gltf) => resolve(gltf),
                undefined,
                (error) => reject(error)
            );
        });
    }

    // Method to update the scene (called in game loop)
    update() {
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    // Method to resize the renderer (for responsive design)
    resize(width, height) {
        this.renderer.setSize(width, height);
        const aspectRatio = width / height;
        const viewSize = 600;
        this.camera.left = -viewSize * aspectRatio / 2;
        this.camera.right = viewSize * aspectRatio / 2;
        this.camera.top = viewSize / 2;
        this.camera.bottom = -viewSize / 2;
        this.camera.updateProjectionMatrix();
    }

    // Method to add objects to the scene
    add(object) {
        this.scene.add(object);
    }

    // Method to remove objects from the scene
    remove(object) {
        this.scene.remove(object);
    }

    // Method to clean up Three.js resources when switching scenes
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
            document.body.removeChild(this.renderer.domElement);
        }
    }
} 