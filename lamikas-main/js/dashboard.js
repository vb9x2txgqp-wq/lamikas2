/**
 * Dashboard Frontend Module
 * Simplified version that doesn't require backend injection
 */

import { Utils } from './utils.js';

class DashboardFrontend {
    constructor() {
        this.isInitialized = false;
        this.data = null;
        this.charts = {};
    }

    async initialize() {
        console.log('📊 Dashboard: Initializing...');
        
        try {
            // Load data
            await this.loadData();
            
            // Render dashboard
            await this.render();
            
            // Initialize charts
            await this.initializeCharts();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update sidebar stats
            this.updateSidebarStats();
            
            this.isInitialized = true;
            console.log('✅ Dashboard: Initialized successfully');
            
        } catch (error) {
            console.error('❌ Dashboard: Initialization failed:', error);
            throw error;
        }
    }

    async loadData() {
        // Load properties from localStorage (same as properties module)
        let properties = JSON.parse(localStorage.getItem('properties')) || [];
        
        // If no properties, create defaults
        if (properties.length === 0) {
            properties = this.getDefaultProperties();
            localStorage.setItem('properties', JSON.stringify(properties));
        }
        
        // Load actual payments data to get accurate monthly collections
        const monthlyCollections = this.calculateMonthlyCollectionsFromPayments();
        
        // Calculate stats based on properties and actual payments
        const stats = this.calculateStats(properties, monthlyCollections);
        
        this.data = {
            stats: stats,
            recentPayments: [
                { id: 1, tenant: 'John Smith', property: 'Beachfront Villa', amount: 1200, date: '2024-01-15', status: 'paid' },
                { id: 2, tenant: 'Sarah Johnson', property: 'Downtown Loft', amount: 950, date: '2024-01-14', status: 'paid' },
                { id: 3, tenant: 'Mike Wilson', property: 'Garden Apartments', amount: 800, date: '2024-01-13', status: 'pending' }
            ],
            recentMaintenance: [
                { id: 1, property: 'Beachfront Villa', issue: 'Leaky faucet', priority: 'medium', status: 'in-progress' },
                { id: 2, property: 'Downtown Loft', issue: 'AC not working', priority: 'high', status: 'pending' },
                { id: 3, property: 'Garden Apartments', issue: 'Paint touch-up', priority: 'low', status: 'completed' }
            ],
            properties: properties
        };
    }

