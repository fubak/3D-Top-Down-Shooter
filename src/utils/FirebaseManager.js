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
        if (!this.db) {
            return Promise.reject(new Error("Firebase database not available"));
        }

        try {
            await this.db.ref(`users/${userId}`).update({
                displayName: displayName
            });
            return true;
        } catch (error) {
            console.error("Error updating display name:", error);
            return Promise.reject(error);
        }
    }
}

// Export as singleton
const firebaseManager = new FirebaseManager();
export default firebaseManager; 