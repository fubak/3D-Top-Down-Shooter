import * as Phaser from 'phaser';
import firebaseManager from '../utils/FirebaseManager.js';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
        this.isLoggedIn = false;
        this.loginStatus = '';
    }

    create() {
        // Add background
        this.add.image(400, 300, 'background');

        // Add title text
        this.add.text(400, 150, 'Stellar Vanguard', {
            font: '48px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create login UI
        this.createLoginUI();

        // Add play button (initially disabled until login)
        this.playButton = this.add.text(400, 400, 'Play Game', {
            font: '32px Arial',
            fill: '#888888',  // Gray color when disabled
            backgroundColor: '#4a4a4a',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive();
        
        // Add event listener to unlock audio context
        this.input.on('pointerdown', () => {
            if (this.game.sound && this.game.sound.context && this.game.sound.context.state === 'suspended') {
                this.game.sound.context.resume();
                console.log('Audio context resumed after user interaction');
            }
        });

        // Add hover effect
        this.playButton.on('pointerover', () => {
            if (this.isLoggedIn) {
                this.playButton.setStyle({ fill: '#ff0' });
            }
        });

        this.playButton.on('pointerout', () => {
            if (this.isLoggedIn) {
                this.playButton.setStyle({ fill: '#ffffff' });
            } else {
                this.playButton.setStyle({ fill: '#888888' });
            }
        });

        // Add click handler
        this.playButton.on('pointerdown', () => {
            if (this.isLoggedIn) {
                // Get the current user and pass it to the GameplayScene
                const currentUser = firebaseManager.getCurrentUser();
                this.scene.start('GameplayScene', { currentUser });
            } else {
                this.loginStatus = 'Please log in to play';
                this.updateLoginStatus();
            }
        });

        // Add leaderboard button
        this.addLeaderboardButton();

        // Check if user is already logged in
        const currentUser = firebaseManager.getCurrentUser();
        if (currentUser) {
            this.handleLoginSuccess(currentUser);
        }
    }

    createLoginUI() {
        // Create HTML form for login
        const loginForm = document.createElement('div');
        loginForm.id = 'login-form';
        loginForm.style.position = 'absolute';
        loginForm.style.top = '220px';
        loginForm.style.left = '50%';
        loginForm.style.transform = 'translateX(-50%)';
        loginForm.style.width = '300px';
        loginForm.style.padding = '10px';
        loginForm.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        loginForm.style.borderRadius = '5px';
        loginForm.style.display = 'flex';
        loginForm.style.flexDirection = 'column';
        loginForm.style.alignItems = 'center';
        loginForm.style.gap = '10px';
        loginForm.style.zIndex = '1000';

        // Email input
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email';
        emailInput.style.width = '90%';
        emailInput.style.padding = '8px';
        emailInput.style.borderRadius = '3px';
        emailInput.style.border = 'none';
        emailInput.id = 'email-input';

        // Password input
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.style.width = '90%';
        passwordInput.style.padding = '8px';
        passwordInput.style.borderRadius = '3px';
        passwordInput.style.border = 'none';
        passwordInput.id = 'password-input';

        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.width = '90%';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.marginTop = '5px';

        // Login button
        const loginButton = document.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.style.padding = '8px 15px';
        loginButton.style.backgroundColor = '#4CAF50';
        loginButton.style.color = 'white';
        loginButton.style.border = 'none';
        loginButton.style.borderRadius = '3px';
        loginButton.style.cursor = 'pointer';

        // Register button
        const registerButton = document.createElement('button');
        registerButton.textContent = 'Register';
        registerButton.style.padding = '8px 15px';
        registerButton.style.backgroundColor = '#2196F3';
        registerButton.style.color = 'white';
        registerButton.style.border = 'none';
        registerButton.style.borderRadius = '3px';
        registerButton.style.cursor = 'pointer';

        // Google sign-in button
        const googleButton = document.createElement('button');
        googleButton.textContent = 'Login with Google';
        googleButton.style.width = '90%';
        googleButton.style.padding = '8px 15px';
        googleButton.style.backgroundColor = '#DB4437';
        googleButton.style.color = 'white';
        googleButton.style.border = 'none';
        googleButton.style.borderRadius = '3px';
        googleButton.style.cursor = 'pointer';
        googleButton.style.marginTop = '10px';
        googleButton.style.display = 'flex';
        googleButton.style.justifyContent = 'center';
        googleButton.style.alignItems = 'center';

        // Add Google icon
        const googleIcon = document.createElement('span');
        googleIcon.innerHTML = 'G';
        googleIcon.style.fontWeight = 'bold';
        googleIcon.style.marginRight = '8px';
        googleIcon.style.backgroundColor = 'white';
        googleIcon.style.color = '#DB4437';
        googleIcon.style.borderRadius = '50%';
        googleIcon.style.width = '20px';
        googleIcon.style.height = '20px';
        googleIcon.style.display = 'flex';
        googleIcon.style.justifyContent = 'center';
        googleIcon.style.alignItems = 'center';
        googleIcon.style.fontSize = '14px';
        
        googleButton.prepend(googleIcon);

        // Status text
        const statusText = document.createElement('div');
        statusText.id = 'login-status';
        statusText.style.color = 'white';
        statusText.style.fontSize = '14px';
        statusText.style.marginTop = '5px';
        statusText.style.textAlign = 'center';
        statusText.style.height = '20px';

        // Add event listeners
        loginButton.addEventListener('click', () => {
            this.handleLogin(emailInput.value, passwordInput.value);
        });

        registerButton.addEventListener('click', () => {
            this.handleRegister(emailInput.value, passwordInput.value);
        });
        
        googleButton.addEventListener('click', () => {
            this.handleGoogleSignIn();
        });

        // Append elements to form
        buttonContainer.appendChild(loginButton);
        buttonContainer.appendChild(registerButton);
        loginForm.appendChild(emailInput);
        loginForm.appendChild(passwordInput);
        loginForm.appendChild(buttonContainer);
        loginForm.appendChild(googleButton);
        loginForm.appendChild(statusText);

        // Add form to document
        document.body.appendChild(loginForm);

        // Store reference to remove later
        this.loginForm = loginForm;
        this.statusText = statusText;

        // Add scene event to clean up DOM elements
        this.events.on('shutdown', this.cleanupLoginUI, this);
    }

    cleanupLoginUI() {
        if (this.loginForm && this.loginForm.parentNode) {
            this.loginForm.parentNode.removeChild(this.loginForm);
        }
    }

    async handleLogin(email, password) {
        if (!email || !password) {
            this.loginStatus = 'Please enter email and password';
            this.updateLoginStatus();
            return;
        }

        try {
            this.loginStatus = 'Logging in...';
            this.updateLoginStatus();
            const user = await firebaseManager.authenticate(email, password);
            this.handleLoginSuccess(user);
        } catch (error) {
            this.loginStatus = `Login failed: ${error.message}`;
            this.updateLoginStatus();
        }
    }
    
    async handleGoogleSignIn() {
        try {
            this.loginStatus = 'Connecting to Google...';
            this.updateLoginStatus();
            const user = await firebaseManager.signInWithGoogle();
            this.handleLoginSuccess(user);
        } catch (error) {
            this.loginStatus = `Google login failed: ${error.message}`;
            this.updateLoginStatus();
        }
    }

    async handleRegister(email, password) {
        if (!email || !password) {
            this.loginStatus = 'Please enter email and password';
            this.updateLoginStatus();
            return;
        }

        if (password.length < 6) {
            this.loginStatus = 'Password must be at least 6 characters';
            this.updateLoginStatus();
            return;
        }

        try {
            this.loginStatus = 'Creating account...';
            this.updateLoginStatus();
            const user = await firebaseManager.createAccount(email, password);
            this.handleLoginSuccess(user);
        } catch (error) {
            this.loginStatus = `Registration failed: ${error.message}`;
            this.updateLoginStatus();
        }
    }

    handleLoginSuccess(user) {
        this.isLoggedIn = true;
        
        // Update login status
        const displayName = user.displayName || user.email || 'Player';
        this.loginStatus = `Logged in as ${displayName}`;
        this.updateLoginStatus();
        
        // Enable play button
        this.playButton.setStyle({ fill: '#ffffff', backgroundColor: '#4CAF50' });
        
        // Hide login form
        if (this.loginForm) {
            this.loginForm.style.display = 'none';
        }
        
        // Add logout button
        this.addLogoutButton();
        
        // Add test database button (for debugging)
        this.addTestDatabaseButton();
        
        // Display high score if available
        this.displayHighScore(user.uid);
    }

    async displayHighScore(userId) {
        try {
            const highScore = await firebaseManager.getHighScore(userId);
            if (highScore) {
                // Create or update high score text
                if (this.highScoreText) {
                    this.highScoreText.setText(`Your High Score: ${highScore}`);
                } else {
                    this.highScoreText = this.add.text(400, 450, `Your High Score: ${highScore}`, {
                        font: '24px Arial',
                        fill: '#ffffff'
                    }).setOrigin(0.5);
                }
            }
        } catch (error) {
            console.error("Error getting high score:", error);
        }
    }

    updateLoginStatus() {
        if (this.statusText) {
            this.statusText.textContent = this.loginStatus;
        }
    }

    addLeaderboardButton() {
        // Add leaderboard button
        this.leaderboardButton = this.add.text(400, 500, 'Leaderboard', {
            font: '24px Arial',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 15, y: 8 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Add hover effect
        this.leaderboardButton.on('pointerover', () => {
            this.leaderboardButton.setStyle({ fill: '#ff0' });
        });

        this.leaderboardButton.on('pointerout', () => {
            this.leaderboardButton.setStyle({ fill: '#ffffff' });
        });

        // Add click handler
        this.leaderboardButton.on('pointerdown', () => {
            this.scene.start('LeaderboardScene');
        });
    }

    addLogoutButton() {
        // Remove existing logout button if it exists
        if (this.logoutButton) {
            this.logoutButton.destroy();
        }
        
        // Add logout button
        this.logoutButton = this.add.text(700, 50, 'Logout', {
            font: '20px Arial',
            fill: '#ffffff',
            backgroundColor: '#d32f2f',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Add hover effect
        this.logoutButton.on('pointerover', () => {
            this.logoutButton.setStyle({ fill: '#ffcccc' });
        });

        this.logoutButton.on('pointerout', () => {
            this.logoutButton.setStyle({ fill: '#ffffff' });
        });

        // Add click handler
        this.logoutButton.on('pointerdown', () => {
            this.handleLogout();
        });
    }
    
    async handleLogout() {
        try {
            await firebaseManager.signOut();
            
            // Reset login state
            this.isLoggedIn = false;
            this.loginStatus = 'Logged out successfully';
            this.updateLoginStatus();
            
            // Disable play button
            this.playButton.setStyle({ fill: '#888888', backgroundColor: '#4a4a4a' });
            
            // Show login form
            if (this.loginForm) {
                this.loginForm.style.display = 'flex';
            }
            
            // Remove logout button
            if (this.logoutButton) {
                this.logoutButton.destroy();
                this.logoutButton = null;
            }
            
            // Remove high score text
            if (this.highScoreText) {
                this.highScoreText.destroy();
                this.highScoreText = null;
            }
            
        } catch (error) {
            this.loginStatus = `Logout failed: ${error.message}`;
            this.updateLoginStatus();
        }
    }

    addTestDatabaseButton() {
        // Add test database button
        this.testDbButton = this.add.text(700, 100, 'Test DB', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 8, y: 4 }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Add hover effect
        this.testDbButton.on('pointerover', () => {
            this.testDbButton.setStyle({ fill: '#ffff00' });
        });

        this.testDbButton.on('pointerout', () => {
            this.testDbButton.setStyle({ fill: '#ffffff' });
        });

        // Add click handler
        this.testDbButton.on('pointerdown', async () => {
            this.loginStatus = "Testing database access...";
            this.updateLoginStatus();
            
            try {
                const results = await firebaseManager.testDatabaseAccess();
                console.log("Database access test results:", results);
                
                let statusText = "DB Test: ";
                if (results.authenticated) {
                    statusText += "Auth ✓ ";
                } else {
                    statusText += "Auth ✗ ";
                }
                
                if (results.canReadUsers) {
                    statusText += "Read ✓ ";
                } else {
                    statusText += "Read ✗ ";
                }
                
                if (results.canWriteOwnData) {
                    statusText += "Write ✓";
                } else {
                    statusText += "Write ✗";
                }
                
                this.loginStatus = statusText;
                this.updateLoginStatus();
                
                if (results.error) {
                    console.error("Database test error:", results.error);
                    this.loginStatus += ` Error: ${results.error}`;
                    this.updateLoginStatus();
                }
            } catch (error) {
                console.error("Error running database test:", error);
                this.loginStatus = `Test error: ${error.message}`;
                this.updateLoginStatus();
            }
        });
    }
} 