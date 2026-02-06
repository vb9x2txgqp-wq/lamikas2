import { authManager } from './auth.js';

class PlanLimits {
    constructor() {
        this.userProfile = null;
        this.init();
    }

    init() {
        this.userProfile = authManager.getUserProfile();
        return this.userProfile !== null;
    }

    getPlanLimit() {
        if (!this.userProfile) return 5;
        
        const planLimits = {
            'starter': 5,
            'essential': 20,
            'professional': 50,
            'business': 100
        };
        
        return planLimits[this.userProfile.plan_type] || 5;
    }

    async getTotalUnits() {
        try {
            const response = await fetch('/.netlify/functions/properties?limit=1000', {
                headers: {
                    'Authorization': `Bearer ${authManager.getToken()}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': authManager.getCSRFToken()
                }
            });
            
            if (response.ok) {
                const properties = await response.json();
                return properties?.reduce((total, prop) => total + (prop.total_units || 0), 0) || 0;
            }
        } catch (error) {
            console.error('Error getting total units:', error);
        }
        return 0;
    }

    async getPlanUsage() {
        if (!this.init()) return null;
        
        const totalUnits = await this.getTotalUnits();
        const maxUnits = this.getPlanLimit();
        
        return {
            units: {
                current: totalUnits,
                max: maxUnits,
                remaining: Math.max(0, maxUnits - totalUnits),
                percentage: maxUnits > 0 ? Math.min(100, (totalUnits / maxUnits) * 100) : 0
            },
            plan: this.getPlanInfo()
        };
    }

    getPlanInfo() {
        if (!this.userProfile) {
            return { name: 'Starter Plan', max_units: 5 };
        }
        
        const plans = {
            'starter': { name: 'Starter Plan', max_units: 5 },
            'essential': { name: 'Essential Plan', max_units: 20 },
            'professional': { name: 'Professional Plan', max_units: 50 },
            'business': { name: 'Business Plan', max_units: 100 }
        };
        
        return plans[this.userProfile.plan_type] || plans.starter;
    }

    showWarning(message, type = 'units') {
        if (window.Utils) {
            window.Utils.showNotification(message, 'warning');
        } else {
            alert(message);
        }
    }

    async updateUI() {
        if (!this.init()) return;
        
        const usage = await this.getPlanUsage();
        if (!usage) return;
        
        // Update progress bar in sidebar
        const unitsElement = document.getElementById('planUsageUnits');
        const progressElement = document.getElementById('planProgressUnits');
        const remainingText = document.getElementById('unitsRemainingText');
        const planName = document.getElementById('planName');
        
        if (unitsElement) unitsElement.textContent = `${usage.units.current}/${usage.units.max}`;
        if (progressElement) progressElement.style.width = `${usage.units.percentage}%`;
        if (remainingText) remainingText.textContent = `${usage.units.remaining} units remaining`;
        if (planName) planName.textContent = usage.plan.name;
        
        // Show warning if nearing limit (but don't block - real blocking is on backend)
        if (usage.units.remaining <= 2 && usage.units.remaining > 0) {
            this.showWarning(`Only ${usage.units.remaining} unit${usage.units.remaining === 1 ? '' : 's'} remaining in your ${usage.plan.name}`);
        }
    }

    handleBackendError(errorData) {
        if (errorData.error && errorData.error.includes('exceed your plan limit')) {
            // Show upgrade modal when backend rejects due to limit
            if (window.upgradePlanManager) {
                window.upgradePlanManager.showModal();
                window.upgradePlanManager.displayLimitWarning(
                    'Plan Limit Reached',
                    `You've reached your plan limit. Upgrade to add more units.`
                );
            }
            return true;
        }
        return false;
    }

    // Client-side pre-check (for UX only - real check is on backend)
    async canAddProperty(units = 1) {
        try {
            const usage = await this.getPlanUsage();
            if (!usage) return { canAdd: false, reason: 'Unable to check plan limits' };
            
            const canAddByUnitCount = (usage.units.current + units) <= usage.units.max;
            
            return {
                canAdd: canAddByUnitCount,
                limits: { max_units: usage.units.max },
                usage: { totalUnits: usage.units.current },
                remainingUnits: usage.units.remaining
            };
        } catch (error) {
            console.error('Error checking property limits:', error);
            return { canAdd: false, reason: 'Error checking limits' };
        }
    }
}

const planLimits = new PlanLimits();
window.planLimits = planLimits;

export { planLimits };
