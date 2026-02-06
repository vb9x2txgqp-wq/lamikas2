/**
 * Tenants Backend - Business Logic and Data Processing
 * All calculations, data processing, and business logic for tenants
 */

class TenantsBackend {
    constructor() {
        this.tenants = [];
        this.stats = null;
        this.propertyManager = null;
    }

    // Initialize tenants data
    async initialize() {
        await this.loadTenants();
        await this.calculateStats();
        await this.loadProperties();
        return this;
    }

    // Load all tenants
    async loadTenants() {
        try {
            const saved = localStorage.getItem('tenants');
            if (saved) {
                this.tenants = JSON.parse(saved);
            } else {
                this.tenants = this.getDefaultTenants();
                this.saveTenants();
            }
            return this.tenants;
        } catch (error) {
            console.error('Error loading tenants:', error);
            this.tenants = this.getDefaultTenants();
            return this.tenants;
        }
    }

    // Load properties for tenant assignments
    async loadProperties() {
        try {
            if (!this.propertyManager) {
                this.propertyManager = new PropertyManager();
            }
            this.properties = await this.propertyManager.loadProperties();
            return this.properties;
        } catch (error) {
            console.error('Error loading properties:', error);
            this.properties = [];
            return this.properties;
        }
    }

    // Get default tenants if none exist
    getDefaultTenants() {
        return [
            {
                id: 1,
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "+1 (555) 123-4567",
                propertyId: 1,
                propertyName: "Miami Beach",
                unit: "3B",
                leaseStart: new Date(Date.now() - 180 * 86400000).toISOString(),
                leaseEnd: new Date(Date.now() + 180 * 86400000).toISOString(),
                monthlyRent: 1200,
                status: "active",
                paymentStatus: "paid",
                notes: "Pays on time, quiet tenant",
                emergencyContact: "Jane Doe (555) 987-6543",
                createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                firstName: "Jane",
                lastName: "Smith",
                email: "jane.smith@example.com",
                phone: "+1 (555) 234-5678",
                propertyId: 2,
                propertyName: "NYC Apt",
                unit: "5A",
                leaseStart: new Date(Date.now() - 90 * 86400000).toISOString(),
                leaseEnd: new Date(Date.now() + 270 * 86400000).toISOString(),
                monthlyRent: 800,
                status: "active",
                paymentStatus: "paid",
                notes: "Works night shift",
                emergencyContact: "Bob Smith (555) 876-5432",
                createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                firstName: "Robert",
                lastName: "Johnson",
                email: "robert.johnson@example.com",
                phone: "+44 20 1234 5678",
                propertyId: 3,
                propertyName: "London Flat",
                unit: "2",
                leaseStart: new Date(Date.now() - 120 * 86400000).toISOString(),
                leaseEnd: new Date(Date.now() + 240 * 86400000).toISOString(),
                monthlyRent: 1500,
                status: "active",
                paymentStatus: "overdue",
                notes: "Late payment history",
                emergencyContact: "Sarah Johnson +44 20 8765 4321",
                createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: 4,
                firstName: "Maria",
                lastName: "Garcia",
                email: "maria.garcia@example.com",
                phone: "+81 3 1234 5678",
                propertyId: 4,
                propertyName: "Tokyo Office",
                unit: "Office 401",
                leaseStart: new Date(Date.now() - 60 * 86400000).toISOString(),
                leaseEnd: new Date(Date.now() + 300 * 86400000).toISOString(),
                monthlyRent: 1200,
                status: "pending",
                paymentStatus: "pending",
                notes: "New tenant, lease processing",
                emergencyContact: "Carlos Garcia +81 3 8765 4321",
                createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    // Calculate tenant statistics
    async calculateStats() {
        const tenants = this.tenants;
        const now = new Date();
        
        // Calculate total tenants
        const totalTenants = tenants.length;
        
        // Calculate active leases
        const activeLeases = tenants.filter(tenant => 
            tenant.status === 'active' || tenant.status === 'pending'
        ).length;
        
        // Calculate leases expiring soon (within 30 days)
        const expiringSoon = tenants.filter(tenant => {
            if (!tenant.leaseEnd) return false;
            const leaseEnd = new Date(tenant.leaseEnd);
            const daysUntilExpiry = Math.ceil((leaseEnd - now) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length;
        
        // Calculate average tenancy (in years)
        const avgTenancy = tenants.length > 0 ? 
            tenants.reduce((sum, tenant) => {
                const leaseStart = new Date(tenant.leaseStart || tenant.createdAt);
                const tenancyYears = (now - leaseStart) / (1000 * 60 * 60 * 24 * 365);
                return sum + tenancyYears;
            }, 0) / tenants.length : 0;
        
        // Calculate satisfaction score (weighted average)
        const satisfaction = tenants.length > 0 ? 
            tenants.reduce((sum, tenant) => {
                // Generate random satisfaction between 3.5-5 for demo
                const tenantSatisfaction = 3.5 + Math.random() * 1.5;
                return sum + tenantSatisfaction;
            }, 0) / tenants.length : 0;
        
        // Calculate new tenants this month
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const newThisMonth = tenants.filter(tenant => {
            const createdDate = new Date(tenant.createdAt);
            return createdDate.getMonth() === currentMonth && 
                   createdDate.getFullYear() === currentYear;
        }).length;
        
        // Calculate tenant distribution by property
        const tenantDistribution = this.calculateTenantDistribution();
        
        // Calculate lease expirations by time period
        const leaseExpirations = this.calculateLeaseExpirations();
        
        this.stats = {
            totalTenants,
            activeLeases,
            expiringSoon,
            avgTenancy: avgTenancy.toFixed(1),
            satisfaction: satisfaction.toFixed(1),
            newThisMonth,
            tenantDistribution,
            leaseExpirations,
            reviewCount: tenants.length * 3, // Simulated review count
            overduePayments: tenants.filter(t => t.paymentStatus === 'overdue').length
        };
        
        return this.stats;
    }

    // Calculate tenant distribution by property
    calculateTenantDistribution() {
        const distribution = {};
        
        this.tenants.forEach(tenant => {
            const propertyName = tenant.propertyName || 'Unknown Property';
            distribution[propertyName] = (distribution[propertyName] || 0) + 1;
        });
        
        // Convert to array format for charts
        return Object.entries(distribution).map(([property, count]) => ({
            property,
            count,
            percentage: Math.round((count / this.tenants.length) * 100)
        }));
    }

    // Calculate lease expirations by time period
    calculateLeaseExpirations() {
        const now = new Date();
        const expirations = {
            thisMonth: 0,
            nextMonth: 0,
            next3Months: 0
        };
        
        this.tenants.forEach(tenant => {
            if (!tenant.leaseEnd) return;
            
            const leaseEnd = new Date(tenant.leaseEnd);
            const daysUntilExpiry = Math.ceil((leaseEnd - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
                expirations.thisMonth++;
            } else if (daysUntilExpiry <= 60 && daysUntilExpiry > 30) {
                expirations.nextMonth++;
            } else if (daysUntilExpiry <= 90 && daysUntilExpiry > 60) {
                expirations.next3Months++;
            }
        });
        
        return expirations;
    }

    // Add new tenant
    async addTenant(tenantData) {
        try {
            // Validate tenant data
            const validation = this.validateTenantData(tenantData);
            if (!validation.isValid) {
                throw new Error(validation.errors[0]);
            }
            
            // Generate new tenant ID
            const newId = this.tenants.length > 0 ? 
                Math.max(...this.tenants.map(t => t.id)) + 1 : 1;
            
            // Get property name
            const property = this.properties.find(p => p.id === tenantData.propertyId);
            const propertyName = property ? property.name : 'Unknown Property';
            
            // Create new tenant
            const newTenant = {
                id: newId,
                ...tenantData,
                propertyName: propertyName,
                status: tenantData.status || 'active',
                paymentStatus: tenantData.paymentStatus || 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.tenants.push(newTenant);
            this.saveTenants();
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'success',
                title: 'Tenant Added',
                message: `Added tenant: ${tenantData.firstName} ${tenantData.lastName}`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return newTenant;
        } catch (error) {
            console.error('Error adding tenant:', error);
            throw error;
        }
    }

    // Update existing tenant
    async updateTenant(tenantId, updates) {
        try {
            const tenantIndex = this.tenants.findIndex(t => t.id === tenantId);
            if (tenantIndex === -1) {
                throw new Error('Tenant not found');
            }
            
            // Update tenant
            this.tenants[tenantIndex] = {
                ...this.tenants[tenantIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Update property name if propertyId changed
            if (updates.propertyId) {
                const property = this.properties.find(p => p.id === updates.propertyId);
                if (property) {
                    this.tenants[tenantIndex].propertyName = property.name;
                }
            }
            
            this.saveTenants();
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'info',
                title: 'Tenant Updated',
                message: `Updated tenant: ${this.tenants[tenantIndex].firstName} ${this.tenants[tenantIndex].lastName}`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return this.tenants[tenantIndex];
        } catch (error) {
            console.error('Error updating tenant:', error);
            throw error;
        }
    }

    // Delete tenant
    async deleteTenant(tenantId) {
        try {
            const tenantIndex = this.tenants.findIndex(t => t.id === tenantId);
            if (tenantIndex === -1) {
                throw new Error('Tenant not found');
            }
            
            const tenantName = `${this.tenants[tenantIndex].firstName} ${this.tenants[tenantIndex].lastName}`;
            
            // Remove tenant
            this.tenants.splice(tenantIndex, 1);
            this.saveTenants();
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'warning',
                title: 'Tenant Removed',
                message: `Removed tenant: ${tenantName}`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return true;
        } catch (error) {
            console.error('Error deleting tenant:', error);
            throw error;
        }
    }

    // Search tenants
    async searchTenants(query) {
        if (!query || query.trim() === '') {
            return this.tenants;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.tenants.filter(tenant => {
            return (
                tenant.firstName.toLowerCase().includes(searchTerm) ||
                tenant.lastName.toLowerCase().includes(searchTerm) ||
                tenant.email.toLowerCase().includes(searchTerm) ||
                (tenant.phone && tenant.phone.toLowerCase().includes(searchTerm)) ||
                tenant.propertyName.toLowerCase().includes(searchTerm) ||
                (tenant.unit && tenant.unit.toLowerCase().includes(searchTerm))
            );
        });
    }

    // Get tenant by ID
    getTenantById(id) {
        return this.tenants.find(tenant => tenant.id === id);
    }

    // Get tenants by property
    getTenantsByProperty(propertyId) {
        return this.tenants.filter(tenant => tenant.propertyId === propertyId);
    }

    // Get tenants with overdue payments
    getOverdueTenants() {
        return this.tenants.filter(tenant => tenant.paymentStatus === 'overdue');
    }

    // Get tenants with leases expiring soon
    getExpiringLeases() {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        return this.tenants.filter(tenant => {
            if (!tenant.leaseEnd) return false;
            const leaseEnd = new Date(tenant.leaseEnd);
            return leaseEnd <= thirtyDaysFromNow && leaseEnd >= now;
        });
    }

    // Validate tenant data
    validateTenantData(tenantData) {
        const errors = [];
        
        if (!tenantData.firstName || tenantData.firstName.trim() === '') {
            errors.push('First name is required');
        }
        
        if (!tenantData.lastName || tenantData.lastName.trim() === '') {
            errors.push('Last name is required');
        }
        
        if (!tenantData.email || tenantData.email.trim() === '') {
            errors.push('Email is required');
        } else if (!this.isValidEmail(tenantData.email)) {
            errors.push('Valid email is required');
        }
        
        if (!tenantData.propertyId) {
            errors.push('Property selection is required');
        }
        
        if (!tenantData.monthlyRent || tenantData.monthlyRent <= 0) {
            errors.push('Monthly rent must be greater than 0');
        }
        
        if (tenantData.leaseStart && tenantData.leaseEnd) {
            const start = new Date(tenantData.leaseStart);
            const end = new Date(tenantData.leaseEnd);
            if (end <= start) {
                errors.push('Lease end date must be after start date');
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate email
    isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // Save tenants to storage
    saveTenants() {
        localStorage.setItem('tenants', JSON.stringify(this.tenants));
    }

    // Export tenants to CSV
    exportTenantsToCSV() {
        if (this.tenants.length === 0) {
            return '';
        }
        
        const headers = ['Name', 'Email', 'Phone', 'Property', 'Unit', 'Monthly Rent', 'Lease Start', 'Lease End', 'Status', 'Payment Status'];
        
        const csvRows = this.tenants.map(tenant => [
            `${tenant.firstName} ${tenant.lastName}`,
            tenant.email,
            tenant.phone || 'N/A',
            tenant.propertyName,
            tenant.unit || 'N/A',
            `$${tenant.monthlyRent.toLocaleString()}`,
            new Date(tenant.leaseStart).toLocaleDateString(),
            new Date(tenant.leaseEnd).toLocaleDateString(),
            tenant.status,
            tenant.paymentStatus
        ]);
        
        // Generate CSV content
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    // Export tenants to JSON
    exportTenantsToJSON() {
        return JSON.stringify({
            tenants: this.tenants,
            stats: this.stats,
            exportDate: new Date().toISOString(),
            totalCount: this.tenants.length
        }, null, 2);
    }

    // Get tenant analytics
    getTenantAnalytics() {
        const analytics = {
            totalTenants: this.tenants.length,
            totalMonthlyRent: this.tenants.reduce((sum, tenant) => sum + (tenant.monthlyRent || 0), 0),
            averageTenancy: this.stats?.avgTenancy || '0.0',
            averageSatisfaction: this.stats?.satisfaction || '0.0',
            occupancyRate: 0,
            renewalRate: 75 // Simulated renewal rate
        };
        
        // Calculate occupancy rate if properties are loaded
        if (this.properties && this.properties.length > 0) {
            const totalUnits = this.properties.reduce((sum, property) => sum + (property.units || 0), 0);
            analytics.occupancyRate = totalUnits > 0 ? 
                Math.round((this.tenants.length / totalUnits) * 100) : 0;
        }
        
        return analytics;
    }

    // Get tenant chart data
    getTenantChartData() {
        const distribution = this.calculateTenantDistribution();
        
        return {
            distribution: {
                labels: distribution.map(item => item.property),
                data: distribution.map(item => item.count),
                colors: ['#FF8E53', '#4ECDC4', '#FFD93D', '#9B5DE5', '#00BBF9']
            },
            statusDistribution: {
                labels: ['Active', 'Pending', 'Inactive'],
                data: [
                    this.tenants.filter(t => t.status === 'active').length,
                    this.tenants.filter(t => t.status === 'pending').length,
                    this.tenants.filter(t => t.status === 'inactive').length
                ],
                colors: ['#10B981', '#F59E0B', '#EF4444']
            }
        };
    }

    // Add notification
    addNotification(notification) {
        try {
            let notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            
            notification.id = Date.now().toString();
            notification.timestamp = new Date().toISOString();
            notification.read = false;
            
            notifications.unshift(notification);
            
            // Keep only last 50 notifications
            if (notifications.length > 50) {
                notifications = notifications.slice(0, 50);
            }
            
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            return notification;
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    }

    // Import tenants from CSV
    async importTenantsFromCSV(csvContent) {
        try {
            const rows = csvContent.split('\n').filter(row => row.trim() !== '');
            if (rows.length < 2) {
                throw new Error('CSV file is empty or has no data');
            }
            
            const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const importedTenants = [];
            
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const tenantData = {};
                
                headers.forEach((header, index) => {
                    tenantData[header.toLowerCase()] = values[index] || '';
                });
                
                // Find property by name
                const propertyName = tenantData.property || 'Unknown Property';
                const property = this.properties.find(p => 
                    p.name.toLowerCase() === propertyName.toLowerCase()
                );
                
                // Convert tenant data to proper format
                const tenant = {
                    firstName: tenantData.firstname || tenantData.name?.split(' ')[0] || `Tenant${i}`,
                    lastName: tenantData.lastname || tenantData.name?.split(' ')[1] || `Smith${i}`,
                    email: tenantData.email || `${tenantData.firstname}.${tenantData.lastname}@example.com`.toLowerCase(),
                    phone: tenantData.phone || '',
                    propertyId: property ? property.id : 1,
                    propertyName: property ? property.name : 'Unknown Property',
                    unit: tenantData.unit || '',
                    monthlyRent: parseFloat(tenantData.monthlyrent) || parseFloat(tenantData.rent) || 1000,
                    leaseStart: tenantData.leasestart ? new Date(tenantData.leasestart).toISOString() : new Date().toISOString(),
                    leaseEnd: tenantData.leaseend ? new Date(tenantData.leaseend).toISOString() : new Date(Date.now() + 365 * 86400000).toISOString(),
                    status: tenantData.status || 'active',
                    paymentStatus: tenantData.paymentstatus || 'pending',
                    notes: tenantData.notes || '',
                    emergencyContact: tenantData.emergencycontact || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                importedTenants.push(tenant);
                
                // Add to tenants
                this.tenants.push({
                    ...tenant,
                    id: this.tenants.length > 0 ? Math.max(...this.tenants.map(t => t.id)) + 1 : 1
                });
            }
            
            // Save tenants
            this.saveTenants();
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'success',
                title: 'Tenants Imported',
                message: `Successfully imported ${importedTenants.length} tenants`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return importedTenants;
        } catch (error) {
            console.error('Error importing tenants from CSV:', error);
            throw error;
        }
    }

    // Refresh tenants data
    async refreshTenants() {
        await this.loadTenants();
        await this.calculateStats();
        return {
            tenants: this.tenants,
            stats: this.stats,
            properties: this.properties
        };
    }
}

// Export the backend class
export { TenantsBackend };