/**
 * G&L Systems - Demo Utilities
 * Shared functionality for all demo pages
 */

// Demo namespace
window.GLDemos = {
    charts: {},
    notifications: [],
    initialized: false
};

// Initialize demo utilities
GLDemos.init = function() {
    if (this.initialized) return;
    
    this.setupNotifications();
    this.setupChartDefaults();
    this.setupExportUtilities();
    this.setupDataValidation();
    this.setupLocalStorage();
    
    this.initialized = true;
    console.log('GL Demos utilities initialized');
};

// Notification system
GLDemos.setupNotifications = function() {
    // Create notification container if it doesn't exist
    if (!document.querySelector('.notification-container')) {
        const container = document.createElement('div');
        container.className = 'notification-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
};

// Show notification (enhanced version)
GLDemos.showNotification = function(message, type = 'info', duration = 5000, options = {}) {
    const container = document.querySelector('.notification-container');
    if (!container) return;
    
    const id = 'notification_' + Date.now();
    const alertClass = {
        'success': 'alert-success',
        'error': 'alert-danger',
        'warning': 'alert-warning',
        'info': 'alert-info',
        'primary': 'alert-primary'
    }[type] || 'alert-info';
    
    const icon = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-triangle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle',
        'primary': 'fas fa-bell'
    }[type] || 'fas fa-info-circle';
    
    const alert = document.createElement('div');
    alert.id = id;
    alert.className = `alert ${alertClass} alert-dismissible fade show shadow-sm`;
    alert.style.cssText = `
        min-width: 300px;
        margin-bottom: 10px;
        border: none;
        border-radius: 10px;
    `;
    
    alert.innerHTML = `
        <i class="${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    container.appendChild(alert);
    
    // Add to notifications array
    this.notifications.push({
        id: id,
        message: message,
        type: type,
        timestamp: new Date()
    });
    
    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        }, duration);
    }
    
    // Sound notification (if enabled)
    if (options.sound) {
        this.playNotificationSound(type);
    }
    
    return id;
};

// Play notification sound
GLDemos.playNotificationSound = function(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequency = {
        'success': 800,
        'error': 400,
        'warning': 600,
        'info': 500
    }[type] || 500;
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
};

// Chart defaults and utilities
GLDemos.setupChartDefaults = function() {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#495057';
        Chart.defaults.borderColor = '#dee2e6';
        Chart.defaults.backgroundColor = 'rgba(0, 123, 255, 0.1)';
        
        // Responsive defaults
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Animation defaults
        Chart.defaults.animation.duration = 750;
        Chart.defaults.animation.easing = 'easeOutQuart';
    }
};

// Create chart with common settings
GLDemos.createChart = function(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas with ID '${canvasId}' not found`);
        return null;
    }
    
    // Destroy existing chart if it exists
    if (this.charts[canvasId]) {
        this.charts[canvasId].destroy();
    }
    
    // Apply common options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#007bff',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false
            }
        }
    };
    
    // Merge configurations
    config.options = this.deepMerge(defaultOptions, config.options || {});
    
    // Create chart
    try {
        this.charts[canvasId] = new Chart(canvas, config);
        return this.charts[canvasId];
    } catch (error) {
        console.error('Error creating chart:', error);
        this.showNotification('Erro ao criar gráfico', 'error');
        return null;
    }
};

