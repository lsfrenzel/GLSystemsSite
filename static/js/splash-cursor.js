// Revolutionary Neon Splash Cursor Animation
class RevolutionarySplashCursor {
    constructor() {
        this.canvas = document.getElementById('fluid-background');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.heroSection = document.querySelector('.modern-hero-section');
        this.particles = [];
        this.ripples = [];
        this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, isActive: false };
        this.time = 0;
        
        this.setupCanvas();
        this.setupEvents();
        this.startAutoEffects();
        this.animate();
        
        console.log('Revolutionary Splash Cursor initialized!');
    }

    setupCanvas() {
        const rect = this.heroSection.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        
        // Set additive blending for revolutionary neon effect
        this.ctx.globalCompositeOperation = 'lighter';
    }

    setupEvents() {
        // Listen on hero section, not canvas
        this.heroSection.addEventListener('mousemove', (e) => {
            const rect = this.heroSection.getBoundingClientRect();
            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.isActive = true;
            
            this.createRevolutionarySplash(this.mouse.x, this.mouse.y);
        }, { passive: true });

        this.heroSection.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.heroSection.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse.prevX = this.mouse.x;
            this.mouse.prevY = this.mouse.y;
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
            this.mouse.isActive = true;
            
            this.createRevolutionarySplash(this.mouse.x, this.mouse.y);
        }, { passive: false });

        this.heroSection.addEventListener('mouseenter', () => {
            this.mouse.isActive = true;
            this.createBigBurst(this.mouse.x, this.mouse.y);
        });

        this.heroSection.addEventListener('mouseleave', () => {
            this.mouse.isActive = false;
        });

        this.heroSection.addEventListener('click', (e) => {
            const rect = this.heroSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createExplosion(x, y);
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }

    createRevolutionarySplash(x, y) {
        const neonColors = [
            { r: 0, g: 255, b: 255, name: 'cyan' },      // Cyan
            { r: 255, g: 0, b: 255, name: 'magenta' },   // Magenta  
            { r: 0, g: 255, b: 128, name: 'green' },     // Neon Green
            { r: 255, g: 128, b: 255, name: 'pink' },    // Hot Pink
            { r: 128, g: 200, b: 255, name: 'blue' },    // Electric Blue
            { r: 255, g: 255, b: 0, name: 'yellow' },    // Neon Yellow
            { r: 255, g: 64, b: 128, name: 'red' }       // Electric Red
        ];

        const color = neonColors[Math.floor(Math.random() * neonColors.length)];
        const velocity = Math.sqrt((this.mouse.x - this.mouse.prevX) ** 2 + (this.mouse.y - this.mouse.prevY) ** 2);
        const intensity = Math.min(velocity * 0.3, 30);

        // Create main splash particles with velocity-based intensity
        for (let i = 0; i < 20 + intensity; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * (8 + intensity * 0.5),
                vy: (Math.random() - 0.5) * (8 + intensity * 0.5),
                size: Math.random() * 8 + 3,
                color: color,
                opacity: 1,
                life: 1,
                decay: Math.random() * 0.015 + 0.008,
                glow: 15 + Math.random() * 20
            });
        }

        // Create ripple effect
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 80 + intensity * 2,
            color: color,
            opacity: 0.6,
            life: 1,
            decay: 0.02
        });

        // Create trailing particles behind cursor
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.mouse.prevX + (x - this.mouse.prevX) * (i / 8) + (Math.random() - 0.5) * 10,
                y: this.mouse.prevY + (y - this.mouse.prevY) * (i / 8) + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                size: Math.random() * 4 + 2,
                color: color,
                opacity: 0.7,
                life: 0.8,
                decay: 0.02,
                glow: 10
            });
        }
    }

    createBigBurst(x, y) {
        const colors = [
            { r: 0, g: 255, b: 255 },
            { r: 255, g: 0, b: 255 },
            { r: 255, g: 255, b: 0 }
        ];

        for (let i = 0; i < 40; i++) {
            const angle = (Math.PI * 2 * i) / 40;
            const speed = Math.random() * 12 + 8;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 6 + 4,
                color: color,
                opacity: 1,
                life: 1,
                decay: 0.01,
                glow: 25
            });
        }
    }

    createExplosion(x, y) {
        const colors = [
            { r: 255, g: 255, b: 255 },
            { r: 0, g: 255, b: 255 },
            { r: 255, g: 0, b: 255 }
        ];

        // Main explosion burst
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 20 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 10 + 5,
                color: color,
                opacity: 1,
                life: 1,
                decay: 0.012,
                glow: 30
            });
        }

        // Shockwave ripple
        this.ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 150,
            color: { r: 255, g: 255, b: 255 },
            opacity: 0.8,
            life: 1,
            decay: 0.015
        });
    }

    startAutoEffects() {
        setInterval(() => {
            if (!this.mouse.isActive && Math.random() < 0.7) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                this.createAutoSplash(x, y);
            }
        }, 2000);

        // Ambient pulses
        setInterval(() => {
            this.createAmbientPulse();
        }, 3000);
    }

    createAutoSplash(x, y) {
        const colors = [
            { r: 0, g: 255, b: 255 },
            { r: 255, g: 0, b: 255 },
            { r: 0, g: 255, b: 128 }
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 5 + 2,
                color: color,
                opacity: 0.8,
                life: 1,
                decay: 0.015,
                glow: 12
            });
        }
    }

    createAmbientPulse() {
        const corners = [
            { x: this.width * 0.1, y: this.height * 0.1 },
            { x: this.width * 0.9, y: this.height * 0.1 },
            { x: this.width * 0.1, y: this.height * 0.9 },
            { x: this.width * 0.9, y: this.height * 0.9 }
        ];

        const corner = corners[Math.floor(Math.random() * corners.length)];
        
        this.ripples.push({
            x: corner.x,
            y: corner.y,
            radius: 0,
            maxRadius: 100,
            color: { r: 0, g: 255, b: 255 },
            opacity: 0.3,
            life: 1,
            decay: 0.01
        });
    }

    update() {
        this.time += 0.016; // ~60fps

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.life -= p.decay;
            p.opacity = p.life;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            
            r.radius += (r.maxRadius - r.radius) * 0.1;
            r.life -= r.decay;
            r.opacity = r.life * 0.6;

            if (r.life <= 0) {
                this.ripples.splice(i, 1);
            }
        }

        // Limit arrays to prevent memory issues
        if (this.particles.length > 300) {
            this.particles.splice(0, this.particles.length - 300);
        }
        if (this.ripples.length > 20) {
            this.ripples.splice(0, this.ripples.length - 20);
        }
    }

    draw() {
        // Clear with slight trail effect for smoother motion
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw ripples
        for (const ripple of this.ripples) {
            if (ripple.opacity > 0) {
                const { r, g, b } = ripple.color;
                
                this.ctx.beginPath();
                this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ripple.opacity})`;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
        }

        // Draw particles with enhanced glow
        for (const particle of this.particles) {
            if (particle.opacity > 0) {
                const { r, g, b } = particle.color;
                const alpha = particle.opacity;
                
                // Create intense glow effect
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size + particle.glow
                );
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
                gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
                gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size + particle.glow, 0, Math.PI * 2);
                this.ctx.fill();

                // Core bright center
                this.ctx.fillStyle = `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize the revolutionary splash cursor
document.addEventListener('DOMContentLoaded', () => {
    new RevolutionarySplashCursor();
});