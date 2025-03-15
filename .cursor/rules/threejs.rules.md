# Three.js Integration Rules

## 3D Integration

### Renderer Setup (Priority: High)
- Create a separate Three.js renderer and scene
- Synchronize with Phaser's game loop
- Handle WebGL context sharing appropriately
- Manage canvas layering and positioning

### 3D Model Management (Priority: High)
- Use GLTF format for all 3D models
- Implement model optimization:
  - Reduce polygon counts
  - Use texture atlases
  - Implement LOD (Level of Detail) where appropriate
- Test performance on mobile devices

### Example Integration
```javascript
export class ThreeJSManager {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    }

    loadModel(path) {
        const loader = new THREE.GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(path,
                (gltf) => resolve(gltf),
                undefined,
                (error) => reject(error)
            );
        });
    }

    update() {
        // Sync with Phaser's update loop
        this.renderer.render(this.scene, this.camera);
    }
}
```

### Performance Guidelines
- Implement proper resource disposal
- Use object pooling for frequently created/destroyed objects
- Optimize render calls and draw operations
- Monitor memory usage and GPU performance 