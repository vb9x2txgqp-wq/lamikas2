/**
 * Properties Frontend - UI Rendering and Event Handling
 * All UI rendering, DOM manipulation, and event listeners for properties
 */

import { PropertiesBackend } from '../functions/properties.js';

class PropertiesFrontend {
    constructor() {
        this.backend = new PropertiesBackend();
        this.currentUser = null;
        this.charts = {
            propertyTypes: null,
            location: null
        };
        this.isInitialized = false;
        this.searchQuery = '';
    }

    // Initialize properties page
    async initialize() {
        try {
            // Initialize backend
            await this.backend.initialize();
            
            // Load user info
            await this.loadUserInfo();
            
            // Render properties page
            this.renderPropertiesPage();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load properties data
            await this.loadPropertiesData();
            
            // Initialize charts
            this.initializeCharts();
            
            this.isInitialized = true;
            console.log('Properties page initialized successfully');
            
        } catch (error) {
            console.error('Error initializing properties page:', error);
            this.showErrorState();
        }
    }

    // Load user information
    async loadUserInfo() {
        try {
            // Get user from auth manager
            if (typeof authManager !== 'undefined') {
                const profile = authManager.getUserProfile();
                const user = authManager.getCurrentUser();
                
                this.currentUser = {
                    name: profile?.full_name || user?.email || 'Demo User',
                    email: user?.email || 'demo@example.com',
                    role: profile?.role || user?.user_type || 'Administrator'
                };
            } else {
                // Fallback to localStorage
                const userSettings = JSON.parse(localStorage.getItem('userSettings')) || {};
                this.currentUser = {
                    name: `${userSettings.firstName || 'John'} ${userSettings.lastName || 'Doe'}`,
                    email: userSettings.email || 'john.doe@propertypro.com',
                    role: 'Administrator'
                };
            }
            
            return this.currentUser;
        } catch (error) {
            console.error('Error loading user info:', error);
            return {
                name: 'Demo User',
                email: 'demo@example.com',
                role: 'Administrator'
            };
        }
    }

    // Render properties page UI
    renderPropertiesPage() {
        const propertiesContainer = document.getElementById('properties');
        if (!propertiesContainer) {
            console.error('Properties container not found');
            return;
        }

        // Inject properties template
        propertiesContainer.innerHTML = this.getPropertiesTemplate();
    }

    getPropertiesTemplate() {
        return `
<main class="p-4 lg:p-6 fade-in">
  <!-- Top Bar -->
  <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Properties Management</h1>
      <p class="text-gray-600">Manage all your properties and units</p>
    </div>
    <div class="flex items-center space-x-4 w-full lg:w-auto">
      <div class="relative flex-1 lg:flex-none">
        <input type="text" id="propertiesSearch" placeholder="Search properties, tenants..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>
      <button id="addPropertyBtn" class="btn-primary px-4 py-2 text-white rounded-lg font-medium flex items-center space-x-2">
        <i class="fas fa-plus"></i>
        <span>Add Property</span>
      </button>
      <button id="notificationBtnProperties" class="p-2 text-gray-500 hover:text-gray-700 relative">
        <i class="fas fa-bell text-xl"></i>
        <span id="notificationBadgeProperties" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
      </button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Total Properties</p>
          <h3 class="text-2xl font-bold mt-2" id="propertiesTotalProperties">0</h3>
          <p class="text-green-600 text-sm mt-1">
            <i class="fas fa-arrow-up mr-1"></i>
            <span id="propertiesAddedThisMonth2">0</span> added this month
          </p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-building text-blue-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Total Units</p>
          <h3 class="text-2xl font-bold mt-2" id="propertiesTotalUnits">0</h3>
          <div class="flex items-center mt-2">
            <span class="occupied px-2 py-1 rounded text-xs font-medium mr-2" id="propertiesOccupiedUnits">0 Occupied</span>
            <span class="vacant px-2 py-1 rounded text-xs font-medium" id="propertiesVacantUnits">0 Vacant</span>
          </div>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-home text-green-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Monthly Income</p>
          <h3 class="text-2xl font-bold mt-2" id="propertiesMonthlyIncome">$0</h3>
          <p class="text-green-600 text-sm mt-1">
            <i class="fas fa-arrow-up mr-1"></i>
            <span id="propertiesIncomeGrowth">0</span>% from last month
          </p>
        </div>
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-money-bill-wave text-purple-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Outstanding Balance</p>
          <h3 class="text-2xl font-bold mt-2" id="propertiesOutstandingBalance">$0</h3>
          <p class="text-red-600 text-sm mt-1">
            <i class="fas fa-exclamation-circle mr-1"></i>
            <span id="propertiesOverdueTenants">0</span> tenants overdue
          </p>
        </div>
        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Properties Table -->
  <div class="bg-white rounded-xl shadow mb-8">
    <div class="p-6 border-b">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">All Properties</h3>
        <div class="flex space-x-2">
          <button id="exportPropertiesBtn" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Export
          </button>
          <button id="addNewPropertyTable" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Add New
          </button>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Income</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody id="propertiesTableBody" class="divide-y divide-gray-200">
          <!-- Properties will be loaded here -->
          <tr>
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              <i class="fas fa-building text-3xl mb-3"></i>
              <p>Loading properties...</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Property Types Distribution -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Property Types</h3>
      <div class="h-64 flex items-center justify-center">
        <!-- Changed from div to canvas element -->
        <canvas id="propertyTypesChart"></canvas>
      </div>
    </div>
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Geographic Distribution</h3>
      <div class="h-64 flex items-center justify-center">
        <!-- Changed from div to canvas element -->
        <canvas id="locationChart"></canvas>
      </div>
    </div>
  </div>
</main>
`;
    }

