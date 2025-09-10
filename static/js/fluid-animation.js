// Enhanced Fluid Animation with WebGL - Complete Implementation
// Based on advanced liquid simulation principles from SplashCursor

class FluidAnimation {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.config = {
            SIM_RESOLUTION: options.SIM_RESOLUTION || 128,
            DYE_RESOLUTION: options.DYE_RESOLUTION || 1440,
            CAPTURE_RESOLUTION: options.CAPTURE_RESOLUTION || 512,
            DENSITY_DISSIPATION: options.DENSITY_DISSIPATION || 3.5,
            VELOCITY_DISSIPATION: options.VELOCITY_DISSIPATION || 2,
            PRESSURE: options.PRESSURE || 0.1,
            PRESSURE_ITERATIONS: options.PRESSURE_ITERATIONS || 20,
            CURL: options.CURL || 3,
            SPLAT_RADIUS: options.SPLAT_RADIUS || 0.2,
            SPLAT_FORCE: options.SPLAT_FORCE || 6000,
            SHADING: options.SHADING !== undefined ? options.SHADING : true,
            COLOR_UPDATE_SPEED: options.COLOR_UPDATE_SPEED || 10,
            BACK_COLOR: options.BACK_COLOR || { r: 0.02, g: 0.02, b: 0.05 },
            TRANSPARENT: options.TRANSPARENT !== undefined ? options.TRANSPARENT : true,
            PAUSED: false
        };

