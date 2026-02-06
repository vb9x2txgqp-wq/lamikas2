/**
 * Settings Frontend - UI Rendering and Event Handling
 * Contains all UI-related code for settings
 */

import { SettingsBackend } from '../functions/settings.js';
import { authManager } from './auth.js';

class SettingsFrontend {
    constructor() {
        this.backend = new SettingsBackend();
        this.isInitialized = false;
        this.currentSettings = null;
        this.userProfile = null;
        this.currentSection = 'profile';
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Load user data
            await this.loadUserData();
            
            // Inject HTML template with real user data
            this.injectTemplate();
            
            // Apply saved theme
            this.backend.loadSavedTheme();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render current section
            this.renderCurrentSection();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Error initializing settings page:', error);
            window.mainApp?.showNotification('Failed to load settings page', 'error');
        }
    }

    async loadUserData() {
        this.userProfile = this.backend.getUserProfile();
        this.currentSettings = this.backend.getUserSettings();
    }

    // Inject HTML template with REAL user data
    injectTemplate() {
        const container = document.getElementById('settings');
        if (!container) return;

        const userPlan = this.backend.getUserPlan();
        const planName = this.backend.getPlanName(userPlan.id);
        
        container.innerHTML = `
<main class="p-4 lg:p-6 fade-in">
  <!-- Top Bar -->
  <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Settings & Preferences</h1>
      <p class="text-gray-600">Manage your account, preferences, and system settings</p>
    </div>
    <div class="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
      Current Plan: <span id="currentPlanBadge" class="font-bold">${planName}</span> (${userPlan.units} units)
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Left Navigation -->
    <div class="lg:col-span-1">
      <div class="bg-white rounded-xl shadow p-4 mb-6">
        <h3 class="font-semibold text-lg mb-4">Settings Menu</h3>
        <nav class="space-y-2">
          <button data-section="profile" class="settings-nav-btn active w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 font-medium">
            <i class="fas fa-user-circle mr-2"></i> Profile
          </button>
          <button data-section="company" class="settings-nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-building mr-2"></i> Company
          </button>
          <button data-section="notifications" class="settings-nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-bell mr-2"></i> Notifications
          </button>
          <button data-section="preferences" class="settings-nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-cog mr-2"></i> Preferences
          </button>
          <button data-section="security" class="settings-nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-shield-alt mr-2"></i> Security
          </button>
          <button data-section="billing" class="settings-nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-credit-card mr-2"></i> Billing & Plan
          </button>
          <button data-section="integrations" class="settings-nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-plug mr-2"></i> Integrations
          </button>
        </nav>
      </div>
      
      <div class="bg-white rounded-xl shadow p-4">
        <h3 class="font-semibold text-lg mb-3">Quick Actions</h3>
        <div class="space-y-3">
          <button id="exportDataBtn" class="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-blue-600">
            <i class="fas fa-download mr-2"></i> Export Data
          </button>
          <button id="getSupportBtn" class="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-headset mr-2"></i> Get Support
          </button>
          <button id="viewTutorialsBtn" class="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
            <i class="fas fa-graduation-cap mr-2"></i> View Tutorials
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="lg:col-span-3">
      <!-- Profile Section -->
      <div id="profileSection" class="settings-section active">
        <div class="bg-white rounded-xl shadow mb-6">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold">Profile Information</h3>
            <p class="text-gray-600 text-sm mt-1">Update your personal details and contact information</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input type="text" id="firstName" value="${this.escapeHtml(this.currentSettings.firstName)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input type="text" id="lastName" value="${this.escapeHtml(this.currentSettings.lastName)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input type="email" id="email" value="${this.escapeHtml(this.currentSettings.email)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" id="phone" value="${this.escapeHtml(this.currentSettings.phone)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                <div class="flex items-center space-x-4">
                  <div id="profileAvatar" class="w-16 h-16 ${this.userProfile.avatar ? '' : 'bg-blue-100'} rounded-full flex items-center justify-center overflow-hidden">
                    ${this.userProfile.avatar ? 
                      `<img src="${this.escapeHtml(this.userProfile.avatar)}" alt="Profile" class="w-full h-full object-cover">` : 
                      `<i class="fas fa-user text-blue-600 text-2xl"></i>`
                    }
                  </div>
                  <div>
                    <button id="uploadPhotoBtn" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                      Upload New Photo
                    </button>
                    <p class="text-xs text-gray-500 mt-1">JPG, PNG or GIF, max 5MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Company Section -->
      <div id="companySection" class="settings-section hidden">
        <div class="bg-white rounded-xl shadow mb-6">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold">Company Information</h3>
            <p class="text-gray-600 text-sm mt-1">Update your company details and business information</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input type="text" id="companyName" value="${this.escapeHtml(this.currentSettings.companyName)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input type="text" id="address" value="${this.escapeHtml(this.currentSettings.address)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input type="text" id="city" value="${this.escapeHtml(this.currentSettings.city)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input type="text" id="state" value="${this.escapeHtml(this.currentSettings.state)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                <input type="text" id="zipCode" value="${this.escapeHtml(this.currentSettings.zipCode)}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <select id="country" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="US" ${this.currentSettings.country === 'US' ? 'selected' : ''}>United States</option>
                  <option value="CA" ${this.currentSettings.country === 'CA' ? 'selected' : ''}>Canada</option>
                  <option value="UK" ${this.currentSettings.country === 'UK' ? 'selected' : ''}>United Kingdom</option>
                  <option value="AU" ${this.currentSettings.country === 'AU' ? 'selected' : ''}>Australia</option>
                  <option value="KE" ${this.currentSettings.country === 'KE' ? 'selected' : ''}>Kenya</option>
                  <option value="ZA" ${this.currentSettings.country === 'ZA' ? 'selected' : ''}>South Africa</option>
                </select>
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                <input type="url" id="website" value="${this.escapeHtml(this.currentSettings.website || '')}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="https://example.com">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div id="notificationsSection" class="settings-section hidden">
        <div class="bg-white rounded-xl shadow mb-6">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold">Notification Preferences</h3>
            <p class="text-gray-600 text-sm mt-1">Configure how and when you receive notifications</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-medium">Email Notifications</p>
                  <p class="text-sm text-gray-500">Receive email alerts for payments, maintenance, and updates</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="emailNotifications" ${this.currentSettings.emailNotifications ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-medium">SMS Notifications</p>
                  <p class="text-sm text-gray-500">Receive text messages for urgent matters and reminders</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="smsNotifications" ${this.currentSettings.smsNotifications ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-medium">Payment Reminders</p>
                  <p class="text-sm text-gray-500">Automated payment reminder emails to tenants</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="paymentReminders" ${this.currentSettings.paymentReminders ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-medium">Maintenance Alerts</p>
                  <p class="text-sm text-gray-500">Notifications for new maintenance requests</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="maintenanceAlerts" ${this.currentSettings.maintenanceAlerts ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-medium">Weekly Reports</p>
                  <p class="text-sm text-gray-500">Weekly summary emails about your properties</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="weeklyReports" ${this.currentSettings.weeklyReports ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferences Section -->
      <div id="preferencesSection" class="settings-section hidden">
        <div class="bg-white rounded-xl shadow mb-6">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold">System Preferences</h3>
            <p class="text-gray-600 text-sm mt-1">Customize your dashboard and system behavior</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                <select id="defaultCurrency" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="USD ($)" ${this.currentSettings.defaultCurrency === 'USD ($)' ? 'selected' : ''}>USD ($)</option>
                  <option value="EUR (€)" ${this.currentSettings.defaultCurrency === 'EUR (€)' ? 'selected' : ''}>EUR (€)</option>
                  <option value="GBP (£)" ${this.currentSettings.defaultCurrency === 'GBP (£)' ? 'selected' : ''}>GBP (£)</option>
                  <option value="CAD ($)" ${this.currentSettings.defaultCurrency === 'CAD ($)' ? 'selected' : ''}>CAD ($)</option>
                  <option value="AUD ($)" ${this.currentSettings.defaultCurrency === 'AUD ($)' ? 'selected' : ''}>AUD ($)</option>
                  <option value="KES (KSh)" ${this.currentSettings.defaultCurrency === 'KES (KSh)' ? 'selected' : ''}>KES (KSh)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                <select id="dateFormat" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="MM/DD/YYYY" ${this.currentSettings.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY" ${this.currentSettings.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD" ${this.currentSettings.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                  <option value="DD MMM YYYY" ${this.currentSettings.dateFormat === 'DD MMM YYYY' ? 'selected' : ''}>DD MMM YYYY</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <select id="timeZone" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Eastern Time (ET)" ${this.currentSettings.timeZone === 'Eastern Time (ET)' ? 'selected' : ''}>Eastern Time (ET)</option>
                  <option value="Central Time (CT)" ${this.currentSettings.timeZone === 'Central Time (CT)' ? 'selected' : ''}>Central Time (CT)</option>
                  <option value="Mountain Time (MT)" ${this.currentSettings.timeZone === 'Mountain Time (MT)' ? 'selected' : ''}>Mountain Time (MT)</option>
                  <option value="Pacific Time (PT)" ${this.currentSettings.timeZone === 'Pacific Time (PT)' ? 'selected' : ''}>Pacific Time (PT)</option>
                  <option value="UTC" ${this.currentSettings.timeZone === 'UTC' ? 'selected' : ''}>UTC</option>
                  <option value="East Africa Time (EAT)" ${this.currentSettings.timeZone === 'East Africa Time (EAT)' ? 'selected' : ''}>East Africa Time (EAT)</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Number Format</label>
                <select id="numberFormat" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="1,000.00" ${this.currentSettings.numberFormat === '1,000.00' ? 'selected' : ''}>1,000.00 (US)</option>
                  <option value="1.000,00" ${this.currentSettings.numberFormat === '1.000,00' ? 'selected' : ''}>1.000,00 (EU)</option>
                  <option value="1 000.00" ${this.currentSettings.numberFormat === '1 000.00' ? 'selected' : ''}>1 000.00</option>
                </select>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Dashboard Theme</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input type="radio" name="theme" value="light" ${this.currentSettings.theme === 'light' ? 'checked' : ''} class="mr-2">
                    <span>Light</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" name="theme" value="dark" ${this.currentSettings.theme === 'dark' ? 'checked' : ''} class="mr-2">
                    <span>Dark</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" name="theme" value="auto" ${this.currentSettings.theme === 'auto' ? 'checked' : ''} class="mr-2">
                    <span>Auto (System)</span>
                  </label>
                </div>
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Default Dashboard View</label>
                <select id="defaultDashboardView" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="overview" ${this.currentSettings.defaultDashboardView === 'overview' ? 'selected' : ''}>Overview</option>
                  <option value="properties" ${this.currentSettings.defaultDashboardView === 'properties' ? 'selected' : ''}>Properties</option>
                  <option value="financial" ${this.currentSettings.defaultDashboardView === 'financial' ? 'selected' : ''}>Financial</option>
                  <option value="map" ${this.currentSettings.defaultDashboardView === 'map' ? 'selected' : ''}>Map View</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div id="securitySection" class="settings-section hidden">
        <div class="bg-white rounded-xl shadow mb-6">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold">Security Settings</h3>
            <p class="text-gray-600 text-sm mt-1">Manage your account security and access</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="font-medium">Change Password</p>
                    <p class="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <button id="changePasswordBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Change Password
                  </button>
                </div>
                <div class="text-sm text-gray-500">
                  <i class="fas fa-info-circle mr-1"></i>
                  Last changed: ${this.currentSettings.lastPasswordChange ? new Date(this.currentSettings.lastPasswordChange).toLocaleDateString() : 'Never'}
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="font-medium">Two-Factor Authentication</p>
                    <p class="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <button id="twoFactorAuthBtn" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                    ${this.currentSettings.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
                <div class="text-sm ${this.currentSettings.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}">
                  <i class="fas ${this.currentSettings.twoFactorEnabled ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
                  ${this.currentSettings.twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is not enabled'}
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="font-medium">Active Sessions</p>
                    <p class="text-sm text-gray-500">Manage your active login sessions</p>
                  </div>
                  <button id="viewSessionsBtn" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                    View All Sessions
                  </button>
                </div>
                <div class="text-sm text-gray-500">
                  <i class="fas fa-laptop mr-1"></i>
                  Current session: ${navigator.userAgent.split(')')[0].split('(')[1] || 'Unknown'}
                </div>
              </div>
              
              <div class="p-4 border border-red-200 bg-red-50 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="font-medium text-red-700">Login History</p>
                    <p class="text-sm text-red-600">View recent login attempts and activity</p>
                  </div>
                  <button id="loginHistoryBtn" class="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 font-medium">
                    View History
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing Section -->
      <div id="billingSection" class="settings-section hidden">
        <div class="bg-white rounded-xl shadow mb-6">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold">Billing & Subscription</h3>
            <p class="text-gray-600 text-sm mt-1">Manage your subscription plan and billing information</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <p class="font-medium">Current Plan</p>
                    <p class="text-sm text-gray-600">${userPlan.name} - ${userPlan.units} units</p>
                  </div>
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div class="flex items-center justify-between mt-4">
                  <div>
                    <p class="text-2xl font-bold">${userPlan.price}</p>
                    <p class="text-sm text-gray-500">per month</p>
                  </div>
                  <button id="upgradePlanSettingsBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Upgrade Plan
                  </button>
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="font-medium">Payment Method</p>
                    <p class="text-sm text-gray-500">Manage your billing information</p>
                  </div>
                  <button id="managePaymentMethodBtn" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                    Update Payment
                  </button>
                </div>
                <div class="text-sm text-gray-500">
                  <i class="fas fa-credit-card mr-1"></i>
                  ${this.currentSettings.paymentMethod || 'No payment method on file'}
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="font-medium">Billing History</p>
                    <p class="text-sm text-gray-500">View and download your invoices</p>
                  </div>
                  <button id="viewInvoicesBtn" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                    View Invoices
                  </button>
                </div>
              </div>
              
              <div class="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-yellow-800">Cancel Subscription</p>
                    <p class="text-sm text-yellow-700">Cancel your subscription at any time</p>
                  </div>
                  <button id="cancelSubscriptionBtn" class="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium">
                    Cancel Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Integrations Section -->
      <div id="integrationsSection" class="settings-section hidden">
        <div class="bg-white rounded-xl shadow mb-6">
          <div class="p-6 border-b">
            <h3 class="text-xl font-semibold">Integrations</h3>
            <p class="text-gray-600 text-sm mt-1">Connect with other services and platforms</p>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-money-bill-wave text-green-600"></i>
                    </div>
                    <div>
                      <p class="font-medium">M-Pesa Integration</p>
                      <p class="text-sm text-gray-500">Process payments through M-Pesa</p>
                    </div>
                  </div>
                  <button id="mpesaIntegrationBtn" class="px-4 py-2 ${this.currentSettings.mpesaIntegrated ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg font-medium">
                    ${this.currentSettings.mpesaIntegrated ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fab fa-google text-blue-600"></i>
                    </div>
                    <div>
                      <p class="font-medium">Google Calendar</p>
                      <p class="text-sm text-gray-500">Sync maintenance schedules and appointments</p>
                    </div>
                  </div>
                  <button id="googleCalendarBtn" class="px-4 py-2 ${this.currentSettings.googleCalendarConnected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg font-medium">
                    ${this.currentSettings.googleCalendarConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fab fa-slack text-red-600"></i>
                    </div>
                    <div>
                      <p class="font-medium">Slack Notifications</p>
                      <p class="text-sm text-gray-500">Get notifications in your Slack workspace</p>
                    </div>
                  </div>
                  <button id="slackIntegrationBtn" class="px-4 py-2 ${this.currentSettings.slackConnected ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg font-medium">
                    ${this.currentSettings.slackConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
              
              <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-sms text-purple-600"></i>
                    </div>
                    <div>
                      <p class="font-medium">Bulk SMS Service</p>
                      <p class="text-sm text-gray-500">Send SMS notifications to tenants</p>
                    </div>
                  </div>
                  <button id="smsServiceBtn" class="px-4 py-2 ${this.currentSettings.smsServiceConnected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg font-medium">
                    ${this.currentSettings.smsServiceConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex justify-between items-center">
          <div>
            <p class="font-medium">Save your changes</p>
            <p class="text-sm text-gray-500">Click save to apply all your settings</p>
          </div>
          <div class="flex space-x-3">
            <button id="resetSettingsBtn" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              Reset
            </button>
            <button id="saveAllSettingsBtn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
        `;
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Quick Actions
        document.getElementById('exportDataBtn')?.addEventListener('click', () => this.exportUserData());
        document.getElementById('getSupportBtn')?.addEventListener('click', () => this.getSupport());
        document.getElementById('viewTutorialsBtn')?.addEventListener('click', () => this.viewTutorials());

        // Save All Changes button
        document.getElementById('saveAllSettingsBtn')?.addEventListener('click', () => this.saveAllSettings());

        // Reset button
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => this.resetSettings());

        // Profile section
        document.getElementById('uploadPhotoBtn')?.addEventListener('click', () => this.uploadProfilePhoto());

        // Security section
        document.getElementById('changePasswordBtn')?.addEventListener('click', () => this.showChangePasswordModal());
        document.getElementById('twoFactorAuthBtn')?.addEventListener('click', () => this.toggleTwoFactorAuth());
        document.getElementById('viewSessionsBtn')?.addEventListener('click', () => this.showActiveSessionsModal());
        document.getElementById('loginHistoryBtn')?.addEventListener('click', () => this.showLoginHistoryModal());

        // Billing section
        document.getElementById('upgradePlanSettingsBtn')?.addEventListener('click', () => this.showUpgradePlanModal());
        document.getElementById('managePaymentMethodBtn')?.addEventListener('click', () => this.showPaymentMethodModal());
        document.getElementById('viewInvoicesBtn')?.addEventListener('click', () => this.showInvoicesModal());
        document.getElementById('cancelSubscriptionBtn')?.addEventListener('click', () => this.cancelSubscription());

        // Integrations section
        document.getElementById('mpesaIntegrationBtn')?.addEventListener('click', () => this.toggleIntegration('mpesa'));
        document.getElementById('googleCalendarBtn')?.addEventListener('click', () => this.toggleIntegration('googleCalendar'));
        document.getElementById('slackIntegrationBtn')?.addEventListener('click', () => this.toggleIntegration('slack'));
        document.getElementById('smsServiceBtn')?.addEventListener('click', () => this.toggleIntegration('smsService'));
    }

    switchSection(section) {
        this.currentSection = section;
        
        // Update navigation buttons
        document.querySelectorAll('.settings-nav-btn').forEach(btn => {
            btn.classList.remove('active', 'text-blue-600', 'hover:bg-blue-50');
            btn.classList.add('text-gray-700', 'hover:bg-gray-50');
        });
        
        const activeBtn = document.querySelector(`.settings-nav-btn[data-section="${section}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('text-gray-700', 'hover:bg-gray-50');
            activeBtn.classList.add('active', 'text-blue-600', 'hover:bg-blue-50');
        }
        
        // Show selected section
        document.querySelectorAll('.settings-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
            sectionEl.classList.add('hidden');
        });
        
        const activeSection = document.getElementById(`${section}Section`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
            activeSection.classList.add('active');
        }
    }

    renderCurrentSection() {
        // Each section is already rendered in the template
        // Additional rendering logic can be added here if needed
    }

    async saveAllSettings() {
        try {
            // Collect all form data
            const updatedSettings = { ...this.currentSettings };
            
            // Profile section
            updatedSettings.firstName = document.getElementById('firstName')?.value || '';
            updatedSettings.lastName = document.getElementById('lastName')?.value || '';
            updatedSettings.email = document.getElementById('email')?.value || '';
            updatedSettings.phone = document.getElementById('phone')?.value || '';
            
            // Company section
            updatedSettings.companyName = document.getElementById('companyName')?.value || '';
            updatedSettings.address = document.getElementById('address')?.value || '';
            updatedSettings.city = document.getElementById('city')?.value || '';
            updatedSettings.state = document.getElementById('state')?.value || '';
            updatedSettings.zipCode = document.getElementById('zipCode')?.value || '';
            updatedSettings.country = document.getElementById('country')?.value || 'US';
            updatedSettings.website = document.getElementById('website')?.value || '';
            
            // Notifications section
            updatedSettings.emailNotifications = document.getElementById('emailNotifications')?.checked || false;
            updatedSettings.smsNotifications = document.getElementById('smsNotifications')?.checked || false;
            updatedSettings.paymentReminders = document.getElementById('paymentReminders')?.checked || false;
            updatedSettings.maintenanceAlerts = document.getElementById('maintenanceAlerts')?.checked || false;
            updatedSettings.weeklyReports = document.getElementById('weeklyReports')?.checked || false;
            
            // Preferences section
            updatedSettings.defaultCurrency = document.getElementById('defaultCurrency')?.value || 'USD ($)';
            updatedSettings.dateFormat = document.getElementById('dateFormat')?.value || 'MM/DD/YYYY';
            updatedSettings.timeZone = document.getElementById('timeZone')?.value || 'Eastern Time (ET)';
            updatedSettings.numberFormat = document.getElementById('numberFormat')?.value || '1,000.00';
            updatedSettings.defaultDashboardView = document.getElementById('defaultDashboardView')?.value || 'overview';
            
            // Theme
            const themeInput = document.querySelector('input[name="theme"]:checked');
            updatedSettings.theme = themeInput?.value || 'light';
            
            // Apply theme immediately
            this.backend.applyTheme(updatedSettings.theme);
            
            // Save settings
            const success = this.backend.saveUserSettings(updatedSettings);
            
            if (success) {
                this.currentSettings = updatedSettings;
                window.mainApp?.showNotification('All settings saved successfully!', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
            
        } catch (error) {
            console.error('Error saving settings:', error);
            window.mainApp?.showNotification('Failed to save settings', 'error');
        }
    }

    async resetSettings() {
        if (!confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            return;
        }
        
        try {
            const success = this.backend.resetToDefaults();
            
            if (success) {
                // Reload data
                await this.loadUserData();
                
                // Re-inject template with default values
                this.injectTemplate();
                
                // Re-setup event listeners
                this.setupEventListeners();
                
                // Switch back to profile section
                this.switchSection('profile');
                
                window.mainApp?.showNotification('Settings reset to defaults', 'success');
            } else {
                throw new Error('Failed to reset settings');
            }
            
        } catch (error) {
            console.error('Error resetting settings:', error);
            window.mainApp?.showNotification('Failed to reset settings', 'error');
        }
    }

    async uploadProfilePhoto() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                window.mainApp?.showNotification('File size must be less than 5MB', 'error');
                return;
            }
            
            try {
                // In a real app, this would upload to a server
                // For now, create a local URL
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const avatar = e.target.result;
                    
                    // Update avatar display
                    const avatarContainer = document.getElementById('profileAvatar');
                    if (avatarContainer) {
                        avatarContainer.innerHTML = `<img src="${avatar}" alt="Profile" class="w-full h-full object-cover">`;
                        avatarContainer.classList.remove('bg-blue-100');
                    }
                    
                    // Update settings
                    this.currentSettings.avatar = avatar;
                    this.backend.saveUserSettings(this.currentSettings);
                    
                    window.mainApp?.showNotification('Profile photo uploaded successfully!', 'success');
                };
                
                reader.readAsDataURL(file);
                
            } catch (error) {
                console.error('Error uploading photo:', error);
                window.mainApp?.showNotification('Failed to upload photo', 'error');
            }
        };
        
        input.click();
    }

    showChangePasswordModal() {
        const modalHTML = `
            <div class="modal-overlay" id="changePasswordModal">
                <div class="modal-container max-w-md">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Change Password</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="changePasswordForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Current Password</label>
                                <input type="password" id="currentPassword" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">New Password</label>
                                <input type="password" id="newPassword" required minlength="8"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="At least 8 characters">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-2">Confirm New Password</label>
                                <input type="password" id="confirmPassword" required minlength="8"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div class="text-sm text-gray-500">
                                <i class="fas fa-info-circle mr-1"></i>
                                Password must be at least 8 characters long
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelPasswordBtn" class="btn-secondary">Cancel</button>
                        <button id="confirmPasswordBtn" class="btn-primary">Change Password</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('changePasswordModal');
            if (!modal) return;
            
            modal.querySelector('#cancelPasswordBtn').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('#confirmPasswordBtn').addEventListener('click', async () => {
                await this.changePassword();
            });
        }, 10);
    }

    async changePassword() {
        try {
            const currentPassword = document.getElementById('currentPassword')?.value;
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            
            // Validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                window.mainApp?.showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                window.mainApp?.showNotification('New passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                window.mainApp?.showNotification('New password must be at least 8 characters', 'error');
                return;
            }
            
            // Call backend
            const result = await this.backend.changePassword(currentPassword, newPassword);
            
            if (result.success) {
                // Close modal
                document.getElementById('changePasswordModal')?.remove();
                
                // Update display
                this.currentSettings.lastPasswordChange = result.timestamp;
                
                // Show success
                window.mainApp?.showNotification(result.message, 'success');
            }
            
        } catch (error) {
            console.error('Error changing password:', error);
            window.mainApp?.showNotification(error.message || 'Failed to change password', 'error');
        }
    }

    async toggleTwoFactorAuth() {
        try {
            const currentState = this.currentSettings.twoFactorEnabled;
            const newState = !currentState;
            
            const result = this.backend.toggleTwoFactorAuth(newState);
            
            // Update local settings
            this.currentSettings.twoFactorEnabled = newState;
            this.backend.saveUserSettings(this.currentSettings);
            
            // Update button text
            const button = document.getElementById('twoFactorAuthBtn');
            if (button) {
                button.textContent = newState ? 'Disable 2FA' : 'Enable 2FA';
            }
            
            // Update status display
            const statusEl = document.querySelector('#securitySection .text-sm');
            if (statusEl) {
                statusEl.className = `text-sm ${newState ? 'text-green-600' : 'text-gray-500'}`;
                statusEl.innerHTML = `
                    <i class="fas ${newState ? 'fa-check-circle' : 'fa-times-circle'} mr-1"></i>
                    ${newState ? 'Two-factor authentication is enabled' : 'Two-factor authentication is not enabled'}
                `;
            }
            
            window.mainApp?.showNotification(result.message, 'success');
            
        } catch (error) {
            console.error('Error toggling 2FA:', error);
            window.mainApp?.showNotification('Failed to update 2FA settings', 'error');
        }
    }

    showActiveSessionsModal() {
        const sessions = this.backend.getActiveSessions();
        
        const modalHTML = `
            <div class="modal-overlay" id="activeSessionsModal">
                <div class="modal-container max-w-3xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Active Sessions</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Started</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">IP Address</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Device</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Activity</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    ${sessions.map(session => `
                                        <tr>
                                            <td class="px-4 py-3 text-sm">${new Date(session.startedAt).toLocaleString()}</td>
                                            <td class="px-4 py-3 text-sm font-mono">${session.ipAddress}</td>
                                            <td class="px-4 py-3 text-sm">${session.location}</td>
                                            <td class="px-4 py-3 text-sm">${session.device}</td>
                                            <td class="px-4 py-3 text-sm">${new Date(session.lastActivity).toLocaleString()}</td>
                                            <td class="px-4 py-3">
                                                <button onclick="window.mainApp?.showNotification('Session terminated', 'info')" 
                                                        class="text-red-600 hover:text-red-800 text-sm">
                                                    Terminate
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                        <button class="btn-primary bg-red-600 hover:bg-red-700" 
                                onclick="window.mainApp?.showNotification('All other sessions terminated', 'warning'); this.closest('.modal-overlay').remove()">
                            Terminate All Other Sessions
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showLoginHistoryModal() {
        const history = this.backend.getLoginHistory();
        
        const modalHTML = `
            <div class="modal-overlay" id="loginHistoryModal">
                <div class="modal-container max-w-3xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Login History</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Date & Time</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">IP Address</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Device</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    ${history.map(entry => `
                                        <tr>
                                            <td class="px-4 py-3 text-sm">${new Date(entry.timestamp).toLocaleString()}</td>
                                            <td class="px-4 py-3 text-sm font-mono">${entry.ipAddress}</td>
                                            <td class="px-4 py-3 text-sm">${entry.location}</td>
                                            <td class="px-4 py-3 text-sm">${entry.device}</td>
                                            <td class="px-4 py-3">
                                                <span class="px-2 py-1 text-xs font-medium rounded-full ${entry.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                                    ${entry.status}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    showUpgradePlanModal() {
        window.mainApp?.showNotification('Opening upgrade plan modal...', 'info');
        // In your main app, this would call the existing upgrade modal
        if (window.mainApp?.showUpgradePlanModal) {
            window.mainApp.showUpgradePlanModal();
        }
    }

    showPaymentMethodModal() {
        const modalHTML = `
            <div class="modal-overlay" id="paymentMethodModal">
                <div class="modal-container max-w-md">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Update Payment Method</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="paymentMethodForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Card Number</label>
                                <input type="text" pattern="[0-9]{16}" placeholder="4242 4242 4242 4242" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Expiry Date</label>
                                    <input type="text" placeholder="MM/YY" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">CVC</label>
                                    <input type="text" pattern="[0-9]{3}" placeholder="123" 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Name on Card</label>
                                <input type="text" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelPaymentMethodBtn" class="btn-secondary">Cancel</button>
                        <button id="savePaymentMethodBtn" class="btn-primary">Update Payment Method</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        setTimeout(() => {
            const modal = document.getElementById('paymentMethodModal');
            if (!modal) return;
            
            modal.querySelector('#cancelPaymentMethodBtn').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('#savePaymentMethodBtn').addEventListener('click', async () => {
                await this.updatePaymentMethod();
            });
        }, 10);
    }

    async updatePaymentMethod() {
        try {
            // In a real app, this would process through a payment gateway
            // For simulation, just update the display
            
            const result = this.backend.updatePaymentMethod({
                type: 'card',
                last4: '4242',
                expiry: '12/25'
            });
            
            // Update display
            this.currentSettings.paymentMethod = result.method;
            this.backend.saveUserSettings(this.currentSettings);
            
            // Update UI
            const paymentMethodEl = document.querySelector('#billingSection .text-sm.text-gray-500');
            if (paymentMethodEl) {
                paymentMethodEl.innerHTML = `<i class="fas fa-credit-card mr-1"></i>${result.method}`;
            }
            
            // Close modal
            document.getElementById('paymentMethodModal')?.remove();
            
            window.mainApp?.showNotification(result.message, 'success');
            
        } catch (error) {
            console.error('Error updating payment method:', error);
            window.mainApp?.showNotification('Failed to update payment method', 'error');
        }
    }

    showInvoicesModal() {
        const invoices = this.backend.getBillingHistory();
        
        const modalHTML = `
            <div class="modal-overlay" id="invoicesModal">
                <div class="modal-container max-w-3xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Billing History</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Invoice #</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Plan</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    ${invoices.map(invoice => `
                                        <tr>
                                            <td class="px-4 py-3 text-sm font-medium">${invoice.id}</td>
                                            <td class="px-4 py-3 text-sm">${invoice.date}</td>
                                            <td class="px-4 py-3 text-sm">${invoice.plan}</td>
                                            <td class="px-4 py-3 text-sm">${invoice.amount}</td>
                                            <td class="px-4 py-3">
                                                <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">${invoice.status}</span>
                                            </td>
                                            <td class="px-4 py-3">
                                                <button onclick="window.mainApp?.showNotification('Invoice downloaded', 'success')" 
                                                        class="text-blue-600 hover:text-blue-800 text-sm">
                                                    Download
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    cancelSubscription() {
        if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
            return;
        }
        
        // In a real app, this would call an API
        window.mainApp?.showNotification('Subscription cancellation request sent. Your account will remain active until the end of your billing period.', 'warning');
    }

    async toggleIntegration(integrationId) {
        try {
            const currentState = this.currentSettings[this.getIntegrationSettingKey(integrationId)] || false;
            const newState = !currentState;
            
            const result = this.backend.toggleIntegration(integrationId, newState);
            
            // Update local settings
            this.currentSettings[this.getIntegrationSettingKey(integrationId)] = newState;
            this.backend.saveUserSettings(this.currentSettings);
            
            // Update button
            const button = document.getElementById(`${integrationId}Btn`);
            if (button) {
                if (newState) {
                    button.classList.remove('bg-gray-100', 'text-gray-700');
                    button.classList.add(this.getIntegrationButtonClass(integrationId), 'text-white');
                    button.textContent = 'Connected';
                } else {
                    button.classList.remove(this.getIntegrationButtonClass(integrationId), 'text-white');
                    button.classList.add('bg-gray-100', 'text-gray-700');
                    button.textContent = 'Connect';
                }
            }
            
            window.mainApp?.showNotification(result.message, 'success');
            
        } catch (error) {
            console.error('Error toggling integration:', error);
            window.mainApp?.showNotification('Failed to update integration', 'error');
        }
    }

    getIntegrationSettingKey(integrationId) {
        const map = {
            'mpesa': 'mpesaIntegrated',
            'googleCalendar': 'googleCalendarConnected',
            'slack': 'slackConnected',
            'smsService': 'smsServiceConnected'
        };
        return map[integrationId] || integrationId;
    }

    getIntegrationButtonClass(integrationId) {
        const map = {
            'mpesa': 'bg-green-600',
            'googleCalendar': 'bg-blue-600',
            'slack': 'bg-red-600',
            'smsService': 'bg-purple-600'
        };
        return map[integrationId] || 'bg-blue-600';
    }

    async exportUserData() {
        try {
            const exportData = this.backend.exportUserData();
            
            // Create download link
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `lamikas_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            window.mainApp?.showNotification('Data exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            window.mainApp?.showNotification('Failed to export data', 'error');
        }
    }

    getSupport() {
        window.open('https://lamikas.com/support', '_blank');
        window.mainApp?.showNotification('Opening support page...', 'info');
    }

    viewTutorials() {
        window.open('https://lamikas.com/tutorials', '_blank');
        window.mainApp?.showNotification('Opening tutorials...', 'info');
    }

    // Utility methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Refresh method for external calls
    async refresh() {
        await this.loadUserData();
        this.injectTemplate();
        this.setupEventListeners();
        this.switchSection(this.currentSection);
    }
}

export { SettingsFrontend };