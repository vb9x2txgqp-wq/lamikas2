/**
 * Payments Backend - Business Logic and Data Management
 * Contains all non-tamperable business logic
 */

import { authManager } from '/js/auth.js';
import { Utils } from '../js/utils.js';

class PaymentsBackend {
    constructor() {
        this.storageKey = 'payments_data';
        this.userId = null;
        this.initializeUser();
    }

    initializeUser() {
        const user = authManager.getCurrentUser();
        this.userId = user?.id || 'default';
        this.storageKey = `payments_${this.userId}`;
    }

    // Get all payments for current user
    getAllPayments() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading payments:', error);
            return [];
        }
    }

    // Get payment by ID
    getPaymentById(id) {
        const payments = this.getAllPayments();
        return payments.find(payment => payment.id === id);
    }

    // Add new payment
    addPayment(paymentData) {
        // Validate payment data
        if (!this.validatePayment(paymentData)) {
            throw new Error('Invalid payment data');
        }

        const payments = this.getAllPayments();
        const newPayment = {
            id: Date.now(),
            ...paymentData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: this.userId
        };

        payments.push(newPayment);
        this.savePayments(payments);
        return newPayment;
    }

    // Update payment
    updatePayment(id, updates) {
        const payments = this.getAllPayments();
        const index = payments.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Payment not found');
        }

        // Validate updates
        const updatedPayment = { ...payments[index], ...updates, updatedAt: new Date().toISOString() };
        if (!this.validatePayment(updatedPayment)) {
            throw new Error('Invalid payment data');
        }

        payments[index] = updatedPayment;
        this.savePayments(payments);
        return updatedPayment;
    }

    // Delete payment
    deletePayment(id) {
        const payments = this.getAllPayments();
        const filteredPayments = payments.filter(p => p.id !== id);
        
        if (filteredPayments.length === payments.length) {
            throw new Error('Payment not found');
        }

        this.savePayments(filteredPayments);
        return true;
    }

    // Validate payment data (CAN'T BE TAMPERED WITH)
    validatePayment(paymentData) {
        if (!paymentData) return false;
        
        // Required fields
        const required = ['tenantId', 'amount', 'date', 'propertyId'];
        for (const field of required) {
            if (!paymentData[field]) return false;
        }

        // Amount validation
        if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
            return false;
        }

        // Date validation
        const paymentDate = new Date(paymentData.date);
        if (isNaN(paymentDate.getTime())) {
            return false;
        }

        // Status validation
        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (paymentData.status && !validStatuses.includes(paymentData.status)) {
            return false;
        }

        return true;
    }

    // Calculate statistics (CAN'T BE TAMPERED WITH)
    calculateStats(payments = null) {
        const allPayments = payments || this.getAllPayments();
        
        if (allPayments.length === 0) {
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

        // Monthly collections
        const monthlyCollections = allPayments
            .filter(p => {
                const paymentDate = new Date(p.date);
                return p.status === 'completed' && 
                       paymentDate.getMonth() === currentMonth &&
                       paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0);

        // Outstanding payments
        const outstanding = allPayments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0);

        // Collection rate
        const totalPayments = allPayments.length;
        const paidPayments = allPayments.filter(p => p.status === 'completed').length;
        const collectionRate = totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0;

        // Average processing time
        const completedPayments = allPayments.filter(p => p.status === 'completed');
        let avgProcessing = 0;
        if (completedPayments.length > 0) {
            const totalDays = completedPayments.reduce((sum, p) => {
                const created = new Date(p.createdAt || p.date);
                const completed = new Date(p.completedAt || p.date);
                return sum + Math.max(0, (completed - created) / (1000 * 60 * 60 * 24));
            }, 0);
            avgProcessing = Math.round(totalDays / completedPayments.length);
        }

        // Overdue tenants
        const overdueTenants = allPayments
            .filter(p => {
                if (p.status !== 'pending') return false;
                const dueDate = new Date(p.dueDate || p.date);
                return dueDate < new Date();
            }).length;

        return {
            monthlyCollections,
            outstanding,
            collectionRate,
            avgProcessing,
            overdueTenants,
            totalCount: totalPayments,
            paidCount: paidPayments,
            overdueCount: overdueTenants
        };
    }

    // Get payments by tenant
    getPaymentsByTenant(tenantId) {
        const payments = this.getAllPayments();
        return payments.filter(p => p.tenantId === tenantId);
    }

    // Get payments by property
    getPaymentsByProperty(propertyId) {
        const payments = this.getAllPayments();
        return payments.filter(p => p.propertyId === propertyId);
    }

    // Search payments
    searchPayments(query, payments = null) {
        const allPayments = payments || this.getAllPayments();
        if (!query.trim()) return allPayments;

        const searchTerm = query.toLowerCase();
        return allPayments.filter(payment => 
            (payment.tenantName && payment.tenantName.toLowerCase().includes(searchTerm)) ||
            (payment.propertyName && payment.propertyName.toLowerCase().includes(searchTerm)) ||
            (payment.reference && payment.reference.toLowerCase().includes(searchTerm)) ||
            (payment.method && payment.method.toLowerCase().includes(searchTerm))
        );
    }

    // Generate payment reference
    generateReference() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PAY-${timestamp}-${random}`;
    }

    // Export payments data
    exportToCSV(payments = null) {
        const allPayments = payments || this.getAllPayments();
        
        if (allPayments.length === 0) {
            return "No payments to export";
        }

        const headers = ['ID', 'Tenant', 'Property', 'Amount', 'Date', 'Method', 'Status', 'Reference'];
        const rows = allPayments.map(p => [
            p.id,
            p.tenantName || `Tenant ${p.tenantId}`,
            p.propertyName || `Property ${p.propertyId}`,
            `$${p.amount.toFixed(2)}`,
            new Date(p.date).toLocaleDateString(),
            p.method || 'N/A',
            p.status || 'pending',
            p.reference || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    // Get recent payments (last 10)
    getRecentPayments(limit = 10) {
        const payments = this.getAllPayments();
        return payments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    // Get outstanding payments
    getOutstandingPayments() {
        const payments = this.getAllPayments();
        return payments.filter(p => p.status === 'pending');
    }

    // Save payments to storage
    savePayments(payments) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(payments));
            return true;
        } catch (error) {
            console.error('Error saving payments:', error);
            return false;
        }
    }

    // Initialize with sample data if needed (optional)
    initializeSampleData() {
        const payments = this.getAllPayments();
        if (payments.length === 0) {
            // No sample data - start empty
            return false;
        }
        return true;
    }
}

export { PaymentsBackend };