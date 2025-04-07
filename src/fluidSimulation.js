import { getSupportedFormat, getResolution, scaleByPixelRatio, generateColor, wrap } from './webglUtils';
import { initPrograms } from './webglPrograms';
import { createDitheringTexture } from './ditheringTexture';

export class FluidSimulation {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.gl = null;
    this.ext = null;
    this.pointers = [];
    this.splatStack = [];
    this.lastUpdateTime = Date.now();
    this.colorUpdateTimer = 0.0;
    this.programs = null;
    this.dye = null;
    this.velocity = null;
    this.divergence = null;
    this.curl = null;
    this.pressure = null;
    this.bloom = null;
    this.bloomFramebuffers = [];
    this.sunrays = null;
    this.sunraysTemp = null;
    this.ditheringTexture = null;
    this.quadVertexBuffer = null;
    this.quadIndexBuffer = null;
    this.quadVAO = null;
  }

  init() {
    this.initWebGL();
    this.initPrograms();
    this.initFramebuffers();
    this.ditheringTexture = createDitheringTexture(this.gl);
    this.multipleSplats(parseInt(Math.random() * 20) + 5);
    this.update();
  }

  initWebGL() {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false
    };

    this.gl = this.canvas.getContext("webgl2", params);
    const isWebGL2 = !!this.gl;
    if (!isWebGL2) {
      this.gl = this.canvas.getContext("webgl", params) || this.canvas.getContext("experimental-webgl", params);
    }

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
      this.gl.getExtension("EXT_color_buffer_float");
      supportLinearFiltering = this.gl.getExtension("OES_texture_float_linear");
    } else {
      halfFloat = this.gl.getExtension("OES_texture_half_float");
      supportLinearFiltering = this.gl.getExtension("OES_texture_half_float_linear");
    }

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const halfFloatTexType = isWebGL2 ? this.gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
    let formatRGBA;
    let formatRG;
    let formatR;

    if (isWebGL2) {
      formatRGBA = getSupportedFormat(this.gl, this.gl.RGBA16F, this.gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(this.gl, this.gl.RG16F, this.gl.RG, halfFloatTexType);
      formatR = getSupportedFormat(this.gl, this.gl.R16F, this.gl.RED, halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(this.gl, this.gl.RGBA, this.gl.RGBA, halfFloatTexType);
      formatRG = getSupportedFormat(this.gl, this.gl.RGBA, this.gl.RGBA, halfFloatTexType);
      formatR = getSupportedFormat(this.gl, this.gl.RGBA, this.gl.RGBA, halfFloatTexType);
    }

    this.ext = {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering
    };

    // Create quad buffers
    const vertices = new Float32Array([
      -1, -1,
      1, -1,
      1, 1,
      -1, 1
    ]);

    const indices = new Uint16Array([
      0, 1, 2,
      0, 2, 3
    ]);

    // Create and bind vertex buffer
    this.quadVertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    // Create and bind element buffer
    this.quadIndexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

    // Create vertex array object
    this.quadVAO = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.quadVAO);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(0);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.quadIndexBuffer);
    this.gl.bindVertexArray(null);
  }

  initPrograms() {
    this.programs = initPrograms(this.gl);
  }

  initFramebuffers() {
    let simRes = getResolution(this.config.SIM_RESOLUTION);
    let dyeRes = getResolution(this.config.DYE_RESOLUTION);

    const texType = this.ext.halfFloatTexType;
    const rgba = this.ext.formatRGBA;
    const rg = this.ext.formatRG;
    const r = this.ext.formatR;
    const filtering = this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST;

    this.gl.disable(this.gl.BLEND);

    if (this.dye == null)
      this.dye = this.createDoubleFBO(
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
    else
      this.dye = this.resizeDoubleFBO(
        this.dye,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );

    if (this.velocity == null)
      this.velocity = this.createDoubleFBO(
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );
    else
      this.velocity = this.resizeDoubleFBO(
        this.velocity,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      );

    this.divergence = this.createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      this.gl.NEAREST
    );
    this.curl = this.createFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      this.gl.NEAREST
    );
    this.pressure = this.createDoubleFBO(
      simRes.width,
      simRes.height,
      r.internalFormat,
      r.format,
      texType,
      this.gl.NEAREST
    );

    this.initBloomFramebuffers();
    this.initSunraysFramebuffers();
  }

  initBloomFramebuffers() {
    let res = getResolution(this.config.BLOOM_RESOLUTION);

    const texType = this.ext.halfFloatTexType;
    const rgba = this.ext.formatRGBA;
    const filtering = this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST;

    this.bloom = this.createFBO(
      res.width,
      res.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );

    this.bloomFramebuffers.length = 0;
    for (let i = 0; i < this.config.BLOOM_ITERATIONS; i++) {
      let width = res.width >> (i + 1);
      let height = res.height >> (i + 1);

      if (width < 2 || height < 2) break;

      let fbo = this.createFBO(
        width,
        height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );
      this.bloomFramebuffers.push(fbo);
    }
  }

  initSunraysFramebuffers() {
    let res = getResolution(this.config.SUNRAYS_RESOLUTION);

    const texType = this.ext.halfFloatTexType;
    const r = this.ext.formatR;
    const filtering = this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST;

    this.sunrays = this.createFBO(
      res.width,
      res.height,
      r.internalFormat,
      r.format,
      texType,
      filtering
    );
    this.sunraysTemp = this.createFBO(
      res.width,
      res.height,
      r.internalFormat,
      r.format,
      texType,
      filtering
    );
  }

  createFBO(w, h, internalFormat, format, type, param) {
    const gl = this.gl;
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const texelSizeX = 1.0 / w;
    const texelSizeY = 1.0 / h;

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      texture,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  createDoubleFBO(w, h, internalFormat, format, type, param) {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);

    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      set read(value) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value) {
        fbo2 = value;
      },
      swap() {
        let temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  }

  resizeFBO(target, w, h, internalFormat, format, type, param) {
    let newFBO = this.createFBO(w, h, internalFormat, format, type, param);
    this.programs.copyProgram.bind();
    this.gl.uniform1i(this.programs.copyProgram.uniforms.uTexture, target.attach(0));
    this.blit(newFBO);
    return newFBO;
  }

  resizeDoubleFBO(target, w, h, internalFormat, format, type, param) {
    if (target.width == w && target.height == h) return target;
    target.read = this.resizeFBO(target.read, w, h, internalFormat, format, type, param);
    target.write = this.createFBO(w, h, internalFormat, format, type, param);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
  }

  blit(target, clear = false) {
    if (target == null) {
      this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    } else {
      this.gl.viewport(0, 0, target.width, target.height);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, target.fbo);
    }
    if (clear) {
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }
    this.gl.bindVertexArray(this.quadVAO);
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    this.gl.bindVertexArray(null);
  }

  update() {
    const dt = this.calcDeltaTime();
    if (this.resizeCanvas()) this.initFramebuffers();
    this.updateColors(dt);
    this.applyInputs();
    if (!this.config.PAUSED) this.step(dt);
    this.render(null);
    requestAnimationFrame(() => this.update());
  }

  calcDeltaTime() {
    let now = Date.now();
    let dt = (now - this.lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    this.lastUpdateTime = now;
    return dt;
  }

  resizeCanvas() {
    let width = scaleByPixelRatio(this.canvas.clientWidth);
    let height = scaleByPixelRatio(this.canvas.clientHeight);
    if (this.canvas.width != width || this.canvas.height != height) {
      this.canvas.width = width;
      this.canvas.height = height;
      return true;
    }
    return false;
  }

  updateColors(dt) {
    if (!this.config.COLORFUL) return;

    this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
    if (this.colorUpdateTimer >= 1) {
      this.colorUpdateTimer = wrap(this.colorUpdateTimer, 0, 1);
      this.pointers.forEach((p) => {
        p.color = generateColor();
      });
    }
  }

  applyInputs() {
    if (this.splatStack.length > 0) {
      this.multipleSplats(this.splatStack.pop());
    }

    this.pointers.forEach(p => {
      if (p.moved) {
        p.moved = false;
        const dx = p.deltaX * this.config.SPLAT_FORCE;
        const dy = p.deltaY * this.config.SPLAT_FORCE;
        this.splat(p.texcoordX, p.texcoordY, dx, dy, p.color);
      }
    });
  }

  step(dt) {
    this.gl.disable(this.gl.BLEND);

    this.programs.curlProgram.bind();
    this.gl.uniform2f(
      this.programs.curlProgram.uniforms.texelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY
    );
    this.gl.uniform1i(this.programs.curlProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl);

    this.programs.vorticityProgram.bind();
    this.gl.uniform2f(
      this.programs.vorticityProgram.uniforms.texelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY
    );
    this.gl.uniform1i(this.programs.vorticityProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.gl.uniform1i(this.programs.vorticityProgram.uniforms.uCurl, this.curl.attach(1));
    this.gl.uniform1f(this.programs.vorticityProgram.uniforms.curl, this.config.CURL);
    this.gl.uniform1f(this.programs.vorticityProgram.uniforms.dt, dt);
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.programs.divergenceProgram.bind();
    this.gl.uniform2f(
      this.programs.divergenceProgram.uniforms.texelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY
    );
    this.gl.uniform1i(this.programs.divergenceProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence);

    this.programs.clearProgram.bind();
    this.gl.uniform1i(this.programs.clearProgram.uniforms.uTexture, this.pressure.read.attach(0));
    this.gl.uniform1f(this.programs.clearProgram.uniforms.value, this.config.PRESSURE);
    this.blit(this.pressure.write);
    this.pressure.swap();

    this.programs.pressureProgram.bind();
    this.gl.uniform2f(
      this.programs.pressureProgram.uniforms.texelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY
    );
    this.gl.uniform1i(this.programs.pressureProgram.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      this.gl.uniform1i(this.programs.pressureProgram.uniforms.uPressure, this.pressure.read.attach(1));
      this.blit(this.pressure.write);
      this.pressure.swap();
    }

    this.programs.gradienSubtractProgram.bind();
    this.gl.uniform2f(
      this.programs.gradienSubtractProgram.uniforms.texelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY
    );
    this.gl.uniform1i(this.programs.gradienSubtractProgram.uniforms.uPressure, this.pressure.read.attach(0));
    this.gl.uniform1i(this.programs.gradienSubtractProgram.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write);
    this.velocity.swap();

    this.programs.advectionProgram.bind();
    this.gl.uniform2f(
      this.programs.advectionProgram.uniforms.texelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY
    );
    if (!this.ext.supportLinearFiltering)
      this.gl.uniform2f(
        this.programs.advectionProgram.uniforms.dyeTexelSize,
        this.velocity.texelSizeX,
        this.velocity.texelSizeY
      );
    let velocityId = this.velocity.read.attach(0);
    this.gl.uniform1i(this.programs.advectionProgram.uniforms.uVelocity, velocityId);
    this.gl.uniform1i(this.programs.advectionProgram.uniforms.uSource, velocityId);
    this.gl.uniform1f(this.programs.advectionProgram.uniforms.dt, dt);
    this.gl.uniform1f(
      this.programs.advectionProgram.uniforms.dissipation,
      this.config.VELOCITY_DISSIPATION
    );
    this.blit(this.velocity.write);
    this.velocity.swap();

    if (!this.ext.supportLinearFiltering)
      this.gl.uniform2f(
        this.programs.advectionProgram.uniforms.dyeTexelSize,
        this.dye.texelSizeX,
        this.dye.texelSizeY
      );
    this.gl.uniform1i(this.programs.advectionProgram.uniforms.uVelocity, this.velocity.read.attach(0));
    this.gl.uniform1i(this.programs.advectionProgram.uniforms.uSource, this.dye.read.attach(1));
    this.gl.uniform1f(
      this.programs.advectionProgram.uniforms.dissipation,
      this.config.DENSITY_DISSIPATION
    );
    this.blit(this.dye.write);
    this.dye.swap();
  }

  normalizeColor(input) {
    let output = {
      r: input.r / 255,
      g: input.g / 255,
      b: input.b / 255
    };
    return output;
  }

  render(target) {
    if (this.config.BLOOM) this.applyBloom(this.dye.read, this.bloom);
    if (this.config.SUNRAYS) {
      this.applySunrays(this.dye.read, this.dye.write, this.sunrays);
      this.blur(this.sunrays, this.sunraysTemp, 1);
    }

    if (target == null || !this.config.TRANSPARENT) {
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.enable(this.gl.BLEND);
    } else {
      this.gl.disable(this.gl.BLEND);
    }

    if (!this.config.TRANSPARENT) this.drawColor(target, this.normalizeColor(this.config.BACK_COLOR));
    if (target == null && this.config.TRANSPARENT) this.drawCheckerboard(target);
    this.drawDisplay(target);
  }

  drawColor(target, color) {
    this.programs.colorProgram.bind();
    this.gl.uniform4f(this.programs.colorProgram.uniforms.color, color.r, color.g, color.b, 1);
    this.blit(target);
  }

  drawCheckerboard(target) {
    this.programs.checkerboardProgram.bind();
    this.gl.uniform1f(
      this.programs.checkerboardProgram.uniforms.aspectRatio,
      this.canvas.width / this.canvas.height
    );
    this.blit(target);
  }

  drawDisplay(target) {
    const gl = this.gl;
    if (this.config.SHADING) {
      gl.disable(gl.BLEND);
      this.programs.displayMaterial.bind();
      gl.uniform1i(this.programs.displayMaterial.uniforms.uTexture, this.dye.read.attach(0));
      gl.uniform1i(this.programs.displayMaterial.uniforms.uBloom, this.bloom.attach(1));
      gl.uniform1i(this.programs.displayMaterial.uniforms.uDithering, this.ditheringTexture.attach(2));
      const scale = this.getTextureScale(this.dye.read, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.programs.displayMaterial.uniforms.uTexelSize, 1.0 / this.canvas.width, 1.0 / this.canvas.height);
      gl.uniform2f(this.programs.displayMaterial.uniforms.uDitherScale, scale.x, scale.y);
      gl.uniform1f(this.programs.displayMaterial.uniforms.uDitherSize, 8.0);
      gl.uniform1f(this.programs.displayMaterial.uniforms.uIntensity, this.config.SHADING ? 1.0 : 0.0);
      this.blit(target);
    } else {
      gl.disable(gl.BLEND);
      this.programs.copyMaterial.bind();
      gl.uniform1i(this.programs.copyMaterial.uniforms.uTexture, this.dye.read.attach(0));
      this.blit(target);
    }
  }

  applyBloom(source, destination) {
    if (this.bloomFramebuffers.length < 2) return;

    let last = destination;

    this.gl.disable(this.gl.BLEND);
    this.programs.bloomPrefilterProgram.bind();
    let knee = this.config.BLOOM_THRESHOLD * this.config.BLOOM_SOFT_KNEE + 0.0001;
    let curve0 = this.config.BLOOM_THRESHOLD - knee;
    let curve1 = knee * 2;
    let curve2 = 0.25 / knee;
    this.gl.uniform3f(this.programs.bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
    this.gl.uniform1f(
      this.programs.bloomPrefilterProgram.uniforms.threshold,
      this.config.BLOOM_THRESHOLD
    );
    this.gl.uniform1i(this.programs.bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
    this.blit(last);

    this.programs.bloomBlurProgram.bind();
    for (let i = 0; i < this.bloomFramebuffers.length; i++) {
      let dest = this.bloomFramebuffers[i];
      this.gl.uniform2f(
        this.programs.bloomBlurProgram.uniforms.texelSize,
        last.texelSizeX,
        last.texelSizeY
      );
      this.gl.uniform1i(this.programs.bloomBlurProgram.uniforms.uTexture, last.attach(0));
      this.blit(dest);
      last = dest;
    }

    this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
    this.gl.enable(this.gl.BLEND);

    for (let i = this.bloomFramebuffers.length - 2; i >= 0; i--) {
      let baseTex = this.bloomFramebuffers[i];
      this.gl.uniform2f(
        this.programs.bloomBlurProgram.uniforms.texelSize,
        last.texelSizeX,
        last.texelSizeY
      );
      this.gl.uniform1i(this.programs.bloomBlurProgram.uniforms.uTexture, last.attach(0));
      this.gl.viewport(0, 0, baseTex.width, baseTex.height);
      this.blit(baseTex);
      last = baseTex;
    }

    this.gl.disable(this.gl.BLEND);
    this.programs.bloomFinalProgram.bind();
    this.gl.uniform2f(
      this.programs.bloomFinalProgram.uniforms.texelSize,
      last.texelSizeX,
      last.texelSizeY
    );
    this.gl.uniform1i(this.programs.bloomFinalProgram.uniforms.uTexture, last.attach(0));
    this.gl.uniform1f(this.programs.bloomFinalProgram.uniforms.intensity, this.config.BLOOM_INTENSITY);
    this.blit(destination);
  }

  applySunrays(source, mask, destination) {
    this.gl.disable(this.gl.BLEND);
    this.programs.sunraysMaskProgram.bind();
    this.gl.uniform1i(this.programs.sunraysMaskProgram.uniforms.uTexture, source.attach(0));
    this.blit(mask);

    this.programs.sunraysProgram.bind();
    this.gl.uniform1f(this.programs.sunraysProgram.uniforms.weight, this.config.SUNRAYS_WEIGHT);
    this.gl.uniform1i(this.programs.sunraysProgram.uniforms.uTexture, mask.attach(0));
    this.blit(destination);
  }

  blur(target, temp, iterations) {
    this.programs.blurProgram.bind();
    for (let i = 0; i < iterations; i++) {
      this.gl.uniform2f(this.programs.blurProgram.uniforms.texelSize, target.texelSizeX, 0.0);
      this.gl.uniform1i(this.programs.blurProgram.uniforms.uTexture, target.attach(0));
      this.blit(temp);

      this.gl.uniform2f(this.programs.blurProgram.uniforms.texelSize, 0.0, target.texelSizeY);
      this.gl.uniform1i(this.programs.blurProgram.uniforms.uTexture, temp.attach(0));
      this.blit(target);
    }
  }

  splat(x, y, dx, dy, color) {
    const gl = this.gl;
    this.programs.splatProgram.bind();
    gl.uniform1i(this.programs.splatProgram.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.programs.splatProgram.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.programs.splatProgram.uniforms.point, x, y);
    gl.uniform3f(this.programs.splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(this.programs.splatProgram.uniforms.radius, this.correctRadius(this.config.SPLAT_RADIUS / 100.0));
    this.blit(this.velocity.write);
    this.velocity.swap();

    gl.uniform1i(this.programs.splatProgram.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform3f(this.programs.splatProgram.uniforms.color, color.r, color.g, color.b);
    this.blit(this.dye.write);
    this.dye.swap();
  }

  correctRadius(radius) {
    let aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio > 1) radius *= aspectRatio;
    return radius;
  }

  correctDeltaX(delta) {
    let aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }

  correctDeltaY(delta) {
    let aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }

  getTextureScale(texture, width, height) {
    return {
      x: width / texture.width,
      y: height / texture.height
    };
  }

  multipleSplats(amount) {
    for (let i = 0; i < amount; i++) {
      const color = generateColor();
      color.r *= 10.0;
      color.g *= 10.0;
      color.b *= 10.0;
      const x = Math.random();
      const y = Math.random();
      const dx = this.config.RANDOM_SPLAT_FORCE * (Math.random() - 0.5);
      const dy = this.config.RANDOM_SPLAT_FORCE * (Math.random() - 0.5);
      this.splat(x, y, dx, dy, color);
    }
  }
} 