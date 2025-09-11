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
    
    let isFiltering = false; // Prevent race conditions
    let currentFilter = 'all'; // Track current filter
    
    filterButtons.forEach(button => {
        button.addEventListener('click', GL_Systems.utils.debounce(function() {
            if (isFiltering) return;
            
            const filterValue = this.dataset.filter;
            if (filterValue === currentFilter) return; // Skip if same filter
            
            isFiltering = true;
            currentFilter = filterValue;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Check reduced motion preference
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion) {
                // Simple show/hide for reduced motion
                solutionCards.forEach(card => {
                    const shouldShow = filterValue === 'all' || card.classList.contains(`segment-${filterValue}`);
                    card.style.display = shouldShow ? '' : 'none';
                });
                isFiltering = false;
                return;
            }
            
            // Categorize cards using CSS classes
            const cardsToShow = [];
            const cardsToHide = [];
            
            solutionCards.forEach(card => {
                const shouldShow = filterValue === 'all' || card.classList.contains(`segment-${filterValue}`);
                
                if (shouldShow) {
                    cardsToShow.push(card);
                } else {
                    cardsToHide.push(card);
                }
            });
            
            // Clear previous animations
            solutionCards.forEach(card => {
                card.classList.remove('filtering-out', 'filtering-in');
                card.style.animationDelay = '';
            });
            
            // Phase 1: Hide cards using CSS classes
            cardsToHide.forEach(card => {
                card.classList.add('filtering-out');
            });
            
            // Phase 2: Show cards after hide animation
            setTimeout(() => {
                cardsToHide.forEach(card => {
                    card.style.display = 'none';
                    card.classList.remove('filtering-out');
                });
                
                cardsToShow.forEach((card, index) => {
                    card.style.display = '';
                    card.classList.add('filtering-in');
                    card.style.animationDelay = `${index * 100}ms`;
                });
                
                // Clean up after animation
                setTimeout(() => {
                    cardsToShow.forEach(card => {
                        card.classList.remove('filtering-in');
                        card.style.animationDelay = '';
                    });
                    isFiltering = false;
                }, cardsToShow.length * 100 + 600);
                
            }, 400);
            
        }, 200)); // Debounce clicks
    });
};

