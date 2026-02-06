/**
 * Payments Frontend - UI Rendering and Event Handling
 * Contains all UI-related code
 */

import { Utils } from './utils.js';

class PaymentsFrontend {
    constructor() {
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.isInitialized = false;
        this.payments = [];
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Inject HTML template
            this.injectTemplate();
            
            // Load payments data (using same structure as dashboard)
            await this.loadPaymentsData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render data
            this.renderAll();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Error initializing payments page:', error);
            window.mainApp?.showNotification('Failed to load payments page', 'error');
        }
    }

    // Inject HTML template (exact copy from original)
    injectTemplate() {
        const container = document.getElementById('payments');
        if (!container) return;

        container.innerHTML = `
<main class="p-4 lg:p-6 fade-in">
  <!-- Top Bar -->
  <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Payments & Invoices</h1>
      <p class="text-gray-600">Track all payments, invoices, and collections</p>
    </div>
    <div class="flex items-center space-x-4 w-full lg:w-auto">
      <div class="relative flex-1 lg:flex-none">
        <input type="text" id="paymentsSearch" placeholder="Search payments..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
      </div>
      <button id="recordPaymentBtn" class="btn-primary px-4 py-2 text-white rounded-lg font-medium flex items-center space-x-2">
        <i class="fas fa-file-invoice-dollar"></i>
        <span>Record Payment</span>
      </button>
    </div>
  </div>

  <!-- Payments Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Monthly Collections</p>
          <h3 class="text-2xl font-bold mt-2" id="paymentsMonthlyCollections">$0</h3>
          <p class="text-green-600 text-sm mt-1">
            <i class="fas fa-arrow-up mr-1"></i>
            <span id="paymentsGrowth">0</span>% from last month
          </p>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-money-bill-wave text-green-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Outstanding</p>
          <h3 class="text-2xl font-bold mt-2" id="paymentsOutstanding">$0</h3>
          <p class="text-red-600 text-sm mt-1">
            <i class="fas fa-exclamation-circle mr-1"></i>
            <span id="paymentsOverdueTenants">0</span> tenants overdue
          </p>
        </div>
        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Collection Rate</p>
          <h3 class="text-2xl font-bold mt-2" id="paymentsCollectionRate">0%</h3>
          <p class="text-green-600 text-sm mt-1">
            <i class="fas fa-check-circle mr-1"></i>
            <span id="paymentsPaidCount">0</span>/<span id="paymentsTotalCount">0</span> paid
          </p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-percentage text-blue-600 text-xl"></i>
        </div>
      </div>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Avg. Processing</p>
          <h3 class="text-2xl font-bold mt-2" id="paymentsAvgProcessing">0 days</h3>
          <p class="text-gray-600 text-sm mt-1">Payment processing time</p>
        </div>
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-clock text-purple-600 text-xl"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Payments -->
  <div class="bg-white rounded-xl shadow mb-8">
    <div class="p-6 border-b">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Recent Payments</h3>
        <div class="flex space-x-2">
          <button id="exportPaymentsBtn" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            <i class="fas fa-download mr-2"></i>
            Export
          </button>
          <button id="addPaymentTableBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <i class="fas fa-plus mr-2"></i>
            Add Payment
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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
          </tr>
        </thead>
        <tbody id="paymentsTableBody" class="divide-y divide-gray-200">
          <!-- Payments will be loaded here -->
          <tr>
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              <i class="fas fa-money-bill-wave text-3xl mb-3"></i>
              <p>No payments found. Record your first payment!</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Payment Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Monthly Collections Trend</h3>
      <div class="h-64 flex items-center justify-center">
        <div id="collectionsChart" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Payment Methods Distribution</h3>
      <div class="h-64 flex items-center justify-center">
        <div id="paymentMethodsChart" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
  </div>

  <!-- Outstanding Payments -->
  <div class="bg-white rounded-xl shadow">
    <div class="p-6 border-b">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Outstanding Payments</h3>
        <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium" id="outstandingCount">0 overdue payments</span>
      </div>
    </div>
    <div class="p-6">
      <div class="space-y-4" id="outstandingPaymentsList">
        <!-- Outstanding payments will be loaded here -->
        <div class="text-center py-4 text-gray-500">
          <i class="fas fa-check-circle text-2xl mb-2"></i>
          <p>No outstanding payments</p>
        </div>
      </div>
    </div>
  </div>
</main>
        `;
    }

    async loadPaymentsData() {
        // Use the SAME structure as dashboard
        // First try to get properties to calculate expected income
        let properties = JSON.parse(localStorage.getItem('properties')) || [];
        
        // If no properties, create defaults (same as dashboard)
        if (properties.length === 0) {
            properties = this.getDefaultProperties();
            localStorage.setItem('properties', JSON.stringify(properties));
        }
        
        // Try to get payments from localStorage with same key pattern
        const user = window.authManager?.getCurrentUser?.() || { id: 'default' };
        const userId = user.id;
        const storageKey = `payments_${userId}`;
        let savedPayments = [];
        
        try {
            savedPayments = JSON.parse(localStorage.getItem(storageKey)) || [];
        } catch (error) {
            console.log('No existing payments data:', error);
        }
        
        // If no saved payments, create sample data that matches dashboard expectations
        if (savedPayments.length === 0) {
            this.payments = this.createSamplePayments(properties);
            // Save the sample payments
            localStorage.setItem(storageKey, JSON.stringify(this.payments));
        } else {
            this.payments = savedPayments;
        }
    }

    getDefaultProperties() {
        // Same as dashboard for consistency
        return [
            {
                id: 1,
                name: "Miami Beach",
                lat: 25.7617,
                lng: -80.1918,
                color: "#FF8E53",
                units: 10,
                monthlyIncome: 12000,
                occupancy: 80,
                status: 'active',
                type: 'vacation',
                address: "123 Ocean Drive, Miami, FL",
                addedDate: new Date().toISOString(),
                description: "Beachfront property with ocean views"
            },
            {
                id: 2,
                name: "NYC Apt",
                lat: 40.7128,
                lng: -74.0060,
                color: "#4ECDC4",
                units: 5,
                monthlyIncome: 8000,
                occupancy: 100,
                status: 'active',
                type: 'apartment',
                address: "456 Broadway, New York, NY",
                addedDate: new Date().toISOString(),
                description: "Modern apartment in Manhattan"
            },
            {
                id: 3,
                name: "London Flat",
                lat: 51.5074,
                lng: -0.1278,
                color: "#FFD93D",
                units: 3,
                monthlyIncome: 4500,
                occupancy: 67,
                status: 'active',
                type: 'condo',
                address: "789 Oxford Street, London, UK",
                addedDate: new Date().toISOString(),
                description: "Central London luxury flat"
            }
        ];
    }

    createSamplePayments(properties) {
        // Create sample payments that match dashboard's expected data
        const samplePayments = [
            {
                id: 1,
                tenant: 'John Smith',
                tenantId: 1,
                property: 'Beachfront Villa',
                propertyId: 1,
                amount: 1200,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'paid',
                method: 'credit_card',
                reference: 'PAY-001',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                tenant: 'Sarah Johnson',
                tenantId: 2,
                property: 'Downtown Loft',
                propertyId: 2,
                amount: 950,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'paid',
                method: 'bank_transfer',
                reference: 'PAY-002',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                tenant: 'Mike Wilson',
                tenantId: 3,
                property: 'Garden Apartments',
                propertyId: 3,
                amount: 800,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Past due
                status: 'pending',
                method: 'check',
                reference: 'PAY-003',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        return samplePayments;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('paymentsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.renderPaymentsTable();
            });
        }

        // Record Payment button
        const recordPaymentBtn = document.getElementById('recordPaymentBtn');
        if (recordPaymentBtn) {
            recordPaymentBtn.addEventListener('click', () => {
                this.showRecordPaymentModal();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportPaymentsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportPayments();
            });
        }

        // Add Payment button in table
        const addPaymentBtn = document.getElementById('addPaymentTableBtn');
        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => {
                this.showRecordPaymentModal();
            });
        }

        // Filter buttons (if any)
        document.querySelectorAll('[data-payment-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.paymentFilter;
                this.renderPaymentsTable();
            });
        });
    }

    renderAll() {
        this.renderStats();
        this.renderPaymentsTable();
        this.renderOutstandingPayments();
        this.renderCharts();
    }

    renderStats() {
        // Calculate stats from payments data
        const stats = this.calculatePaymentStats();
        
        // Update all stat elements
        this.updateElement('#paymentsMonthlyCollections', this.formatCurrency(stats.monthlyCollections));
        this.updateElement('#paymentsOutstanding', this.formatCurrency(stats.outstanding));
        this.updateElement('#paymentsCollectionRate', `${stats.collectionRate}%`);
        this.updateElement('#paymentsAvgProcessing', `${stats.avgProcessing} days`);
        this.updateElement('#paymentsOverdueTenants', stats.overdueTenants);
        this.updateElement('#paymentsPaidCount', stats.paidCount);
        this.updateElement('#paymentsTotalCount', stats.totalCount);
        this.updateElement('#outstandingCount', `${stats.overdueCount} overdue payments`);
        
        // Growth calculation (simplified - matches dashboard logic)
        const growth = Math.floor(Math.random() * 10) + 5;
        this.updateElement('#paymentsGrowth', growth);
    }

    calculatePaymentStats() {
        const payments = this.payments;
        
        if (payments.length === 0) {
            return {
                monthlyCollections: 0,
                outstanding: 0,
                collectionRate: 0,
                avgProcessing: 0,
                overdueTenants: 0,
                totalCount: 0,
                paidCount: 0,
                overdueCount: 0
            };
        }

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Monthly collections (completed payments this month)
        const monthlyCollections = payments
            .filter(p => {
                if (!p.date) return false;
                const paymentDate = new Date(p.date);
                return p.status === 'paid' && 
                       paymentDate.getMonth() === currentMonth &&
                       paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Outstanding payments (pending)
        const outstanding = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Collection rate
        const totalCount = payments.length;
        const paidCount = payments.filter(p => p.status === 'paid').length;
        const collectionRate = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

        // Average processing time (simplified)
        const avgProcessing = totalCount > 0 ? Math.floor(Math.random() * 3) + 1 : 0;

        // Overdue tenants (pending and past due)
        const overduePayments = payments.filter(p => {
            if (p.status !== 'pending') return false;
            const dueDate = new Date(p.dueDate || p.date);
            return dueDate < new Date();
        });
        
        const overdueCount = overduePayments.length;
        const overdueTenants = overdueCount; // One tenant per overdue payment

        return {
            monthlyCollections,
            outstanding,
            collectionRate,
            avgProcessing,
            overdueTenants,
            totalCount,
            paidCount,
            overdueCount
        };
    }

    renderPaymentsTable() {
        const tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;

        // Filter payments based on search
        let filteredPayments = this.payments;
        if (this.currentSearch) {
            filteredPayments = this.searchPayments(this.currentSearch);
        }

        // Apply filter
        if (this.currentFilter !== 'all') {
            filteredPayments = filteredPayments.filter(p => p.status === this.currentFilter);
        }

        // Get recent payments
        const recentPayments = filteredPayments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        if (recentPayments.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                        <i class="fas fa-money-bill-wave text-3xl mb-3"></i>
                        <p>${this.currentSearch ? 'No payments match your search' : 'No payments found. Record your first payment!'}</p>
                        ${!this.currentSearch ? `
                            <button onclick="window.mainApp.modules.payments.showRecordPaymentModal()" 
                                    class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Record First Payment
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = recentPayments.map(payment => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <i class="fas fa-user text-purple-600 text-sm"></i>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${this.escapeHtml(payment.tenant || `Tenant ${payment.tenantId}`)}</div>
                            <div class="text-sm text-gray-500">Tenant</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.escapeHtml(payment.property || `Property ${payment.propertyId}`)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${this.formatCurrency(payment.amount)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${new Date(payment.date).toLocaleDateString()}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        ${this.formatMethod(payment.method)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusClass(payment.status)}">
                        ${payment.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="window.mainApp.modules.payments.viewInvoice('${payment.id}')" 
                            class="text-blue-600 hover:text-blue-900">
                        View Invoice
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderOutstandingPayments() {
        const container = document.getElementById('outstandingPaymentsList');
        if (!container) return;

        const outstandingPayments = this.payments.filter(p => p.status === 'pending');
        
        if (outstandingPayments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fas fa-check-circle text-2xl mb-2"></i>
                    <p>No outstanding payments</p>
                </div>
            `;
            return;
        }

        container.innerHTML = outstandingPayments.slice(0, 5).map(payment => `
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-exclamation-triangle text-red-600"></i>
                    </div>
                    <div>
                        <p class="font-medium">${this.escapeHtml(payment.tenant || `Tenant ${payment.tenantId}`)}</p>
                        <p class="text-sm text-gray-500">${this.escapeHtml(payment.property || `Property ${payment.propertyId}`)}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-red-600">${this.formatCurrency(payment.amount)}</p>
                    <p class="text-sm text-gray-500">Due ${new Date(payment.dueDate || payment.date).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.renderCollectionsChart();
            this.renderMethodsChart();
        } else {
            // Load Chart.js dynamically
            this.loadChartJS();
        }
    }

    async loadChartJS() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => {
            this.renderCollectionsChart();
            this.renderMethodsChart();
        };
        document.head.appendChild(script);
    }

    renderCollectionsChart() {
        const ctx = document.getElementById('collectionsChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        // Get monthly data
        const monthlyData = this.calculateMonthlyCollections();
        
        ctx.chart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Monthly Collections',
                    data: monthlyData.data,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
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

    renderMethodsChart() {
        const ctx = document.getElementById('paymentMethodsChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        // Calculate method distribution
        const methodData = this.calculateMethodDistribution();
        
        ctx.chart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: methodData.labels,
                datasets: [{
                    data: methodData.data,
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
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

    calculateMonthlyCollections() {
        const payments = this.payments.filter(p => p.status === 'paid');
        const monthlyData = {};
        
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = date.toLocaleDateString('en-US', { month: 'short' });
            monthlyData[key] = 0;
        }
        
        payments.forEach(payment => {
            if (!payment.date) return;
            const date = new Date(payment.date);
            const key = date.toLocaleDateString('en-US', { month: 'short' });
            if (monthlyData[key] !== undefined) {
                monthlyData[key] += (payment.amount || 0);
            }
        });
        
        return {
            labels: Object.keys(monthlyData),
            data: Object.values(monthlyData)
        };
    }

    calculateMethodDistribution() {
        const payments = this.payments;
        const methods = {};
        
        payments.forEach(payment => {
            const method = payment.method || 'Unknown';
            methods[method] = (methods[method] || 0) + 1;
        });
        
        const sorted = Object.entries(methods)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return {
            labels: sorted.map(([method]) => this.formatMethod(method)),
            data: sorted.map(([, count]) => count)
        };
    }

    // Show Record Payment Modal
    showRecordPaymentModal() {
        const modalHTML = `
            <div class="modal-overlay" id="recordPaymentModal">
                <div class="modal-container max-w-2xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Record Payment</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="recordPaymentForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">Select Tenant</label>
                                <select id="paymentTenantSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select a tenant</option>
                                    <option value="1">John Doe - Miami Beach</option>
                                    <option value="2">Jane Smith - NYC Apt</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Select Property</label>
                                <select id="paymentPropertySelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select a property</option>
                                    <option value="1">Miami Beach</option>
                                    <option value="2">NYC Apt</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Amount *</label>
                                <input type="number" step="0.01" min="0" required 
                                       id="paymentAmount" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Payment Date</label>
                                <input type="date" required id="paymentDate" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Payment Method</label>
                                <select id="paymentMethod" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="credit_card">Credit Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="check">Check</option>
                                    <option value="cash">Cash</option>
                                    <option value="mpesa">M-Pesa</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Status</label>
                                <select id="paymentStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Reference/Notes</label>
                                <textarea id="paymentNotes" rows="3" 
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                          placeholder="Payment reference or additional notes..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelPaymentBtn" class="btn-secondary">Cancel</button>
                        <button id="savePaymentBtn" class="btn-primary">Record Payment</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners to the modal
        setTimeout(() => {
            const modal = document.getElementById('recordPaymentModal');
            if (!modal) return;
            
            // Cancel button
            modal.querySelector('#cancelPaymentBtn').addEventListener('click', () => {
                modal.remove();
            });
            
            // Save button
            modal.querySelector('#savePaymentBtn').addEventListener('click', () => {
                this.savePayment();
            });
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }, 10);
    }

    async savePayment() {
        const form = document.getElementById('recordPaymentForm');
        if (!form) return;
        
        try {
            // Get form data
            const tenantSelect = document.getElementById('paymentTenantSelect');
            const propertySelect = document.getElementById('paymentPropertySelect');
            
            const paymentData = {
                id: Date.now(),
                tenantId: tenantSelect?.value || '1',
                propertyId: propertySelect?.value || '1',
                tenant: tenantSelect?.selectedOptions[0]?.text.split(' - ')[0] || 'John Doe',
                property: propertySelect?.selectedOptions[0]?.text.split(' - ')[1] || 'Miami Beach',
                amount: parseFloat(document.getElementById('paymentAmount')?.value) || 0,
                date: document.getElementById('paymentDate')?.value || new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                method: document.getElementById('paymentMethod')?.value || 'credit_card',
                status: document.getElementById('paymentStatus')?.value || 'pending',
                reference: document.getElementById('paymentNotes')?.value || `PAY-${Date.now().toString().slice(-6)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Validate (frontend validation)
            if (!paymentData.tenantId || !paymentData.propertyId || paymentData.amount <= 0) {
                window.mainApp?.showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            // Add payment to array
            this.payments.unshift(paymentData);
            
            // Save to localStorage
            const user = window.authManager?.getCurrentUser?.() || { id: 'default' };
            const userId = user.id;
            const storageKey = `payments_${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(this.payments));
            
            // Close modal
            document.getElementById('recordPaymentModal')?.remove();
            
            // Show success message
            window.mainApp?.showNotification('Payment recorded successfully!', 'success');
            
            // Refresh display
            this.renderAll();
            
            // Also update dashboard if it's loaded
            if (window.mainApp?.modules?.dashboard) {
                await window.mainApp.modules.dashboard.refresh();
            }
            
        } catch (error) {
            console.error('Error saving payment:', error);
            window.mainApp?.showNotification(error.message || 'Failed to record payment', 'error');
        }
    }

    searchPayments(query) {
        if (!query.trim()) return this.payments;

        const searchTerm = query.toLowerCase();
        return this.payments.filter(payment => 
            (payment.tenant && payment.tenant.toLowerCase().includes(searchTerm)) ||
            (payment.property && payment.property.toLowerCase().includes(searchTerm)) ||
            (payment.reference && payment.reference.toLowerCase().includes(searchTerm)) ||
            (payment.method && payment.method.toLowerCase().includes(searchTerm))
        );
    }

    viewInvoice(paymentId) {
        // For now, show a notification
        window.mainApp?.showNotification('Invoice view would open here', 'info');
        
        // In a real implementation, this would:
        // 1. Generate or retrieve invoice PDF
        // 2. Open in new tab or download
        // 3. Or show invoice details in modal
    }

    async exportPayments() {
        try {
            const csvContent = this.exportToCSV();
            
            if (csvContent === "No payments to export") {
                window.mainApp?.showNotification('No payments to export', 'info');
                return;
            }
            
            // Create download link
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            window.mainApp?.showNotification('Payments exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting payments:', error);
            window.mainApp?.showNotification('Failed to export payments', 'error');
        }
    }

    exportToCSV() {
        if (this.payments.length === 0) {
            return "No payments to export";
        }

        const headers = ['ID', 'Tenant', 'Property', 'Amount', 'Date', 'Due Date', 'Method', 'Status', 'Reference'];
        const rows = this.payments.map(p => [
            p.id,
            p.tenant || `Tenant ${p.tenantId}`,
            p.property || `Property ${p.propertyId}`,
            `$${p.amount.toFixed(2)}`,
            new Date(p.date).toLocaleDateString(),
            new Date(p.dueDate || p.date).toLocaleDateString(),
            this.formatMethod(p.method) || 'N/A',
            p.status === 'paid' ? 'Paid' : 'Pending',
            p.reference || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
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

    getStatusClass(status) {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    formatMethod(method) {
        const methods = {
            'credit_card': 'Credit Card',
            'bank_transfer': 'Bank Transfer',
            'check': 'Check',
            'cash': 'Cash',
            'mpesa': 'M-Pesa'
        };
        return methods[method] || method || 'N/A';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    // Refresh method for external calls
    async refresh() {
        await this.loadPaymentsData();
        this.renderAll();
    }
}

export { PaymentsFrontend };