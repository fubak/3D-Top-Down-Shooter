/**
 * FirebaseManager.js
 * Handles Firebase authentication and database operations
 */

class FirebaseManager {
    constructor() {
        // Firebase configuration
        this.firebaseConfig = {
            apiKey: "AIzaSyDglvbccxu-VVZqqk3awVsJronIQsSiO8s",
            authDomain: "stellar-vanguard.firebaseapp.com",
            projectId: "stellar-vanguard",
            storageBucket: "stellar-vanguard.firebasestorage.app",
            messagingSenderId: "28531302827",
            appId: "1:28531302827:web:813f710debbcd95ab472ee",
            measurementId: "G-F0ETVZGE9P"
        };

        // Initialize Firebase if it exists
        if (typeof firebase !== 'undefined') {
            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            this.auth = firebase.auth();
            this.db = firebase.database();
            // Initialize Google Auth Provider
            this.googleProvider = new firebase.auth.GoogleAuthProvider();
            console.log("Firebase initialized successfully");
        } else {
            console.error("Firebase SDK not loaded");
            this.auth = null;
            this.db = null;
            this.googleProvider = null;
        }
    }

    /**
     * Authenticate user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Authentication result
     */
    async authenticate(email, password) {
        if (!this.auth) {
            return Promise.reject(new Error("Firebase authentication not available"));
        }

        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Authentication error:", error);
            return Promise.reject(error);
        }
    }

    /**
     * Sign in with Google
     * @returns {Promise} - Authentication result
     */
    async signInWithGoogle() {
        if (!this.auth || !this.googleProvider) {
            return Promise.reject(new Error("Google authentication not available"));
        }

        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            return result.user;
        } catch (error) {
            console.error("Google sign-in error:", error);
            return Promise.reject(error);
        }
    }

    /**
     * Create a new user account
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - Registration result
     */
    async createAccount(email, password) {
        if (!this.auth) {
            return Promise.reject(new Error("Firebase authentication not available"));
        }

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Account creation error:", error);
            return Promise.reject(error);
        }
    }

    /**
     * Sign out the current user
     * @returns {Promise} - Sign out result
     */
    async signOut() {
        if (!this.auth) {
            return Promise.reject(new Error("Firebase authentication not available"));
        }

        try {
            await this.auth.signOut();
            return true;
        } catch (error) {
            console.error("Sign out error:", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get the current authenticated user
     * @returns {Object|null} - Current user or null if not authenticated
     */
    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }

    /**
     * Save high score to Firebase
     * @param {string} userId - User ID
     * @param {number} score - Score to save
     * @returns {Promise} - Save result
     */
    async saveHighScore(userId, score) {
        if (!this.db) {
            return Promise.reject(new Error("Firebase database not available"));
        }

        try {
            const userRef = this.db.ref(`users/${userId}`);
            
            // Get current high score
            const snapshot = await userRef.once('value');
            const userData = snapshot.val() || {};
            const currentHighScore = userData.highScore || 0;
            
            // Only update if new score is higher
            if (score > currentHighScore) {
                await userRef.update({
                    highScore: score,
                    lastPlayed: new Date().toISOString()
                });
                console.log(`High score updated: ${score}`);
                return true;
            } else {
                console.log(`Score not high enough to update: ${score} <= ${currentHighScore}`);
                return false;
            }
        } catch (error) {
            console.error("Error saving high score:", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get user's high score from Firebase
     * @param {string} userId - User ID
     * @returns {Promise<number>} - High score
     */
    async getHighScore(userId) {
        if (!this.db) {
            return Promise.reject(new Error("Firebase database not available"));
        }

        try {
            const snapshot = await this.db.ref(`users/${userId}/highScore`).once('value');
            return snapshot.val() || 0;
        } catch (error) {
            console.error("Error getting high score:", error);
            return Promise.reject(error);
        }
    }

    /**
     * Get top scores for the leaderboard
     * @param {number} limit - Maximum number of scores to retrieve
     * @returns {Promise<Array>} - Array of user scores
     */
    async getLeaderboard(limit = 10) {
        if (!this.db) {
            return Promise.reject(new Error("Firebase database not available"));
        }

        try {
            const snapshot = await this.db.ref('users')
                .orderByChild('highScore')
                .limitToLast(limit)
                .once('value');
            
            const leaderboard = [];
            snapshot.forEach(childSnapshot => {
                const userData = childSnapshot.val();
                leaderboard.push({
                    userId: childSnapshot.key,
                    displayName: userData.displayName || userData.email || 'Anonymous',
                    highScore: userData.highScore || 0,
                    lastPlayed: userData.lastPlayed
                });
            });
            
            // Sort in descending order
            return leaderboard.sort((a, b) => b.highScore - a.highScore);
        } catch (error) {
            console.error("Error getting leaderboard:", error);
            return Promise.reject(error);
        }
    }

    /**
     * Update user display name
     * @param {string} userId - User ID
     * @param {string} displayName - Display name to set
     * @returns {Promise} - Update result
     */
    async updateUserDisplayName(userId, displayName) {
        console.log(`Attempting to update display name for user ${userId} to "${displayName}"`);
        
        if (!this.db) {
            console.error("Firebase database not available");
            return Promise.reject(new Error("Firebase database not available"));
        }

        try {
            console.log(`Writing to database path: users/${userId}`);
            const userRef = this.db.ref(`users/${userId}`);
            
            // First check if we can read from this location (to test permissions)
            try {
                const snapshot = await userRef.once('value');
                console.log("Current user data:", snapshot.val());
            } catch (readError) {
                console.error("Error reading user data (permission issue?):", readError);
            }
            
            // Now try to update
            await userRef.update({
                displayName: displayName,
                lastUpdated: new Date().toISOString()
            });
            
            console.log(`Display name successfully updated to "${displayName}"`);
            return true;
        } catch (error) {
            console.error("Error updating display name:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            
            if (error.code === 'PERMISSION_DENIED') {
                console.error("This is a Firebase permissions issue. Check your database rules.");
            }
            
            return Promise.reject(error);
        }
    }

    /**
     * Save high score to Firebase with custom display name
     * @param {string} userId - User ID
     * @param {number} score - Score to save
     * @param {string} displayName - User's display name
     * @returns {Promise} - Save result
     */
    async saveHighScoreWithName(userId, score, displayName) {
        console.log(`Attempting to save score ${score} for user ${userId} with name "${displayName}"`);
        
        if (!this.db) {
            console.error("Firebase database not available");
            return Promise.reject(new Error("Firebase database not available"));
        }

        try {
            console.log(`Writing to database path: users/${userId}`);
            const userRef = this.db.ref(`users/${userId}`);
            
            // First check if we can read from this location (to test permissions)
            let currentHighScore = 0;
            try {
                const snapshot = await userRef.once('value');
                const userData = snapshot.val() || {};
                currentHighScore = userData.highScore || 0;
                console.log("Current user data:", userData);
                console.log(`Current high score: ${currentHighScore}`);
            } catch (readError) {
                console.error("Error reading user data (permission issue?):", readError);
            }
            
            // Only update if new score is higher
            if (score > currentHighScore) {
                console.log(`New score ${score} is higher than current high score ${currentHighScore}, updating...`);
                await userRef.update({
                    highScore: score,
                    displayName: displayName,
                    lastPlayed: new Date().toISOString()
                });
                console.log(`High score updated to ${score} for ${displayName}`);
                return true;
            } else {
                // Even if score isn't higher, update the display name
                console.log(`Score ${score} is not higher than current high score ${currentHighScore}, only updating name...`);
                await userRef.update({
                    displayName: displayName,
                    lastPlayed: new Date().toISOString()
                });
                console.log(`Display name updated to ${displayName}`);
                return false;
            }
        } catch (error) {
            console.error("Error saving high score with name:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            
            if (error.code === 'PERMISSION_DENIED') {
                console.error("This is a Firebase permissions issue. Check your database rules.");
            }
            
            return Promise.reject(error);
        }
    }

    /**
     * Test database access to diagnose permission issues
     * @returns {Promise<Object>} - Test results
     */
    async testDatabaseAccess() {
        console.log("Testing Firebase database access...");
        
        const results = {
            authenticated: false,
            canReadUsers: false,
            canWriteOwnData: false,
            error: null
        };
        
        if (!this.auth || !this.db) {
            console.error("Firebase not initialized");
            results.error = "Firebase not initialized";
            return results;
        }
        
        try {
            // Check if user is authenticated
            const user = this.auth.currentUser;
            results.authenticated = !!user;
            console.log(`User authenticated: ${results.authenticated}`);
            
            if (user) {
                console.log(`Current user ID: ${user.uid}`);
                console.log(`Current user email: ${user.email}`);
                
                // Test reading users node
                try {
                    console.log("Testing read access to /users node...");
                    const usersSnapshot = await this.db.ref('users').once('value');
                    console.log("Successfully read /users node");
                    results.canReadUsers = true;
                    
                    // Log the first few users
                    const users = usersSnapshot.val() || {};
                    const userIds = Object.keys(users).slice(0, 3);
                    console.log(`Found ${Object.keys(users).length} users. First few: ${userIds.join(', ')}`);
                } catch (readError) {
                    console.error("Error reading /users node:", readError);
                    results.error = `Cannot read users: ${readError.message}`;
                }
                
                // Test writing to own user data
                try {
                    console.log(`Testing write access to /users/${user.uid} node...`);
                    const testData = {
                        testField: `Test at ${new Date().toISOString()}`
                    };
                    await this.db.ref(`users/${user.uid}/test`).set(testData);
                    console.log("Successfully wrote test data to user node");
                    results.canWriteOwnData = true;
                } catch (writeError) {
                    console.error("Error writing to user node:", writeError);
                    results.error = `Cannot write to own data: ${writeError.message}`;
                }
            } else {
                results.error = "User not authenticated";
            }
            
            return results;
        } catch (error) {
            console.error("Error testing database access:", error);
            results.error = error.message;
            return results;
        }
    }
}

// Export as singleton
const firebaseManager = new FirebaseManager();
export default firebaseManager; 