// Revolutionary Top Systems Demo Functionality
GL_Systems.setupTopSystemsDemos = function() {
    const demoButtons = document.querySelectorAll('.btn-system-demo');
    
    demoButtons.forEach(button => {
        // Add revolutionary click effects
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            const systemCard = this.closest('.top-system-card');
            const systemTitle = systemCard.querySelector('.system-title').textContent;
            
            // Create spectacular click effect
            this.style.transform = 'scale(0.95)';
            this.style.boxShadow = '0 0 100px rgba(138, 43, 226, 0.8)';
            
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                width: 100px;
                height: 100px;
                left: 50%;
                top: 50%;
                margin-left: -50px;
                margin-top: -50px;
                z-index: 1000;
            `;
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            // Revolutionary modal with preview
            setTimeout(() => {
                this.createDemoPreviewModal(href, systemTitle);
                
                // Reset button state
                this.style.transform = '';
                this.style.boxShadow = '';
                ripple.remove();
            }, 300);
        });
        
        // Add hover glow effect
        button.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 50px rgba(138, 43, 226, 0.5)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
        
        // Add the revolutionary modal creation method
        button.createDemoPreviewModal = function(href, systemTitle) {
            // Remove existing modal if any
            const existingModal = document.getElementById('revolutionaryModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Create revolutionary modal
            const modal = document.createElement('div');
            modal.id = 'revolutionaryModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: linear-gradient(145deg, 
                    rgba(0, 0, 0, 0.9) 0%,
                    rgba(26, 10, 46, 0.95) 50%,
                    rgba(0, 0, 0, 0.9) 100%);
                backdrop-filter: blur(20px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            `;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(145deg, 
                    rgba(255, 255, 255, 0.95) 0%,
                    rgba(248, 250, 252, 0.9) 100%);
                backdrop-filter: blur(30px);
                border: 1px solid rgba(138, 43, 226, 0.3);
                border-radius: 24px;
                padding: 3rem;
                max-width: 600px;
                width: 90%;
                text-align: center;
                box-shadow: 
                    0 40px 80px rgba(0, 0, 0, 0.3),
                    0 0 100px rgba(138, 43, 226, 0.3);
                transform: scale(0.7) translateY(50px);
                transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            `;
            
            modalContent.innerHTML = `
                <div style="
                    width: 120px;
                    height: 120px;
                    background: linear-gradient(145deg, rgba(138, 43, 226, 1) 0%, rgba(255, 0, 128, 0.8) 50%, rgba(106, 27, 154, 1) 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 2rem;
                    font-size: 3rem;
                    color: white;
                    box-shadow: 0 20px 60px rgba(138, 43, 226, 0.4);
                    animation: modalIconPulse 2s ease-in-out infinite;
                ">
                    <i class="fas fa-rocket"></i>
                </div>
                <h2 style="
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #1e293b 0%, #8a2be2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 1rem;
                    font-family: 'Orbitron', monospace;
                ">Iniciando Demo</h2>
                <h3 style="
                    font-size: 1.5rem;
                    color: #8a2be2;
                    margin-bottom: 2rem;
                    font-weight: 600;
                ">${systemTitle}</h3>
                <p style="
                    font-size: 1.2rem;
                    color: #64748b;
                    margin-bottom: 3rem;
                    line-height: 1.6;
                ">Preparando uma experiência interativa revolucionária para você!</p>
                <div style="
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                ">
                    <button onclick="window.open('${href}', '_blank')" style="
                        background: linear-gradient(145deg, rgba(138, 43, 226, 1) 0%, rgba(255, 0, 128, 0.9) 50%, rgba(106, 27, 154, 1) 100%);
                        color: white;
                        border: none;
                        padding: 1rem 2.5rem;
                        border-radius: 16px;
                        font-weight: 700;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3);
                        font-family: 'Orbitron', monospace;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    " onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 20px 50px rgba(138, 43, 226, 0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 10px 30px rgba(138, 43, 226, 0.3)'">
                        <i class="fas fa-external-link-alt me-2"></i>Abrir Demo
                    </button>
                    <button onclick="document.getElementById('revolutionaryModal').remove()" style="
                        background: transparent;
                        color: #8a2be2;
                        border: 2px solid #8a2be2;
                        padding: 1rem 2rem;
                        border-radius: 16px;
                        font-weight: 600;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        font-family: 'Orbitron', monospace;
                    " onmouseover="this.style.background='#8a2be2'; this.style.color='white'" onmouseout="this.style.background='transparent'; this.style.color='#8a2be2'">
                        Fechar
                    </button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes modalIconPulse {
                    0%, 100% { transform: scale(1) rotateY(0deg); }
                    50% { transform: scale(1.1) rotateY(180deg); }
                }
                @keyframes ripple {
                    to { transform: scale(4); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            
            // Animate modal in
            setTimeout(() => {
                modal.style.opacity = '1';
                modalContent.style.transform = 'scale(1) translateY(0)';
            }, 100);
            
            // Close on background click
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // Close on Escape key
            const escapeHandler = function(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        };
    });
};

// Performance detection and management
GL_Systems.detectPerformanceCapabilities = function() {
    const capabilities = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        lowEndDevice: false,
        fps: 60
    };
    
    // Device performance heuristics
    const memoryLimit = navigator.deviceMemory;
    const coresLimit = navigator.hardwareConcurrency;
    const connectionSpeed = navigator.connection?.effectiveType;
    
    capabilities.lowEndDevice = 
        memoryLimit <= 2 || 
        coresLimit <= 2 ||
        connectionSpeed === 'slow-2g' ||
        connectionSpeed === '2g' ||
        /Android.*(SM-|GT-|SCH-|SGH-|SPH-|LG-|HTC|SonyEricsson)/.test(navigator.userAgent);
    
    // Basic FPS detection
    let frames = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
        const currentTime = performance.now();
        frames++;
        
        if (currentTime - lastTime >= 1000) {
            capabilities.fps = Math.round((frames * 1000) / (currentTime - lastTime));
            frames = 0;
            lastTime = currentTime;
            
            if (capabilities.fps < 30) {
                capabilities.lowEndDevice = true;
            }
        }
        
        if (frames < 10) {
            requestAnimationFrame(measureFPS);
        }
    };
    
    requestAnimationFrame(measureFPS);
    return capabilities;
};

// Revolutionary Visual Effects System
GL_Systems.setupRevolutionaryEffects = function() {
    const capabilities = this.detectPerformanceCapabilities();
    
    if (capabilities.reducedMotion) {
        this.log && this.log('Reduced motion preferred, skipping heavy effects');
        return;
    }
    
    if (capabilities.lowEndDevice) {
        this.log && this.log('Low-end device detected, using lite effects');
        this.setupLiteEffects();
        return;
    }
    
    // Full effects for capable devices
    this.createFloatingParticles();
    this.setupRevolutionaryCursor();
    this.setupCardInteractionEffects();
    this.setupScrollAnimations();
};

// Lite effects for low-end devices
GL_Systems.setupLiteEffects = function() {
    this.setupScrollAnimations(); // Only keep scroll animations
};

