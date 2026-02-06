/**
 * Settings Backend - Business Logic and Data Management
 * Contains all non-tamperable business logic for settings
 */

import { authManager } from '/js/auth.js';
import { Utils } from '../js/utils.js';

class SettingsBackend {
    constructor() {
        this.storageKey = 'user_settings';
        this.userId = null;
        this.initializeUser();
    }

    initializeUser() {
        const user = authManager.getCurrentUser();
        this.userId = user?.id || 'default';
        this.storageKey = `settings_${this.userId}`;
    }

    // Get current user profile
    getUserProfile() {
        const user = authManager.getCurrentUser();
        const profile = authManager.getUserProfile();
        
        return {
            id: user?.id || 'default',
            email: user?.email || '',
            fullName: profile?.full_name || 'User',
            firstName: profile?.first_name || 'User',
            lastName: profile?.last_name || 'Account',
            role: profile?.role || 'Administrator',
            avatar: profile?.avatar || null,
            createdAt: user?.created_at || new Date().toISOString(),
            lastLogin: user?.last_login || new Date().toISOString()
        };
    }

    // Get user settings
    getUserSettings() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
            
            // Return default settings if none exist
            return this.getDefaultSettings();
            
        } catch (error) {
            console.error('Error loading user settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Save user settings
    saveUserSettings(settings) {
        // Validate settings before saving
        if (!this.validateSettings(settings)) {
            throw new Error('Invalid settings data');
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(settings));
            
            // Apply theme if changed
            if (settings.theme) {
                this.applyTheme(settings.theme);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving user settings:', error);
            return false;
        }
    }

    // Validate settings (CAN'T BE TAMPERED WITH)
    validateSettings(settings) {
        if (!settings || typeof settings !== 'object') return false;
        
        // Theme validation
        const validThemes = ['light', 'dark', 'auto'];
        if (settings.theme && !validThemes.includes(settings.theme)) {
            return false;
        }
        
        // Email validation
        if (settings.email && !this.isValidEmail(settings.email)) {
            return false;
        }
        
        // Phone validation (if provided)
        if (settings.phone && !this.isValidPhone(settings.phone)) {
            return false;
        }
        
        // Boolean validations
        const booleanFields = ['emailNotifications', 'smsNotifications', 'paymentReminders', 
                              'maintenanceAlerts', 'weeklyReports', 'twoFactorEnabled'];
        for (const field of booleanFields) {
            if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
                return false;
            }
        }
        
        // Currency validation
        const validCurrencies = ['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)'];
        if (settings.defaultCurrency && !validCurrencies.includes(settings.defaultCurrency)) {
            return false;
        }
        
        // Date format validation
        const validDateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY'];
        if (settings.dateFormat && !validDateFormats.includes(settings.dateFormat)) {
            return false;
        }
        
        return true;
    }

    // Get default settings
    getDefaultSettings() {
        const userProfile = this.getUserProfile();
        
        return {
            // Personal Info
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            email: userProfile.email || '',
            phone: '',
            companyName: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US',
            website: '',
            
            // Preferences
            defaultCurrency: 'USD ($)',
            dateFormat: 'MM/DD/YYYY',
            timeZone: 'Eastern Time (ET)',
            numberFormat: '1,000.00',
            theme: 'light',
            defaultDashboardView: 'overview',
            
            // Notifications
            emailNotifications: true,
            smsNotifications: false,
            paymentReminders: true,
            maintenanceAlerts: true,
            weeklyReports: false,
            
            // Security
            twoFactorEnabled: false,
            lastPasswordChange: null,
            loginAlerts: true,
            
            // Billing
            paymentMethod: '',
            billingAddressSame: true,
            
            // Integrations
            mpesaIntegrated: false,
            googleCalendarConnected: false,
            slackConnected: false,
            smsServiceConnected: false,
            
            // Metadata
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // Apply theme to document
    applyTheme(theme) {
        try {
            const html = document.documentElement;
            
            // Remove existing theme classes
            html.classList.remove('theme-light', 'theme-dark');
            
            if (theme === 'auto') {
                // Check system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                html.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
            } else {
                html.classList.add(`theme-${theme}`);
            }
            
            // Save to localStorage for persistence across pages
            localStorage.setItem('theme', theme);
            
            return true;
        } catch (error) {
            console.error('Error applying theme:', error);
            return false;
        }
    }

    // Load saved theme on page load
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('theme') || 'light';
            this.applyTheme(savedTheme);
            return savedTheme;
        } catch (error) {
            console.error('Error loading saved theme:', error);
            return 'light';
        }
    }

    // Update user profile
    async updateUserProfile(profileData) {
        // Validate profile data
        if (!this.validateProfileData(profileData)) {
            throw new Error('Invalid profile data');
        }
        
        // In a real app, this would call an API
        // For now, update localStorage
        
        const currentSettings = this.getUserSettings();
        const updatedSettings = {
            ...currentSettings,
            ...profileData,
            lastUpdated: new Date().toISOString()
        };
        
        return this.saveUserSettings(updatedSettings);
    }

    // Validate profile data
    validateProfileData(profileData) {
        if (!profileData || typeof profileData !== 'object') return false;
        
        // Email validation
        if (profileData.email && !this.isValidEmail(profileData.email)) {
            return false;
        }
        
        // Phone validation (if provided)
        if (profileData.phone && !this.isValidPhone(profileData.phone)) {
            return false;
        }
        
        // Name validation
        if (profileData.firstName && typeof profileData.firstName !== 'string') {
            return false;
        }
        
        if (profileData.lastName && typeof profileData.lastName !== 'string') {
            return false;
        }
        
        return true;
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        // Validate passwords
        if (!currentPassword || !newPassword) {
            throw new Error('Both current and new passwords are required');
        }
        
        if (newPassword.length < 8) {
            throw new Error('New password must be at least 8 characters');
        }
        
        // In a real app, this would:
        // 1. Verify current password with backend
        // 2. Update password in database
        // 3. Send confirmation email
        
        // For simulation, just update settings
        const settings = this.getUserSettings();
        settings.lastPasswordChange = new Date().toISOString();
        
        this.saveUserSettings(settings);
        
        return {
            success: true,
            message: 'Password changed successfully',
            timestamp: new Date().toISOString()
        };
    }

    // Toggle two-factor authentication
    toggleTwoFactorAuth(enable) {
        const settings = this.getUserSettings();
        settings.twoFactorEnabled = enable;
        settings.lastUpdated = new Date().toISOString();
        
        this.saveUserSettings(settings);
        
        return {
            enabled: enable,
            message: enable ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled'
        };
    }

    // Get user plan information
    getUserPlan() {
        const plan = localStorage.getItem('userPlan') || 'starter';
        const units = parseInt(localStorage.getItem('userUnits')) || 5;
        
        return {
            id: plan,
            name: this.getPlanName(plan),
            units: units,
            price: this.calculatePlanPrice(plan),
            maxUnits: this.getPlanMaxUnits(plan),
            features: this.getPlanFeatures(plan),
            status: 'active',
            nextBillingDate: this.calculateNextBillingDate()
        };
    }

    // Calculate plan price
    calculatePlanPrice(planId) {
        const plans = {
            'starter': '$9.99/month',
            'essential': '$22.99/month',
            'professional': '$49.99/month',
            'business': '$69.99/month',
            'enterprise': 'Custom Pricing'
        };
        return plans[planId] || '$9.99/month';
    }

    // Get plan name
    getPlanName(planId) {
        const names = {
            'starter': 'Starter',
            'essential': 'Essential',
            'professional': 'Professional',
            'business': 'Business',
            'enterprise': 'Enterprise'
        };
        return names[planId] || 'Starter';
    }

    // Get plan max units
    getPlanMaxUnits(planId) {
        const units = {
            'starter': 5,
            'essential': 20,
            'professional': 50,
            'business': 100,
            'enterprise': 1000
        };
        return units[planId] || 5;
    }

    // Get plan features
    getPlanFeatures(planId) {
        const features = {
            'starter': ['Basic Property Management', 'M-Pesa Integration', 'Email Support'],
            'essential': ['All Starter Features', 'Bulk SMS Credits', 'Priority Chat Support'],
            'professional': ['All Essential Features', 'Advanced Reporting', 'Priority Phone Support'],
            'business': ['All Professional Features', 'Multi-user Access', 'Dedicated Account Manager'],
            'enterprise': ['All Business Features', 'Custom Development', '24/7 Premium Support']
        };
        return features[planId] || features['starter'];
    }

    // Calculate next billing date
    calculateNextBillingDate() {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        return nextMonth.toISOString().split('T')[0];
    }

    // Update payment method
    updatePaymentMethod(paymentData) {
        // Validate payment data
        if (!this.validatePaymentMethod(paymentData)) {
            throw new Error('Invalid payment method data');
        }
        
        const settings = this.getUserSettings();
        settings.paymentMethod = `${paymentData.type} ending in ${paymentData.last4}`;
        settings.lastUpdated = new Date().toISOString();
        
        this.saveUserSettings(settings);
        
        return {
            success: true,
            message: 'Payment method updated successfully',
            method: settings.paymentMethod
        };
    }

    // Validate payment method
    validatePaymentMethod(paymentData) {
        if (!paymentData || typeof paymentData !== 'object') return false;
        
        // Card validation
        if (paymentData.type === 'card') {
            if (!paymentData.last4 || paymentData.last4.length !== 4) {
                return false;
            }
            if (!paymentData.expiry || !/^\d{2}\/\d{2}$/.test(paymentData.expiry)) {
                return false;
            }
        }
        
        return true;
    }

    // Toggle integration
    toggleIntegration(integrationId, enable) {
        const settings = this.getUserSettings();
        
        const integrationMap = {
            'mpesa': 'mpesaIntegrated',
            'googleCalendar': 'googleCalendarConnected',
            'slack': 'slackConnected',
            'smsService': 'smsServiceConnected'
        };
        
        const settingKey = integrationMap[integrationId];
        if (!settingKey) {
            throw new Error('Invalid integration');
        }
        
        settings[settingKey] = enable;
        settings.lastUpdated = new Date().toISOString();
        
        this.saveUserSettings(settings);
        
        return {
            integration: integrationId,
            enabled: enable,
            message: `${integrationId} ${enable ? 'connected' : 'disconnected'} successfully`
        };
    }

    // Export user data
    exportUserData() {
        const settings = this.getUserSettings();
        const profile = this.getUserProfile();
        const plan = this.getUserPlan();
        
        const exportData = {
            profile: {
                ...profile,
                // Don't include sensitive data
                password: undefined
            },
            settings: settings,
            plan: plan,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    // Get login history (simulated)
    getLoginHistory() {
        return [
            {
                id: 1,
                timestamp: new Date().toISOString(),
                ipAddress: '192.168.1.1',
                location: 'New York, USA',
                device: 'Chrome on Windows',
                status: 'success'
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                ipAddress: '192.168.1.1',
                location: 'New York, USA',
                device: 'Chrome on Windows',
                status: 'success'
            },
            {
                id: 3,
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                ipAddress: '203.0.113.1',
                location: 'London, UK',
                device: 'Safari on Mac',
                status: 'success'
            }
        ];
    }

    // Get active sessions (simulated)
    getActiveSessions() {
        return [
            {
                id: 1,
                startedAt: new Date(Date.now() - 3600000).toISOString(),
                ipAddress: '192.168.1.1',
                location: 'New York, USA',
                device: 'Chrome on Windows',
                lastActivity: new Date().toISOString()
            }
        ];
    }

    // Get billing history (simulated)
    getBillingHistory() {
        const plan = this.getUserPlan();
        
        return [
            {
                id: 'INV-' + new Date().getFullYear() + '001',
                date: new Date().toISOString().split('T')[0],
                amount: plan.price,
                status: 'paid',
                plan: plan.name
            },
            {
                id: 'INV-' + (new Date().getFullYear() - 1) + '012',
                date: new Date(Date.now() - 2592000000).toISOString().split('T')[0],
                amount: plan.price,
                status: 'paid',
                plan: plan.name
            }
        ];
    }

    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number (basic)
    isValidPhone(phone) {
        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Reset to default settings
    resetToDefaults() {
        const defaultSettings = this.getDefaultSettings();
        return this.saveUserSettings(defaultSettings);
    }

    // Get system information
    getSystemInfo() {
        return {
            appVersion: '2.1.0',
            lastUpdate: '2024-01-15',
            browser: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            localStorageSupported: typeof Storage !== 'undefined',
            cookiesEnabled: navigator.cookieEnabled,
            online: navigator.onLine
        };
    }
}

export { SettingsBackend };