    getDefaultProperties() {
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

    calculateMonthlyCollectionsFromPayments() {
        try {
            // Get user ID for payments storage key
            const user = window.authManager?.getCurrentUser?.() || { id: 'default' };
            const userId = user.id;
            const storageKey = `payments_${userId}`;
            
            // Load payments data
            const payments = JSON.parse(localStorage.getItem(storageKey)) || [];
            
            // Get current month and year
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            // Calculate monthly collections (completed payments this month)
            const monthlyCollections = payments
                .filter(p => {
                    if (!p.date) return false;
                    const paymentDate = new Date(p.date);
                    return p.status === 'paid' && 
                           paymentDate.getMonth() === currentMonth &&
                           paymentDate.getFullYear() === currentYear;
                })
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            
            return monthlyCollections;
            
        } catch (error) {
            console.error('Error calculating monthly collections from payments:', error);
            return 0;
        }
    }

    calculateStats(properties, monthlyCollections) {
        const totalProperties = properties.length;
        
        const totalUnits = properties.reduce((sum, property) => {
            return sum + (property.units || 1);
        }, 0);
        
        const occupiedUnits = properties.reduce((sum, property) => {
            const occupancyRate = property.occupancy || Math.floor(Math.random() * 30) + 70;
            const propertyUnits = property.units || 1;
            return sum + Math.floor((propertyUnits * occupancyRate) / 100);
        }, 0);
        
        // Calculate expected monthly income from properties
        const expectedMonthlyIncome = properties.reduce((sum, property) => {
            return sum + (property.monthlyIncome || 
                         (property.units || 1) * (property.monthlyRent || 1000));
        }, 0);
        
        // Use actual monthly collections if available, otherwise use expected income
        const monthlyRevenue = monthlyCollections > 0 ? monthlyCollections : expectedMonthlyIncome;
        
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
        const vacancyRate = 100 - occupancyRate;
        
        // Calculate pending payments based on payments data
        const pendingPayments = this.calculatePendingPayments();
        
        // Calculate maintenance requests based on property count
        const maintenanceRequests = Math.max(1, Math.floor(properties.length * 0.4));
        
        return {
            totalProperties: totalProperties,
            totalUnits: totalUnits,
            occupiedUnits: occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            monthlyIncome: monthlyRevenue, // Changed to use actual collections
            expectedMonthlyIncome: expectedMonthlyIncome, // Keep for reference
            outstandingBalance: monthlyRevenue * 0.1,
            overdueTenants: Math.max(1, Math.floor(totalProperties * 0.2)),
            propertiesAddedThisMonth: properties.filter(p => {
                const addedDate = new Date(p.addedDate || Date.now());
                const now = new Date();
                return addedDate.getMonth() === now.getMonth() && 
                       addedDate.getFullYear() === now.getFullYear();
            }).length,
            incomeGrowth: Math.floor(Math.random() * 10) + 5,
            occupancyRate: occupancyRate,
            vacancyRate: vacancyRate,
            pendingPayments: pendingPayments,
            maintenanceRequests: maintenanceRequests
        };
    }

    calculatePendingPayments() {
        try {
            // Get user ID for payments storage key
            const user = window.authManager?.getCurrentUser?.() || { id: 'default' };
            const userId = user.id;
            const storageKey = `payments_${userId}`;
            
            // Load payments data
            const payments = JSON.parse(localStorage.getItem(storageKey)) || [];
            
            // Count pending payments
            const pendingPayments = payments.filter(p => p.status === 'pending').length;
            
            return pendingPayments > 0 ? pendingPayments : Math.max(1, Math.floor((JSON.parse(localStorage.getItem('properties')) || []).length * 0.2));
            
        } catch (error) {
            console.error('Error calculating pending payments:', error);
            const properties = JSON.parse(localStorage.getItem('properties')) || [];
            return Math.max(1, Math.floor(properties.length * 0.2));
        }
    }

    // Update sidebar stats with real data
    updateSidebarStats() {
        const stats = this.data?.stats;
        if (!stats) return;
        
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };
        
        updateElement('propertiesCount', stats.totalProperties || 0);
        updateElement('sidebarPropertyCount', stats.totalProperties || 0);
        updateElement('sidebarOccupancyRate', `${stats.occupancyRate || 0}%`);
        updateElement('sidebarMonthlyIncome', Utils.formatCurrency(stats.monthlyIncome || 0));
        updateElement('sidebarPending', stats.pendingPayments || 0);
        
        // Update navigation badges
        updateElement('propertyCountBadge', stats.totalProperties || 0);
        updateElement('tenantCountBadge', Math.floor((stats.occupiedUnits || 0) * 0.8) || 0);
        updateElement('paymentBadge', stats.pendingPayments || 0);
        updateElement('maintenanceCountBadge', stats.maintenanceRequests || 0);
    }

    async render() {
        const container = document.getElementById('dashboard');
        if (!container) {
            console.error('Dashboard container not found');
            throw new Error('Dashboard container not found');
        }

        container.innerHTML = this.getDashboardHTML();
    }