// Floating Particles System
GL_Systems.createFloatingParticles = function() {
    const particleContainer = document.createElement('div');
    particleContainer.id = 'particleSystem';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    
    // Create 50 particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: rgba(138, 43, 226, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float${i % 3} ${Math.random() * 20 + 10}s linear infinite;
            box-shadow: 0 0 ${Math.random() * 10 + 5}px rgba(138, 43, 226, 0.5);
        `;
        particleContainer.appendChild(particle);
    }
    
    document.body.appendChild(particleContainer);
    
    // Add particle animation styles
    const particleStyles = document.createElement('style');
    particleStyles.textContent = `
        @keyframes float0 {
            0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) translateX(50px) rotate(360deg); opacity: 0; }
        }
        @keyframes float1 {
            0% { transform: translateY(100vh) translateX(0px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100px) translateX(-30px) rotate(-360deg); opacity: 0; }
        }
        @keyframes float2 {
            0% { transform: translateY(100vh) translateX(0px) scale(0); opacity: 0; }
            10% { opacity: 1; transform: translateY(90vh) translateX(0px) scale(1); }
            90% { opacity: 1; transform: translateY(10vh) translateX(20px) scale(1); }
            100% { transform: translateY(-100px) translateX(40px) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(particleStyles);
};

// Revolutionary Cursor Effects
GL_Systems.setupRevolutionaryCursor = function() {
    const cursorTrail = document.createElement('div');
    cursorTrail.id = 'cursorTrail';
    cursorTrail.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(138, 43, 226, 0.6) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease-out;
        box-shadow: 0 0 20px rgba(138, 43, 226, 0.5);
    `;
    document.body.appendChild(cursorTrail);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;
        
        cursorTrail.style.left = cursorX - 10 + 'px';
        cursorTrail.style.top = cursorY - 10 + 'px';
        
        requestAnimationFrame(animateCursor);
    };
    animateCursor();
    
    // Create trail particles on mouse move
    let trailTimeout;
    document.addEventListener('mousemove', (e) => {
        clearTimeout(trailTimeout);
        trailTimeout = setTimeout(() => {
            const trailParticle = document.createElement('div');
            trailParticle.style.cssText = `
                position: fixed;
                left: ${e.clientX - 2}px;
                top: ${e.clientY - 2}px;
                width: 4px;
                height: 4px;
                background: rgba(255, 0, 128, 0.6);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
                animation: trailFade 1s ease-out forwards;
            `;
            document.body.appendChild(trailParticle);
            
            setTimeout(() => trailParticle.remove(), 1000);
        }, 5);
    });
    
    // Add trail animation
    const trailStyle = document.createElement('style');
    trailStyle.textContent = `
        @keyframes trailFade {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0); }
        }
    `;
    document.head.appendChild(trailStyle);
};

// Card Interaction Effects
GL_Systems.setupCardInteractionEffects = function() {
    const cards = document.querySelectorAll('.top-system-card, .solution-card, .feature-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Create magnetic field effect
            this.style.zIndex = '100';
            
            // Add glow particles around card
            for (let i = 0; i < 8; i++) {
                const glowParticle = document.createElement('div');
                const angle = (i / 8) * Math.PI * 2;
                const radius = 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                glowParticle.style.cssText = `
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 4px;
                    height: 4px;
                    background: rgba(138, 43, 226, 0.8);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: orbitGlow 2s linear infinite;
                    animation-delay: ${i * 0.25}s;
                    pointer-events: none;
                    z-index: -1;
                `;
                
                this.style.position = 'relative';
                this.appendChild(glowParticle);
            }
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
            
            // Remove glow particles
            const glowParticles = this.querySelectorAll('div[style*="orbitGlow"]');
            glowParticles.forEach(particle => particle.remove());
        });
    });
    
    // Add orbit animation
    const orbitStyle = document.createElement('style');
    orbitStyle.textContent = `
        @keyframes orbitGlow {
            0% { transform: translate(-50%, -50%) rotate(0deg) translateX(80px) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg) translateX(80px) rotate(-360deg); }
        }
    `;
    document.head.appendChild(orbitStyle);
};

// Scroll Triggered Animations
GL_Systems.setupScrollAnimations = function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInFromBottom 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards';
                
                // Add sparkle effect
                const sparkles = document.createElement('div');
                sparkles.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    z-index: 10;
                `;
                
                for (let i = 0; i < 12; i++) {
                    const sparkle = document.createElement('div');
                    sparkle.style.cssText = `
                        position: absolute;
                        left: ${Math.random() * 100}%;
                        top: ${Math.random() * 100}%;
                        width: 3px;
                        height: 3px;
                        background: #fff;
                        border-radius: 50%;
                        animation: sparkle 1.5s ease-out forwards;
                        animation-delay: ${Math.random() * 0.5}s;
                        box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
                    `;
                    sparkles.appendChild(sparkle);
                }
                
                entry.target.style.position = 'relative';
                entry.target.appendChild(sparkles);
                
                setTimeout(() => sparkles.remove(), 2000);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll('.top-system-card, .section-title, .hero-title');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        observer.observe(el);
    });
    
    // Add scroll animations
    const scrollStyle = document.createElement('style');
    scrollStyle.textContent = `
        @keyframes slideInFromBottom {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes sparkle {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
            100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
    `;
    document.head.appendChild(scrollStyle);
};

// Initialize all systems
document.addEventListener('DOMContentLoaded', function() {
    GL_Systems.enhanceContactForm();
    GL_Systems.setupSolutionFilters();
    GL_Systems.setupTopSystemsDemos();
    GL_Systems.setupRevolutionaryEffects();
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
