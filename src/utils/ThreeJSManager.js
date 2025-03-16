import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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

            // Enhanced lighting system
            // Ambient light - provides overall illumination
            const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
            this.scene.add(ambientLight);

            // Main directional light - simulates sun/main light source
            const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
            mainLight.position.set(0, 1, 1000);
            mainLight.castShadow = true;
            this.scene.add(mainLight);
            
            // Secondary directional light - adds depth from another angle
            const secondaryLight = new THREE.DirectionalLight(0x6060ff, 0.3);
            secondaryLight.position.set(-1, -0.5, 500);
            this.scene.add(secondaryLight);
            
            // Add a subtle point light at the center for additional highlights
            const centerLight = new THREE.PointLight(0x9090ff, 0.5, 1000);
            centerLight.position.set(0, 0, 200);
            this.scene.add(centerLight);
            
            // Store references to lights for potential animation
            this.lights = {
                ambient: ambientLight,
                main: mainLight,
                secondary: secondaryLight,
                center: centerLight
            };
            
            this.debugLog("Enhanced lighting system added to scene");
            
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
                // Use the global GLTFLoader since it's loaded via script tag
                const loader = new GLTFLoader();
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

    /**
     * Clear all objects from the scene
     */
    clear() {
        this.debugLog("Clearing all objects from Three.js scene");
        
        // Remove all objects from the scene
        while(this.scene.children.length > 0) { 
            const object = this.scene.children[0];
            
            // Properly dispose of geometries and materials to prevent memory leaks
            if (object.geometry) {
                object.geometry.dispose();
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
            
            this.scene.remove(object);
        }
        
        // Force renderer to clear its cache
        this.renderer.renderLists.dispose();
        
        this.debugLog("Three.js scene cleared");
    }

    /**
     * Destroy the Three.js manager and clean up resources
     */
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
    
    /**
     * Create an explosion effect at the specified position
     * @param {number} x - X position in Three.js coordinates
     * @param {number} y - Y position in Three.js coordinates
     * @param {number} z - Z position in Three.js coordinates
     * @param {object} options - Optional parameters for customizing the explosion
     */
    createExplosion(x, y, z, options = {}) {
        try {
            this.debugLog(`Creating explosion at (${x}, ${y}, ${z})`);
            
            // Default options
            const settings = {
                particleCount: options.particleCount || 30,
                particleSize: options.particleSize || 3,
                duration: options.duration || 1000, // milliseconds
                colors: options.colors || [0xff7700, 0xff9900, 0xffaa00, 0xffcc00],
                spread: options.spread || 30,
                speed: options.speed || 50
            };
            
            // Create a group to hold all explosion particles
            const explosionGroup = new THREE.Group();
            explosionGroup.position.set(x, y, z);
            this.scene.add(explosionGroup);
            
            // Create particles
            const particles = [];
            for (let i = 0; i < settings.particleCount; i++) {
                // Randomly select a color from the colors array
                const colorIndex = Math.floor(Math.random() * settings.colors.length);
                const color = settings.colors[colorIndex];
                
                // Create particle geometry and material
                const geometry = new THREE.SphereGeometry(settings.particleSize, 8, 8);
                const material = new THREE.MeshPhongMaterial({
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 1
                });
                
                // Create mesh for the particle
                const particle = new THREE.Mesh(geometry, material);
                
                // Set random initial position (slightly offset from center)
                particle.position.set(
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5,
                    (Math.random() - 0.5) * 5
                );
                
                // Set random velocity
                particle.userData.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * settings.speed,
                    (Math.random() - 0.5) * settings.speed,
                    (Math.random() - 0.5) * settings.speed
                );
                
                // Add to group and particles array
                explosionGroup.add(particle);
                particles.push(particle);
            }
            
            // Add a point light for illumination
            const light = new THREE.PointLight(0xff7700, 1, 100);
            light.position.set(0, 0, 0);
            explosionGroup.add(light);
            
            // Create animation
            let startTime = Date.now();
            
            // Animation function
            const animateExplosion = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / settings.duration;
                
                if (progress >= 1) {
                    // Animation complete, remove particles and cancel animation
                    this.scene.remove(explosionGroup);
                    
                    // Dispose of geometries and materials
                    particles.forEach(particle => {
                        particle.geometry.dispose();
                        particle.material.dispose();
                    });
                    
                    return;
                }
                
                // Update particles
                particles.forEach(particle => {
                    // Move particle based on velocity
                    particle.position.x += particle.userData.velocity.x * (1 - progress) * 0.1;
                    particle.position.y += particle.userData.velocity.y * (1 - progress) * 0.1;
                    particle.position.z += particle.userData.velocity.z * (1 - progress) * 0.1;
                    
                    // Fade out particle
                    particle.material.opacity = 1 - progress;
                    
                    // Scale down particle
                    const scale = 1 - (progress * 0.5);
                    particle.scale.set(scale, scale, scale);
                });
                
                // Fade out light
                light.intensity = 1 - progress;
                
                // Continue animation
                requestAnimationFrame(animateExplosion);
            };
            
            // Start animation
            animateExplosion();
            
        } catch (error) {
            console.error("Error creating explosion:", error);
        }
    }
} 