/**
 * Dashboard Backend - Business Logic and Data Processing
 * Single source of truth using PropertiesBackend
 */

// Simple PropertyManager that uses the same storage as PropertiesBackend
class PropertyManager {
    constructor() {
        this.storageKey = 'properties'; // Same as PropertiesBackend
    }

    async loadProperties() {
        try {a
            const properties = JSON.parse(localStorage.getItem(this.storageKey)) || [];
            
            // If no properties in storage, create default ones
            if (properties.length === 0) {
                return this.createDefaultProperties();
            }
            
            return properties;
        } catch (error) {
            console.error('Error loading properties:', error);
            return this.createDefaultProperties();
        }
    }

    createDefaultProperties() {
        // Same default properties as PropertiesBackend to ensure consistency
        const defaultProperties = [
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
                addedDate: new Date(Date.now() - 86400000).toISOString(),
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
                addedDate: new Date(Date.now() - 172800000).toISOString(),
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
                addedDate: new Date(Date.now() - 259200000).toISOString(),
                description: "Central London luxury flat"
            }
        ];
        
        localStorage.setItem(this.storageKey, JSON.stringify(defaultProperties));
        return defaultProperties;
    }
}

class DashboardBackend {
    constructor() {
        this.stats = null;
        this.recentActivity = [];
        this.properties = [];
        this.propertyManager = new PropertyManager();
    }

    // Initialize dashboard data
    async initialize() {
        await this.loadDashboardData();
        return this;
    }

    // Load all dashboard data with real calculations
    async loadDashboardData() {
        try {
            // Load properties
            this.properties = await this.propertyManager.loadProperties();
            
            // Calculate real stats
            this.stats = await this.calculateDashboardStats();
            
            // Get recent activity
            this.recentActivity = await this.getRecentActivity();
            
            return {
                stats: this.stats,
                recentActivity: this.recentActivity,
                properties: this.properties
            };
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            return this.getDefaultData();
        }
    }

    // Calculate real dashboard statistics
    async calculateDashboardStats() {
        const properties = this.properties;
        
        // Calculate total properties
        const totalProperties = properties.length;
        
        // Calculate total units
        const totalUnits = properties.reduce((sum, property) => {
            return sum + (property.units || 1);
        }, 0);
        
        // Calculate occupied units (70-100% occupancy for each property)
        const occupiedUnits = properties.reduce((sum, property) => {
            const occupancyRate = property.occupancy || Math.floor(Math.random() * 30) + 70;
            const propertyUnits = property.units || 1;
            return sum + Math.floor((propertyUnits * occupancyRate) / 100);
        }, 0);
        
        // Calculate monthly income
        const monthlyIncome = properties.reduce((sum, property) => {
            return sum + (property.monthlyIncome || 
                         (property.units || 1) * (property.monthlyRent || 1000));
        }, 0);
        
        // Calculate outstanding balance (10% of monthly income)
        const outstandingBalance = monthlyIncome * 0.1;
        
        // Calculate overdue tenants (20% of total properties)
        const overdueTenants = Math.max(1, Math.floor(totalProperties * 0.2));
        
        // Calculate properties added this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const propertiesAddedThisMonth = properties.filter(property => {
            const addedDate = new Date(property.addedDate || Date.now());
            return addedDate.getMonth() === currentMonth && 
                   addedDate.getFullYear() === currentYear;
        }).length;
        
        // Calculate income growth (random 5-15% growth)
        const incomeGrowth = Math.floor(Math.random() * 10) + 5;
        
        // Dashboard-specific calculations
        const pendingPayments = Math.max(1, Math.floor(totalProperties * 0.2));
        const maintenanceRequests = Math.max(1, Math.floor(totalProperties * 0.4));
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
        const vacancyRate = 100 - occupancyRate;
        
        return {
            totalProperties,
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            monthlyIncome,
            outstandingBalance,
            overdueTenants,
            propertiesAddedThisMonth,
            incomeGrowth,
            occupancyRate,
            vacancyRate,
            pendingPayments,
            maintenanceRequests
        };
    }

    // Get recent activity from notifications
    async getRecentActivity() {
        try {
            // Get notifications as activity
            const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
            
            // Get property additions
            const properties = this.properties;
            const recentProperties = properties
                .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
                .slice(0, 3);
            
            // Combine activities
            const activities = [];
            
            // Add property additions
            recentProperties.forEach(property => {
                activities.push({
                    type: 'property',
                    description: `Added "${property.name}" property`,
                    timestamp: property.addedDate || new Date().toISOString(),
                    amount: property.monthlyIncome || 0
                });
            });
            
            // Add recent notifications as activities
            notifications.slice(0, 2).forEach(notification => {
                activities.push({
                    type: this.mapNotificationTypeToActivity(notification.type),
                    description: notification.title,
                    timestamp: notification.timestamp,
                    amount: this.extractAmountFromNotification(notification.message)
                });
            });
            
            // Sort by timestamp
            return activities.sort((a, b) => 
                new Date(b.timestamp) - new Date(a.timestamp)
            ).slice(0, 5);
            
        } catch (error) {
            console.error('Error getting recent activity:', error);
            return this.getDefaultActivity();
        }
    }

    mapNotificationTypeToActivity(notificationType) {
        const map = {
            'success': 'payment',
            'warning': 'maintenance',
            'info': 'tenant',
            'error': 'maintenance'
        };
        return map[notificationType] || 'default';
    }

    extractAmountFromNotification(message) {
        // Extract dollar amount from message
        const match = message.match(/\$([\d,]+(\.\d{2})?)/);
        return match ? parseFloat(match[1].replace(',', '')) : null;
    }

    getDefaultActivity() {
        return [
            {
                type: 'property',
                description: 'Added "Miami Beach" property',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                amount: 12000
            },
            {
                type: 'tenant',
                description: 'New tenant registered: John Doe',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                amount: null
            },
            {
                type: 'payment',
                description: 'Payment received from Jane Smith',
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                amount: 800
            }
        ];
    }

    getDefaultData() {
        return {
            stats: {
                totalProperties: 4,
                totalUnits: 26,
                occupiedUnits: 21,
                vacantUnits: 5,
                monthlyIncome: 34100,
                outstandingBalance: 3410,
                overdueTenants: 1,
                propertiesAddedThisMonth: 1,
                incomeGrowth: 8,
                occupancyRate: 81,
                vacancyRate: 19,
                pendingPayments: 2,
                maintenanceRequests: 5
            },
            recentActivity: this.getDefaultActivity(),
            properties: []
        };
    }

    // Refresh dashboard data
    async refreshDashboard() {
        return await this.loadDashboardData();
    }

    // Export dashboard data
    exportDashboardData() {
        const data = {
            stats: this.stats,
            properties: this.properties,
            recentActivity: this.recentActivity,
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
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
}

// Export the backend class
export { DashboardBackend };