/**
 * Tenants Frontend - UI Rendering and Event Handling
 * All UI rendering, DOM manipulation, and event listeners for tenants
 */

import { TenantsBackend } from '../functions/tenants.js';

class TenantsFrontend {
    constructor() {
        this.backend = new TenantsBackend();
        this.currentUser = null;
        this.charts = {
            tenantDistribution: null
        };
        this.isInitialized = false;
        this.searchQuery = '';
    }

    // Initialize tenants page
    async initialize() {
        try {
            // Initialize backend
            await this.backend.initialize();
            
            // Load user info
            await this.loadUserInfo();
            
            // Render tenants page
            this.renderTenantsPage();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load tenants data
            await this.loadTenantsData();
            
            // Initialize charts
            this.initializeCharts();
            
            this.isInitialized = true;
            console.log('Tenants page initialized successfully');
            
        } catch (error) {
            console.error('Error initializing tenants page:', error);
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

    // Render tenants page UI
    renderTenantsPage() {
        const tenantsContainer = document.getElementById('tenants');
        if (!tenantsContainer) {
            console.error('Tenants container not found');
            return;
        }

        // Inject tenants template
        tenantsContainer.innerHTML = this.getTenantsTemplate();
    }

    getTenantsTemplate() {
        return `
<main class="p-4 lg:p-6 fade-in">
  <!-- Top Bar -->
  <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Tenants Management</h1>
      <p class="text-gray-600">Manage all tenant information and leases</p>
    </div>
    <div class="flex items-center space-x-4 w-full lg:w-auto">
      <div class="relative flex-1 lg:flex-none">
        <input type="text" id="tenantsSearch" placeholder="Search tenants..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>
      <button id="addTenantBtn" class="btn-primary px-4 py-2 text-white rounded-lg font-medium flex items-center space-x-2">
        <i class="fas fa-user-plus"></i>
        <span>Add Tenant</span>
      </button>
    </div>
  </div>

  <!-- Tenants Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Total Tenants</p>
          <h3 class="text-2xl font-bold mt-2" id="tenantsTotalTenants">0</h3>
          <p class="text-green-600 text-sm mt-1">
            <i class="fas fa-arrow-up mr-1"></i>
            <span id="tenantsNewThisMonth">0</span> new this month
          </p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-users text-blue-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Active Leases</p>
          <h3 class="text-2xl font-bold mt-2" id="tenantsActiveLeases">0</h3>
          <p class="text-gray-600 text-sm mt-1">
            <span id="tenantsExpiringSoon">0</span> leases expiring soon
          </p>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-file-contract text-green-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Avg. Tenancy</p>
          <h3 class="text-2xl font-bold mt-2" id="tenantsAvgTenancy">0 yrs</h3>
          <p class="text-gray-600 text-sm mt-1">Average stay duration</p>
        </div>
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-calendar-alt text-purple-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Satisfaction</p>
          <h3 class="text-2xl font-bold mt-2" id="tenantsSatisfaction">0/5</h3>
          <p class="text-green-600 text-sm mt-1">
            <i class="fas fa-star mr-1"></i>
            Based on <span id="tenantsReviewCount">0</span> reviews
          </p>
        </div>
        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-star text-yellow-600 text-xl"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Tenants Table -->
  <div class="bg-white rounded-xl shadow mb-8">
    <div class="p-6 border-b">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">All Tenants</h3>
        <div class="flex space-x-2">
          <button id="exportTenantsBtn" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <i class="fas fa-download mr-2"></i>
            Export
          </button>
          <button id="addNewTenantTable" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <i class="fas fa-user-plus mr-2"></i>
            Add Tenant
          </button>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease End</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody id="tenantsTableBody" class="divide-y divide-gray-200">
          <!-- Tenants will be loaded here -->
          <tr>
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              <i class="fas fa-users text-3xl mb-3"></i>
              <p>Loading tenants...</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Tenant Distribution -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Tenant Distribution by Property</h3>
      <div class="h-64 flex items-center justify-center">
        <canvas id="tenantDistributionChart" style="width: 100%; height: 100%;"></canvas>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow p-6">
      <h3 class="text-lg font-semibold mb-6">Lease Expirations</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">This Month</p>
            <p class="text-sm text-gray-500">Leases ending in ${this.getCurrentMonthName()}</p>
          </div>
          <span id="expiringThisMonth" class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">0 leases</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Next Month</p>
            <p class="text-sm text-gray-500">Leases ending in ${this.getNextMonthName()}</p>
          </div>
          <span id="expiringNextMonth" class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">0 leases</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Next 3 Months</p>
            <p class="text-sm text-gray-500">Leases ending in next quarter</p>
          </div>
          <span id="expiringNext3Months" class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">0 leases</span>
        </div>
        <button id="viewAllLeasesBtn" class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
          View All Upcoming Expirations
        </button>
      </div>
    </div>
  </div>
</main>
`;
    }

    // Get current month name
    getCurrentMonthName() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[new Date().getMonth()];
    }

    // Get next month name
    getNextMonthName() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        const nextMonth = (new Date().getMonth() + 1) % 12;
        return months[nextMonth];
    }

