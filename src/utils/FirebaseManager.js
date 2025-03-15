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
}

// Export as singleton
const firebaseManager = new FirebaseManager();
export default firebaseManager; 