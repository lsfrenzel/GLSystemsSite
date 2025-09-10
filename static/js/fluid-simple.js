// Simplified Fluid Animation for Hero Background
class SimpleFluidAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0, isMoving: false };
        
        this.resizeCanvas();
        this.initParticles();
        this.setupEvents();
        this.animate();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    initParticles() {
        this.particles = [];
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: this.getRandomNeonColor(),
                opacity: Math.random() * 0.8 + 0.2,
                life: 1.0
            });
        }
    }
    
    getRandomNeonColor() {
        const neonColors = [
            'rgba(0, 255, 255, ',    // Cyan
            'rgba(255, 0, 255, ',    // Magenta
            'rgba(0, 255, 64, ',     // Green
            'rgba(255, 64, 255, ',   // Pink
            'rgba(64, 200, 255, ',   // Blue
            'rgba(255, 255, 0, ',    // Yellow
            'rgba(200, 0, 255, '     // Purple
        ];
        return neonColors[Math.floor(Math.random() * neonColors.length)];
    }
    
    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this.mouse.isMoving = true;
            
            // Create particles at mouse position
            this.createMouseParticle(this.mouse.x, this.mouse.y);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.isMoving = false;
        });
        
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.initParticles();
        });
    }
    
    createMouseParticle(x, y) {
        // Add particles near mouse
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 50,
                y: y + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 8 + 2,
                color: this.getRandomNeonColor(),
                opacity: 1.0,
                life: 1.0
            });
        }
        
        // Keep particle count reasonable
        if (this.particles.length > 150) {
            this.particles.splice(0, this.particles.length - 150);
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Add some drift
            particle.vx *= 0.995;
            particle.vy *= 0.995;
            
            // Fade out
            particle.life *= 0.998;
            particle.opacity = particle.life;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -0.8;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -0.8;
            }
            
            // Remove dead particles
            if (particle.life < 0.01) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const particle of this.particles) {
            this.ctx.globalAlpha = particle.opacity;
            
            // Create gradient for glow effect
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            
            gradient.addColorStop(0, particle.color + particle.opacity + ')');
            gradient.addColorStop(0.5, particle.color + (particle.opacity * 0.5) + ')');
            gradient.addColorStop(1, particle.color + '0)');
            
            this.ctx.fillStyle = gradient;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.globalAlpha = 1.0;
    }
    
    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fluid-background');
    if (canvas) {
        console.log('Initializing simple fluid animation...');
        new SimpleFluidAnimation(canvas);
    }
});