    // Load tenants data
    async loadTenantsData() {
        try {
            const data = await this.backend.refreshTenants();
            this.updateTenantsUI(data);
            return data;
        } catch (error) {
            console.error('Error loading tenants data:', error);
            this.showNotification('Failed to load tenants data', 'error');
        }
    }

    // Update tenants UI with data
    updateTenantsUI(data) {
        if (!data) return;
        
        const stats = data.stats || {};
        const tenants = data.tenants || [];
        const expirations = stats.leaseExpirations || {};
        
        // Update stats
        this.updateElement('#tenantsTotalTenants', stats.totalTenants || 0);
        this.updateElement('#tenantsActiveLeases', stats.activeLeases || 0);
        this.updateElement('#tenantsExpiringSoon', stats.expiringSoon || 0);
        this.updateElement('#tenantsAvgTenancy', `${stats.avgTenancy || '0'} yrs`);
        this.updateElement('#tenantsSatisfaction', `${stats.satisfaction || '0'}/5`);
        this.updateElement('#tenantsReviewCount', stats.reviewCount || 0);
        this.updateElement('#tenantsNewThisMonth', stats.newThisMonth || 0);
        
        // Update lease expirations
        this.updateElement('#expiringThisMonth', `${expirations.thisMonth || 0} leases`);
        this.updateElement('#expiringNextMonth', `${expirations.nextMonth || 0} leases`);
        this.updateElement('#expiringNext3Months', `${expirations.next3Months || 0} leases`);
        
        // Update tenants table
        this.updateTenantsTable(tenants);
        
        // Update charts if they exist
        this.updateCharts(data);
    }