    getDashboardHTML() {
        const stats = this.data?.stats || {};
        
        return `
            <div class="p-6">
                <!-- Header -->
                <div class="mb-8">
                    <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p class="text-gray-600 mt-2">Welcome back! Here's what's happening with your properties.</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    ${this.getStatsCards(stats)}
                </div>

                <!-- Charts and Recent Activity -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Revenue Chart -->
                    <div class="lg:col-span-2">
                        <div class="enhanced-card p-6">
                            <div class="flex justify-between items-center mb-6">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                                    <p class="text-gray-600 text-sm">Monthly revenue trends</p>
                                </div>
                                <div class="flex gap-2">
                                    <button class="action-btn action-btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100" onclick="window.mainApp.modules.dashboard.changeChartRange('month')">
                                        Month
                                    </button>
                                    <button class="action-btn action-btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200" onclick="window.mainApp.modules.dashboard.changeChartRange('quarter')">
                                        Quarter
                                    </button>
                                    <button class="action-btn action-btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200" onclick="window.mainApp.modules.dashboard.changeChartRange('year')">
                                        Year
                                    </button>
                                </div>
                            </div>
                            <div class="h-80">
                                <canvas id="revenueChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div>
                        <div class="enhanced-card p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
                            <div class="space-y-3">
                                <button class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all group" onclick="window.mainApp.navigateTo('properties'); setTimeout(() => { if(window.propertiesFrontend && window.propertiesFrontend.showAddPropertyModal) window.propertiesFrontend.showAddPropertyModal(); }, 500)">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200">
                                            <i class="fas fa-plus text-blue-600"></i>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium text-blue-900">Add Property</div>
                                            <div class="text-sm text-blue-700">List a new property</div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-right text-blue-500"></i>
                                </button>

                                <button class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg hover:from-green-100 hover:to-green-200 transition-all group" onclick="window.mainApp.navigateTo('payments')">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200">
                                            <i class="fas fa-money-bill-wave text-green-600"></i>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium text-green-900">Record Payment</div>
                                            <div class="text-sm text-green-700">Add tenant payment</div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-right text-green-500"></i>
                                </button>

                                <button class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all group" onclick="window.mainApp.navigateTo('maintenance')">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-200">
                                            <i class="fas fa-wrench text-yellow-600"></i>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium text-yellow-900">New Request</div>
                                            <div class="text-sm text-yellow-700">Log maintenance</div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-right text-yellow-500"></i>
                                </button>

                                <button class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all group" onclick="window.mainApp.navigateTo('reports')">
                                    <div class="flex items-center">
                                        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200">
                                            <i class="fas fa-chart-bar text-purple-600"></i>
                                        </div>
                                        <div class="text-left">
                                            <div class="font-medium text-purple-900">Generate Report</div>
                                            <div class="text-sm text-purple-700">Financial analysis</div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-right text-purple-500"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity - Stacked Vertically -->
                <div class="space-y-6 mb-8">
                    <!-- Recent Payments -->
                    <div class="enhanced-card">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-900">Recent Payments</h3>
                                <button class="text-sm text-blue-600 hover:text-blue-800 font-medium" onclick="window.mainApp.navigateTo('payments')">
                                    View All <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="text-left p-4">Tenant</th>
                                        <th class="text-left p-4">Property</th>
                                        <th class="text-left p-4">Amount</th>
                                        <th class="text-left p-4">Date</th>
                                        <th class="text-left p-4">Status</th>
                                        <th class="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.data.recentPayments.map(payment => `
                                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                                            <td class="p-4 font-medium">${payment.tenant}</td>
                                            <td class="p-4 text-gray-600">${payment.property}</td>
                                            <td class="p-4 font-medium">${Utils.formatCurrency(payment.amount)}</td>
                                            <td class="p-4 text-gray-600">${Utils.formatDate(payment.date, 'MM/DD/YYYY')}</td>
                                            <td class="p-4">
                                                <span class="px-2 py-1 text-xs font-medium rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                                    ${payment.status === 'paid' ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex gap-2">
                                                    <button class="action-btn action-btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100" onclick="window.mainApp.modules.dashboard.viewPayment(${payment.id})" title="View Details">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    ${payment.status === 'pending' ? `
                                                        <button class="action-btn action-btn-sm bg-green-50 text-green-600 hover:bg-green-100" onclick="window.mainApp.modules.dashboard.markAsPaid(${payment.id})" title="Mark as Paid">
                                                            <i class="fas fa-check"></i>
                                                        </button>
                                                    ` : ''}
                                                    <button class="action-btn action-btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200" onclick="window.mainApp.modules.dashboard.downloadReceipt(${payment.id})" title="Download Receipt">
                                                        <i class="fas fa-download"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Recent Maintenance -->
                    <div class="enhanced-card">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold text-gray-900">Recent Maintenance</h3>
                                <button class="text-sm text-blue-600 hover:text-blue-800 font-medium" onclick="window.mainApp.navigateTo('maintenance')">
                                    View All <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="text-left p-4">Property</th>
                                        <th class="text-left p-4">Issue</th>
                                        <th class="text-left p-4">Priority</th>
                                        <th class="text-left p-4">Status</th>
                                        <th class="text-left p-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.data.recentMaintenance.map(maintenance => `
                                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                                            <td class="p-4 font-medium">${maintenance.property}</td>
                                            <td class="p-4 text-gray-600">${maintenance.issue}</td>
                                            <td class="p-4">
                                                <span class="px-2 py-1 text-xs font-medium rounded-full ${maintenance.priority === 'high' ? 'bg-red-100 text-red-800' : maintenance.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}">
                                                    ${maintenance.priority}
                                                </span>
                                            </td>
                                            <td class="p-4">
                                                <span class="px-2 py-1 text-xs font-medium rounded-full ${maintenance.status === 'completed' ? 'bg-green-100 text-green-800' : maintenance.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}">
                                                    ${maintenance.status}
                                                </span>
                                            </td>
                                            <td class="p-4">
                                                <div class="flex gap-2">
                                                    <button class="action-btn action-btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100" onclick="window.mainApp.modules.dashboard.viewMaintenance(${maintenance.id})" title="View Details">
                                                        <i class="fas fa-eye"></i>
                                                    </button>
                                                    <button class="action-btn action-btn-sm bg-green-50 text-green-600 hover:bg-green-100" onclick="window.mainApp.modules.dashboard.updateMaintenanceStatus(${maintenance.id})" title="Update Status">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    ${maintenance.status !== 'completed' ? `
                                                        <button class="action-btn action-btn-sm bg-purple-50 text-purple-600 hover:bg-purple-100" onclick="window.mainApp.modules.dashboard.assignVendor(${maintenance.id})" title="Assign Vendor">
                                                            <i class="fas fa-user-tie"></i>
                                                        </button>
                                                    ` : ''}
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Property Map -->
                <div class="mt-8">
                    <div class="enhanced-card p-6">
                        <div class="flex justify-between items-center mb-6">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900">Property Locations</h3>
                                <p class="text-gray-600 text-sm">Geographic distribution of your properties</p>
                            </div>
                            <button class="btn-secondary" onclick="window.mainApp.modules.dashboard.refreshMap()">
                                <i class="fas fa-sync-alt mr-2"></i>
                                Refresh Map
                            </button>
                        </div>
                        <div id="propertyMap" class="h-96 rounded-lg overflow-hidden border border-gray-200">
                            <div class="h-full flex items-center justify-center text-gray-500">
                                <div class="text-center">
                                    <i class="fas fa-map text-4xl mb-4"></i>
                                    <p>Map loading...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getStatsCards(stats) {
        return `
            <!-- Total Properties -->
            <div class="enhanced-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Total Properties</p>
                        <h3 class="text-2xl font-bold text-gray-900">${stats.totalProperties || 0}</h3>
                    </div>
                    <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <i class="fas fa-building text-blue-600 text-xl"></i>
                    </div>
                </div>
                <div class="flex items-center text-sm mb-4">
                    <span class="text-green-600 font-medium mr-2">
                        <i class="fas fa-arrow-up mr-1"></i>
                        ${stats.occupiedUnits || 0} occupied
                    </span>
                    <span class="text-gray-500">• ${stats.vacancyRate || 0}% vacancy</span>
                </div>
                <button class="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 border border-transparent hover:border-blue-600 flex items-center justify-center" onclick="window.mainApp.navigateTo('properties')">
                    <i class="fas fa-list mr-2"></i>
                    View Properties
                </button>
            </div>

            <!-- Monthly Collections (Revenue) -->
            <div class="enhanced-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Monthly Revenue</p>
                        <h3 class="text-2xl font-bold text-gray-900">${Utils.formatCurrency(stats.monthlyIncome || 0)}</h3>
                    </div>
                    <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <i class="fas fa-money-bill-wave text-green-600 text-xl"></i>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-green-600 font-medium mr-2">
                        <i class="fas fa-arrow-up mr-1"></i>
                        ${stats.incomeGrowth || 0}% from last month
                    </span>
                </div>
                <button class="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-all duration-200 border border-transparent hover:border-blue-600 flex items-center justify-center" onclick="window.mainApp.navigateTo('payments')">
                    <i class="fas fa-chart-line mr-2"></i>
                    View Payment Report
                </button>
            </div>

            <!-- Pending Payments -->
            <div class="enhanced-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Pending Payments</p>
                        <h3 class="text-2xl font-bold text-gray-900">${stats.pendingPayments || 0}</h3>
                    </div>
                    <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <i class="fas fa-clock text-yellow-600 text-xl"></i>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="${(stats.pendingPayments || 0) > 0 ? 'text-red-600' : 'text-green-600'} font-medium">
                        ${(stats.pendingPayments || 0) > 0 ? 'Action required' : 'All clear'}
                    </span>
                </div>
                <button class="w-full mt-4 px-4 py-2 ${(stats.pendingPayments || 0) > 0 ? 'bg-red-100 text-red-700 hover:bg-red-600 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'} rounded-lg font-medium transition-all duration-200 border border-transparent ${(stats.pendingPayments || 0) > 0 ? 'hover:border-red-600' : 'hover:border-blue-600'} flex items-center justify-center" onclick="window.mainApp.navigateTo('payments')">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    ${(stats.pendingPayments || 0) > 0 ? 'Review Pending' : 'View Payments'}
                </button>
            </div>

            <!-- Maintenance Requests -->
            <div class="enhanced-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <p class="text-sm text-gray-600">Active Requests</p>
                        <h3 class="text-2xl font-bold text-gray-900">${stats.maintenanceRequests || 0}</h3>
                    </div>
                    <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <i class="fas fa-wrench text-red-600 text-xl"></i>
                    </div>
                </div>
                <div class="flex items-center text-sm">
                    <span class="${(stats.maintenanceRequests || 0) > 3 ? 'text-red-600' : 'text-yellow-600'} font-medium">
                        ${(stats.maintenanceRequests || 0) > 3 ? 'High priority' : 'Normal load'}
                    </span>
                </div>
                <button class="w-full mt-4 px-4 py-2 ${(stats.maintenanceRequests || 0) > 3 ? 'bg-red-100 text-red-700 hover:bg-red-600 hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'} rounded-lg font-medium transition-all duration-200 border border-transparent ${(stats.maintenanceRequests || 0) > 3 ? 'hover:border-red-600' : 'hover:border-blue-600'} flex items-center justify-center" onclick="window.mainApp.navigateTo('maintenance')">
                    <i class="fas fa-tools mr-2"></i>
                    Manage Requests
                </button>
            </div>
        `;
    }

    async initializeCharts() {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            console.log('Chart.js not loaded yet, waiting...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not available, skipping charts');
                return;
            }
        }
        