    // Load properties data
    async loadPropertiesData() {
        try {
            const data = await this.backend.refreshProperties();
            this.updatePropertiesUI(data);
            return data;
        } catch (error) {
            console.error('Error loading properties data:', error);
            this.showNotification('Failed to load properties data', 'error');
        }
    }

    // Update properties UI with data
    updatePropertiesUI(data) {
        if (!data) return;
        
        const stats = data.stats || {};
        const properties = data.properties || [];
        
        // Update stats
        this.updateElement('#propertiesTotalProperties', stats.totalProperties || 0);
        this.updateElement('#propertiesTotalUnits', stats.totalUnits || 0);
        this.updateElement('#propertiesOccupiedUnits', `${stats.occupiedUnits || 0} Occupied`);
        this.updateElement('#propertiesVacantUnits', `${stats.vacantUnits || 0} Vacant`);
        this.updateElement('#propertiesMonthlyIncome', this.formatCurrency(stats.monthlyIncome || 0));
        this.updateElement('#propertiesOutstandingBalance', this.formatCurrency(stats.outstandingBalance || 0));
        this.updateElement('#propertiesOverdueTenants', stats.overdueTenants || 0);
        this.updateElement('#propertiesAddedThisMonth2', stats.propertiesAddedThisMonth || 0);
        this.updateElement('#propertiesIncomeGrowth', stats.incomeGrowth || 0);
        
        // Update properties table
        this.updatePropertiesTable(properties);
        
        // Update notification badge
        this.updateNotificationBadge();
        
        // Update charts if they exist
        this.updateCharts(data);
    }

