// Game configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    scene: {
        preload: preload,
        create: create
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Preload game assets
function preload() {
    // Assets will be loaded here in future steps
}

// Create game objects
function create() {
    this.add.text(400, 300, 'Stellar Vanguard', {
        font: '32px Arial',
        fill: '#ffffff'
    }).setOrigin(0.5);
} 