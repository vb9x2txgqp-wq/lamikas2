/**
 * Maintenance Frontend - UI Rendering and Event Handling
 * Contains all UI-related code
 */

import { MaintenanceBackend } from '../functions/maintenance.js';

class MaintenanceFrontend {
    constructor() {
        this.backend = new MaintenanceBackend();
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.isInitialized = false;
        this.requests = [];
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Inject HTML template
            this.injectTemplate();
            
            // Load maintenance data
            await this.loadMaintenanceData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render data
            this.renderAll();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Error initializing maintenance page:', error);
            window.mainApp?.showNotification('Failed to load maintenance page', 'error');
        }
    }

    // Inject HTML template (exact copy from original)
    injectTemplate() {
        const container = document.getElementById('maintenance');
        if (!container) return;

        container.innerHTML = `
<main class="p-4 lg:p-6 fade-in">
  <!-- Top Bar -->
  <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Maintenance Requests</h1>
      <p class="text-gray-600">Track and manage maintenance issues</p>
    </div>
    <div class="flex items-center space-x-4 w-full lg:w-auto">
      <div class="relative flex-1 lg:flex-none">
        <input type="text" id="maintenanceSearch" placeholder="Search requests..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>
      <button id="newRequestBtn" class="btn-primary px-4 py-2 text-white rounded-lg font-medium flex items-center space-x-2">
        <i class="fas fa-plus"></i>
        <span>New Request</span>
      </button>
    </div>
  </div>

  <!-- Maintenance Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Open Requests</p>
          <h3 class="text-2xl font-bold mt-2" id="maintenanceOpenRequests">0</h3>
          <p class="text-yellow-600 text-sm mt-1">
            <i class="fas fa-clock mr-1"></i>
            <span id="maintenanceHighPriority">0</span> high priority
          </p>
        </div>
        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-tools text-yellow-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">In Progress</p>
          <h3 class="text-2xl font-bold mt-2" id="maintenanceInProgress">0</h3>
          <p class="text-blue-600 text-sm mt-1">
            <i class="fas fa-spinner mr-1"></i>
            Avg. <span id="maintenanceAvgDays">0</span> days to resolve
          </p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-clock text-blue-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Completed</p>
          <h3 class="text-2xl font-bold mt-2" id="maintenanceCompleted">0</h3>
          <p class="text-green-600 text-sm mt-1">
            <i class="fas fa-check-circle mr-1"></i>
            This month
          </p>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-check text-green-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Avg. Cost</p>
          <h3 class="text-2xl font-bold mt-2" id="maintenanceAvgCost">$0</h3>
          <p class="text-gray-600 text-sm mt-1">Per request</p>
        </div>
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-dollar-sign text-purple-600 text-xl"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Maintenance Requests -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    <!-- Open Requests -->
    <div class="bg-white rounded-xl shadow">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold">Open Requests (<span id="openRequestsCount">0</span>)</h3>
      </div>
      <div class="p-6" id="openRequestsList">
        <!-- Open requests will be loaded here -->
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-inbox text-2xl mb-2"></i>
          <p>No open requests</p>
        </div>
      </div>
    </div>

    <!-- In Progress -->
    <div class="bg-white rounded-xl shadow">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold">In Progress (<span id="inProgressCount">0</span>)</h3>
      </div>
      <div class="p-6" id="inProgressList">
        <!-- In progress requests will be loaded here -->
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-spinner text-2xl mb-2"></i>
          <p>No requests in progress</p>
        </div>
      </div>
    </div>

    <!-- Recently Completed -->
    <div class="bg-white rounded-xl shadow">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold">Recently Completed</h3>
      </div>
      <div class="p-6" id="completedList">
        <!-- Completed requests will be loaded here -->
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-check-circle text-2xl mb-2"></i>
          <p>No completed requests</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Maintenance Categories -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Maintenance by Category</h3>
      <div class="h-64 flex items-center justify-center">
        <div id="maintenanceCategoriesChart" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Monthly Maintenance Costs</h3>
      <div class="h-64 flex items-center justify-center">
        <div id="maintenanceCostsChart" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
  </div>
</main>
        `;
    }

    async loadMaintenanceData() {
        this.requests = this.backend.getAllRequests();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('maintenanceSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.renderRequestLists();
            });
        }

        // New Request button
        const newRequestBtn = document.getElementById('newRequestBtn');
        if (newRequestBtn) {
            newRequestBtn.addEventListener('click', () => {
                this.showNewRequestModal();
            });
        }

        // Filter buttons (if any in the future)
        document.querySelectorAll('[data-maintenance-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.maintenanceFilter;
                this.renderRequestLists();
            });
        });
    }

    renderAll() {
        this.renderStats();
        this.renderRequestLists();
        this.renderCharts();
    }

    renderStats() {
        const stats = this.backend.calculateStats(this.requests);
        
        // Update all stat elements
        this.updateElement('#maintenanceOpenRequests', stats.openRequests);
        this.updateElement('#maintenanceHighPriority', stats.highPriority);
        this.updateElement('#maintenanceInProgress', stats.inProgress);
        this.updateElement('#maintenanceAvgDays', `${stats.avgDays}`);
        this.updateElement('#maintenanceCompleted', stats.completed);
        this.updateElement('#maintenanceAvgCost', window.mainApp?.formatCurrency(stats.avgCost) || `$${stats.avgCost}`);
        this.updateElement('#openRequestsCount', stats.openRequests);
        this.updateElement('#inProgressCount', stats.inProgress);
    }

    renderRequestLists() {
        this.renderOpenRequests();
        this.renderInProgressRequests();
        this.renderCompletedRequests();
    }

    renderOpenRequests() {
        const container = document.getElementById('openRequestsList');
        if (!container) return;

        // Filter requests
        let openRequests = this.requests.filter(r => r.status === 'open');
        if (this.currentSearch) {
            openRequests = this.backend.searchRequests(this.currentSearch, openRequests);
        }

        if (openRequests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-2xl mb-2"></i>
                    <p>${this.currentSearch ? 'No open requests match your search' : 'No open requests'}</p>
                    ${!this.currentSearch ? `
                        <button onclick="window.mainApp.modules.maintenance.showNewRequestModal()" 
                                class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Create First Request
                        </button>
                    ` : ''}
                </div>
            `;
            return;
        }

        container.innerHTML = openRequests.slice(0, 5).map(request => `
            <div class="p-4 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 cursor-pointer" 
                 onclick="window.mainApp.modules.maintenance.viewRequestDetails(${request.id})">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-medium">${this.escapeHtml(request.title)}</div>
                        <div class="text-sm text-gray-500">${this.escapeHtml(request.propertyName || `Property ${request.propertyId}`)}</div>
                    </div>
                    <span class="px-2 py-1 text-xs ${this.getPriorityClass(request.priority)} rounded">
                        ${this.formatPriority(request.priority)}
                    </span>
                </div>
                <div class="mt-2 text-sm text-gray-600">
                    <div class="truncate">${this.escapeHtml(request.description?.substring(0, 100) || 'No description')}${request.description?.length > 100 ? '...' : ''}</div>
                    <div class="mt-1 text-xs text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        ${window.mainApp?.formatTimeAgo(request.createdAt) || 'Recently'}
                    </div>
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <div class="text-xs text-gray-500">
                        <i class="fas fa-tag mr-1"></i>
                        ${this.escapeHtml(request.category || 'Uncategorized')}
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="window.mainApp.modules.maintenance.startRequest(${request.id}); event.stopPropagation();" 
                                class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                            Start
                        </button>
                        <button onclick="window.mainApp.modules.maintenance.completeRequestModal(${request.id}); event.stopPropagation();" 
                                class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                            Complete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderInProgressRequests() {
        const container = document.getElementById('inProgressList');
        if (!container) return;

        // Filter requests
        let inProgressRequests = this.requests.filter(r => r.status === 'in_progress');
        if (this.currentSearch) {
            inProgressRequests = this.backend.searchRequests(this.currentSearch, inProgressRequests);
        }

        if (inProgressRequests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner text-2xl mb-2"></i>
                    <p>${this.currentSearch ? 'No requests in progress match your search' : 'No requests in progress'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = inProgressRequests.slice(0, 5).map(request => `
            <div class="p-4 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 cursor-pointer"
                 onclick="window.mainApp.modules.maintenance.viewRequestDetails(${request.id})">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-medium">${this.escapeHtml(request.title)}</div>
                        <div class="text-sm text-gray-500">${this.escapeHtml(request.propertyName || `Property ${request.propertyId}`)}</div>
                    </div>
                    <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        In Progress
                    </span>
                </div>
                <div class="mt-2 text-sm text-gray-600">
                    ${this.escapeHtml(request.description?.substring(0, 100) || 'No description')}${request.description?.length > 100 ? '...' : ''}
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <div class="text-xs text-gray-500">
                        <i class="fas fa-user mr-1"></i>
                        ${this.escapeHtml(request.assignedTo || 'Unassigned')}
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="window.mainApp.modules.maintenance.completeRequestModal(${request.id}); event.stopPropagation();" 
                                class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                            Complete
                        </button>
                        <button onclick="window.mainApp.modules.maintenance.reopenRequest(${request.id}); event.stopPropagation();" 
                                class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                            Re-open
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderCompletedRequests() {
        const container = document.getElementById('completedList');
        if (!container) return;

        // Filter requests
        let completedRequests = this.requests
            .filter(r => r.status === 'completed')
            .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt));
        
        if (this.currentSearch) {
            completedRequests = this.backend.searchRequests(this.currentSearch, completedRequests);
        }

        if (completedRequests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-check-circle text-2xl mb-2"></i>
                    <p>${this.currentSearch ? 'No completed requests match your search' : 'No completed requests'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = completedRequests.slice(0, 5).map(request => `
            <div class="p-4 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 cursor-pointer"
                 onclick="window.mainApp.modules.maintenance.viewRequestDetails(${request.id})">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="font-medium">${this.escapeHtml(request.title)}</div>
                        <div class="text-sm text-gray-500">${this.escapeHtml(request.propertyName || `Property ${request.propertyId}`)}</div>
                    </div>
                    <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Completed
                    </span>
                </div>
                <div class="mt-2 text-sm text-gray-600">
                    <div>${this.escapeHtml(request.completionNotes?.substring(0, 100) || request.description?.substring(0, 100) || 'Completed')}${request.completionNotes?.length > 100 ? '...' : ''}</div>
                    <div class="mt-1 text-xs text-gray-500">
                        <i class="fas fa-calendar-check mr-1"></i>
                        ${window.mainApp?.formatTimeAgo(request.completedAt) || 'Recently completed'}
                    </div>
                </div>
                <div class="mt-3 flex justify-between items-center">
                    <div class="text-sm font-medium text-green-700">
                        $${request.actualCost?.toFixed(2) || '0.00'}
                    </div>
                    <button onclick="window.mainApp.modules.maintenance.reopenRequest(${request.id}); event.stopPropagation();" 
                            class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">
                        Re-open
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.renderCategoriesChart();
            this.renderCostsChart();
        } else {
            // Load Chart.js dynamically
            this.loadChartJS();
        }
    }

    async loadChartJS() {
        // Only load if not already loaded
        if (typeof Chart !== 'undefined') return;
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            this.renderCategoriesChart();
            this.renderCostsChart();
        };
        document.head.appendChild(script);
    }

    renderCategoriesChart() {
        const ctx = document.getElementById('maintenanceCategoriesChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        // Get category data
        const categoryData = this.backend.getCategoryDistribution();
        
        ctx.chart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: [
                        '#f59e0b', // amber
                        '#3b82f6', // blue
                        '#10b981', // emerald
                        '#8b5cf6', // violet
                        '#ef4444', // red
                        '#06b6d4', // cyan
                        '#f97316'  // orange
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    renderCostsChart() {
        const ctx = document.getElementById('maintenanceCostsChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        // Get monthly costs
        const costData = this.backend.calculateMonthlyCosts();
        
        ctx.chart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: costData.labels,
                datasets: [{
                    label: 'Maintenance Costs',
                    data: costData.data,
                    backgroundColor: 'rgba(139, 92, 246, 0.7)',
                    borderColor: '#8b5cf6',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Show New Request Modal
    showNewRequestModal() {
        const modalHTML = `
            <div class="modal-overlay" id="newMaintenanceModal">
                <div class="modal-container max-w-2xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">New Maintenance Request</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="maintenanceRequestForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Title *</label>
                                <input type="text" id="requestTitle" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="Brief description of the issue">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Select Property *</label>
                                <select id="requestProperty" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select a property</option>
                                    <option value="1">Miami Beach</option>
                                    <option value="2">NYC Apt</option>
                                    <option value="3">London Flat</option>
                                    <option value="4">Tokyo Office</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Category *</label>
                                <select id="requestCategory" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select category</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="heating">Heating/Cooling</option>
                                    <option value="appliance">Appliance</option>
                                    <option value="structural">Structural</option>
                                    <option value="pest_control">Pest Control</option>
                                    <option value="cleaning">Cleaning</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Priority *</label>
                                <select id="requestPriority" required 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="low">Low</option>
                                    <option value="medium" selected>Medium</option>
                                    <option value="high">High</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Detailed Description *</label>
                                <textarea id="requestDescription" rows="4" required 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                          placeholder="Describe the issue in detail..."></textarea>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Estimated Cost</label>
                                <input type="number" step="0.01" min="0" id="requestEstimatedCost"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="0.00">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Attach Photos (Optional)</label>
                                <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                    <i class="fas fa-camera text-gray-400 text-2xl mb-2"></i>
                                    <p class="text-sm text-gray-500">Drag & drop or click to upload photos</p>
                                    <input type="file" id="requestPhotos" multiple accept="image/*" class="hidden">
                                    <label for="requestPhotos" class="mt-2 inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm cursor-pointer hover:bg-gray-200">
                                        Choose Files
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelRequestBtn" class="btn-secondary">Cancel</button>
                        <button id="submitRequestBtn" class="btn-primary">Submit Request</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners to the modal
        setTimeout(() => {
            const modal = document.getElementById('newMaintenanceModal');
            if (!modal) return;
            
            // Cancel button
            modal.querySelector('#cancelRequestBtn').addEventListener('click', () => {
                modal.remove();
            });
            
            // Submit button
            modal.querySelector('#submitRequestBtn').addEventListener('click', () => {
                this.submitNewRequest();
            });
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // File upload
            const fileInput = modal.querySelector('#requestPhotos');
            const uploadLabel = modal.querySelector('label[for="requestPhotos"]');
            
            fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (files.length > 0) {
                    uploadLabel.innerHTML = `<i class="fas fa-check mr-2"></i>${files.length} file(s) selected`;
                }
            });
        }, 10);
    }

    async submitNewRequest() {
        const form = document.getElementById('maintenanceRequestForm');
        if (!form) return;
        
        try {
            // Get form data
            const requestData = {
                title: document.getElementById('requestTitle')?.value || '',
                propertyId: document.getElementById('requestProperty')?.value,
                category: document.getElementById('requestCategory')?.value,
                priority: document.getElementById('requestPriority')?.value || 'medium',
                description: document.getElementById('requestDescription')?.value || '',
                estimatedCost: parseFloat(document.getElementById('requestEstimatedCost')?.value) || 0,
                propertyName: document.getElementById('requestProperty')?.selectedOptions[0]?.text || '',
                status: 'open'
            };
            
            // Validate (frontend validation)
            if (!requestData.title || !requestData.propertyId || !requestData.category || !requestData.description) {
                window.mainApp?.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Add request through backend
            const newRequest = this.backend.addRequest(requestData);
            
            // Update local data
            this.requests = this.backend.getAllRequests();
            
            // Close modal
            document.getElementById('newMaintenanceModal')?.remove();
            
            // Show success message
            window.mainApp?.showNotification('Maintenance request submitted successfully!', 'success');
            
            // Refresh display
            this.renderAll();
            
        } catch (error) {
            console.error('Error submitting request:', error);
            window.mainApp?.showNotification(error.message || 'Failed to submit request', 'error');
        }
    }

    viewRequestDetails(requestId) {
        // For now, show a notification
        window.mainApp?.showNotification('Request details would open here', 'info');
        
        // In a real implementation, this would:
        // 1. Show detailed modal with all request info
        // 2. Allow editing
        // 3. Show photos and updates
    }

    async startRequest(requestId) {
        try {
            // Assign to current user (in real app, would have user management)
            const user = { name: 'Current User', id: 'user1' };
            const updated = this.backend.assignRequest(requestId, user.name);
            
            // Update local data
            this.requests = this.backend.getAllRequests();
            
            // Refresh display
            this.renderAll();
            
            window.mainApp?.showNotification('Request marked as in progress', 'success');
            
        } catch (error) {
            console.error('Error starting request:', error);
            window.mainApp?.showNotification('Failed to start request', 'error');
        }
    }

    completeRequestModal(requestId) {
        const modalHTML = `
            <div class="modal-overlay" id="completeRequestModal">
                <div class="modal-container max-w-md">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Complete Request</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="completeRequestForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Actual Cost</label>
                                <input type="number" step="0.01" min="0" id="actualCost"
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="0.00">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Completion Notes</label>
                                <textarea id="completionNotes" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                          placeholder="What was done to resolve the issue..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelCompleteBtn" class="btn-secondary">Cancel</button>
                        <button id="confirmCompleteBtn" class="btn-primary" data-request-id="${requestId}">Complete Request</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners
        setTimeout(() => {
            const modal = document.getElementById('completeRequestModal');
            if (!modal) return;
            
            modal.querySelector('#cancelCompleteBtn').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.querySelector('#confirmCompleteBtn').addEventListener('click', (e) => {
                const requestId = e.target.dataset.requestId;
                this.completeRequest(requestId);
            });
        }, 10);
    }

    async completeRequest(requestId) {
        try {
            const actualCost = parseFloat(document.getElementById('actualCost')?.value) || 0;
            const notes = document.getElementById('completionNotes')?.value || '';
            
            const updated = this.backend.completeRequest(requestId, actualCost, notes);
            
            // Update local data
            this.requests = this.backend.getAllRequests();
            
            // Close modal
            document.getElementById('completeRequestModal')?.remove();
            
            // Refresh display
            this.renderAll();
            
            window.mainApp?.showNotification('Request marked as completed', 'success');
            
        } catch (error) {
            console.error('Error completing request:', error);
            window.mainApp?.showNotification('Failed to complete request', 'error');
        }
    }

    async reopenRequest(requestId) {
        try {
            const updated = this.backend.updateStatus(requestId, 'open');
            
            // Update local data
            this.requests = this.backend.getAllRequests();
            
            // Refresh display
            this.renderAll();
            
            window.mainApp?.showNotification('Request reopened', 'success');
            
        } catch (error) {
            console.error('Error reopening request:', error);
            window.mainApp?.showNotification('Failed to reopen request', 'error');
        }
    }

    async exportMaintenance() {
        try {
            const csvContent = this.backend.exportToCSV(this.requests);
            
            if (csvContent === "No maintenance requests to export") {
                window.mainApp?.showNotification('No maintenance requests to export', 'info');
                return;
            }
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `maintenance_requests_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            window.mainApp?.showNotification('Maintenance requests exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting maintenance requests:', error);
            window.mainApp?.showNotification('Failed to export maintenance requests', 'error');
        }
    }

    // Utility methods
    updateElement(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPriorityClass(priority) {
        switch (priority) {
            case 'emergency':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    formatPriority(priority) {
        return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Medium';
    }

    // Refresh method for external calls
    async refresh() {
        await this.loadMaintenanceData();
        this.renderAll();
    }
}

export { MaintenanceFrontend };