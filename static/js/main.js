/**
 * G&L Systems - Main JavaScript File
 * Handles general website functionality, navigation, and common interactions
 */

// Global variables
let GL_Systems = {
    initialized: false,
    animations: true,
    debug: false
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    GL_Systems.init();
});

// Main initialization
GL_Systems.init = function() {
    if (this.initialized) return;
    
    this.setupNavigation();
    this.setupAnimations();
    this.setupFormValidations();
    this.setupTooltips();
    this.setupScrollEffects();
    this.setupLazyLoading();
    this.setupAccessibility();
    
    this.initialized = true;
    this.log('G&L Systems initialized successfully');
};

// Navigation functionality
GL_Systems.setupNavigation = function() {
    const navbar = document.querySelector('.navbar');
    const navToggler = document.querySelector('.navbar-toggler');
    const navCollapse = document.querySelector('.navbar-collapse');
    
    // Handle navbar transparency on scroll
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }
    
    // Auto-close mobile menu when clicking on links
    if (navCollapse) {
        navCollapse.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                const bsCollapse = new bootstrap.Collapse(navCollapse, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

// Animation setup
GL_Systems.setupAnimations = function() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.card, .feature-card, .solution-card').forEach(el => {
        observer.observe(el);
    });
    
    // Add hover effects to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
};

// Form validation setup
GL_Systems.setupFormValidations = function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
        
        // Real-time validation for inputs
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', function() {
                this.classList.add('was-validated');
            });
            
            input.addEventListener('input', function() {
                if (this.checkValidity()) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                }
            });
        });
    });
    
    // Email validation
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.addEventListener('blur', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
                this.setCustomValidity('Por favor, insira um e-mail válido');
            } else {
                this.setCustomValidity('');
            }
        });
    });
    
    // Phone validation (Brazilian format)
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length >= 10) {
                if (value.length === 11) {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                }
            }
            
            this.value = value;
        });
    });
};

// Tooltip setup
GL_Systems.setupTooltips = function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
};

// Scroll effects
GL_Systems.setupScrollEffects = function() {
    // Back to top button
    const backToTopBtn = this.createBackToTopButton();
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Progress bar for page scroll
    const progressBar = this.createProgressBar();
    
    window.addEventListener('scroll', function() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    });
};

