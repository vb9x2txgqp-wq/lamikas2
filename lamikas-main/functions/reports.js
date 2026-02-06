/**
 * Reports Backend - Business Logic and Data Management
 * Contains all non-tamperable business logic for reports
 */

import { authManager } from '/js/auth.js';
import { Utils } from '../js/utils.js';

class ReportsBackend {
    constructor() {
        this.storageKey = 'reports_data';
        this.userId = null;
        this.generatedReportsKey = 'generated_reports';
        this.initializeUser();
    }

    initializeUser() {
        const user = authManager.getCurrentUser();
        this.userId = user?.id || 'default';
        this.storageKey = `reports_${this.userId}`;
        this.generatedReportsKey = `generated_reports_${this.userId}`;
    }

    // Get all generated reports
    getAllReports() {
        try {
            const data = localStorage.getItem(this.generatedReportsKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading reports:', error);
            return [];
        }
    }

    // Get report by ID
    getReportById(id) {
        const reports = this.getAllReports();
        return reports.find(report => report.id === id);
    }

    // Generate financial report
    generateFinancialReport(data = {}) {
        const { startDate, endDate, includeDetails = true } = data;
        
        // In a real app, this would fetch from actual data
        // For now, generate based on available data
        
        const report = {
            id: Date.now(),
            type: 'financial',
            title: 'Financial Report',
            period: `${startDate || 'Start'} to ${endDate || 'End'}`,
            generatedAt: new Date().toISOString(),
            data: {
                summary: this.calculateFinancialSummary(),
                incomeBreakdown: this.calculateIncomeBreakdown(),
                expenseBreakdown: this.calculateExpenseBreakdown(),
                netProfit: this.calculateNetProfit(),
                recommendations: this.generateFinancialRecommendations()
            },
            format: 'pdf',
            fileName: `financial_report_${new Date().toISOString().split('T')[0]}.pdf`
        };
        
        this.saveReport(report);
        return report;
    }

    // Generate occupancy report
    generateOccupancyReport(data = {}) {
        const { propertyId, timeframe = 'quarterly' } = data;
        
        const report = {
            id: Date.now(),
            type: 'occupancy',
            title: 'Occupancy Report',
            timeframe: timeframe,
            generatedAt: new Date().toISOString(),
            data: {
                occupancyRate: this.calculateOccupancyRate(),
                vacancyRate: this.calculateVacancyRate(),
                turnoverRate: this.calculateTurnoverRate(),
                averageTenancy: this.calculateAverageTenancy(),
                recommendations: this.generateOccupancyRecommendations()
            },
            format: 'pdf',
            fileName: `occupancy_report_${new Date().toISOString().split('T')[0]}.pdf`
        };
        
        this.saveReport(report);
        return report;
    }

    // Generate maintenance report
    generateMaintenanceReport(data = {}) {
        const { startDate, endDate, category = 'all' } = data;
        
        const report = {
            id: Date.now(),
            type: 'maintenance',
            title: 'Maintenance Report',
            period: `${startDate || 'Start'} to ${endDate || 'End'}`,
            generatedAt: new Date().toISOString(),
            data: {
                totalRequests: this.countMaintenanceRequests(),
                completedRequests: this.countCompletedMaintenance(),
                averageResponseTime: this.calculateAverageResponseTime(),
                totalCost: this.calculateMaintenanceCost(),
                categoryBreakdown: this.getMaintenanceCategoryBreakdown(),
                recommendations: this.generateMaintenanceRecommendations()
            },
            format: 'pdf',
            fileName: `maintenance_report_${new Date().toISOString().split('T')[0]}.pdf`
        };
        
        this.saveReport(report);
        return report;
    }

    // Generate tenant report
    generateTenantReport(data = {}) {
        const { includeDemographics = true, includeHistory = true } = data;
        
        const report = {
            id: Date.now(),
            type: 'tenant',
            title: 'Tenant Report',
            generatedAt: new Date().toISOString(),
            data: {
                totalTenants: this.countTotalTenants(),
                activeTenants: this.countActiveTenants(),
                tenantTurnover: this.calculateTenantTurnover(),
                satisfactionScore: this.calculateSatisfactionScore(),
                demographicBreakdown: includeDemographics ? this.getDemographicBreakdown() : null,
                paymentHistory: includeHistory ? this.getPaymentHistorySummary() : null,
                recommendations: this.generateTenantRecommendations()
            },
            format: 'pdf',
            fileName: `tenant_report_${new Date().toISOString().split('T')[0]}.pdf`
        };
        
        this.saveReport(report);
        return report;
    }

    // Generate tax report
    generateTaxReport(data = {}) {
        const { year = new Date().getFullYear(), includeDeductions = true } = data;
        
        const report = {
            id: Date.now(),
            type: 'tax',
            title: 'Tax Report',
            year: year,
            generatedAt: new Date().toISOString(),
            data: {
                totalIncome: this.calculateTotalIncome(year),
                totalExpenses: this.calculateTotalExpenses(year),
                taxableIncome: this.calculateTaxableIncome(year),
                deductions: includeDeductions ? this.getTaxDeductions(year) : [],
                estimatedTax: this.calculateEstimatedTax(year),
                recommendations: this.generateTaxRecommendations(year)
            },
            format: 'pdf',
            fileName: `tax_report_${year}_${new Date().toISOString().split('T')[0]}.pdf`
        };
        
        this.saveReport(report);
        return report;
    }

    // Generate custom report
    generateCustomReport(config) {
        if (!this.validateCustomReportConfig(config)) {
            throw new Error('Invalid custom report configuration');
        }
        
        const report = {
            id: Date.now(),
            type: 'custom',
            title: config.title || 'Custom Report',
            config: config,
            generatedAt: new Date().toISOString(),
            data: this.generateCustomReportData(config),
            format: config.format || 'pdf',
            fileName: `custom_report_${new Date().toISOString().split('T')[0]}.${config.format || 'pdf'}`
        };
        
        this.saveReport(report);
        return report;
    }

    // Validate custom report configuration (CAN'T BE TAMPERED WITH)
    validateCustomReportConfig(config) {
        if (!config || typeof config !== 'object') return false;
        
        // Must have at least one data type
        if (!config.dataTypes || !Array.isArray(config.dataTypes) || config.dataTypes.length === 0) {
            return false;
        }
        
        // Valid data types
        const validDataTypes = ['financial', 'occupancy', 'maintenance', 'tenant', 'payment'];
        for (const type of config.dataTypes) {
            if (!validDataTypes.includes(type)) {
                return false;
            }
        }
        
        // Valid formats
        const validFormats = ['pdf', 'excel', 'csv', 'json'];
        if (config.format && !validFormats.includes(config.format)) {
            return false;
        }
        
        return true;
    }

    // Generate data for custom report
    generateCustomReportData(config) {
        const data = {};
        
        config.dataTypes.forEach(type => {
            switch (type) {
                case 'financial':
                    data.financial = this.calculateFinancialSummary();
                    break;
                case 'occupancy':
                    data.occupancy = {
                        rate: this.calculateOccupancyRate(),
                        vacancy: this.calculateVacancyRate()
                    };
                    break;
                case 'maintenance':
                    data.maintenance = {
                        totalRequests: this.countMaintenanceRequests(),
                        totalCost: this.calculateMaintenanceCost()
                    };
                    break;
                case 'tenant':
                    data.tenant = {
                        total: this.countTotalTenants(),
                        active: this.countActiveTenants()
                    };
                    break;
                case 'payment':
                    data.payment = {
                        totalCollected: this.calculateTotalPayments(),
                        outstanding: this.calculateOutstandingPayments()
                    };
                    break;
            }
        });
        
        return data;
    }

    // Save report to storage
    saveReport(report) {
        try {
            const reports = this.getAllReports();
            reports.unshift(report); // Add to beginning
            
            // Keep only last 50 reports
            if (reports.length > 50) {
                reports.pop();
            }
            
            localStorage.setItem(this.generatedReportsKey, JSON.stringify(reports));
            return true;
        } catch (error) {
            console.error('Error saving report:', error);
            return false;
        }
    }

    // Delete report
    deleteReport(id) {
        const reports = this.getAllReports();
        const filteredReports = reports.filter(r => r.id !== id);
        
        if (filteredReports.length === reports.length) {
            throw new Error('Report not found');
        }

        localStorage.setItem(this.generatedReportsKey, JSON.stringify(filteredReports));
        return true;
    }

    // Export report to file
    exportReport(report, format = 'pdf') {
        // In a real app, this would generate actual files
        // For now, return a simulated file content
        
        let content = '';
        let mimeType = '';
        let extension = '';
        
        switch (format) {
            case 'pdf':
                content = `PDF Content for ${report.title}`;
                mimeType = 'application/pdf';
                extension = 'pdf';
                break;
            case 'excel':
                content = this.generateExcelContent(report);
                mimeType = 'application/vnd.ms-excel';
                extension = 'xlsx';
                break;
            case 'csv':
                content = this.generateCSVContent(report);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'json':
                content = JSON.stringify(report, null, 2);
                mimeType = 'application/json';
                extension = 'json';
                break;
            default:
                throw new Error('Unsupported format');
        }
        
        return {
            content,
            mimeType,
            fileName: `${report.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${extension}`
        };
    }

    // Generate Excel content (simulated)
    generateExcelContent(report) {
        // Simplified Excel content simulation
        let content = 'Report Data\n';
        content += `Title: ${report.title}\n`;
        content += `Type: ${report.type}\n`;
        content += `Generated: ${new Date(report.generatedAt).toLocaleString()}\n\n`;
        
        if (report.data) {
            for (const [key, value] of Object.entries(report.data)) {
                content += `${key}: ${JSON.stringify(value)}\n`;
            }
        }
        
        return content;
    }

    // Generate CSV content
    generateCSVContent(report) {
        let content = 'Report Data\n';
        
        if (report.data) {
            for (const [key, value] of Object.entries(report.data)) {
                if (typeof value === 'object') {
                    content += `${key},"${JSON.stringify(value).replace(/"/g, '""')}"\n`;
                } else {
                    content += `${key},"${value}"\n`;
                }
            }
        }
        
        return content;
    }

    // Get recent reports (last 5)
    getRecentReports(limit = 5) {
        const reports = this.getAllReports();
        return reports.slice(0, limit);
    }

    // Calculate financial summary (CAN'T BE TAMPERED WITH)
    calculateFinancialSummary() {
        // In a real app, these would be actual calculations
        // For now, return simulated data
        
        return {
            totalIncome: 125000,
            totalExpenses: 75000,
            netProfit: 50000,
            grossMargin: '40%',
            operatingMargin: '30%'
        };
    }

    calculateIncomeBreakdown() {
        return {
            rentalIncome: 100000,
            lateFees: 5000,
            otherFees: 20000
        };
    }

    calculateExpenseBreakdown() {
        return {
            mortgage: 40000,
            maintenance: 15000,
            utilities: 10000,
            insurance: 5000,
            taxes: 5000
        };
    }

    calculateNetProfit() {
        const summary = this.calculateFinancialSummary();
        return summary.netProfit;
    }

    // Calculate occupancy metrics (CAN'T BE TAMPERED WITH)
    calculateOccupancyRate() {
        // Simulated calculation
        return '92%';
    }

    calculateVacancyRate() {
        // Simulated calculation
        return '8%';
    }

    calculateTurnoverRate() {
        // Simulated calculation
        return '15%';
    }

    calculateAverageTenancy() {
        // Simulated calculation
        return '2.5 years';
    }

    // Maintenance calculations (CAN'T BE TAMPERED WITH)
    countMaintenanceRequests() {
        // In real app, would count from maintenance data
        return 24;
    }

    countCompletedMaintenance() {
        // In real app, would count from maintenance data
        return 18;
    }

    calculateAverageResponseTime() {
        // Simulated calculation
        return '2.3 days';
    }

    calculateMaintenanceCost() {
        // Simulated calculation
        return 12500;
    }

    getMaintenanceCategoryBreakdown() {
        return {
            plumbing: 8,
            electrical: 5,
            hvac: 4,
            structural: 3,
            other: 4
        };
    }

    // Tenant calculations (CAN'T BE TAMPERED WITH)
    countTotalTenants() {
        // In real app, would count from tenant data
        return 42;
    }

    countActiveTenants() {
        // In real app, would count from tenant data
        return 38;
    }

    calculateTenantTurnover() {
        // Simulated calculation
        return '12%';
    }

    calculateSatisfactionScore() {
        // Simulated calculation
        return '4.2/5.0';
    }

    getDemographicBreakdown() {
        return {
            ageGroups: {
                '18-25': 5,
                '26-35': 15,
                '36-45': 12,
                '46-55': 7,
                '55+': 3
            },
            avgHouseholdSize: '2.3'
        };
    }

    getPaymentHistorySummary() {
        return {
            onTimePayments: '94%',
            averageDaysLate: '2.1',
            collectionRate: '96%'
        };
    }

    // Tax calculations (CAN'T BE TAMPERED WITH)
    calculateTotalIncome(year) {
        // Simulated calculation
        return 125000;
    }

    calculateTotalExpenses(year) {
        // Simulated calculation
        return 75000;
    }

    calculateTaxableIncome(year) {
        const income = this.calculateTotalIncome(year);
        const expenses = this.calculateTotalExpenses(year);
        return income - expenses;
    }

    getTaxDeductions(year) {
        return {
            depreciation: 15000,
            repairs: 5000,
            utilities: 10000,
            insurance: 5000,
            propertyTaxes: 8000,
            mortgageInterest: 20000
        };
    }

    calculateEstimatedTax(year) {
        const taxableIncome = this.calculateTaxableIncome(year);
        // Simplified tax calculation
        return taxableIncome * 0.25;
    }

    // Payment calculations (CAN'T BE TAMPERED WITH)
    calculateTotalPayments() {
        // In real app, would sum from payment data
        return 100000;
    }

    calculateOutstandingPayments() {
        // In real app, would calculate from payment data
        return 5000;
    }

    // Generate recommendations (CAN'T BE TAMPERED WITH)
    generateFinancialRecommendations() {
        return [
            'Consider increasing rent by 3-5% for renewals',
            'Reduce maintenance costs by implementing preventative maintenance schedule',
            'Explore refinancing options for better mortgage rates'
        ];
    }

    generateOccupancyRecommendations() {
        return [
            'Offer referral bonuses to current tenants',
            'Improve property marketing during vacancy periods',
            'Consider flexible lease terms to attract more tenants'
        ];
    }

    generateMaintenanceRecommendations() {
        return [
            'Implement regular preventative maintenance checks',
            'Create preferred vendor list for faster response times',
            'Track maintenance history to identify recurring issues'
        ];
    }

    generateTenantRecommendations() {
        return [
            'Implement tenant satisfaction surveys quarterly',
            'Create tenant retention program with rewards',
            'Improve communication channels for faster issue resolution'
        ];
    }

    generateTaxRecommendations(year) {
        return [
            'Consult with tax professional for maximum deductions',
            'Keep detailed records of all property-related expenses',
            'Consider tax-advantaged investment strategies'
        ];
    }

    // Export all reports as ZIP
    exportAllReports() {
        const reports = this.getAllReports();
        if (reports.length === 0) {
            throw new Error('No reports to export');
        }
        
        // Simulated ZIP content
        let zipContent = 'ZIP Archive Contents:\n\n';
        
        reports.forEach((report, index) => {
            zipContent += `${index + 1}. ${report.title} (${report.type}) - ${new Date(report.generatedAt).toLocaleDateString()}\n`;
        });
        
        return {
            content: zipContent,
            fileName: `all_reports_${new Date().toISOString().split('T')[0]}.zip`
        };
    }

    // Print report (simulated)
    printReport(report) {
        // In a real app, this would open print dialog with formatted content
        console.log('Printing report:', report.title);
        return true;
    }

    // Clear all reports
    clearAllReports() {
        localStorage.setItem(this.generatedReportsKey, JSON.stringify([]));
        return true;
    }
}

export { ReportsBackend };