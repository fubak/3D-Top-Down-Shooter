import * as Phaser from 'phaser';
import firebaseManager from '../utils/FirebaseManager.js';

export default class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
        this.leaderboardData = [];
        this.isLoading = true;
        
        // Mock data for fallback when Firebase permissions fail
        this.mockLeaderboardData = [
            { displayName: 'SpaceAce', highScore: 250, lastPlayed: new Date().toISOString() },
            { displayName: 'StarBlaster', highScore: 200, lastPlayed: new Date().toISOString() },
            { displayName: 'CosmicHero', highScore: 180, lastPlayed: new Date().toISOString() },
            { displayName: 'GalaxyDefender', highScore: 150, lastPlayed: new Date().toISOString() },
            { displayName: 'AsteroidCrusher', highScore: 130, lastPlayed: new Date().toISOString() },
            { displayName: 'NebulaPilot', highScore: 120, lastPlayed: new Date().toISOString() },
            { displayName: 'VoidWarrior', highScore: 110, lastPlayed: new Date().toISOString() },
            { displayName: 'You', highScore: 100, lastPlayed: new Date().toISOString() },
            { displayName: 'OrbitRanger', highScore: 90, lastPlayed: new Date().toISOString() },
            { displayName: 'SolarSailor', highScore: 80, lastPlayed: new Date().toISOString() }
        ];
    }

    create() {
        // Add background
        this.add.image(400, 300, 'background');

        // Add title
        this.add.text(400, 80, 'LEADERBOARD', {
            font: '48px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Add loading text
        this.loadingText = this.add.text(400, 300, 'Loading leaderboard...', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Fetch leaderboard data
        this.fetchLeaderboard();

        // Add back button
        const backButton = this.add.text(400, 520, 'Back to Menu', {
            font: '24px Arial',
            fill: '#ffffff',
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Add hover effect
        backButton.on('pointerover', () => {
            backButton.setStyle({ fill: '#ff0' });
        });

        backButton.on('pointerout', () => {
            backButton.setStyle({ fill: '#ffffff' });
        });

        // Add click handler
        backButton.on('pointerdown', () => {
            this.returnToMainMenu();
        });
    }

    async fetchLeaderboard() {
        try {
            this.leaderboardData = await firebaseManager.getLeaderboard(10);
            this.isLoading = false;
            this.displayLeaderboard();
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            
            // Use mock data as fallback
            this.leaderboardData = this.mockLeaderboardData;
            
            // Add note about using demo data
            this.add.text(400, 150, 'Using demo data (Firebase permissions issue)', {
                font: '16px Arial',
                fill: '#ff9900',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
            
            this.isLoading = false;
            this.displayLeaderboard();
        }
    }

    displayLeaderboard() {
        // Remove loading text
        if (this.loadingText) {
            this.loadingText.destroy();
        }

        if (this.leaderboardData.length === 0) {
            this.add.text(400, 300, 'No scores yet. Be the first!', {
                font: '24px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 4
            }).setOrigin(0.5);
            return;
        }

        // Create header
        this.add.text(200, 180, 'Player', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(600, 180, 'Score', {
            font: '24px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Display leaderboard entries
        const startY = 220;
        const spacing = 35;

        this.leaderboardData.forEach((entry, index) => {
            // Rank number with medal for top 3
            let rankText = `${index + 1}.`;
            let rankColor = '#ffffff';
            
            if (index === 0) {
                rankText = '🥇 ' + rankText;
                rankColor = '#FFD700'; // Gold
            } else if (index === 1) {
                rankText = '🥈 ' + rankText;
                rankColor = '#C0C0C0'; // Silver
            } else if (index === 2) {
                rankText = '🥉 ' + rankText;
                rankColor = '#CD7F32'; // Bronze
            }
            
            this.add.text(100, startY + index * spacing, rankText, {
                font: '20px Arial',
                fill: rankColor,
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);

            // Player name (truncate if too long)
            let displayName = entry.displayName;
            if (displayName.length > 15) {
                displayName = displayName.substring(0, 12) + '...';
            }
            
            this.add.text(250, startY + index * spacing, displayName, {
                font: '20px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0, 0.5);

            // Score
            this.add.text(600, startY + index * spacing, entry.highScore.toString(), {
                font: '20px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5);
        });
    }

    // Method to return to main menu with proper cleanup
    returnToMainMenu() {
        // Clean up any resources if needed
        this.scene.start('MainMenuScene');
    }
} 