// Deep merge utility
GLDemos.deepMerge = function(target, source) {
    const output = Object.assign({}, target);
    if (this.isObject(target) && this.isObject(source)) {
        Object.keys(source).forEach(key => {
            if (this.isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = this.deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
};

// Check if object
GLDemos.isObject = function(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
};

// Export utilities
GLDemos.setupExportUtilities = function() {
    // Common export functions
    this.exportCSV = function(data, filename) {
        if (!Array.isArray(data) || data.length === 0) {
            this.showNotification('Nenhum dado para exportar', 'warning');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            }).join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, filename || 'dados.csv', 'text/csv;charset=utf-8;');
        this.showNotification('Arquivo CSV exportado com sucesso!', 'success');
    };
    
    this.exportJSON = function(data, filename) {
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename || 'dados.json', 'application/json');
        this.showNotification('Arquivo JSON exportado com sucesso!', 'success');
    };
    
    this.exportChart = function(chartId, filename) {
        const chart = this.charts[chartId];
        if (!chart) {
            this.showNotification('Gráfico não encontrado', 'error');
            return;
        }
        
        const canvas = chart.canvas;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = filename || 'grafico.png';
        link.href = url;
        link.click();
        
        this.showNotification('Gráfico exportado como imagem!', 'success');
    };
};

// Download file utility
GLDemos.downloadFile = function(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Data validation utilities
GLDemos.setupDataValidation = function() {
    this.validators = {
        email: function(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },
        
        phone: function(phone) {
            const cleaned = phone.replace(/\D/g, '');
            return cleaned.length >= 10 && cleaned.length <= 11;
        },
        
        cpf: function(cpf) {
            const cleaned = cpf.replace(/\D/g, '');
            if (cleaned.length !== 11) return false;
            
            // Check for known invalid CPFs
            if (/^(\d)\1{10}$/.test(cleaned)) return false;
            
            // Validate check digits
            let sum = 0;
            for (let i = 0; i < 9; i++) {
                sum += parseInt(cleaned.charAt(i)) * (10 - i);
            }
            let checkDigit = 11 - (sum % 11);
            if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
            if (checkDigit !== parseInt(cleaned.charAt(9))) return false;
            
            sum = 0;
            for (let i = 0; i < 10; i++) {
                sum += parseInt(cleaned.charAt(i)) * (11 - i);
            }
            checkDigit = 11 - (sum % 11);
            if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
            return checkDigit === parseInt(cleaned.charAt(10));
        },
        
        cnpj: function(cnpj) {
            const cleaned = cnpj.replace(/\D/g, '');
            if (cleaned.length !== 14) return false;
            
            // Check for known invalid CNPJs
            if (/^(\d)\1{13}$/.test(cleaned)) return false;
            
            // Validate check digits
            const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
            const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
            
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += parseInt(cleaned.charAt(i)) * weights1[i];
            }
            let checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
            if (checkDigit !== parseInt(cleaned.charAt(12))) return false;
            
            sum = 0;
            for (let i = 0; i < 13; i++) {
                sum += parseInt(cleaned.charAt(i)) * weights2[i];
            }
            checkDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
            return checkDigit === parseInt(cleaned.charAt(13));
        },
        
        currency: function(value) {
            return !isNaN(parseFloat(value)) && parseFloat(value) >= 0;
        },
        
        date: function(date) {
            const parsed = new Date(date);
            return !isNaN(parsed.getTime());
        }
    };
};

// Format utilities
GLDemos.formatters = {
    currency: function(value, locale = 'pt-BR', currency = 'BRL') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(value);
    },
    
    number: function(value, decimals = 2) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    },
    
    date: function(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        return new Intl.DateTimeFormat('pt-BR', { ...defaultOptions, ...options }).format(new Date(date));
    },
    
    time: function(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },
    
    phone: function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    cpf: function(cpf) {
        const cleaned = cpf.replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },
    
    cnpj: function(cnpj) {
        const cleaned = cnpj.replace(/\D/g, '');
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
};

// Local storage utilities
GLDemos.setupLocalStorage = function() {
    this.storage = {
        set: function(key, value) {
            try {
                localStorage.setItem(`gl_demo_${key}`, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },
        
        get: function(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`gl_demo_${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(`gl_demo_${key}`);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        },
        
        clear: function() {
            try {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('gl_demo_')) {
                        localStorage.removeItem(key);
                    }
                });
                return true;
            } catch (error) {
                console.error('Error clearing localStorage:', error);
                return false;
            }
        }
    };
};

// Table utilities
GLDemos.table = {
    sort: function(tableId, columnIndex, dataType = 'string') {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            switch (dataType) {
                case 'number':
                    return parseFloat(aValue) - parseFloat(bValue);
                case 'date':
                    return new Date(aValue) - new Date(bValue);
                case 'currency':
                    const aNum = parseFloat(aValue.replace(/[^\d,-]/g, '').replace(',', '.'));
                    const bNum = parseFloat(bValue.replace(/[^\d,-]/g, '').replace(',', '.'));
                    return aNum - bNum;
                default:
                    return aValue.localeCompare(bValue, 'pt-BR');
            }
        });
        
        rows.forEach(row => tbody.appendChild(row));
    },
    
    filter: function(tableId, searchTerm, columns = []) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const cells = Array.from(row.cells);
            const searchableCells = columns.length > 0 ? 
                columns.map(index => cells[index]).filter(cell => cell) : 
                cells;
            
            const match = searchableCells.some(cell => 
                cell.textContent.toLowerCase().includes(term)
            );
            
            row.style.display = match ? '' : 'none';
        });
    },
    
    export: function(tableId, filename) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const rows = Array.from(table.querySelectorAll('tr'));
        const data = rows.map(row => 
            Array.from(row.cells).map(cell => cell.textContent.trim())
        );
        
        const csvContent = data.map(row => row.join(',')).join('\n');
        GLDemos.downloadFile(csvContent, filename || 'tabela.csv', 'text/csv;charset=utf-8;');
    }
};

// Form utilities
GLDemos.form = {
    serialize: function(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },
    
    validate: function(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
                input.classList.add('is-valid');
            }
        });
        
        return isValid;
    },
    
    reset: function(formElement) {
        formElement.reset();
        formElement.classList.remove('was-validated');
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    GLDemos.init();
});

// Export for global use
window.GLDemos = GLDemos;
