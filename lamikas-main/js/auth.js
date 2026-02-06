class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.isAuthenticated = true; // Always authenticated
    }

    // Mock user data - always available
    async checkAuth() {
        // Always return true - no authentication required
        this.currentUser = {
            id: 1,
            email: 'demo@lamikas.com',
            full_name: 'Demo User',
            user_type: 'landlord'
        };
        
        this.userProfile = {
            full_name: 'Demo User',
            email: 'demo@lamikas.com',
            phone: '+1234567890',
            company: 'Demo Property Management'
        };
        
        this.isAuthenticated = true;
        return true;
    }

    async login(email, password) {
        // Mock login - always succeeds
        this.currentUser = {
            id: 1,
            email: email || 'demo@lamikas.com',
            full_name: email ? email.split('@')[0] : 'Demo User',
            user_type: 'landlord'
        };
        
        this.userProfile = {
            full_name: email ? email.split('@')[0] : 'Demo User',
            email: email || 'demo@lamikas.com',
            phone: '+1234567890',
            company: 'Demo Property Management'
        };
        
        this.isAuthenticated = true;
        return { success: true, user: this.currentUser };
    }

    async logout() {
        // Just clear local data but stay authenticated
        this.currentUser = null;
        this.userProfile = null;
        return { success: true };
    }

    // Always return user data
    getCurrentUser() {
        return this.currentUser || {
            id: 1,
            email: 'demo@lamikas.com',
            full_name: 'Demo User',
            user_type: 'landlord'
        };
    }

    getUserProfile() {
        return this.userProfile || {
            full_name: 'Demo User',
            email: 'demo@lamikas.com',
            phone: '+1234567890',
            company: 'Demo Property Management'
        };
    }

    getIsAuthenticated() {
        return true;
    }

    getUserInitials() {
        const user = this.getCurrentUser();
        if (user?.full_name) {
            return user.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();
        }
        return 'DU';
    }

    // These methods are kept for compatibility but do nothing
    getToken() { return 'demo-token'; }
    setToken() { }
    clearAuth() { }
    async register() { return { success: true }; }
    async loadUserProfile() { return this.getUserProfile(); }
    async updateProfile() { return { success: true }; }
}

const authManager = new AuthManager();
window.authManager = authManager;

export { authManager };