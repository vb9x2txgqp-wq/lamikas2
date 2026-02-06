/**
 * Maintenance Backend - Business Logic and Data Management
 * Contains all non-tamperable business logic
 */

import { authManager } from '/js/auth.js';
import { Utils } from '../js/utils.js';

class MaintenanceBackend {
    constructor() {
        this.storageKey = 'maintenance_requests';
        this.userId = null;
        this.initializeUser();
    }

    initializeUser() {
        const user = authManager.getCurrentUser();
        this.userId = user?.id || 'default';
        this.storageKey = `maintenance_${this.userId}`;
    }

    // Get all maintenance requests
    getAllRequests() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading maintenance requests:', error);
            return [];
        }
    }

    // Get request by ID
    getRequestById(id) {
        const requests = this.getAllRequests();
        return requests.find(request => request.id === id);
    }

    // Add new maintenance request
    addRequest(requestData) {
        // Validate request data
        if (!this.validateRequest(requestData)) {
            throw new Error('Invalid maintenance request data');
        }

        const requests = this.getAllRequests();
        const newRequest = {
            id: Date.now(),
            ...requestData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: this.userId,
            status: requestData.status || 'open',
            assignedTo: requestData.assignedTo || null,
            priority: requestData.priority || 'medium',
            estimatedCost: requestData.estimatedCost || 0,
            actualCost: requestData.actualCost || 0,
            completedAt: null
        };

        requests.push(newRequest);
        this.saveRequests(requests);
        return newRequest;
    }

    // Update maintenance request
    updateRequest(id, updates) {
        const requests = this.getAllRequests();
        const index = requests.findIndex(r => r.id === id);
        
        if (index === -1) {
            throw new Error('Maintenance request not found');
        }

        // Validate updates
        const updatedRequest = { 
            ...requests[index], 
            ...updates, 
            updatedAt: new Date().toISOString() 
        };
        
        if (updates.status === 'completed' && !updatedRequest.completedAt) {
            updatedRequest.completedAt = new Date().toISOString();
        }

        if (!this.validateRequest(updatedRequest)) {
            throw new Error('Invalid maintenance request data');
        }

        requests[index] = updatedRequest;
        this.saveRequests(requests);
        return updatedRequest;
    }

    // Delete maintenance request
    deleteRequest(id) {
        const requests = this.getAllRequests();
        const filteredRequests = requests.filter(r => r.id !== id);
        
        if (filteredRequests.length === requests.length) {
            throw new Error('Maintenance request not found');
        }

        this.saveRequests(filteredRequests);
        return true;
    }

    // Validate maintenance request data (CAN'T BE TAMPERED WITH)
    validateRequest(requestData) {
        if (!requestData) return false;
        
        // Required fields
        const required = ['title', 'propertyId', 'category'];
        for (const field of required) {
            if (!requestData[field]) return false;
        }

        // Title validation
        if (typeof requestData.title !== 'string' || requestData.title.trim().length < 3) {
            return false;
        }

        // Description validation (if provided)
        if (requestData.description && typeof requestData.description !== 'string') {
            return false;
        }

        // Priority validation
        const validPriorities = ['low', 'medium', 'high', 'emergency'];
        if (requestData.priority && !validPriorities.includes(requestData.priority)) {
            return false;
        }

        // Status validation
        const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
        if (requestData.status && !validStatuses.includes(requestData.status)) {
            return false;
        }

        // Cost validation
        if (requestData.estimatedCost && (typeof requestData.estimatedCost !== 'number' || requestData.estimatedCost < 0)) {
            return false;
        }

        if (requestData.actualCost && (typeof requestData.actualCost !== 'number' || requestData.actualCost < 0)) {
            return false;
        }

        return true;
    }

    // Calculate statistics (CAN'T BE TAMPERED WITH)
    calculateStats(requests = null) {
        const allRequests = requests || this.getAllRequests();
        
        if (allRequests.length === 0) {
            return {
                openRequests: 0,
                highPriority: 0,
                inProgress: 0,
                avgDays: 0,
                completed: 0,
                avgCost: 0,
                totalRequests: 0,
                totalCost: 0,
                categories: {}
            };
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Count by status
        const openRequests = allRequests.filter(r => r.status === 'open').length;
        const highPriority = allRequests.filter(r => r.priority === 'high' || r.priority === 'emergency').length;
        const inProgress = allRequests.filter(r => r.status === 'in_progress').length;
        
        // Completed this month
        const completed = allRequests.filter(r => {
            if (r.status !== 'completed') return false;
            const completedDate = new Date(r.completedAt || r.updatedAt);
            return completedDate.getMonth() === currentMonth && 
                   completedDate.getFullYear() === currentYear;
        }).length;

        // Calculate average days to resolve
        const completedRequests = allRequests.filter(r => r.status === 'completed');
        let avgDays = 0;
        if (completedRequests.length > 0) {
            const totalDays = completedRequests.reduce((sum, r) => {
                const created = new Date(r.createdAt);
                const completed = new Date(r.completedAt || r.updatedAt);
                return sum + Math.max(0, (completed - created) / (1000 * 60 * 60 * 24));
            }, 0);
            avgDays = Math.round(totalDays / completedRequests.length);
        }

        // Calculate average cost
        const requestsWithCost = allRequests.filter(r => r.actualCost > 0);
        let avgCost = 0;
        if (requestsWithCost.length > 0) {
            const totalCost = requestsWithCost.reduce((sum, r) => sum + r.actualCost, 0);
            avgCost = Math.round(totalCost / requestsWithCost.length);
        }

        // Calculate total cost
        const totalCost = allRequests.reduce((sum, r) => sum + (r.actualCost || 0), 0);

        // Calculate category distribution
        const categories = {};
        allRequests.forEach(r => {
            const category = r.category || 'other';
            categories[category] = (categories[category] || 0) + 1;
        });

        return {
            openRequests,
            highPriority,
            inProgress,
            avgDays,
            completed,
            avgCost,
            totalRequests: allRequests.length,
            totalCost,
            categories
        };
    }

    // Get requests by status
    getRequestsByStatus(status) {
        const requests = this.getAllRequests();
        return requests.filter(r => r.status === status);
    }

    // Get requests by property
    getRequestsByProperty(propertyId) {
        const requests = this.getAllRequests();
        return requests.filter(r => r.propertyId === propertyId);
    }

    // Get requests by priority
    getRequestsByPriority(priority) {
        const requests = this.getAllRequests();
        return requests.filter(r => r.priority === priority);
    }

    // Search maintenance requests
    searchRequests(query, requests = null) {
        const allRequests = requests || this.getAllRequests();
        if (!query.trim()) return allRequests;

        const searchTerm = query.toLowerCase();
        return allRequests.filter(request => 
            (request.title && request.title.toLowerCase().includes(searchTerm)) ||
            (request.description && request.description.toLowerCase().includes(searchTerm)) ||
            (request.propertyName && request.propertyName.toLowerCase().includes(searchTerm)) ||
            (request.category && request.category.toLowerCase().includes(searchTerm))
        );
    }

    // Get requests needing attention (open + high priority)
    getUrgentRequests() {
        const requests = this.getAllRequests();
        return requests.filter(r => 
            r.status === 'open' && 
            (r.priority === 'high' || r.priority === 'emergency')
        );
    }

    // Calculate monthly costs
    calculateMonthlyCosts(months = 6) {
        const requests = this.getAllRequests();
        const monthlyCosts = {};
        
        // Initialize last 6 months
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = date.toLocaleDateString('en-US', { month: 'short' });
            monthlyCosts[key] = 0;
        }
        
        // Calculate costs per month
        requests.forEach(request => {
            if (request.actualCost > 0 && request.completedAt) {
                const completedDate = new Date(request.completedAt);
                const key = completedDate.toLocaleDateString('en-US', { month: 'short' });
                if (monthlyCosts[key] !== undefined) {
                    monthlyCosts[key] += request.actualCost;
                }
            }
        });
        
        return {
            labels: Object.keys(monthlyCosts),
            data: Object.values(monthlyCosts)
        };
    }

    // Get category distribution
    getCategoryDistribution() {
        const requests = this.getAllRequests();
        const categories = {};
        
        requests.forEach(request => {
            const category = request.category || 'other';
            categories[category] = (categories[category] || 0) + 1;
        });
        
        // Sort by count and get top 5
        const sorted = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return {
            labels: sorted.map(([category]) => category),
            data: sorted.map(([, count]) => count)
        };
    }

    // Update request status
    updateStatus(id, newStatus) {
        return this.updateRequest(id, { status: newStatus });
    }

    // Assign request to someone
    assignRequest(id, assignee) {
        return this.updateRequest(id, { 
            assignedTo: assignee,
            status: 'in_progress'
        });
    }

    // Mark request as completed
    completeRequest(id, actualCost = null, notes = '') {
        const updates = {
            status: 'completed',
            completedAt: new Date().toISOString()
        };
        
        if (actualCost !== null) {
            updates.actualCost = actualCost;
        }
        
        if (notes) {
            updates.completionNotes = notes;
        }
        
        return this.updateRequest(id, updates);
    }

    // Generate request number
    generateRequestNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `MT-${timestamp}-${random}`;
    }

    // Export maintenance data
    exportToCSV(requests = null) {
        const allRequests = requests || this.getAllRequests();
        
        if (allRequests.length === 0) {
            return "No maintenance requests to export";
        }

        const headers = ['ID', 'Title', 'Property', 'Category', 'Priority', 'Status', 'Created', 'Completed', 'Cost'];
        const rows = allRequests.map(r => [
            r.id,
            r.title,
            r.propertyName || `Property ${r.propertyId}`,
            r.category || 'N/A',
            r.priority || 'medium',
            r.status || 'open',
            new Date(r.createdAt).toLocaleDateString(),
            r.completedAt ? new Date(r.completedAt).toLocaleDateString() : 'N/A',
            `$${r.actualCost?.toFixed(2) || '0.00'}`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    // Get recent requests (last 10)
    getRecentRequests(limit = 10) {
        const requests = this.getAllRequests();
        return requests
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    // Save requests to storage
    saveRequests(requests) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(requests));
            return true;
        } catch (error) {
            console.error('Error saving maintenance requests:', error);
            return false;
        }
    }

    // Initialize with empty data (no mock data)
    initializeData() {
        const requests = this.getAllRequests();
        if (requests.length === 0) {
            // Start with empty array
            this.saveRequests([]);
        }
        return true;
    }
}

export { MaintenanceBackend };