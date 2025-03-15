import * as THREE from 'three';

export default class ThreeJSManager {
    constructor(phaserCanvas) {
        try {
            this.debugMode = true; // Enable debug mode
            this.debugLog("Initializing ThreeJSManager");
            
            // Get dimensions from Phaser canvas if provided
            if (phaserCanvas) {
                this.width = phaserCanvas.width;
                this.height = phaserCanvas.height;
            } else {
                this.width = 800;
                this.height = 600;
            }
            
            // Initialize Three.js components with a new canvas
            this.renderer = new THREE.WebGLRenderer({ 
                alpha: true,
                antialias: true
            });
            this.renderer.setSize(this.width, this.height);
            
            // Position the Three.js canvas on top of the Phaser canvas
            this.renderer.domElement.style.position = 'absolute';
            this.renderer.domElement.style.left = '50%';
            this.renderer.domElement.style.top = '50%';
            this.renderer.domElement.style.transform = 'translate(-50%, -50%)';
            this.renderer.domElement.style.pointerEvents = 'none'; // Allow clicks to pass through to Phaser canvas
            document.body.appendChild(this.renderer.domElement);
            
            this.debugLog("Renderer created and added to DOM");

            // Create scene and camera
            this.scene = new THREE.Scene();
            // Use orthographic camera for 2D-like view
            const aspectRatio = this.width / this.height;
            const viewSize = this.height;
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
            this.debugLog("Camera initialized");

            // Add some basic lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            this.scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 1, 1000);
            this.scene.add(directionalLight);
            this.debugLog("Lighting added to scene");
            
            // Add debug helpers
            if (this.debugMode) {
                // Debug logging only, no visual helpers
                this.debugLog("Debug mode enabled");
            }
        } catch (error) {
            console.error("Error in ThreeJSManager constructor:", error);
        }
    }

    debugLog(message) {
        if (this.debugMode) {
            console.log(`[ThreeJSManager] ${message}`);
        }
    }

    // Convert Phaser coordinates to Three.js coordinates
    convertPhaserToThreeCoords(x, y) {
        try {
            // In Phaser, (0,0) is top-left, y increases downward
            // In Three.js, (0,0) is center, y increases upward
            const threeX = x - this.width / 2;
            const threeY = this.height / 2 - y;
            this.debugLog(`Converting Phaser (${x}, ${y}) to Three.js (${threeX}, ${threeY})`);
            return { x: threeX, y: threeY };
        } catch (error) {
            console.error("Error converting coordinates:", error);
            return { x: 0, y: 0 };
        }
    }

    // Convert Three.js coordinates to Phaser coordinates
    convertThreeToPhaserCoords(x, y) {
        try {
            // Convert from Three.js to Phaser coordinate system
            const phaserX = x + this.width / 2;
            const phaserY = this.height / 2 - y;
            this.debugLog(`Converting Three.js (${x}, ${y}) to Phaser (${phaserX}, ${phaserY})`);
            return { x: phaserX, y: phaserY };
        } catch (error) {
            console.error("Error converting coordinates:", error);
            return { x: 0, y: 0 };
        }
    }

    // Method to load 3D models (will be used later)
    loadModel(path) {
        return new Promise((resolve, reject) => {
            try {
                this.debugLog(`Loading model from: ${path}`);
                const loader = new THREE.GLTFLoader();
                loader.load(
                    path,
                    (gltf) => {
                        this.debugLog(`Model loaded successfully from: ${path}`);
                        resolve(gltf);
                    },
                    (progress) => {
                        if (this.debugMode && progress.lengthComputable) {
                            const percentComplete = (progress.loaded / progress.total) * 100;
                            this.debugLog(`Model loading progress: ${Math.round(percentComplete)}%`);
                        }
                    },
                    (error) => {
                        console.error(`Error loading model from ${path}:`, error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error(`Error in loadModel for ${path}:`, error);
                reject(error);
            }
        });
    }

    // Method to update the scene (called in game loop)
    update() {
        try {
            // Render the scene
            this.renderer.render(this.scene, this.camera);
        } catch (error) {
            console.error("Error in ThreeJSManager update:", error);
        }
    }

    // Method to resize the renderer (for responsive design)
    resize(width, height) {
        try {
            this.debugLog(`Resizing renderer to ${width}x${height}`);
            // Update width and height properties
            this.width = width;
            this.height = height;
            
            this.renderer.setSize(width, height);
            const aspectRatio = width / height;
            const viewSize = height;
            this.camera.left = -viewSize * aspectRatio / 2;
            this.camera.right = viewSize * aspectRatio / 2;
            this.camera.top = viewSize / 2;
            this.camera.bottom = -viewSize / 2;
            this.camera.updateProjectionMatrix();
            this.debugLog("Camera projection matrix updated");
        } catch (error) {
            console.error("Error in ThreeJSManager resize:", error);
        }
    }

    // Method to add objects to the scene
    add(object) {
        try {
            this.scene.add(object);
            this.debugLog(`Object added to scene: ${object.type || 'Unknown object type'}`);
        } catch (error) {
            console.error("Error adding object to scene:", error);
        }
    }

    // Method to remove objects from the scene
    remove(object) {
        try {
            this.scene.remove(object);
            this.debugLog(`Object removed from scene: ${object.type || 'Unknown object type'}`);
        } catch (error) {
            console.error("Error removing object from scene:", error);
        }
    }

    // Method to clean up Three.js resources when switching scenes
    destroy() {
        try {
            this.debugLog("Destroying ThreeJSManager");
            if (this.renderer) {
                this.renderer.dispose();
                if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                    document.body.removeChild(this.renderer.domElement);
                    this.debugLog("Renderer DOM element removed");
                } else {
                    this.debugLog("Renderer DOM element not found or already removed");
                }
            }
        } catch (error) {
            console.error("Error in ThreeJSManager destroy:", error);
        }
    }
    
    // Method to check if WebGL is available and working
    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                this.debugLog("WebGL not supported by this browser");
                return false;
            }
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                this.debugLog(`WebGL Vendor: ${vendor}`);
                this.debugLog(`WebGL Renderer: ${renderer}`);
            }
            
            this.debugLog("WebGL is supported and working");
            return true;
        } catch (error) {
            console.error("Error checking WebGL support:", error);
            return false;
        }
    }
} 