        this.pointers = [this.createPointer()];
        this.init();
    }

    init() {
        const { gl, ext } = this.getWebGLContext();
        this.gl = gl;
        this.ext = ext;
        
        if (!ext.supportLinearFiltering) {
            this.config.DYE_RESOLUTION = 256;
            this.config.SHADING = false;
        }

        this.initShaders();
        this.initFramebuffers();
        this.setupEventListeners();
        this.startAnimation();
    }

    createPointer() {
        return {
            id: -1,
            texcoordX: 0,
            texcoordY: 0,
            prevTexcoordX: 0,
            prevTexcoordY: 0,
            deltaX: 0,
            deltaY: 0,
            down: false,
            moved: false,
            color: [0, 0, 0]
        };
    }

    getWebGLContext() {
        const params = {
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: false,
        };
        
        let gl = this.canvas.getContext("webgl2", params);
        const isWebGL2 = !!gl;
        
        if (!isWebGL2) {
            gl = this.canvas.getContext("webgl", params) ||
                 this.canvas.getContext("experimental-webgl", params);
        }
        
        let halfFloat;
        let supportLinearFiltering;
        
        if (isWebGL2) {
            gl.getExtension("EXT_color_buffer_float");
            supportLinearFiltering = gl.getExtension("OES_texture_float_linear");
        } else {
            halfFloat = gl.getExtension("OES_texture_half_float");
            supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
        }
        
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
        
        let formatRGBA, formatRG, formatR;

        if (isWebGL2) {
            formatRGBA = this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
            formatRG = this.getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
            formatR = this.getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
        } else {
            formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        }

        return {
            gl,
            ext: {
                formatRGBA,
                formatRG,
                formatR,
                halfFloatTexType,
                supportLinearFiltering,
            },
        };
    }

    getSupportedFormat(gl, internalFormat, format, type) {
        if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
            switch (internalFormat) {
                case gl.R16F:
                    return this.getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                case gl.RG16F:
                    return this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                default:
                    return null;
            }
        }
        return { internalFormat, format };
    }

    supportRenderTextureFormat(gl, internalFormat, format, type) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
        
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        return status === gl.FRAMEBUFFER_COMPLETE;
    }

    initShaders() {
        const gl = this.gl;
        const ext = this.ext;

        // Utility functions
        this.hashCode = (s) => {
            if (s.length == 0) return 0;
            let hash = 0;
            for (let i = 0; i < s.length; i++) {
                hash = ((hash << 5) - hash) + s.charCodeAt(i);
                hash = hash & hash;
            }
            return hash;
        };

        this.compileShader = (type, source, keywords) => {
            source = this.addKeywords(source, keywords);
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
                console.trace(gl.getShaderInfoLog(shader));
            return shader;
        };

        this.addKeywords = (source, keywords) => {
            if (!keywords) return source;
            let keywordsString = "";
            keywords.forEach((keyword) => {
                keywordsString += "#define " + keyword + "\\n";
            });
            return keywordsString + source;
        };

        this.createProgram = (vertexShader, fragmentShader) => {
            let program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS))
                console.trace(gl.getProgramInfoLog(program));
            return program;
        };

        this.getUniforms = (program) => {
            let uniforms = [];
            let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let uniformName = gl.getActiveUniform(program, i).name;
                uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
            }
            return uniforms;
        };

        // Base vertex shader
        const baseVertexShader = this.compileShader(gl.VERTEX_SHADER, `
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

        // Fragment shaders
        const copyShader = this.compileShader(gl.FRAGMENT_SHADER, `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            uniform sampler2D uTexture;

            void main () {
                gl_FragColor = texture2D(uTexture, vUv);
            }
        `);

        const clearShader = this.compileShader(gl.FRAGMENT_SHADER, `
            precision mediump float;
            precision mediump sampler2D;
            varying highp vec2 vUv;
            uniform sampler2D uTexture;
            uniform float value;

            void main () {
                gl_FragColor = value * texture2D(uTexture, vUv);
            }
        `);

        const splatShader = this.compileShader(gl.FRAGMENT_SHADER, `
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

        const advectionShader = this.compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform vec2 dyeTexelSize;
            uniform float dt;
            uniform float dissipation;

            vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
                vec2 st = uv / tsize - 0.5;
                vec2 iuv = floor(st);
                vec2 fuv = fract(st);

                vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
                vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
                vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
                vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

                return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
            }

            void main () {
                #ifdef MANUAL_FILTERING
                    vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
                    vec4 result = bilerp(uSource, coord, dyeTexelSize);
                #else
                    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                    vec4 result = texture2D(uSource, coord);
                #endif
                float decay = 1.0 + dissipation * dt;
                gl_FragColor = result / decay;
            }
        `, ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]);

        const displayShaderSource = `
            precision highp float;
            precision highp sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uTexture;
            uniform sampler2D uDithering;
            uniform vec2 ditherScale;
            uniform vec2 texelSize;

            vec3 linearToGamma (vec3 color) {
                color = max(color, vec3(0));
                return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
            }

            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                #ifdef SHADING
                    vec3 lc = texture2D(uTexture, vL).rgb;
                    vec3 rc = texture2D(uTexture, vR).rgb;
                    vec3 tc = texture2D(uTexture, vT).rgb;
                    vec3 bc = texture2D(uTexture, vB).rgb;

                    float dx = length(rc) - length(lc);
                    float dy = length(tc) - length(bc);

                    vec3 n = normalize(vec3(dx, dy, length(texelSize)));
                    vec3 l = vec3(0.0, 0.0, 1.0);

                    float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
                    c *= diffuse;
                #endif

                float a = max(c.r, max(c.g, c.b));
                gl_FragColor = vec4(c, a);
            }
        `;

        // Program and Material classes
        class Program {
            constructor(vertexShader, fragmentShader) {
                this.uniforms = {};
                this.program = this.createProgram(vertexShader, fragmentShader);
                this.uniforms = this.getUniforms(this.program);
            }
            bind() { gl.useProgram(this.program); }
            createProgram = this.createProgram.bind(this);
            getUniforms = this.getUniforms.bind(this);
        }

        class Material {
            constructor(vertexShader, fragmentShaderSource) {
                this.vertexShader = vertexShader;
                this.fragmentShaderSource = fragmentShaderSource;
                this.programs = [];
                this.activeProgram = null;
                this.uniforms = [];
            }
            setKeywords(keywords) {
                let hash = 0;
                for (let i = 0; i < keywords.length; i++) hash += this.hashCode(keywords[i]);
                let program = this.programs[hash];
                if (program == null) {
                    let fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
                    program = this.createProgram(this.vertexShader, fragmentShader);
                    this.programs[hash] = program;
                }
                if (program === this.activeProgram) return;
                this.uniforms = this.getUniforms(program);
                this.activeProgram = program;
            }
            bind() { gl.useProgram(this.activeProgram); }
            compileShader = this.compileShader.bind(this);
            createProgram = this.createProgram.bind(this);
            getUniforms = this.getUniforms.bind(this);
        }

        // Store shaders and programs
        this.baseVertexShader = baseVertexShader;
        this.copyProgram = new Program(baseVertexShader, copyShader);
        this.clearProgram = new Program(baseVertexShader, clearShader);
        this.splatProgram = new Program(baseVertexShader, splatShader);
        this.advectionProgram = new Program(baseVertexShader, advectionShader);
        this.displayMaterial = new Material(baseVertexShader, displayShaderSource);
    }

    initFramebuffers() {
        const gl = this.gl;
        const ext = this.ext;
        
        // Buffer setup
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        this.blit = (target, clear = false) => {
            if (target == null) {
                gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            } else {
                gl.viewport(0, 0, target.width, target.height);
                gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
            }
            if (clear) {
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
            }
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        };

        this.resizeCanvas();
    }

    createFBO(w, h, internalFormat, format, type, param) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let texelSizeX = 1.0 / w;
        let texelSizeY = 1.0 / h;
        return { texture, fbo, width: w, height: h, texelSizeX, texelSizeY };
    }

    createDoubleFBO(w, h, internalFormat, format, type, param) {
        let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);
        return {
            width: w, height: h,
            texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
            get read() { return fbo1; },
            set read(value) { fbo1 = value; },
            get write() { return fbo2; },
            set write(value) { fbo2 = value; },
            swap() { let temp = fbo1; fbo1 = fbo2; fbo2 = temp; }
        };
    }

    getResolution(resolution) {
        let aspectRatio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

        let max = Math.round(resolution * aspectRatio);
        let min = Math.round(resolution);

        if (this.gl.drawingBufferWidth > this.gl.drawingBufferHeight)
            return { width: max, height: min };
        else
            return { width: min, height: max };
    }

    setupEventListeners() {
        // Mouse movement with neon colors
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gl) return;
            const rect = this.canvas.getBoundingClientRect();
            const pointer = this.pointers[0];
            pointer.prevTexcoordX = pointer.texcoordX;
            pointer.prevTexcoordY = pointer.texcoordY;
            pointer.texcoordX = (e.clientX - rect.left) / rect.width;
            pointer.texcoordY = 1.0 - (e.clientY - rect.top) / rect.height;
            pointer.deltaX = pointer.texcoordX - pointer.prevTexcoordX;
            pointer.deltaY = pointer.texcoordY - pointer.prevTexcoordY;
            pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
            
            // Create splat effect on mouse move
            if (pointer.moved && (Math.abs(pointer.deltaX) > 0.001 || Math.abs(pointer.deltaY) > 0.001)) {
                const neonColors = [
                    [0.0, 1.0, 1.0],    // Cyan neon
                    [1.0, 0.0, 1.0],    // Magenta neon
                    [0.0, 1.0, 0.3],    // Green neon
                    [1.0, 0.2, 0.8],    // Pink neon
                    [0.2, 0.8, 1.0],    // Blue neon
                ];
                const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
                this.splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX * 100, pointer.deltaY * 100, randomColor);
            }
        });

        // Auto-splat effect with neon colors
        setInterval(() => {
            const pointer = this.pointers[0];
            pointer.texcoordX = Math.random();
            pointer.texcoordY = Math.random();
            
            // Neon color palette
            const neonColors = [
                [0.0, 1.0, 1.0],    // Cyan neon
                [1.0, 0.0, 1.0],    // Magenta neon
                [0.0, 1.0, 0.3],    // Green neon
                [1.0, 0.2, 0.8],    // Pink neon
                [0.2, 0.8, 1.0],    // Blue neon
                [1.0, 1.0, 0.0],    // Yellow neon
                [0.8, 0.0, 1.0]     // Purple neon
            ];
            
            const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
            pointer.color = randomColor;
            this.splat(pointer.texcoordX, pointer.texcoordY, pointer.deltaX || 0.1, pointer.deltaY || 0.1, pointer.color);
        }, 1500);

        // Resize handler
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    splat(x, y, dx, dy, color) {
        const gl = this.gl;
        if (!this.dye) return;
        
        this.splatProgram.bind();
        gl.uniform1i(this.splatProgram.uniforms.uTarget, this.dye.read.attach(0));
        gl.uniform1f(this.splatProgram.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
        gl.uniform2f(this.splatProgram.uniforms.point, x, y);
        gl.uniform3f(this.splatProgram.uniforms.color, dx, dy, 0);
        gl.uniform1f(this.splatProgram.uniforms.radius, this.correctRadius(this.config.SPLAT_RADIUS / 100.0));
        
        this.blit(this.dye.write);
        this.dye.swap();
        
        // Apply color
        gl.uniform3f(this.splatProgram.uniforms.color, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
        this.blit(this.dye.write);
        this.dye.swap();
    }

    correctRadius(radius) {
        let aspectRatio = this.canvas.width / this.canvas.height;
        if (aspectRatio > 1) radius *= aspectRatio;
        return radius;
    }

    update() {
        const gl = this.gl;
        if (!this.dye || !this.velocity) return;

        const dt = 0.016; // 60fps
        
        if (!this.config.PAUSED) {
            this.advectionProgram.bind();
            gl.uniform2f(this.advectionProgram.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
            gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
            gl.uniform1i(this.advectionProgram.uniforms.uSource, this.velocity.read.attach(0));
            gl.uniform1f(this.advectionProgram.uniforms.dt, dt);
            gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
            this.blit(this.velocity.write);
            this.velocity.swap();

            gl.uniform1i(this.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
            gl.uniform1i(this.advectionProgram.uniforms.uSource, this.dye.read.attach(1));
            gl.uniform2f(this.advectionProgram.uniforms.dyeTexelSize, this.dye.texelSizeX, this.dye.texelSizeY);
            gl.uniform1f(this.advectionProgram.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
            this.blit(this.dye.write);
            this.dye.swap();
        }

        this.render(null);
    }

    render(target) {
        const gl = this.gl;
        if (!this.dye) return;

        if (this.config.SHADING)
            this.displayMaterial.setKeywords(['SHADING']);
        else
            this.displayMaterial.setKeywords([]);

        this.displayMaterial.bind();
        gl.uniform2f(this.displayMaterial.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
        gl.uniform1i(this.displayMaterial.uniforms.uTexture, this.dye.read.attach(0));
        this.blit(target);
    }

    resizeCanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = this.canvas.clientWidth * pixelRatio;
        this.canvas.height = this.canvas.clientHeight * pixelRatio;
        
        if (this.gl) {
            const gl = this.gl;
            const ext = this.ext;
            
            let simRes = this.getResolution(this.config.SIM_RESOLUTION);
            let dyeRes = this.getResolution(this.config.DYE_RESOLUTION);
            const texType = ext.halfFloatTexType;
            const rgba = ext.formatRGBA;
            const rg = ext.formatRG;
            const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
            
            gl.disable(gl.BLEND);

            this.dye = this.createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
            this.velocity = this.createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
        }
    }

    startAnimation() {
        let lastTime = 0;
        const animate = (time) => {
            if (time - lastTime >= 16) { // ~60fps
                this.update();
                lastTime = time;
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fluid-background');
    if (canvas) {
        // Enhanced configuration for hero section
        const fluidAnimation = new FluidAnimation(canvas, {
            SIM_RESOLUTION: 128,
            DYE_RESOLUTION: 1440,
            DENSITY_DISSIPATION: 3.5,
            VELOCITY_DISSIPATION: 2,
            PRESSURE: 0.1,
            PRESSURE_ITERATIONS: 20,
            CURL: 3,
            SPLAT_RADIUS: 0.2,
            SPLAT_FORCE: 6000,
            SHADING: true,
            COLOR_UPDATE_SPEED: 10,
            BACK_COLOR: { r: 0.02, g: 0.02, b: 0.05 },
            TRANSPARENT: true
        });
    }
});