    // Update properties table
    updatePropertiesTable(properties) {
        const tbody = document.getElementById('propertiesTableBody');
        if (!tbody) return;
        
        if (!properties || properties.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-building text-3xl mb-3"></i>
                        <p>No properties found. Add your first property!</p>
                        <button id="addFirstPropertyBtn" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Add Property
                        </button>
                    </td>
                </tr>
            `;
            
            document.getElementById('addFirstPropertyBtn')?.addEventListener('click', () => {
                this.showAddPropertyModal();
            });
            
            return;
        }
        
        tbody.innerHTML = properties.map(property => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 ${this.getPropertyTypeColor(property.type)} rounded-lg flex items-center justify-center mr-3">
                            <i class="fas ${this.getPropertyTypeIcon(property.type)} text-white text-sm"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${this.escapeHtml(property.name)}</div>
                            <div class="text-sm text-gray-500 capitalize">${this.formatPropertyType(property.type)}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        <i class="fas fa-map-marker-alt text-gray-400 mr-1"></i>
                        ${property.lat?.toFixed(4) || 'N/A'}, ${property.lng?.toFixed(4) || 'N/A'}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${property.units || 0}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div class="bg-green-600 h-2 rounded-full" style="width: ${property.occupancy || 0}%"></div>
                        </div>
                        <span class="text-sm text-gray-900">${property.occupancy || 0}%</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatCurrency(property.monthlyIncome || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${property.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        ${property.status || 'inactive'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="window.propertiesFrontend.editProperty(${property.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button onclick="window.propertiesFrontend.deleteProperty(${property.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash mr-1"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Get property type icon
    getPropertyTypeIcon(type) {
        const icons = {
            'apartment': 'fa-building',
            'house': 'fa-home',
            'condo': 'fa-building',
            'commercial': 'fa-store',
            'vacation': 'fa-umbrella-beach'
        };
        return icons[type] || 'fa-building';
    }

    // Get property type color
    getPropertyTypeColor(type) {
        const colors = {
            'apartment': 'bg-blue-500',
            'house': 'bg-green-500',
            'condo': 'bg-purple-500',
            'commercial': 'bg-yellow-500',
            'vacation': 'bg-red-500'
        };
        return colors[type] || 'bg-gray-500';
    }

    // Format property type for display
    formatPropertyType(type) {
        const typeMap = {
            'apartment': 'Apartment Building',
            'house': 'Single Family House',
            'condo': 'Condominium',
            'commercial': 'Commercial Property',
            'vacation': 'Vacation Rental'
        };
        return typeMap[type] || type;
    }

    // Initialize charts
    initializeCharts() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            // Load Chart.js dynamically
            this.loadChartJS().then(() => {
                this.createCharts();
            });
        } else {
            this.createCharts();
        }
    }

    // Load Chart.js
    async loadChartJS() {
        return new Promise((resolve) => {
            // Check if already loaded
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => {
                console.log('Chart.js loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load Chart.js');
                resolve(); // Resolve anyway to prevent hanging
            };
            document.head.appendChild(script);
        });
    }

    // Create charts
    createCharts() {
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            try {
                // Property Types Chart
                const propertyTypesCanvas = document.getElementById('propertyTypesChart');
                if (propertyTypesCanvas) {
                    // Make sure it's a canvas element
                    if (propertyTypesCanvas.tagName !== 'CANVAS') {
                        console.error('propertyTypesChart element is not a canvas');
                        return;
                    }
                    
                    const ctx = propertyTypesCanvas.getContext('2d');
                    if (!ctx) {
                        console.error('Could not get 2D context for propertyTypesChart');
                        return;
                    }
                    
                    this.charts.propertyTypes = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: ['Loading...'],
                            datasets: [{
                                data: [100],
                                backgroundColor: ['#e5e7eb']
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 20,
                                        usePointStyle: true,
                                        pointStyle: 'circle'
                                    }
                                }
                            },
                            cutout: '60%'
                        }
                    });
                }

                // Location Chart
                const locationCanvas = document.getElementById('locationChart');
                if (locationCanvas) {
                    // Make sure it's a canvas element
                    if (locationCanvas.tagName !== 'CANVAS') {
                        console.error('locationChart element is not a canvas');
                        return;
                    }
                    
                    const ctx = locationCanvas.getContext('2d');
                    if (!ctx) {
                        console.error('Could not get 2D context for locationChart');
                        return;
                    }
                    
                    this.charts.location = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Loading...'],
                            datasets: [{
                                label: 'Properties',
                                data: [0],
                                backgroundColor: '#3b82f6',
                                borderRadius: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1,
                                        precision: 0
                                    },
                                    grid: {
                                        display: true,
                                        color: 'rgba(0, 0, 0, 0.05)'
                                    }
                                },
                                x: {
                                    grid: {
                                        display: false
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                }
                            }
                        }
                    });
                }
                
                console.log('Charts created successfully');
            } catch (error) {
                console.error('Error creating charts:', error);
            }
        }, 100);
    }

    // Update charts with data
    updateCharts(data) {
        if (!data || !data.stats || typeof Chart === 'undefined') return;
        
        try {
            const chartData = this.backend.getPropertyChartData();
            
            // Update Property Types Chart
            if (this.charts.propertyTypes && chartData.typeDistribution) {
                this.charts.propertyTypes.data.labels = chartData.typeDistribution.labels;
                this.charts.propertyTypes.data.datasets[0].data = chartData.typeDistribution.data;
                this.charts.propertyTypes.data.datasets[0].backgroundColor = chartData.typeDistribution.colors;
                this.charts.propertyTypes.update('none');
            }
            
            // Update Location Chart
            if (this.charts.location && chartData.geoDistribution) {
                this.charts.location.data.labels = chartData.geoDistribution.labels;
                this.charts.location.data.datasets[0].data = chartData.geoDistribution.data;
                this.charts.location.data.datasets[0].backgroundColor = chartData.geoDistribution.colors;
                this.charts.location.update('none');
            }
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('propertiesSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProperties(e.target.value);
            });
        }
        
        // Add property buttons
        document.getElementById('addPropertyBtn')?.addEventListener('click', () => {
            this.showAddPropertyModal();
        });
        
        document.getElementById('addNewPropertyTable')?.addEventListener('click', () => {
            this.showAddPropertyModal();
        });
        
        // Export button
        document.getElementById('exportPropertiesBtn')?.addEventListener('click', () => {
            this.exportProperties();
        });
        
        // Notification button
        document.getElementById('notificationBtnProperties')?.addEventListener('click', () => {
            this.showNotificationsPanel();
        });
        
        // Import functionality
        this.setupImportFunctionality();
    }

    // Setup import functionality
    setupImportFunctionality() {
        // Create import button if it doesn't exist
        const exportBtn = document.getElementById('exportPropertiesBtn');
        if (exportBtn && !document.getElementById('importPropertiesBtn')) {
            const importBtn = document.createElement('button');
            importBtn.id = 'importPropertiesBtn';
            importBtn.className = 'px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 ml-2';
            importBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Import';
            importBtn.addEventListener('click', () => {
                this.showImportModal();
            });
            
            exportBtn.parentNode.insertBefore(importBtn, exportBtn.nextSibling);
        }
    }

    // Search properties
    async searchProperties(query) {
        this.searchQuery = query;
        
        try {
            const filteredProperties = await this.backend.searchProperties(query);
            this.updatePropertiesTable(filteredProperties);
        } catch (error) {
            console.error('Error searching properties:', error);
            this.showNotification('Failed to search properties', 'error');
        }
    }

    // Show add property modal
    showAddPropertyModal() {
        // Close any existing modal first
        this.closeAllModals();
        
        const modalHTML = `
            <div class="modal-overlay" id="addPropertyModal">
                <div class="modal-container max-w-4xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Add New Property</h2>
                        <button id="closeModalBtn" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column: Map -->
                            <div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Search Location</label>
                                    <div class="relative">
                                        <input type="text" id="locationSearchInput" placeholder="Search for a location..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                                    </div>
                                    <div id="searchResults" class="search-results"></div>
                                </div>
                                
                                <div id="addPropertyMap" style="height: 400px; border-radius: 8px; border: 1px solid #e5e7eb;"></div>
                                
                                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium mb-1">Latitude</label>
                                            <div id="selectedLat" class="font-mono text-sm p-2 bg-white border rounded">--</div>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium mb-1">Longitude</label>
                                            <div id="selectedLng" class="font-mono text-sm p-2 bg-white border rounded">--</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Right Column: Form -->
                            <div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Property Name *</label>
                                    <input type="text" id="propertyNameInput" placeholder="Enter property name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Property Type</label>
                                    <select id="propertyType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="apartment">Apartment Building</option>
                                        <option value="house">Single Family House</option>
                                        <option value="condo">Condominium</option>
                                        <option value="commercial">Commercial Property</option>
                                        <option value="vacation">Vacation Rental</option>
                                    </select>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Number of Units</label>
                                    <input type="number" id="propertyUnits" min="1" max="1000" value="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Monthly Rent per Unit</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" id="monthlyRent" min="0" step="0.01" placeholder="0.00" class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Address</label>
                                    <input type="text" id="propertyAddress" placeholder="Enter property address" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-sm font-medium mb-2">Description</label>
                                    <textarea id="propertyDescription" rows="3" placeholder="Enter property description..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                                    <div class="flex items-center">
                                        <i class="fas fa-exclamation-triangle text-yellow-600 mr-2"></i>
                                        <span class="text-sm text-yellow-800">Click on the map or search to select location</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelPropertyBtn" class="btn-secondary">Cancel</button>
                        <button id="savePropertyBtn" class="btn-primary" disabled>Add Property</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize property selector
        this.initializePropertySelector();
        
        // Setup modal event listeners
        this.setupAddPropertyModalEvents();
    }

    // Initialize property selector with Leaflet
    initializePropertySelector() {
        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            // Load Leaflet dynamically
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                this.createLeafletMap();
                this.setupLeafletSearch();
            };
            document.head.appendChild(script);
        } else {
            this.createLeafletMap();
            this.setupLeafletSearch();
        }
    }

    // Create Leaflet map
    createLeafletMap() {
        const mapElement = document.getElementById('addPropertyMap');
        if (!mapElement) return;
        
        // Initialize map
        this.propertyMap = L.map('addPropertyMap').setView([20, 0], 3);
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.propertyMap);
        
        // Add click event
        this.propertyMap.on('click', (e) => {
            this.placePropertyMarker(e.latlng.lat, e.latlng.lng);
        });
        
        // Add default marker
        this.placePropertyMarker(20, 0);
    }

    // Setup Leaflet search
    setupLeafletSearch() {
        const searchInput = document.getElementById('locationSearchInput');
        if (!searchInput) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 3) {
                this.clearSearchResults();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this.performLocationSearch(query);
            }, 500);
        });
    }

    // Perform location search
    async performLocationSearch(query) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
            );
            const results = await response.json();
            
            this.displaySearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Search service temporarily unavailable', 'error');
        }
    }

    // Display search results
    displaySearchResults(results) {
        const container = document.getElementById('searchResults');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-name">No results found</div>
                    <div class="search-result-type">Try a different search term</div>
                </div>
            `;
            container.style.display = 'block';
            return;
        }
        
        container.innerHTML = results.map(result => `
            <div class="search-result-item" 
                 data-lat="${result.lat}" 
                 data-lng="${result.lon}"
                 data-name="${result.display_name}">
                <div class="search-result-name">
                    <i class="fas fa-map-marker-alt mr-2 text-gray-400"></i>
                    ${result.display_name}
                </div>
                <div class="search-result-type">${result.type}</div>
            </div>
        `).join('');
        
        container.style.display = 'block';
        
        // Add click handlers
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);
                const name = item.dataset.name;
                
                this.selectSearchResult(lat, lng, name);
            });
        });
    }

    // Select search result
    selectSearchResult(lat, lng, name) {
        // Update search input
        const searchInput = document.getElementById('locationSearchInput');
        if (searchInput) {
            searchInput.value = name.split(',')[0];
        }
        
        // Clear results
        this.clearSearchResults();
        
        // Place marker on map
        this.placePropertyMarker(lat, lng);
        
        // Center map on location
        if (this.propertyMap) {
            this.propertyMap.setView([lat, lng], 14);
        }
    }

    // Place property marker
    placePropertyMarker(lat, lng) {
        if (!this.propertyMap) return;
        
        // Remove existing marker
        if (this.propertyMap.marker) {
            this.propertyMap.removeLayer(this.propertyMap.marker);
        }
        
        // Add new marker
        this.propertyMap.marker = L.marker([lat, lng], {
            draggable: true
        }).addTo(this.propertyMap);
        
        // Update coordinates display
        const latEl = document.getElementById('selectedLat');
        const lngEl = document.getElementById('selectedLng');
        if (latEl) latEl.textContent = lat.toFixed(6);
        if (lngEl) lngEl.textContent = lng.toFixed(6);
        
        // Enable save button
        const saveBtn = document.getElementById('savePropertyBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
        }
        
        // Handle marker drag
        this.propertyMap.marker.on('dragend', (e) => {
            const newLat = e.target.getLatLng().lat;
            const newLng = e.target.getLatLng().lng;
            
            if (latEl) latEl.textContent = newLat.toFixed(6);
            if (lngEl) lngEl.textContent = newLng.toFixed(6);
        });
    }

    // Clear search results
    clearSearchResults() {
        const container = document.getElementById('searchResults');
        if (container) {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    }

    // Setup add property modal events
    setupAddPropertyModalEvents() {
        const modal = document.getElementById('addPropertyModal');
        if (!modal) return;

        // Close buttons
        modal.querySelectorAll('#closeModalBtn, #cancelPropertyBtn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAddPropertyModal());
        });

        // Save property button
        const saveBtn = document.getElementById('savePropertyBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProperty());
        }

        // Property name validation
        const propertyNameInput = document.getElementById('propertyNameInput');
        if (propertyNameInput) {
            propertyNameInput.addEventListener('input', () => {
                this.validatePropertyForm();
            });
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeAddPropertyModal();
            }
        });
    }

    // Validate property form
    validatePropertyForm() {
        const name = document.getElementById('propertyNameInput')?.value.trim();
        const lat = document.getElementById('selectedLat')?.textContent;
        const hasLocation = lat !== '--' && lat !== '';
        
        const saveBtn = document.getElementById('savePropertyBtn');
        if (saveBtn) {
            saveBtn.disabled = !name || !hasLocation;
        }
    }

    // Close add property modal
    closeAddPropertyModal() {
        const modal = document.getElementById('addPropertyModal');
        if (modal) {
            modal.remove();
            
            // Clear property map
            if (this.propertyMap) {
                this.propertyMap.remove();
                this.propertyMap = null;
            }
        }
    }

    // Save property
    async saveProperty() {
        const name = document.getElementById('propertyNameInput')?.value.trim();
        const lat = document.getElementById('selectedLat')?.textContent;
        const lng = document.getElementById('selectedLng')?.textContent;
        const type = document.getElementById('propertyType')?.value;
        const units = parseInt(document.getElementById('propertyUnits')?.value) || 1;
        const rent = parseFloat(document.getElementById('monthlyRent')?.value) || 0;
        const address = document.getElementById('propertyAddress')?.value.trim();
        const description = document.getElementById('propertyDescription')?.value.trim();

        if (!name || !lat || !lng || lat === '--' || lng === '--') {
            this.showNotification('Please select a location and enter a property name', 'error');
            return;
        }

        // Validate property data
        const propertyData = {
            name: name,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            type: type,
            units: units,
            monthlyRent: rent,
            address: address,
            description: description
        };

        const validation = this.backend.validatePropertyData(propertyData);
        if (!validation.isValid) {
            this.showNotification(validation.errors[0], 'error');
            return;
        }

        try {
            await this.backend.addProperty(propertyData);
            this.showNotification('Property added successfully', 'success');
            this.closeAddPropertyModal();
            
            // Refresh properties data
            await this.loadPropertiesData();
            
        } catch (error) {
            console.error('Error saving property:', error);
            this.showNotification('Failed to add property', 'error');
        }
    }

    // Edit property
    async editProperty(propertyId) {
        const property = this.backend.getPropertyById(propertyId);
        if (!property) {
            this.showNotification('Property not found', 'error');
            return;
        }
        
        // Show edit modal
        this.showEditPropertyModal(property);
    }

    // Show edit property modal
    showEditPropertyModal(property) {
        // Close any existing modal first
        this.closeAllModals();
        
        const modalHTML = `
            <div class="modal-overlay" id="editPropertyModal">
                <div class="modal-container max-w-4xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Edit Property</h2>
                        <button id="closeEditModalBtn" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column: Form -->
                            <div>
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Property Name *</label>
                                    <input type="text" id="editPropertyName" value="${this.escapeHtml(property.name)}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Property Type</label>
                                    <select id="editPropertyType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="apartment" ${property.type === 'apartment' ? 'selected' : ''}>Apartment Building</option>
                                        <option value="house" ${property.type === 'house' ? 'selected' : ''}>Single Family House</option>
                                        <option value="condo" ${property.type === 'condo' ? 'selected' : ''}>Condominium</option>
                                        <option value="commercial" ${property.type === 'commercial' ? 'selected' : ''}>Commercial Property</option>
                                        <option value="vacation" ${property.type === 'vacation' ? 'selected' : ''}>Vacation Rental</option>
                                    </select>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Number of Units</label>
                                    <input type="number" id="editPropertyUnits" value="${property.units || 1}" min="1" max="1000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Monthly Income</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" id="editMonthlyIncome" value="${property.monthlyIncome || 0}" min="0" step="0.01" class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Occupancy Rate (%)</label>
                                    <input type="number" id="editOccupancy" value="${property.occupancy || 70}" min="0" max="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div class="mb-4">
                                    <label class="block text-sm font-medium mb-2">Address</label>
                                    <input type="text" id="editPropertyAddress" value="${this.escapeHtml(property.address || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                
                                <div class="mb-6">
                                    <label class="block text-sm font-medium mb-2">Description</label>
                                    <textarea id="editPropertyDescription" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${this.escapeHtml(property.description || '')}</textarea>
                                </div>
                            </div>
                            
                            <!-- Right Column: Status and Info -->
                            <div>
                                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <h3 class="font-semibold mb-3">Property Information</h3>
                                    <div class="space-y-2">
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Added Date:</span>
                                            <span class="font-medium">${new Date(property.addedDate).toLocaleDateString()}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Location:</span>
                                            <span class="font-medium">${property.lat?.toFixed(4)}, ${property.lng?.toFixed(4)}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-gray-600">Status:</span>
                                            <select id="editPropertyStatus" class="border rounded px-2 py-1">
                                                <option value="active" ${property.status === 'active' ? 'selected' : ''}>Active</option>
                                                <option value="inactive" ${property.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                                <option value="maintenance" ${property.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="p-4 bg-blue-50 rounded-lg">
                                    <h3 class="font-semibold mb-3">Quick Stats</h3>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="text-center p-3 bg-white rounded-lg">
                                            <div class="text-2xl font-bold text-blue-600">${property.units || 0}</div>
                                            <div class="text-sm text-gray-600">Total Units</div>
                                        </div>
                                        <div class="text-center p-3 bg-white rounded-lg">
                                            <div class="text-2xl font-bold text-green-600">${property.occupancy || 0}%</div>
                                            <div class="text-sm text-gray-600">Occupancy</div>
                                        </div>
                                        <div class="text-center p-3 bg-white rounded-lg">
                                            <div class="text-2xl font-bold text-purple-600">${this.formatCurrency(property.monthlyIncome || 0)}</div>
                                            <div class="text-sm text-gray-600">Monthly Income</div>
                                        </div>
                                        <div class="text-center p-3 bg-white rounded-lg">
                                            <div class="text-2xl font-bold text-yellow-600">${this.formatCurrency((property.monthlyIncome || 0) * 0.1)}</div>
                                            <div class="text-sm text-gray-600">Outstanding</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelEditBtn" class="btn-secondary">Cancel</button>
                        <button id="updatePropertyBtn" class="btn-primary">Update Property</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup edit modal event listeners
        this.setupEditPropertyModalEvents(property.id);
    }

    // Setup edit property modal events
    setupEditPropertyModalEvents(propertyId) {
        const modal = document.getElementById('editPropertyModal');
        if (!modal) return;

        // Close buttons
        modal.querySelectorAll('#closeEditModalBtn, #cancelEditBtn').forEach(btn => {
            btn.addEventListener('click', () => this.closeEditPropertyModal());
        });

        // Update property button
        const updateBtn = document.getElementById('updatePropertyBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                await this.updateProperty(propertyId);
            });
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditPropertyModal();
            }
        });
    }

    // Update property
    async updateProperty(propertyId) {
        const updates = {
            name: document.getElementById('editPropertyName')?.value.trim(),
            type: document.getElementById('editPropertyType')?.value,
            units: parseInt(document.getElementById('editPropertyUnits')?.value) || 1,
            monthlyIncome: parseFloat(document.getElementById('editMonthlyIncome')?.value) || 0,
            occupancy: parseInt(document.getElementById('editOccupancy')?.value) || 70,
            address: document.getElementById('editPropertyAddress')?.value.trim(),
            description: document.getElementById('editPropertyDescription')?.value.trim(),
            status: document.getElementById('editPropertyStatus')?.value
        };

        if (!updates.name) {
            this.showNotification('Property name is required', 'error');
            return;
        }

        try {
            await this.backend.updateProperty(propertyId, updates);
            this.showNotification('Property updated successfully', 'success');
            this.closeEditPropertyModal();
            
            // Refresh properties data
            await this.loadPropertiesData();
            
        } catch (error) {
            console.error('Error updating property:', error);
            this.showNotification('Failed to update property', 'error');
        }
    }

    // Close edit property modal
    closeEditPropertyModal() {
        const modal = document.getElementById('editPropertyModal');
        if (modal) {
            modal.remove();
        }
    }

    // Delete property
    async deleteProperty(propertyId) {
        if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            try {
                await this.backend.deleteProperty(propertyId);
                this.showNotification('Property deleted successfully', 'success');
                
                // Refresh properties data
                await this.loadPropertiesData();
                
            } catch (error) {
                console.error('Error deleting property:', error);
                this.showNotification('Failed to delete property', 'error');
            }
        }
    }

    // Export properties
    async exportProperties() {
        try {
            const csvContent = this.backend.exportPropertiesToCSV();
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `properties_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Properties exported successfully', 'success');
            
        } catch (error) {
            console.error('Error exporting properties:', error);
            this.showNotification('Failed to export properties', 'error');
        }
    }

    // Show import modal
    showImportModal() {
        const modalHTML = `
            <div class="modal-overlay" id="importModal">
                <div class="modal-container max-w-md">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Import Properties</h2>
                        <button id="closeImportModalBtn" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="mb-6">
                            <div class="p-4 bg-blue-50 rounded-lg mb-4">
                                <h3 class="font-semibold mb-2">CSV Format Required</h3>
                                <p class="text-sm text-gray-600">Your CSV file should include these columns:</p>
                                <ul class="text-sm text-gray-600 mt-2 list-disc pl-4">
                                    <li>Name (required)</li>
                                    <li>Type (apartment/house/condo/commercial/vacation)</li>
                                    <li>Units (number)</li>
                                    <li>Latitude (decimal)</li>
                                    <li>Longitude (decimal)</li>
                                    <li>MonthlyIncome (number)</li>
                                    <li>Address (text)</li>
                                </ul>
                            </div>
                            
                            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                                <input type="file" id="csvFileInput" accept=".csv" class="hidden">
                                <div id="dropZone" class="cursor-pointer">
                                    <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                                    <p class="font-medium">Drop CSV file here or click to browse</p>
                                    <p class="text-sm text-gray-500 mt-2">Max file size: 5MB</p>
                                </div>
                            </div>
                            
                            <div id="fileInfo" class="hidden mt-4 p-3 bg-gray-50 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <div class="font-medium" id="fileName"></div>
                                        <div class="text-sm text-gray-500" id="fileSize"></div>
                                    </div>
                                    <button id="removeFileBtn" class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="text-sm text-gray-600">
                            <a href="#" id="downloadTemplateBtn" class="text-blue-600 hover:text-blue-800">
                                <i class="fas fa-download mr-1"></i> Download CSV Template
                            </a>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelImportBtn" class="btn-secondary">Cancel</button>
                        <button id="importCsvBtn" class="btn-primary" disabled>Import</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup import modal events
        this.setupImportModalEvents();
    }

    // Setup import modal events
    setupImportModalEvents() {
        const modal = document.getElementById('importModal');
        if (!modal) return;

        // Close buttons
        modal.querySelectorAll('#closeImportModalBtn, #cancelImportBtn').forEach(btn => {
            btn.addEventListener('click', () => this.closeImportModal());
        });

        // File input
        const fileInput = document.getElementById('csvFileInput');
        const dropZone = document.getElementById('dropZone');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const removeFileBtn = document.getElementById('removeFileBtn');
        const importBtn = document.getElementById('importCsvBtn');

        // Click to browse
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Remove file
        removeFileBtn.addEventListener('click', () => {
            fileInput.value = '';
            fileInfo.classList.add('hidden');
            importBtn.disabled = true;
        });

        // Import button
        importBtn.addEventListener('click', () => {
            this.importCSVFile(fileInput.files[0]);
        });

        // Download template
        document.getElementById('downloadTemplateBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.downloadCSVTemplate();
        });
    }

    // Handle file selection
    handleFileSelect(file) {
        if (!file) return;
        
        // Check file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showNotification('Please select a CSV file', 'error');
            return;
        }
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('File size must be less than 5MB', 'error');
            return;
        }
        
        // Show file info
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const fileInfo = document.getElementById('fileInfo');
        const importBtn = document.getElementById('importCsvBtn');
        
        if (fileName && fileSize && fileInfo && importBtn) {
            fileName.textContent = file.name;
            fileSize.textContent = this.formatFileSize(file.size);
            fileInfo.classList.remove('hidden');
            importBtn.disabled = false;
        }
    }

    // Import CSV file
    async importCSVFile(file) {
        try {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const csvContent = e.target.result;
                    await this.backend.importPropertiesFromCSV(csvContent);
                    
                    this.showNotification('Properties imported successfully', 'success');
                    this.closeImportModal();
                    
                    // Refresh properties data
                    await this.loadPropertiesData();
                    
                } catch (error) {
                    console.error('Error importing CSV:', error);
                    this.showNotification(`Import failed: ${error.message}`, 'error');
                }
            };
            
            reader.onerror = () => {
                this.showNotification('Failed to read file', 'error');
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            console.error('Error importing file:', error);
            this.showNotification('Failed to import properties', 'error');
        }
    }

    // Download CSV template
    downloadCSVTemplate() {
        const template = `Name,Type,Units,Latitude,Longitude,MonthlyIncome,Address,Description
Miami Beach,vacation,10,25.7617,-80.1918,12000,123 Ocean Drive Miami FL,Beachfront property
NYC Apt,apartment,5,40.7128,-74.0060,8000,456 Broadway New York NY,Modern apartment
London Flat,condo,3,51.5074,-0.1278,4500,789 Oxford Street London UK,Central London flat`;
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'properties_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Template downloaded', 'success');
    }

    // Close import modal
    closeImportModal() {
        const modal = document.getElementById('importModal');
        if (modal) {
            modal.remove();
        }
    }

    // Show notifications panel
    showNotificationsPanel() {
        if (window.mainApp && typeof window.mainApp.showNotificationsPanel === 'function') {
            window.mainApp.showNotificationsPanel();
        } else {
            this.showNotification('Notification module not loaded', 'error');
        }
    }

    // Update notification badge
    updateNotificationBadge() {
        try {
            const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            const unreadCount = notifications.filter(n => !n.read).length;
            const badge = document.getElementById('notificationBadgeProperties');
            
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error updating notification badge:', error);
        }
    }

    // Utility methods
    updateElement(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
        document.querySelectorAll('.notifications-panel').forEach(panel => panel.remove());
    }

    showErrorState() {
        const propertiesContainer = document.getElementById('properties');
        if (propertiesContainer) {
            propertiesContainer.innerHTML = `
                <div class="text-center p-8">
                    <i class="fas fa-exclamation-triangle text-3xl text-yellow-500 mb-4"></i>
                    <h2 class="text-xl font-semibold mb-2">Failed to Load Properties</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the properties data.</p>
                    <button onclick="window.propertiesFrontend.initialize()" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Create and export properties frontend instance
const propertiesFrontend = new PropertiesFrontend();
window.propertiesFrontend = propertiesFrontend;

// Initialize properties when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('properties')) {
        propertiesFrontend.initialize();
    }
});

export { PropertiesFrontend };