    // Update tenants table
    updateTenantsTable(tenants) {
        const tbody = document.getElementById('tenantsTableBody');
        if (!tbody) return;
        
        if (!tenants || tenants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-users text-3xl mb-3"></i>
                        <p>No tenants found. Add your first tenant!</p>
                        <button id="addFirstTenantBtn" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Add Tenant
                        </button>
                    </td>
                </tr>
            `;
            
            document.getElementById('addFirstTenantBtn')?.addEventListener('click', () => {
                this.showAddTenantModal();
            });
            
            return;
        }
        
        tbody.innerHTML = tenants.map(tenant => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-user text-green-600 text-sm"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${this.escapeHtml(tenant.firstName)} ${this.escapeHtml(tenant.lastName)}</div>
                            <div class="text-sm text-gray-500">${tenant.email}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        <i class="fas fa-building text-gray-400 mr-1"></i>
                        ${this.escapeHtml(tenant.propertyName)}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${tenant.unit || 'N/A'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${new Date(tenant.leaseEnd).toLocaleDateString()}
                        ${this.getLeaseStatusBadge(tenant.leaseEnd)}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatCurrency(tenant.monthlyRent || 0)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusColor(tenant.status)}">
                        ${tenant.status}
                    </span>
                    ${tenant.paymentStatus === 'overdue' ? 
                        `<span class="ml-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Overdue</span>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="window.tenantsFrontend.editTenant(${tenant.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button onclick="window.tenantsFrontend.deleteTenant(${tenant.id})" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash mr-1"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Get lease status badge
    getLeaseStatusBadge(leaseEnd) {
        const now = new Date();
        const end = new Date(leaseEnd);
        const daysUntilExpiry = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
            return '<span class="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expired</span>';
        } else if (daysUntilExpiry <= 30) {
            return '<span class="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Expiring</span>';
        }
        return '';
    }

    // Get status color
    getStatusColor(status) {
        const colors = {
            'active': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'overdue': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Create charts
    createCharts() {
        // Tenant Distribution Chart
        const tenantDistributionCanvas = document.getElementById('tenantDistributionChart');
        
        if (!tenantDistributionCanvas) {
            console.warn('Tenant distribution chart canvas not found');
            return;
        }
        
        // Check if canvas is a valid element
        if (!(tenantDistributionCanvas instanceof HTMLCanvasElement)) {
            console.error('tenantDistributionChart is not a canvas element');
            return;
        }
        
        try {
            const ctx = tenantDistributionCanvas.getContext('2d');
            
            if (!ctx) {
                console.error('Could not get 2D context for chart');
                return;
            }
            
            this.charts.tenantDistribution = new Chart(ctx, {
                type: 'pie',
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
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating chart:', error);
        }
    }

    // Update charts with data
    updateCharts(data) {
        if (!data || !data.stats) return;
        
        const chartData = this.backend.getTenantChartData();
        
        // Update Tenant Distribution Chart
        if (this.charts.tenantDistribution && chartData.distribution) {
            this.charts.tenantDistribution.data.labels = chartData.distribution.labels;
            this.charts.tenantDistribution.data.datasets[0].data = chartData.distribution.data;
            this.charts.tenantDistribution.data.datasets[0].backgroundColor = chartData.distribution.colors;
            this.charts.tenantDistribution.update();
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('tenantsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTenants(e.target.value);
            });
        }
        
        // Add tenant buttons
        document.getElementById('addTenantBtn')?.addEventListener('click', () => {
            this.showAddTenantModal();
        });
        
        document.getElementById('addNewTenantTable')?.addEventListener('click', () => {
            this.showAddTenantModal();
        });
        
        // Export button
        document.getElementById('exportTenantsBtn')?.addEventListener('click', () => {
            this.exportTenants();
        });
        
        // View all leases button
        document.getElementById('viewAllLeasesBtn')?.addEventListener('click', () => {
            this.viewAllLeases();
        });
        
        // Import functionality
        this.setupImportFunctionality();
    }

    // Setup import functionality
    setupImportFunctionality() {
        // Create import button if it doesn't exist
        const exportBtn = document.getElementById('exportTenantsBtn');
        if (exportBtn && !document.getElementById('importTenantsBtn')) {
            const importBtn = document.createElement('button');
            importBtn.id = 'importTenantsBtn';
            importBtn.className = 'px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 ml-2';
            importBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Import';
            importBtn.addEventListener('click', () => {
                this.showImportModal();
            });
            
            exportBtn.parentNode.insertBefore(importBtn, exportBtn.nextSibling);
        }
    }

    // Search tenants
    async searchTenants(query) {
        this.searchQuery = query;
        
        try {
            const filteredTenants = await this.backend.searchTenants(query);
            this.updateTenantsTable(filteredTenants);
        } catch (error) {
            console.error('Error searching tenants:', error);
            this.showNotification('Failed to search tenants', 'error');
        }
    }

    // Show add tenant modal
    showAddTenantModal() {
        // Close any existing modal first
        this.closeAllModals();
        
        const modalHTML = `
            <div class="modal-overlay" id="addTenantModal">
                <div class="modal-container max-w-2xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Add New Tenant</h2>
                        <button id="closeModalBtn" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="addTenantForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">First Name *</label>
                                    <input type="text" id="firstName" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Last Name *</label>
                                    <input type="text" id="lastName" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Email *</label>
                                    <input type="email" id="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Phone</label>
                                    <input type="tel" id="phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Select Property *</label>
                                    <select id="propertyId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select a property</option>
                                        ${this.getPropertyOptions()}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Unit Number</label>
                                    <input type="text" id="unit" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Monthly Rent *</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" id="monthlyRent" required min="0" step="0.01" class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Lease Status</label>
                                    <select id="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Lease Start Date</label>
                                    <input type="date" id="leaseStart" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Lease End Date</label>
                                    <input type="date" id="leaseEnd" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Emergency Contact</label>
                                <input type="text" id="emergencyContact" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Notes</label>
                                <textarea id="notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelTenantBtn" class="btn-secondary">Cancel</button>
                        <button id="saveTenantBtn" class="btn-primary">Add Tenant</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Set default dates
        this.setDefaultDates();
        
        // Setup modal event listeners
        this.setupAddTenantModalEvents();
    }

    // Get property options for dropdown
    getPropertyOptions() {
        const properties = this.backend.properties || [];
        return properties.map(property => 
            `<option value="${property.id}">${this.escapeHtml(property.name)}</option>`
        ).join('');
    }

    // Set default dates for lease
    setDefaultDates() {
        const today = new Date();
        const oneYearFromNow = new Date(today);
        oneYearFromNow.setFullYear(today.getFullYear() + 1);
        
        // Format dates for input fields (YYYY-MM-DD)
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        const leaseStartInput = document.getElementById('leaseStart');
        const leaseEndInput = document.getElementById('leaseEnd');
        
        if (leaseStartInput) {
            leaseStartInput.value = formatDate(today);
        }
        if (leaseEndInput) {
            leaseEndInput.value = formatDate(oneYearFromNow);
        }
    }

    // Setup add tenant modal events
    setupAddTenantModalEvents() {
        const modal = document.getElementById('addTenantModal');
        if (!modal) return;

        // Close buttons
        modal.querySelectorAll('#closeModalBtn, #cancelTenantBtn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAddTenantModal());
        });

        // Save tenant button
        const saveBtn = document.getElementById('saveTenantBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveTenant();
            });
        }

        // Form validation
        const form = document.getElementById('addTenantForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTenant();
            });
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeAddTenantModal();
            }
        });
    }

    // Save tenant
    async saveTenant() {
        const tenantData = {
            firstName: document.getElementById('firstName')?.value.trim(),
            lastName: document.getElementById('lastName')?.value.trim(),
            email: document.getElementById('email')?.value.trim(),
            phone: document.getElementById('phone')?.value.trim(),
            propertyId: parseInt(document.getElementById('propertyId')?.value),
            unit: document.getElementById('unit')?.value.trim(),
            monthlyRent: parseFloat(document.getElementById('monthlyRent')?.value) || 0,
            status: document.getElementById('status')?.value,
            leaseStart: document.getElementById('leaseStart')?.value,
            leaseEnd: document.getElementById('leaseEnd')?.value,
            emergencyContact: document.getElementById('emergencyContact')?.value.trim(),
            notes: document.getElementById('notes')?.value.trim()
        };

        try {
            await this.backend.addTenant(tenantData);
            this.showNotification('Tenant added successfully', 'success');
            this.closeAddTenantModal();
            
            // Refresh tenants data
            await this.loadTenantsData();
            
        } catch (error) {
            console.error('Error saving tenant:', error);
            this.showNotification(error.message || 'Failed to add tenant', 'error');
        }
    }

    // Close add tenant modal
    closeAddTenantModal() {
        const modal = document.getElementById('addTenantModal');
        if (modal) {
            modal.remove();
        }
    }

    // Edit tenant
    async editTenant(tenantId) {
        const tenant = this.backend.getTenantById(tenantId);
        if (!tenant) {
            this.showNotification('Tenant not found', 'error');
            return;
        }
        
        // Show edit modal
        this.showEditTenantModal(tenant);
    }

    // Show edit tenant modal
    showEditTenantModal(tenant) {
        // Close any existing modal first
        this.closeAllModals();
        
        const modalHTML = `
            <div class="modal-overlay" id="editTenantModal">
                <div class="modal-container max-w-2xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Edit Tenant</h2>
                        <button id="closeEditModalBtn" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="editTenantForm" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">First Name *</label>
                                    <input type="text" id="editFirstName" value="${this.escapeHtml(tenant.firstName)}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Last Name *</label>
                                    <input type="text" id="editLastName" value="${this.escapeHtml(tenant.lastName)}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Email *</label>
                                    <input type="email" id="editEmail" value="${this.escapeHtml(tenant.email)}" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Phone</label>
                                    <input type="tel" id="editPhone" value="${this.escapeHtml(tenant.phone || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Select Property *</label>
                                    <select id="editPropertyId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select a property</option>
                                        ${this.getPropertyOptions()}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Unit Number</label>
                                    <input type="text" id="editUnit" value="${this.escapeHtml(tenant.unit || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Monthly Rent *</label>
                                    <div class="relative">
                                        <span class="absolute left-3 top-2 text-gray-500">$</span>
                                        <input type="number" id="editMonthlyRent" value="${tenant.monthlyRent}" required min="0" step="0.01" class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Lease Status</label>
                                    <select id="editStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="active" ${tenant.status === 'active' ? 'selected' : ''}>Active</option>
                                        <option value="pending" ${tenant.status === 'pending' ? 'selected' : ''}>Pending</option>
                                        <option value="inactive" ${tenant.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium mb-2">Lease Start Date</label>
                                    <input type="date" id="editLeaseStart" value="${tenant.leaseStart ? new Date(tenant.leaseStart).toISOString().split('T')[0] : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium mb-2">Lease End Date</label>
                                    <input type="date" id="editLeaseEnd" value="${tenant.leaseEnd ? new Date(tenant.leaseEnd).toISOString().split('T')[0] : ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Emergency Contact</label>
                                <input type="text" id="editEmergencyContact" value="${this.escapeHtml(tenant.emergencyContact || '')}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Payment Status</label>
                                <select id="editPaymentStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="paid" ${tenant.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
                                    <option value="pending" ${tenant.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="overdue" ${tenant.paymentStatus === 'overdue' ? 'selected' : ''}>Overdue</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Notes</label>
                                <textarea id="editNotes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">${this.escapeHtml(tenant.notes || '')}</textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelEditBtn" class="btn-secondary">Cancel</button>
                        <button id="updateTenantBtn" class="btn-primary">Update Tenant</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Set property selection
        this.setPropertySelection(tenant.propertyId);
        
        // Setup edit modal event listeners
        this.setupEditTenantModalEvents(tenant.id);
    }

    // Set property selection
    setPropertySelection(propertyId) {
        const propertySelect = document.getElementById('editPropertyId');
        if (propertySelect) {
            propertySelect.value = propertyId;
        }
    }

    // Setup edit tenant modal events
    setupEditTenantModalEvents(tenantId) {
        const modal = document.getElementById('editTenantModal');
        if (!modal) return;

        // Close buttons
        modal.querySelectorAll('#closeEditModalBtn, #cancelEditBtn').forEach(btn => {
            btn.addEventListener('click', () => this.closeEditTenantModal());
        });

        // Update tenant button
        const updateBtn = document.getElementById('updateTenantBtn');
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                await this.updateTenant(tenantId);
            });
        }

        // Form submission
        const form = document.getElementById('editTenantForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.updateTenant(tenantId);
            });
        }

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeEditTenantModal();
            }
        });
    }

