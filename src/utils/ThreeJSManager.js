import * as THREE from 'three';

export default class ThreeJSManager {
    constructor() {
        // Initialize Three.js components
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(800, 600);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        document.body.appendChild(this.renderer.domElement);

        // Create scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        this.camera.position.z = 5;

        // Add some basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 0);
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
        this.camera.aspect = width / height;
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