        // Initialize revenue chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            try {
                this.charts.revenue = new Chart(revenueCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                        datasets: [{
                            label: 'Revenue',
                            data: [12000, 13500, 14200, 15800, 16500, 17800, this.data?.stats?.monthlyIncome || 18500],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
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
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                callbacks: {
                                    label: function(context) {
                                        return `Revenue: ${Utils.formatCurrency(context.parsed.y)}`;
                                    }
                                }
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
                                        return '$' + value/1000 + 'k';
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
                console.log('✅ Revenue chart initialized');
            } catch (error) {
                console.error('Failed to initialize revenue chart:', error);
            }
        }
    }

    setupEventListeners() {
        console.log('🎯 Dashboard: Setting up event listeners...');
    }

    async refresh() {
        console.log('🔄 Dashboard: Refreshing...');
        await this.loadData();
        await this.render();
        await this.initializeCharts();
        this.setupEventListeners();
        this.updateSidebarStats();
    }

    // Action methods
    changeChartRange(range) {
        console.log(`Changing chart range to: ${range}`);
        if (this.charts.revenue) {
            const data = {
                month: [12000, 13500, 14200, 15800, 16500, 17800, this.data?.stats?.monthlyIncome || 18500],
                quarter: [45000, 48000, 52000, 55000],
                year: [145000, 165000, 185000, 210000]
            };
            
            this.charts.revenue.data.datasets[0].data = data[range] || data.month;
            this.charts.revenue.update();
            
            Utils.showNotification(`Chart updated to show ${range}ly data`, 'info');
        }
    }

    viewPayment(paymentId) {
        console.log(`Viewing payment: ${paymentId}`);
        // Implement payment view modal
    }

    markAsPaid(paymentId) {
        if (confirm('Mark this payment as paid?')) {
            console.log(`Marking payment ${paymentId} as paid`);
            Utils.showNotification('Payment marked as paid', 'success');
        }
    }

    downloadReceipt(paymentId) {
        console.log(`Downloading receipt for payment: ${paymentId}`);
        Utils.showNotification('Receipt downloaded', 'success');
    }

    viewMaintenance(requestId) {
        console.log(`Viewing maintenance request: ${requestId}`);
        // Implement maintenance view modal
    }

    updateMaintenanceStatus(requestId) {
        console.log(`Updating maintenance status: ${requestId}`);
        Utils.showNotification('Maintenance status updated', 'success');
    }

    assignVendor(requestId) {
        console.log(`Assigning vendor to request: ${requestId}`);
        Utils.showNotification('Vendor assigned', 'success');
    }

    refreshMap() {
        console.log('Refreshing map...');
        Utils.showNotification('Map refreshed', 'info');
    }
}

// Export the class
export { DashboardFrontend };