    // Update tenant
    async updateTenant(tenantId) {
        const updates = {
            firstName: document.getElementById('editFirstName')?.value.trim(),
            lastName: document.getElementById('editLastName')?.value.trim(),
            email: document.getElementById('editEmail')?.value.trim(),
            phone: document.getElementById('editPhone')?.value.trim(),
            propertyId: parseInt(document.getElementById('editPropertyId')?.value),
            unit: document.getElementById('editUnit')?.value.trim(),
            monthlyRent: parseFloat(document.getElementById('editMonthlyRent')?.value) || 0,
            status: document.getElementById('editStatus')?.value,
            leaseStart: document.getElementById('editLeaseStart')?.value,
            leaseEnd: document.getElementById('editLeaseEnd')?.value,
            emergencyContact: document.getElementById('editEmergencyContact')?.value.trim(),
            paymentStatus: document.getElementById('editPaymentStatus')?.value,
            notes: document.getElementById('editNotes')?.value.trim()
        };

        try {
            await this.backend.updateTenant(tenantId, updates);
            this.showNotification('Tenant updated successfully', 'success');
            this.closeEditTenantModal();
            
            // Refresh tenants data
            await this.loadTenantsData();
            
        } catch (error) {
            console.error('Error updating tenant:', error);
            this.showNotification(error.message || 'Failed to update tenant', 'error');
        }
    }

