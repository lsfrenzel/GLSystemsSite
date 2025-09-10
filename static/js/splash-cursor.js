// Splash Cursor Animation for Hero Section
class SplashCursor {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0, isActive: false };
        this.trails = [];
        
        this.resizeCanvas();
        this.setupEvents();
        this.animate();
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    setupEvents() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.isActive = true;
            
            this.createSplash(this.mouse.x, this.mouse.y);
        });

        // Mouse enter
        this.canvas.addEventListener('mouseenter', () => {
            this.mouse.isActive = true;
        });

        // Mouse leave
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.isActive = false;
        });

        // Resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Auto-splashes
        setInterval(() => {
            if (!this.mouse.isActive) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                this.createAutoSplash(x, y);
            }
        }, 2000);
    }

    createSplash(x, y) {
        // Neon colors
        const colors = [
            'rgba(0, 255, 255, ',    // Cyan
            'rgba(255, 0, 255, ',    // Magenta
            'rgba(0, 255, 128, ',    // Green
            'rgba(255, 128, 255, ',  // Pink
            'rgba(128, 200, 255, ',  // Blue
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create multiple particles for splash effect
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 6 + 2,
                color: color,
                opacity: 1,
                life: 1,
                decay: Math.random() * 0.02 + 0.01
            });
        }

        // Add trail point
        this.trails.push({
            x: x,
            y: y,
            size: 10,
            color: color,
            opacity: 0.8,
            life: 1
        });

        // Limit particles
        if (this.particles.length > 200) {
            this.particles.splice(0, this.particles.length - 200);
        }

        // Limit trails
        if (this.trails.length > 50) {
            this.trails.splice(0, this.trails.length - 50);
        }
    }

    createAutoSplash(x, y) {
        const colors = [
            'rgba(0, 255, 255, ',
            'rgba(255, 0, 255, ',
            'rgba(0, 255, 128, ',
        ];

        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Smaller auto-splash
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 15,
                y: y + (Math.random() - 0.5) * 15,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 4 + 1,
                color: color,
                opacity: 0.6,
                life: 1,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }

    updateParticles() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life -= particle.decay;
            particle.opacity = particle.life;

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.life -= 0.03;
            trail.opacity = trail.life * 0.8;
            trail.size *= 0.98;

            if (trail.life <= 0) {
                this.trails.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw trails first
        for (const trail of this.trails) {
            if (trail.opacity > 0) {
                const gradient = this.ctx.createRadialGradient(
                    trail.x, trail.y, 0,
                    trail.x, trail.y, trail.size
                );
                gradient.addColorStop(0, trail.color + trail.opacity + ')');
                gradient.addColorStop(1, trail.color + '0)');

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw particles
        for (const particle of this.particles) {
            if (particle.opacity > 0) {
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size
                );
                gradient.addColorStop(0, particle.color + particle.opacity + ')');
                gradient.addColorStop(1, particle.color + '0)');

                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    animate() {
        this.updateParticles();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fluid-background');
    if (canvas) {
        console.log('Initializing Splash Cursor...');
        new SplashCursor(canvas);
    } else {
        console.error('Canvas element not found');
    }
});