// Create back to top button
GL_Systems.createBackToTopButton = function() {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.className = 'btn btn-primary btn-floating position-fixed';
    btn.style.cssText = `
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: none;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    btn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    document.body.appendChild(btn);
    return btn;
};

// Create progress bar
GL_Systems.createProgressBar = function() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background-color: rgba(0,123,255,0.1);
        z-index: 9999;
    `;
    
    const bar = document.createElement('div');
    bar.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #007bff, #0056b3);
        width: 0%;
        transition: width 0.3s ease;
    `;
    
    container.appendChild(bar);
    document.body.appendChild(container);
    return bar;
};

// Lazy loading setup
GL_Systems.setupLazyLoading = function() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
};

// Accessibility improvements
GL_Systems.setupAccessibility = function() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'sr-only sr-only-focusable btn btn-primary';
    skipLink.style.cssText = `
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 10000;
        padding: 8px 16px;
        text-decoration: none;
    `;
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main landmark if not present
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main';
    }
    
    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        // ESC key to close modals
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                const modalInstance = bootstrap.Modal.getInstance(openModal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }
        }
        
        // Tab navigation improvements
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
    
    // Focus management for dropdowns
    document.querySelectorAll('.dropdown-toggle').forEach(dropdown => {
        dropdown.addEventListener('shown.bs.dropdown', function() {
            const firstItem = this.nextElementSibling.querySelector('.dropdown-item');
            if (firstItem) {
                firstItem.focus();
            }
        });
    });
};

// Utility functions
GL_Systems.utils = {
    // Format currency (Brazilian Real)
    formatCurrency: function(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },
    
    // Format date (Brazilian format)
    formatDate: function(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    },
    
    // Format phone number (Brazilian format)
    formatPhone: function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        return phone;
    },
    
    // Generate random ID
    generateId: function(prefix = 'gl') {
        return prefix + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: function(func, limit) {
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
    },
    
    // Copy to clipboard
    copyToClipboard: function(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return Promise.resolve();
        }
    },
    
    // Download file
    downloadFile: function(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Logging function
GL_Systems.log = function(message, type = 'info') {
    if (this.debug) {
        console.log(`[G&L Systems ${type.toUpperCase()}]`, message);
    }
};

// Error handling
GL_Systems.handleError = function(error, context = 'Unknown') {
    this.log(`Error in ${context}: ${error.message}`, 'error');
    
    // Send error to monitoring service (if available)
    if (window.errorReporting) {
        window.errorReporting.captureException(error, { context });
    }
};

// Performance monitoring
GL_Systems.performance = {
    marks: {},
    
    mark: function(name) {
        this.marks[name] = performance.now();
    },
    
    measure: function(name, startMark) {
        const endTime = performance.now();
        const startTime = this.marks[startMark];
        if (startTime) {
            const duration = endTime - startTime;
            GL_Systems.log(`Performance ${name}: ${duration.toFixed(2)}ms`, 'performance');
            return duration;
        }
    }
};

// Contact form enhancement
GL_Systems.enhanceContactForm = function() {
    const contactForm = document.querySelector('#contactForm, form[action*="contato"]');
    if (!contactForm) return;
    
    // Add loading state
    contactForm.addEventListener('submit', function() {
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';
        }
    });
    
    // Auto-save form data
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Load saved data
        const savedValue = localStorage.getItem(`contact_${input.name}`);
        if (savedValue && !input.value) {
            input.value = savedValue;
        }
        
        // Save data on change
        input.addEventListener('input', GL_Systems.utils.debounce(function() {
            localStorage.setItem(`contact_${this.name}`, this.value);
        }, 500));
    });
    
    // Clear saved data on successful submission
    contactForm.addEventListener('submit', function() {
        inputs.forEach(input => {
            localStorage.removeItem(`contact_${input.name}`);
        });
    });
};

// Solution filters functionality
GL_Systems.setupSolutionFilters = function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const solutionCards = document.querySelectorAll('.solution-card');
    
    if (filterButtons.length === 0 || solutionCards.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter cards with smooth animation
            solutionCards.forEach(card => {
                const cardCategories = card.className;
                let shouldShow = false;
                
                if (filterValue === 'all') {
                    shouldShow = true;
                } else {
                    // Map filter values to segment classes
                    const categoryMap = {
                        'crm': 'segment-crm',
                        'comunicacao': 'segment-comunicacao',
                        'projetos': 'segment-projetos',
                        'financeiro': 'segment-financeiro',
                        'ecommerce': 'segment-ecommerce',
                        'saude': 'segment-saude',
                        'educacao': 'segment-educacao',
                        'servicos': 'segment-servicos',
                        'marketing': 'segment-marketing'
                    };
                    
                    shouldShow = cardCategories.includes(categoryMap[filterValue]);
                }
                
                if (shouldShow) {
                    card.style.display = 'block';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
            
            // Update counter if exists
            setTimeout(() => {
                const visibleCards = Array.from(solutionCards).filter(card => 
                    window.getComputedStyle(card).display !== 'none'
                ).length;
                
                // You can add a counter display here if needed
                GL_Systems.log && GL_Systems.log(`Showing ${visibleCards} solutions`);
            }, 350);
        });
    });
};

// Initialize contact form enhancement
document.addEventListener('DOMContentLoaded', function() {
    GL_Systems.enhanceContactForm();
    GL_Systems.setupSolutionFilters();
});

// Global error handler
window.addEventListener('error', function(event) {
    GL_Systems.handleError(event.error, 'Global');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    GL_Systems.handleError(new Error(event.reason), 'Promise');
});

// Export for use in other scripts
window.GL_Systems = GL_Systems;
