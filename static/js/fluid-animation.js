// Fluid Animation for Hero Background
class FluidAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.config = {
            SIM_RESOLUTION: 128,
            DYE_RESOLUTION: 1024,
            DENSITY_DISSIPATION: 1.5,
            VELOCITY_DISSIPATION: 0.2,
            PRESSURE: 0.1,
            PRESSURE_ITERATIONS: 20,
            CURL: 30,
            SPLAT_RADIUS: 0.25,
            SPLAT_FORCE: 6000,
            SHADING: true,
            COLOR_UPDATE_SPEED: 10,
            BACK_COLOR: { r: 0.1, g: 0.1, b: 0.2 },
            TRANSPARENT: true,
        };

        this.pointers = [new this.PointerPrototype()];
        this.initWebGL();
        this.initFramebuffers();
        this.startAnimation();
    }

    PointerPrototype() {
        this.id = -1;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.down = false;
        this.moved = false;
        this.color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
    }

    initWebGL() {
        const params = {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: false,
        };

        this.gl = this.canvas.getContext("webgl2", params) ||
                   this.canvas.getContext("webgl", params) ||
                   this.canvas.getContext("experimental-webgl", params);

        if (!this.gl) {
            console.error("WebGL not supported");
            return;
        }

        this.isWebGL2 = !!this.canvas.getContext("webgl2", params);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.ext = {
            supportLinearFiltering: this.gl.getExtension("OES_texture_float_linear"),
            halfFloatTexType: this.isWebGL2 ? this.gl.HALF_FLOAT : 
                             (this.gl.getExtension("OES_texture_half_float") || {}).HALF_FLOAT_OES
        };

        this.initShaders();
        this.setupEventListeners();
    }

    initShaders() {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, `
            precision highp float;
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform vec2 texelSize;

            void main () {
                vUv = aPosition * 0.5 + 0.5;
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `);

        const displayShader = this.compileShader(this.gl.FRAGMENT_SHADER, `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uTexture;

            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                float a = max(c.r, max(c.g, c.b));
                gl_FragColor = vec4(c, a * 0.8);
            }
        `);

        const splatShader = this.compileShader(this.gl.FRAGMENT_SHADER, `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uTarget;
            uniform float aspectRatio;
            uniform vec3 color;
            uniform vec2 point;
            uniform float radius;

            void main () {
                vec2 p = vUv - point.xy;
                p.x *= aspectRatio;
                vec3 splat = exp(-dot(p, p) / radius) * color;
                vec3 base = texture2D(uTarget, vUv).xyz;
                gl_FragColor = vec4(base + splat, 1.0);
            }
        `);

        const advectionShader = this.compileShader(this.gl.FRAGMENT_SHADER, `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;

            void main () {
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = texture2D(uSource, coord);
                float decay = 1.0 + dissipation * dt;
                gl_FragColor = result / decay;
            }
        `);

        this.programs = {
            display: this.createProgram(vertexShader, displayShader),
            splat: this.createProgram(vertexShader, splatShader),
            advection: this.createProgram(vertexShader, advectionShader)
        };

        // Setup vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
            this.gl.STATIC_DRAW
        );
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.createBuffer());
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array([0, 1, 2, 0, 2, 3]),
            this.gl.STATIC_DRAW
        );
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
        }
        
        const uniforms = {};
        const uniformCount = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformName = this.gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = this.gl.getUniformLocation(program, uniformName);
        }
        
        return { program, uniforms };
    }

    initFramebuffers() {
        const simRes = this.getResolution(this.config.SIM_RESOLUTION);
        const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);
        
        this.dye = this.createDoubleFBO(dyeRes.width, dyeRes.height, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.gl.LINEAR);
        this.velocity = this.createDoubleFBO(simRes.width, simRes.height, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.gl.LINEAR);
    }

    getResolution(resolution) {
        let aspectRatio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
        
        let min = Math.round(resolution);
        let max = Math.round(resolution * aspectRatio);
        
        if (this.gl.drawingBufferWidth > this.gl.drawingBufferHeight) {
            return { width: max, height: min };
        } else {
            return { width: min, height: max };
        }
    }

    createDoubleFBO(w, h, internalFormat, format, type, param) {
        let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);
        
        return {
            width: w,
            height: h,
            texelSizeX: 1.0 / w,
            texelSizeY: 1.0 / h,
            read: fbo1,
            write: fbo2,
            swap() {
                let temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
                this.read = fbo1;
                this.write = fbo2;
            }
        };
    }

    createFBO(w, h, internalFormat, format, type, param) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        let texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, param);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, param);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        let fbo = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0);
        this.gl.viewport(0, 0, w, h);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        return { texture, fbo, width: w, height: h };
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const pointer = this.pointers[0];
            pointer.prevTexcoordX = pointer.texcoordX;
            pointer.prevTexcoordY = pointer.texcoordY;
            pointer.texcoordX = (e.clientX - rect.left) / rect.width;
            pointer.texcoordY = 1.0 - (e.clientY - rect.top) / rect.height;
            pointer.deltaX = pointer.texcoordX - pointer.prevTexcoordX;
            pointer.deltaY = pointer.texcoordY - pointer.prevTexcoordY;
            pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
        });

        // Auto-splat effect
        setInterval(() => {
            const pointer = this.pointers[0];
            pointer.texcoordX = Math.random();
            pointer.texcoordY = Math.random();
            pointer.color = [Math.random() * 0.3 + 0.2, Math.random() * 0.3 + 0.2, Math.random() * 0.3 + 0.5];
            this.splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX, pointer.deltaY, pointer.color);
        }, 2000);
    }

    splat(x, y, dx, dy, color) {
        this.gl.viewport(0, 0, this.velocity.width, this.velocity.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velocity.write.fbo);
        this.gl.useProgram(this.programs.splat.program);
        this.gl.uniform1i(this.programs.splat.uniforms.uTarget, this.velocity.read.texture);
        this.gl.uniform1f(this.programs.splat.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
        this.gl.uniform2f(this.programs.splat.uniforms.point, x, y);
        this.gl.uniform3f(this.programs.splat.uniforms.color, dx, dy, 0.0);
        this.gl.uniform1f(this.programs.splat.uniforms.radius, this.config.SPLAT_RADIUS / 100.0);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.velocity.read.texture);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.velocity.swap();

        this.gl.viewport(0, 0, this.dye.width, this.dye.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.dye.write.fbo);
        this.gl.uniform1i(this.programs.splat.uniforms.uTarget, this.dye.read.texture);
        this.gl.uniform3f(this.programs.splat.uniforms.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dye.read.texture);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.dye.swap();
    }

    step(dt) {
        this.gl.disable(this.gl.BLEND);

        // Advection
        this.gl.viewport(0, 0, this.velocity.width, this.velocity.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.velocity.write.fbo);
        this.gl.useProgram(this.programs.advection.program);
        this.gl.uniform2f(this.programs.advection.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
        this.gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.texture);
        this.gl.uniform1i(this.programs.advection.uniforms.uSource, this.velocity.read.texture);
        this.gl.uniform1f(this.programs.advection.uniforms.dt, dt);
        this.gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.velocity.read.texture);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.velocity.swap();

        this.gl.viewport(0, 0, this.dye.width, this.dye.height);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.dye.write.fbo);
        this.gl.uniform2f(this.programs.advection.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
        this.gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.texture);
        this.gl.uniform1i(this.programs.advection.uniforms.uSource, this.dye.read.texture);
        this.gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.velocity.read.texture);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dye.read.texture);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
        this.dye.swap();
    }

    render() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.programs.display.program);
        this.gl.uniform1i(this.programs.display.uniforms.uTexture, this.dye.read.texture);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.dye.read.texture);
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

    resizeCanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * pixelRatio;
        this.canvas.height = this.canvas.clientHeight * pixelRatio;
        this.initFramebuffers();
    }

    startAnimation() {
        let lastTime = 0;
        const animate = (time) => {
            const dt = Math.min((time - lastTime) / 1000, 0.016);
            lastTime = time;

            this.step(dt);
            this.render();

            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('fluid-background');
    if (canvas) {
        new FluidAnimation(canvas);
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
        });
    }
});