    // Close edit tenant modal
    closeEditTenantModal() {
        const modal = document.getElementById('editTenantModal');
        if (modal) {
            modal.remove();
        }
    }

    // Delete tenant
    async deleteTenant(tenantId) {
        if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            try {
                await this.backend.deleteTenant(tenantId);
                this.showNotification('Tenant deleted successfully', 'success');
                
                // Refresh tenants data
                await this.loadTenantsData();
                
            } catch (error) {
                console.error('Error deleting tenant:', error);
                this.showNotification('Failed to delete tenant', 'error');
            }
        }
    }

    // Export tenants
    async exportTenants() {
        try {
            const csvContent = this.backend.exportTenantsToCSV();
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tenants_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Tenants exported successfully', 'success');
            
        } catch (error) {
            console.error('Error exporting tenants:', error);
            this.showNotification('Failed to export tenants', 'error');
        }
    }

    // View all leases
    viewAllLeases() {
        // Show leases modal
        this.showLeasesModal();
    }

    // Show leases modal
    showLeasesModal() {
        const expiringLeases = this.backend.getExpiringLeases();
        
        const modalHTML = `
            <div class="modal-overlay" id="leasesModal">
                <div class="modal-container max-w-3xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Upcoming Lease Expirations</h2>
                        <button id="closeLeasesModalBtn" class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        ${expiringLeases.length === 0 ? 
                            `<div class="text-center py-8 text-gray-500">
                                <i class="fas fa-check-circle text-3xl mb-4 text-green-500"></i>
                                <p class="text-lg font-medium">No leases expiring soon</p>
                                <p class="text-gray-600 mt-2">All leases are up to date</p>
                            </div>` :
                            `<div class="overflow-x-auto">
                                <table class="w-full">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Tenant</th>
                                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Property</th>
                                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Lease End</th>
                                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Days Left</th>
                                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        ${expiringLeases.map(lease => `
                                            <tr class="hover:bg-gray-50">
                                                <td class="px-4 py-3">
                                                    <div class="font-medium">${this.escapeHtml(lease.firstName)} ${this.escapeHtml(lease.lastName)}</div>
                                                    <div class="text-sm text-gray-500">${lease.email}</div>
                                                </td>
                                                <td class="px-4 py-3">
                                                    <div class="text-sm">${this.escapeHtml(lease.propertyName)}</div>
                                                    <div class="text-xs text-gray-500">${lease.unit || 'N/A'}</div>
                                                </td>
                                                <td class="px-4 py-3">
                                                    <div class="text-sm">${new Date(lease.leaseEnd).toLocaleDateString()}</div>
                                                </td>
                                                <td class="px-4 py-3">
                                                    ${this.getDaysLeftBadge(lease.leaseEnd)}
                                                </td>
                                                <td class="px-4 py-3">
                                                    <button onclick="window.tenantsFrontend.sendRenewalReminder(${lease.id})" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                        Send Reminder
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>`
                        }
                        
                        ${expiringLeases.length > 0 ? 
                            `<div class="mt-6 p-4 bg-blue-50 rounded-lg">
                                <div class="flex items-center">
                                    <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                                    <p class="text-sm text-blue-700">
                                        Send renewal reminders to tenants with expiring leases. Consider offering lease extensions.
                                    </p>
                                </div>
                            </div>` : ''
                        }
                    </div>
                    
                    <div class="modal-footer">
                        <button id="closeLeasesBtn" class="btn-secondary">Close</button>
                        ${expiringLeases.length > 0 ? 
                            `<button id="sendAllRemindersBtn" class="btn-primary">Send All Reminders</button>` : ''
                        }
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup leases modal events
        this.setupLeasesModalEvents(expiringLeases);
    }

    // Get days left badge
    getDaysLeftBadge(leaseEnd) {
        const now = new Date();
        const end = new Date(leaseEnd);
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        
        let badgeClass = 'px-2 py-1 text-xs font-medium rounded-full';
        let text = `${daysLeft} days`;
        
        if (daysLeft <= 7) {
            badgeClass += ' bg-red-100 text-red-800';
        } else if (daysLeft <= 30) {
            badgeClass += ' bg-yellow-100 text-yellow-800';
        } else {
            badgeClass += ' bg-green-100 text-green-800';
        }
        
        return `<span class="${badgeClass}">${text}</span>`;
    }

    // Setup leases modal events
    setupLeasesModalEvents(expiringLeases) {
        const modal = document.getElementById('leasesModal');
        if (!modal) return;

        // Close buttons
        modal.querySelectorAll('#closeLeasesModalBtn, #closeLeasesBtn').forEach(btn => {
            btn.addEventListener('click', () => this.closeLeasesModal());
        });

        // Send all reminders button
        const sendAllBtn = document.getElementById('sendAllRemindersBtn');
        if (sendAllBtn) {
            sendAllBtn.addEventListener('click', () => {
                this.sendAllRenewalReminders(expiringLeases);
            });
        }
    }

    // Send renewal reminder
    sendRenewalReminder(tenantId) {
        const tenant = this.backend.getTenantById(tenantId);
        if (!tenant) return;
        
        // Simulate sending reminder
        this.showNotification(`Renewal reminder sent to ${tenant.firstName} ${tenant.lastName}`, 'success');
        
        // Add notification
        this.backend.addNotification({
            type: 'info',
            title: 'Renewal Reminder Sent',
            message: `Sent renewal reminder to ${tenant.firstName} ${tenant.lastName}`,
            timestamp: new Date().toISOString(),
            read: false
        });
    }

    // Send all renewal reminders
    sendAllRenewalReminders(leases) {
        leases.forEach(lease => {
            this.sendRenewalReminder(lease.id);
        });
        
        this.showNotification(`Renewal reminders sent to ${leases.length} tenants`, 'success');
        this.closeLeasesModal();
    }

    // Close leases modal
    closeLeasesModal() {
        const modal = document.getElementById('leasesModal');
        if (modal) {
            modal.remove();
        }
    }

    // Show import modal
    showImportModal() {
        const modalHTML = `
            <div class="modal-overlay" id="importModal">
                <div class="modal-container max-w-md">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Import Tenants</h2>
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
                                    <li>FirstName (required)</li>
                                    <li>LastName (required)</li>
                                    <li>Email (required)</li>
                                    <li>Phone (optional)</li>
                                    <li>Property (property name)</li>
                                    <li>Unit (optional)</li>
                                    <li>MonthlyRent (number)</li>
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
                    await this.backend.importTenantsFromCSV(csvContent);
                    
                    this.showNotification('Tenants imported successfully', 'success');
                    this.closeImportModal();
                    
                    // Refresh tenants data
                    await this.loadTenantsData();
                    
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
            this.showNotification('Failed to import tenants', 'error');
        }
    }

    // Download CSV template
    downloadCSVTemplate() {
        const template = `FirstName,LastName,Email,Phone,Property,Unit,MonthlyRent,Status,Notes
John,Doe,john.doe@example.com,555-123-4567,Miami Beach,3B,1200,active,Good tenant
Jane,Smith,jane.smith@example.com,555-234-5678,NYC Apt,5A,800,active,Pays on time
Robert,Johnson,robert.johnson@example.com,555-345-6789,London Flat,2,1500,active,Long-term tenant`;
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tenants_template.csv';
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
        const tenantsContainer = document.getElementById('tenants');
        if (tenantsContainer) {
            tenantsContainer.innerHTML = `
                <div class="text-center p-8">
                    <i class="fas fa-exclamation-triangle text-3xl text-yellow-500 mb-4"></i>
                    <h2 class="text-xl font-semibold mb-2">Failed to Load Tenants</h2>
                    <p class="text-gray-600 mb-4">There was an error loading the tenants data.</p>
                    <button onclick="window.tenantsFrontend.initialize()" class="px-4 py-2 bg-blue-600 text-white rounded-lg">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Create and export tenants frontend instance
const tenantsFrontend = new TenantsFrontend();
window.tenantsFrontend = tenantsFrontend;

// Initialize tenants when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tenants')) {
        tenantsFrontend.initialize();
    }
});

export { TenantsFrontend };