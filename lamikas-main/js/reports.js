/**
 * Reports Frontend - UI Rendering and Event Handling
 * Contains all UI-related code for reports
 */

import { ReportsBackend } from '../functions/reports.js';

class ReportsFrontend {
    constructor() {
        this.backend = new ReportsBackend();
        this.isInitialized = false;
        this.reports = [];
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Inject HTML template
            this.injectTemplate();
            
            // Load reports data
            await this.loadReportsData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render data
            this.renderAll();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Error initializing reports page:', error);
            window.mainApp?.showNotification('Failed to load reports page', 'error');
        }
    }

    // Inject HTML template (exact copy from original)
    injectTemplate() {
        const container = document.getElementById('reports');
        if (!container) return;

        container.innerHTML = `
<main class="p-4 lg:p-6 fade-in">
  <!-- Top Bar -->
  <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
    <div>
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
      <p class="text-gray-600">Generate and view detailed reports</p>
    </div>
    <div class="flex items-center space-x-4 w-full lg:w-auto">
      <button id="exportAllBtn" class="btn-primary px-4 py-2 text-white rounded-lg font-medium flex items-center space-x-2">
        <i class="fas fa-download"></i>
        <span>Export All</span>
      </button>
      <button id="printReportsBtn" class="px-4 py-2 border border-gray-300 rounded-lg font-medium flex items-center space-x-2 hover:bg-gray-50">
        <i class="fas fa-print"></i>
        <span>Print</span>
      </button>
    </div>
  </div>

  <!-- Report Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Financial Report</p>
          <h3 class="text-xl font-bold mt-2">Annual Summary</h3>
          <p class="text-gray-600 text-sm mt-1">Income, expenses, and profits</p>
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-chart-line text-green-600 text-xl"></i>
        </div>
      </div>
      <button id="generateFinancialReport" class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
        Generate Report
      </button>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Occupancy Report</p>
          <h3 class="text-xl font-bold mt-2">Quarterly Analysis</h3>
          <p class="text-gray-600 text-sm mt-1">Vacancy rates and trends</p>
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-home text-blue-600 text-xl"></i>
        </div>
      </div>
      <button id="generateOccupancyReport" class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
        Generate Report
      </button>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Maintenance Report</p>
          <h3 class="text-xl font-bold mt-2">Monthly Summary</h3>
          <p class="text-gray-600 text-sm mt-1">Requests, costs, and resolution</p>
        </div>
        <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-tools text-yellow-600 text-xl"></i>
        </div>
      </div>
      <button id="generateMaintenanceReport" class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
        Generate Report
      </button>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Tenant Report</p>
          <h3 class="text-xl font-bold mt-2">Tenant Statistics</h3>
          <p class="text-gray-600 text-sm mt-1">Demographics and retention</p>
        </div>
        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-users text-purple-600 text-xl"></i>
        </div>
      </div>
      <button id="generateTenantReport" class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
        Generate Report
      </button>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Tax Report</p>
          <h3 class="text-xl font-bold mt-2">Annual Tax Summary</h3>
          <p class="text-gray-600 text-sm mt-1">Property taxes and deductions</p>
        </div>
        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-file-invoice-dollar text-red-600 text-xl"></i>
        </div>
      </div>
      <button id="generateTaxReport" class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
        Generate Report
      </button>
    </div>

    <div class="stat-card bg-white p-6 rounded-xl">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-gray-500 text-sm">Custom Report</p>
          <h3 class="text-xl font-bold mt-2">Custom Analysis</h3>
          <p class="text-gray-600 text-sm mt-1">Create your own report</p>
        </div>
        <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <i class="fas fa-chart-bar text-gray-600 text-xl"></i>
        </div>
      </div>
      <button id="createCustomReport" class="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
        Create Report
      </button>
    </div>
  </div>

  <!-- Recent Reports -->
  <div class="bg-white rounded-xl shadow mb-8">
    <div class="p-6 border-b">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Recently Generated Reports</h3>
        <button id="viewAllReportsBtn" class="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium">
          View All
        </button>
      </div>
    </div>
    <div class="p-6">
      <div class="space-y-4" id="recentReportsList">
        <!-- Recent reports will be loaded here -->
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-file-alt text-2xl mb-2"></i>
          <p>No reports generated yet</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Annual Performance</h3>
      <div class="h-64 flex items-center justify-center">
        <div id="annualPerformanceChart" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
    <div class="chart-container p-6 bg-white rounded-xl shadow">
      <h3 class="text-lg font-semibold mb-6">Expense Breakdown</h3>
      <div class="h-64 flex items-center justify-center">
        <div id="expenseBreakdownChart" style="width: 100%; height: 100%;"></div>
      </div>
    </div>
  </div>
</main>
        `;
    }

    async loadReportsData() {
        this.reports = this.backend.getAllReports();
    }

    setupEventListeners() {
        // Generate Report buttons
        document.querySelectorAll('[id^="generate"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const reportType = e.target.id.replace('generate', '').replace('Report', '').toLowerCase();
                this.generateReport(reportType);
            });
        });

        // Create Custom Report button
        const customReportBtn = document.getElementById('createCustomReport');
        if (customReportBtn) {
            customReportBtn.addEventListener('click', () => {
                this.showCustomReportModal();
            });
        }

        // Export All button
        const exportAllBtn = document.getElementById('exportAllBtn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => {
                this.exportAllReports();
            });
        }

        // Print Reports button
        const printReportsBtn = document.getElementById('printReportsBtn');
        if (printReportsBtn) {
            printReportsBtn.addEventListener('click', () => {
                this.printReports();
            });
        }

        // View All Reports button
        const viewAllBtn = document.getElementById('viewAllReportsBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.showAllReportsModal();
            });
        }
    }

    renderAll() {
        this.renderRecentReports();
        this.renderCharts();
    }

    renderRecentReports() {
        const container = document.getElementById('recentReportsList');
        if (!container) return;

        const recentReports = this.backend.getRecentReports(5);
        
        if (recentReports.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-file-alt text-2xl mb-2"></i>
                    <p>No reports generated yet</p>
                    <button onclick="window.mainApp.modules.reports.generateReport('financial')" 
                            class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Generate Your First Report
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = recentReports.map(report => `
            <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div class="flex items-center">
                    <div class="w-10 h-10 ${this.getReportIconClass(report.type)} rounded-lg flex items-center justify-center mr-3">
                        <i class="fas ${this.getReportIcon(report.type)} text-white"></i>
                    </div>
                    <div>
                        <div class="font-medium">${this.escapeHtml(report.title)}</div>
                        <div class="text-sm text-gray-500">
                            ${this.formatReportType(report.type)} • ${new Date(report.generatedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="window.mainApp.modules.reports.downloadReport(${report.id})" 
                            class="text-blue-600 hover:text-blue-800 p-2">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="window.mainApp.modules.reports.printSingleReport(${report.id})" 
                            class="text-gray-600 hover:text-gray-800 p-2">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="window.mainApp.modules.reports.deleteReport(${report.id})" 
                            class="text-red-600 hover:text-red-800 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        // Initialize charts if Chart.js is available
        if (typeof Chart !== 'undefined') {
            this.renderAnnualPerformanceChart();
            this.renderExpenseBreakdownChart();
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
            this.renderAnnualPerformanceChart();
            this.renderExpenseBreakdownChart();
        };
        document.head.appendChild(script);
    }

    renderAnnualPerformanceChart() {
        const ctx = document.getElementById('annualPerformanceChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        // Generate annual performance data
        const performanceData = this.generateAnnualPerformanceData();
        
        ctx.chart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: performanceData.labels,
                datasets: [
                    {
                        label: 'Income',
                        data: performanceData.income,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Expenses',
                        data: performanceData.expenses,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Profit',
                        data: performanceData.profit,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
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

    renderExpenseBreakdownChart() {
        const ctx = document.getElementById('expenseBreakdownChart');
        if (!ctx) return;

        // Destroy existing chart
        if (ctx.chart) {
            ctx.chart.destroy();
        }

        // Get expense breakdown data
        const expenseData = this.backend.calculateExpenseBreakdown();
        
        const labels = Object.keys(expenseData).map(key => 
            key.charAt(0).toUpperCase() + key.slice(1)
        );
        const data = Object.values(expenseData);
        
        ctx.chart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#ef4444', // red
                        '#f59e0b', // amber
                        '#10b981', // emerald
                        '#3b82f6', // blue
                        '#8b5cf6'  // violet
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

    generateAnnualPerformanceData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate realistic-looking data
        const income = months.map((_, i) => {
            const base = 10000;
            const seasonal = Math.sin(i / 3) * 2000;
            const random = (Math.random() - 0.5) * 1000;
            return Math.round(base + seasonal + random);
        });
        
        const expenses = months.map((_, i) => {
            const base = 6000;
            const seasonal = Math.cos(i / 4) * 1000;
            const random = (Math.random() - 0.5) * 500;
            return Math.round(base + seasonal + random);
        });
        
        const profit = months.map((_, i) => income[i] - expenses[i]);
        
        return {
            labels: months,
            income,
            expenses,
            profit
        };
    }

    // Generate Report
    async generateReport(type) {
        try {
            let report;
            
            switch (type) {
                case 'financial':
                    report = this.backend.generateFinancialReport({
                        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0]
                    });
                    break;
                    
                case 'occupancy':
                    report = this.backend.generateOccupancyReport({
                        timeframe: 'quarterly'
                    });
                    break;
                    
                case 'maintenance':
                    report = this.backend.generateMaintenanceReport({
                        startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
                        endDate: new Date().toISOString().split('T')[0]
                    });
                    break;
                    
                case 'tenant':
                    report = this.backend.generateTenantReport({
                        includeDemographics: true,
                        includeHistory: true
                    });
                    break;
                    
                case 'tax':
                    report = this.backend.generateTaxReport({
                        year: new Date().getFullYear(),
                        includeDeductions: true
                    });
                    break;
                    
                default:
                    throw new Error('Unknown report type');
            }
            
            // Update local data
            this.reports = this.backend.getAllReports();
            
            // Show success message
            window.mainApp?.showNotification(`${this.formatReportType(type)} generated successfully!`, 'success');
            
            // Ask if user wants to download
            setTimeout(() => {
                if (confirm('Report generated successfully! Would you like to download it now?')) {
                    this.downloadReport(report.id);
                }
            }, 500);
            
            // Refresh display
            this.renderAll();
            
        } catch (error) {
            console.error('Error generating report:', error);
            window.mainApp?.showNotification(`Failed to generate ${type} report`, 'error');
        }
    }

    // Show Custom Report Modal
    showCustomReportModal() {
        const modalHTML = `
            <div class="modal-overlay" id="customReportModal">
                <div class="modal-container max-w-2xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">Create Custom Report</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="customReportForm" class="space-y-6">
                            <div>
                                <label class="block text-sm font-medium mb-2">Report Title *</label>
                                <input type="text" id="customReportTitle" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                       placeholder="My Custom Report">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-3">Include Data Types *</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" name="dataTypes" value="financial" class="mr-3">
                                        <div>
                                            <div class="font-medium">Financial</div>
                                            <div class="text-sm text-gray-500">Income, expenses, profit</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" name="dataTypes" value="occupancy" class="mr-3">
                                        <div>
                                            <div class="font-medium">Occupancy</div>
                                            <div class="text-sm text-gray-500">Vacancy rates, trends</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" name="dataTypes" value="maintenance" class="mr-3">
                                        <div>
                                            <div class="font-medium">Maintenance</div>
                                            <div class="text-sm text-gray-500">Requests, costs, resolution</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" name="dataTypes" value="tenant" class="mr-3">
                                        <div>
                                            <div class="font-medium">Tenant</div>
                                            <div class="text-sm text-gray-500">Demographics, retention</div>
                                        </div>
                                    </label>
                                    <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input type="checkbox" name="dataTypes" value="payment" class="mr-3">
                                        <div>
                                            <div class="font-medium">Payments</div>
                                            <div class="text-sm text-gray-500">Collections, outstanding</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Date Range</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">Start Date</label>
                                        <input type="date" id="startDate" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                               value="${new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]}">
                                    </div>
                                    <div>
                                        <label class="block text-xs text-gray-500 mb-1">End Date</label>
                                        <input type="date" id="endDate" 
                                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                               value="${new Date().toISOString().split('T')[0]}">
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Output Format *</label>
                                <div class="flex space-x-4">
                                    <label class="flex items-center">
                                        <input type="radio" name="format" value="pdf" checked class="mr-2">
                                        <span>PDF</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="format" value="excel" class="mr-2">
                                        <span>Excel</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="format" value="csv" class="mr-2">
                                        <span>CSV</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="format" value="json" class="mr-2">
                                        <span>JSON</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                                <textarea id="customReportNotes" rows="3"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                          placeholder="Any specific requirements or notes..."></textarea>
                            </div>
                        </form>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="cancelCustomReportBtn" class="btn-secondary">Cancel</button>
                        <button id="generateCustomReportBtn" class="btn-primary">Generate Custom Report</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add event listeners to the modal
        setTimeout(() => {
            const modal = document.getElementById('customReportModal');
            if (!modal) return;
            
            // Cancel button
            modal.querySelector('#cancelCustomReportBtn').addEventListener('click', () => {
                modal.remove();
            });
            
            // Generate button
            modal.querySelector('#generateCustomReportBtn').addEventListener('click', () => {
                this.generateCustomReport();
            });
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }, 10);
    }

    async generateCustomReport() {
        const form = document.getElementById('customReportForm');
        if (!form) return;
        
        try {
            // Get selected data types
            const dataTypeCheckboxes = form.querySelectorAll('input[name="dataTypes"]:checked');
            if (dataTypeCheckboxes.length === 0) {
                window.mainApp?.showNotification('Please select at least one data type', 'error');
                return;
            }
            
            const dataTypes = Array.from(dataTypeCheckboxes).map(cb => cb.value);
            
            // Get other form data
            const config = {
                title: document.getElementById('customReportTitle')?.value || 'Custom Report',
                dataTypes: dataTypes,
                startDate: document.getElementById('startDate')?.value,
                endDate: document.getElementById('endDate')?.value,
                format: form.querySelector('input[name="format"]:checked')?.value || 'pdf',
                notes: document.getElementById('customReportNotes')?.value || ''
            };
            
            // Generate custom report
            const report = this.backend.generateCustomReport(config);
            
            // Update local data
            this.reports = this.backend.getAllReports();
            
            // Close modal
            document.getElementById('customReportModal')?.remove();
            
            // Show success message
            window.mainApp?.showNotification('Custom report generated successfully!', 'success');
            
            // Ask if user wants to download
            setTimeout(() => {
                if (confirm('Custom report generated! Would you like to download it now?')) {
                    this.downloadReport(report.id);
                }
            }, 500);
            
            // Refresh display
            this.renderAll();
            
        } catch (error) {
            console.error('Error generating custom report:', error);
            window.mainApp?.showNotification(error.message || 'Failed to generate custom report', 'error');
        }
    }

    async downloadReport(reportId) {
        try {
            const report = this.backend.getReportById(reportId);
            if (!report) {
                throw new Error('Report not found');
            }
            
            const exportData = this.backend.exportReport(report, report.format || 'pdf');
            
            // Create download link
            const blob = new Blob([exportData.content], { type: exportData.mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = exportData.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            window.mainApp?.showNotification('Report downloaded successfully!', 'success');
            
        } catch (error) {
            console.error('Error downloading report:', error);
            window.mainApp?.showNotification('Failed to download report', 'error');
        }
    }

    async exportAllReports() {
        try {
            const exportData = this.backend.exportAllReports();
            
            // Create download link
            const blob = new Blob([exportData.content], { type: 'application/zip' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = exportData.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            window.mainApp?.showNotification('All reports exported successfully!', 'success');
            
        } catch (error) {
            console.error('Error exporting all reports:', error);
            window.mainApp?.showNotification(error.message || 'Failed to export reports', 'error');
        }
    }

    async printReports() {
        try {
            // For now, print the current page
            window.print();
            window.mainApp?.showNotification('Print dialog opened', 'info');
            
        } catch (error) {
            console.error('Error printing reports:', error);
            window.mainApp?.showNotification('Failed to print', 'error');
        }
    }

    async printSingleReport(reportId) {
        try {
            const report = this.backend.getReportById(reportId);
            if (!report) {
                throw new Error('Report not found');
            }
            
            // In a real app, this would open a print dialog with the report content
            this.backend.printReport(report);
            window.mainApp?.showNotification(`Printing ${report.title}...`, 'info');
            
        } catch (error) {
            console.error('Error printing report:', error);
            window.mainApp?.showNotification('Failed to print report', 'error');
        }
    }

    async deleteReport(reportId) {
        if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.backend.deleteReport(reportId);
            
            // Update local data
            this.reports = this.backend.getAllReports();
            
            // Refresh display
            this.renderAll();
            
            window.mainApp?.showNotification('Report deleted successfully', 'success');
            
        } catch (error) {
            console.error('Error deleting report:', error);
            window.mainApp?.showNotification('Failed to delete report', 'error');
        }
    }

    showAllReportsModal() {
        const modalHTML = `
            <div class="modal-overlay" id="allReportsModal">
                <div class="modal-container max-w-4xl">
                    <div class="modal-header">
                        <h2 class="text-2xl font-bold">All Generated Reports</h2>
                        <button class="modal-close-btn" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-gray-50">
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Report</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Generated</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Format</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="allReportsTableBody" class="divide-y divide-gray-200">
                                    <!-- Reports will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <button id="closeAllReportsBtn" class="btn-secondary">Close</button>
                        <button id="clearAllReportsBtn" class="btn-primary bg-red-600 hover:bg-red-700">Clear All Reports</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Render reports in the table
        setTimeout(() => {
            this.renderAllReportsTable();
            
            const modal = document.getElementById('allReportsModal');
            if (!modal) return;
            
            // Close button
            modal.querySelector('#closeAllReportsBtn').addEventListener('click', () => {
                modal.remove();
            });
            
            // Clear All button
            modal.querySelector('#clearAllReportsBtn').addEventListener('click', () => {
                this.clearAllReports();
            });
        }, 10);
    }

    renderAllReportsTable() {
        const tbody = document.getElementById('allReportsTableBody');
        if (!tbody) return;
        
        const allReports = this.backend.getAllReports();
        
        if (allReports.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-file-alt text-2xl mb-2"></i>
                        <p>No reports generated yet</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = allReports.map(report => `
            <tr>
                <td class="px-4 py-3">
                    <div class="font-medium">${this.escapeHtml(report.title)}</div>
                    <div class="text-sm text-gray-500">${report.fileName || 'No file'}</div>
                </td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getReportTypeClass(report.type)}">
                        ${this.formatReportType(report.type)}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm">
                    ${new Date(report.generatedAt).toLocaleString()}
                </td>
                <td class="px-4 py-3 text-sm">
                    ${report.format?.toUpperCase() || 'PDF'}
                </td>
                <td class="px-4 py-3">
                    <div class="flex space-x-2">
                        <button onclick="window.mainApp.modules.reports.downloadReport(${report.id})" 
                                class="text-blue-600 hover:text-blue-800 p-1">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="window.mainApp.modules.reports.printSingleReport(${report.id})" 
                                class="text-gray-600 hover:text-gray-800 p-1">
                            <i class="fas fa-print"></i>
                        </button>
                        <button onclick="window.mainApp.modules.reports.deleteReport(${report.id})" 
                                class="text-red-600 hover:text-red-800 p-1">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async clearAllReports() {
        if (!confirm('Are you sure you want to clear ALL reports? This action cannot be undone.')) {
            return;
        }
        
        try {
            this.backend.clearAllReports();
            
            // Update local data
            this.reports = this.backend.getAllReports();
            
            // Close modal
            document.getElementById('allReportsModal')?.remove();
            
            // Refresh display
            this.renderAll();
            
            window.mainApp?.showNotification('All reports cleared successfully', 'success');
            
        } catch (error) {
            console.error('Error clearing reports:', error);
            window.mainApp?.showNotification('Failed to clear reports', 'error');
        }
    }

    // Utility methods
    getReportIcon(reportType) {
        switch (reportType) {
            case 'financial':
                return 'fa-chart-line';
            case 'occupancy':
                return 'fa-home';
            case 'maintenance':
                return 'fa-tools';
            case 'tenant':
                return 'fa-users';
            case 'tax':
                return 'fa-file-invoice-dollar';
            case 'custom':
                return 'fa-chart-bar';
            default:
                return 'fa-file-alt';
        }
    }

    getReportIconClass(reportType) {
        switch (reportType) {
            case 'financial':
                return 'bg-green-500';
            case 'occupancy':
                return 'bg-blue-500';
            case 'maintenance':
                return 'bg-yellow-500';
            case 'tenant':
                return 'bg-purple-500';
            case 'tax':
                return 'bg-red-500';
            case 'custom':
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
        }
    }

    getReportTypeClass(reportType) {
        switch (reportType) {
            case 'financial':
                return 'bg-green-100 text-green-800';
            case 'occupancy':
                return 'bg-blue-100 text-blue-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            case 'tenant':
                return 'bg-purple-100 text-purple-800';
            case 'tax':
                return 'bg-red-100 text-red-800';
            case 'custom':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    formatReportType(reportType) {
        return reportType ? reportType.charAt(0).toUpperCase() + reportType.slice(1) : 'Report';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Refresh method for external calls
    async refresh() {
        await this.loadReportsData();
        this.renderAll();
    }
}

export { ReportsFrontend };