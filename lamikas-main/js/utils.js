/**
 * Enhanced Utility Functions with Beautiful UI Components
 */

class Utils {
    // Keep all existing static methods
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
    }

    static formatDate(date, format = 'MM/DD/YYYY') {
        const d = new Date(date);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        
        switch (format) {
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            case 'DD MMM YYYY':
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return `${day} ${months[d.getMonth()]} ${year}`;
            default:
                return d.toLocaleDateString();
        }
    }

    static validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // NEW: Enhanced UI Components

    static showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };

        const colors = {
            'success': 'bg-green-500',
            'error': 'bg-red-500',
            'warning': 'bg-yellow-500',
            'info': 'bg-blue-500'
        };

        notification.innerHTML = `
            <div class="flex items-center justify-between p-4 rounded-lg shadow-lg ${colors[type]} text-white">
                <div class="flex items-center">
                    <i class="fas ${icons[type]} text-xl mr-3"></i>
                    <span>${this.escapeHtml(message)}</span>
                </div>
                <button class="ml-4 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        container.appendChild(notification);

        // Show animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Close button
        notification.querySelector('button').onclick = () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        };

        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    static showModal(options = {}) {
        const {
            title = 'Modal',
            content = '',
            size = 'md',
            showClose = true,
            buttons = [],
            onClose = null,
            className = ''
        } = options;

        // Remove existing modals
        this.closeAllModals();

        const modalId = 'modal-' + Date.now();
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.id = modalId;

        const sizeClasses = {
            'sm': 'max-w-md',
            'md': 'max-w-2xl',
            'lg': 'max-w-4xl',
            'xl': 'max-w-6xl'
        };

        modalOverlay.innerHTML = `
            <div class="modal-container ${sizeClasses[size]} ${className}">
                <div class="modal-header">
                    <h2 class="text-xl font-bold text-gray-900">${this.escapeHtml(title)}</h2>
                    ${showClose ? `
                        <button class="modal-close-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttons.map(btn => `
                            <button 
                                class="${btn.className || 'btn-secondary'}"
                                ${btn.id ? `id="${btn.id}"` : ''}
                                ${btn.onClick ? `onclick="${btn.onClick}"` : ''}
                                ${btn.disabled ? 'disabled' : ''}
                            >
                                ${btn.icon ? `<i class="${btn.icon} mr-2"></i>` : ''}
                                ${this.escapeHtml(btn.text)}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Show animation
        setTimeout(() => modalOverlay.style.opacity = '1', 10);

        // Close button
        const closeBtn = modalOverlay.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                this.closeModal(modalId);
                if (onClose) onClose();
            };
        }

        // Backdrop click
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) {
                this.closeModal(modalId);
                if (onClose) onClose();
            }
        };

        // Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modalId);
                if (onClose) onClose();
            }
        };
        document.addEventListener('keydown', escapeHandler);

        return modalId;
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        }
    }

    static closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });
    }

    static showConfirmation(options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Are you sure?',
                message = 'This action cannot be undone.',
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                confirmColor = 'red'
            } = options;

            const modalId = this.showModal({
                title: title,
                content: `
                    <div class="text-center py-6">
                        <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-${confirmColor}-100 text-${confirmColor}-600 mb-4">
                            <i class="fas fa-exclamation-triangle text-2xl"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">${this.escapeHtml(title)}</h3>
                        <p class="text-gray-600">${this.escapeHtml(message)}</p>
                    </div>
                `,
                size: 'sm',
                buttons: [
                    {
                        text: cancelText,
                        className: 'btn-secondary',
                        onClick: `Utils.closeModal('${modalId}'); resolve(false)`
                    },
                    {
                        text: confirmText,
                        className: `btn-${confirmColor}`,
                        onClick: `Utils.closeModal('${modalId}'); resolve(true)`
                    }
                ],
                onClose: () => resolve(false)
            });
        });
    }

    static showLoading(message = 'Loading...') {
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = loadingId;
        loadingDiv.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center';
        loadingDiv.innerHTML = `
            <div class="bg-white rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl">
                <div class="flex flex-col items-center">
                    <div class="relative">
                        <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-8 h-8 bg-blue-600 rounded-full"></div>
                        </div>
                    </div>
                    <p class="mt-6 text-gray-700 font-medium">${this.escapeHtml(message)}</p>
                </div>
            </div>
        `;
        document.body.appendChild(loadingDiv);
        return loadingId;
    }

    static hideLoading(loadingId) {
        const loading = document.getElementById(loadingId);
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => loading.remove(), 300);
        }
    }

    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-[9999] transform transition-all duration-300 translate-x-full`;
        
        const colors = {
            'success': 'bg-green-500 border-green-600',
            'error': 'bg-red-500 border-red-600',
            'warning': 'bg-yellow-500 border-yellow-600',
            'info': 'bg-blue-500 border-blue-600'
        };

        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };

        toast.innerHTML = `
            <div class="${colors[type]} text-white px-6 py-4 rounded-lg shadow-xl border-l-4 flex items-center">
                <i class="fas ${icons[type]} text-xl mr-3"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        }, 10);

        // Auto remove
        setTimeout(() => {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.classList.remove('translate-x-0');
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        });
    }
}

// Export utility class
export { Utils };