/**
 * Properties Backend - Business Logic and Data Processing
 * All calculations, data processing, and business logic for properties
 */

class PropertiesBackend {
    constructor() {
        this.properties = [];
        this.stats = null;
        this.nextId = 1;
    }

    // Initialize properties data
    async initialize() {
        await this.loadProperties();
        await this.calculateStats();
        return this;
    }

    // Load all properties from localStorage
    async loadProperties() {
        try {
            const savedProperties = localStorage.getItem('properties');
            if (savedProperties) {
                this.properties = JSON.parse(savedProperties);
                // Find the highest ID for nextId
                this.nextId = this.properties.reduce((maxId, property) => {
                    return Math.max(maxId, property.id || 0);
                }, 0) + 1;
            } else {
                this.properties = this.getDefaultProperties();
                this.nextId = this.properties.length + 1;
                this.saveProperties();
            }
            return this.properties;
        } catch (error) {
            console.error('Error loading properties:', error);
            this.properties = this.getDefaultProperties();
            this.nextId = this.properties.length + 1;
            return this.properties;
        }
    }

    // Get default properties if none exist
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
            },
            {
                id: 4,
                name: "Tokyo Office",
                lat: 35.6762,
                lng: 139.6503,
                color: "#9B5DE5",
                units: 8,
                monthlyIncome: 9600,
                occupancy: 75,
                status: 'active',
                type: 'commercial',
                address: "101 Shinjuku, Tokyo, Japan",
                addedDate: new Date(Date.now() - 345600000).toISOString(),
                description: "Commercial office space in Tokyo"
            }
        ];
    }

    // Calculate property statistics
    async calculateStats() {
        const properties = this.properties;
        
        // Calculate total properties
        const totalProperties = properties.length;
        
        // Calculate total units
        const totalUnits = properties.reduce((sum, property) => {
            return sum + (property.units || 1);
        }, 0);
        
        // Calculate occupied units
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
        
        // Calculate property type distribution
        const propertyTypes = this.calculatePropertyTypeDistribution();
        
        // Calculate geographic distribution
        const geographicDistribution = this.calculateGeographicDistribution();
        
        this.stats = {
            totalProperties,
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            monthlyIncome,
            outstandingBalance,
            overdueTenants,
            propertiesAddedThisMonth,
            incomeGrowth,
            occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
            propertyTypes,
            geographicDistribution
        };
        
        return this.stats;
    }

    // Calculate property type distribution
    calculatePropertyTypeDistribution() {
        const properties = this.properties;
        const typeCounts = {};
        
        properties.forEach(property => {
            const type = property.type || 'apartment';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        // Convert to array format for charts
        return Object.entries(typeCounts).map(([type, count]) => ({
            type: this.formatPropertyType(type),
            count,
            percentage: Math.round((count / properties.length) * 100)
        }));
    }

    // Format property type for display
    formatPropertyType(type) {
        const typeMap = {
            'apartment': 'Apartment Building',
            'house': 'Single Family House',
            'condo': 'Condominium',
            'commercial': 'Commercial Property',
            'vacation': 'Vacation Rental'
        };
        return typeMap[type] || type;
    }

    // Calculate geographic distribution
    calculateGeographicDistribution() {
        const properties = this.properties;
        const regions = {};
        
        properties.forEach(property => {
            // Simple region detection based on coordinates
            let region = 'Other';
            const lat = property.lat;
            const lng = property.lng;
            
            if (lat >= 24 && lat <= 50 && lng >= -130 && lng <= -60) {
                region = 'North America';
            } else if (lat >= 35 && lat <= 60 && lng >= -10 && lng <= 40) {
                region = 'Europe';
            } else if (lat >= 20 && lat <= 50 && lng >= 120 && lng <= 150) {
                region = 'East Asia';
            } else if (lat >= -35 && lat <= 0 && lng >= 110 && lng <= 155) {
                region = 'Australia';
            }
            
            regions[region] = (regions[region] || 0) + 1;
        });
        
        // Convert to array format for charts
        return Object.entries(regions).map(([region, count]) => ({
            region,
            count,
            percentage: Math.round((count / properties.length) * 100)
        }));
    }

    // Add new property
    async addProperty(propertyData) {
        try {
            const newProperty = {
                id: this.nextId++,
                name: propertyData.name,
                lat: propertyData.lat,
                lng: propertyData.lng,
                type: propertyData.type || 'apartment',
                units: propertyData.units || 1,
                monthlyIncome: propertyData.monthlyRent * (propertyData.units || 1),
                occupancy: Math.floor(Math.random() * 30) + 70, // Random 70-100%
                status: 'active',
                address: propertyData.address || '',
                description: propertyData.description || '',
                addedDate: new Date().toISOString(),
                color: this.getPropertyColor(propertyData.type)
            };
            
            this.properties.push(newProperty);
            this.saveProperties();
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'success',
                title: 'Property Added',
                message: `Added "${propertyData.name}" with ${propertyData.units || 1} unit(s)`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return newProperty;
        } catch (error) {
            console.error('Error adding property:', error);
            throw error;
        }
    }

    // Get property color based on type
    getPropertyColor(type) {
        const colors = {
            'apartment': '#4ECDC4',
            'house': '#FFD93D',
            'condo': '#9B5DE5',
            'commercial': '#00BBF9',
            'vacation': '#FF8E53'
        };
        return colors[type] || '#999999';
    }

    // Update existing property
    async updateProperty(propertyId, updates) {
        try {
            const propertyIndex = this.properties.findIndex(p => p.id === propertyId);
            if (propertyIndex === -1) {
                throw new Error('Property not found');
            }
            
            // Update property
            this.properties[propertyIndex] = {
                ...this.properties[propertyIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Recalculate monthly income if units or rent changed
            if (updates.units || updates.monthlyIncome) {
                // Keep the monthly income as provided, or calculate based on rent per unit
                // (logic depends on your data structure)
            }
            
            // Save to storage
            this.saveProperties();
            
            // Recalculate stats
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'info',
                title: 'Property Updated',
                message: `Updated "${this.properties[propertyIndex].name}"`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return this.properties[propertyIndex];
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    }

    // Delete property
    async deleteProperty(propertyId) {
        try {
            const propertyIndex = this.properties.findIndex(p => p.id === propertyId);
            if (propertyIndex === -1) {
                throw new Error('Property not found');
            }
            
            const propertyName = this.properties[propertyIndex].name;
            
            // Remove property
            this.properties.splice(propertyIndex, 1);
            this.saveProperties();
            
            // Recalculate stats
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'warning',
                title: 'Property Deleted',
                message: `Deleted "${propertyName}" from your portfolio`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return true;
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }

    // Search properties
    async searchProperties(query) {
        if (!query || query.trim() === '') {
            return this.properties;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        return this.properties.filter(property => {
            return (
                property.name.toLowerCase().includes(searchTerm) ||
                (property.type && property.type.toLowerCase().includes(searchTerm)) ||
                (property.address && property.address.toLowerCase().includes(searchTerm)) ||
                (property.description && property.description.toLowerCase().includes(searchTerm))
            );
        });
    }

    // Get property by ID
    getPropertyById(id) {
        return this.properties.find(property => property.id === id);
    }

    // Export properties to CSV
    exportPropertiesToCSV() {
        if (this.properties.length === 0) {
            return '';
        }
        
        const headers = ['Name', 'Type', 'Units', 'Occupancy', 'Monthly Income', 'Address', 'Status', 'Added Date'];
        
        const csvRows = this.properties.map(property => [
            property.name,
            this.formatPropertyType(property.type),
            property.units || 0,
            `${property.occupancy || 0}%`,
            `$${(property.monthlyIncome || 0).toLocaleString()}`,
            property.address || 'N/A',
            property.status || 'active',
            new Date(property.addedDate || Date.now()).toLocaleDateString()
        ]);
        
        // Generate CSV content
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    // Export properties to JSON
    exportPropertiesToJSON() {
        return JSON.stringify({
            properties: this.properties,
            stats: this.stats,
            exportDate: new Date().toISOString(),
            totalCount: this.properties.length
        }, null, 2);
    }

    // Get property analytics
    getPropertyAnalytics() {
        const analytics = {
            totalProperties: this.properties.length,
            totalUnits: this.stats?.totalUnits || 0,
            totalMonthlyIncome: this.stats?.monthlyIncome || 0,
            averageOccupancy: this.stats?.occupancyRate || 0,
            topPerformingProperty: null,
            lowestOccupancyProperty: null
        };
        
        if (this.properties.length > 0) {
            // Find top performing property (highest income per unit)
            analytics.topPerformingProperty = this.properties.reduce((top, property) => {
                const incomePerUnit = (property.monthlyIncome || 0) / (property.units || 1);
                const topIncomePerUnit = (top.monthlyIncome || 0) / (top.units || 1);
                return incomePerUnit > topIncomePerUnit ? property : top;
            }, this.properties[0]);
            
            // Find property with lowest occupancy
            analytics.lowestOccupancyProperty = this.properties.reduce((lowest, property) => {
                return (property.occupancy || 0) < (lowest.occupancy || 0) ? property : lowest;
            }, this.properties[0]);
        }
        
        return analytics;
    }

    // Save properties to localStorage
    saveProperties() {
        try {
            localStorage.setItem('properties', JSON.stringify(this.properties));
        } catch (error) {
            console.error('Error saving properties:', error);
        }
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

    // Refresh properties data
    async refreshProperties() {
        await this.loadProperties();
        await this.calculateStats();
        return {
            properties: this.properties,
            stats: this.stats
        };
    }

    // Validate property data
    validatePropertyData(propertyData) {
        const errors = [];
        
        if (!propertyData.name || propertyData.name.trim() === '') {
            errors.push('Property name is required');
        }
        
        if (!propertyData.lat || !propertyData.lng) {
            errors.push('Property location is required');
        }
        
        if (propertyData.units && (propertyData.units < 1 || propertyData.units > 1000)) {
            errors.push('Number of units must be between 1 and 1000');
        }
        
        if (propertyData.monthlyRent && propertyData.monthlyRent < 0) {
            errors.push('Monthly rent cannot be negative');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Get property statistics for charts
    getPropertyChartData() {
        const typeDistribution = this.calculatePropertyTypeDistribution();
        const geoDistribution = this.calculateGeographicDistribution();
        
        return {
            typeDistribution: {
                labels: typeDistribution.map(item => item.type),
                data: typeDistribution.map(item => item.count),
                colors: ['#FF8E53', '#4ECDC4', '#FFD93D', '#9B5DE5', '#00BBF9']
            },
            geoDistribution: {
                labels: geoDistribution.map(item => item.region),
                data: geoDistribution.map(item => item.count),
                colors: ['#FF8E53', '#4ECDC4', '#FFD93D', '#9B5DE5']
            }
        };
    }

    // Import properties from CSV
    async importPropertiesFromCSV(csvContent) {
        try {
            const rows = csvContent.split('\n').filter(row => row.trim() !== '');
            if (rows.length < 2) {
                throw new Error('CSV file is empty or has no data');
            }
            
            const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const importedProperties = [];
            
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const propertyData = {};
                
                headers.forEach((header, index) => {
                    propertyData[header.toLowerCase()] = values[index] || '';
                });
                
                // Convert property data to proper format
                const property = {
                    id: this.nextId++,
                    name: propertyData.name || `Imported Property ${i}`,
                    lat: parseFloat(propertyData.lat) || 0,
                    lng: parseFloat(propertyData.lng) || 0,
                    type: propertyData.type || 'apartment',
                    units: parseInt(propertyData.units) || 1,
                    monthlyIncome: parseFloat(propertyData.monthlyincome) || 0,
                    occupancy: parseInt(propertyData.occupancy) || Math.floor(Math.random() * 30) + 70,
                    status: propertyData.status || 'active',
                    address: propertyData.address || '',
                    description: propertyData.description || '',
                    addedDate: new Date().toISOString(),
                    color: this.getPropertyColor(propertyData.type || 'apartment')
                };
                
                importedProperties.push(property);
                this.properties.push(property);
            }
            
            // Save all properties
            this.saveProperties();
            
            // Recalculate stats
            await this.calculateStats();
            
            // Add notification
            this.addNotification({
                type: 'success',
                title: 'Properties Imported',
                message: `Successfully imported ${importedProperties.length} properties`,
                timestamp: new Date().toISOString(),
                read: false
            });
            
            return importedProperties;
        } catch (error) {
            console.error('Error importing properties from CSV:', error);
            throw error;
        }
    }
}

// Export the backend class
export { PropertiesBackend };