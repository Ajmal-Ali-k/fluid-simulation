import {
  baseVertexShader,
  blurVertexShader,
  blurShader,
  copyShader,
  clearShader,
  colorShader,
  checkerboardShader,
  displayShaderSource,
  bloomPrefilterShader,
  bloomBlurShader,
  bloomFinalShader,
  sunraysMaskShader,
  sunraysShader,
  splatShader,
  advectionShader,
  divergenceShader,
  curlShader,
  vorticityShader,
  pressureShader,
  gradientSubtractShader
} from './shaders';

export class Material {
  constructor(gl, vertexShader, fragmentShaderSource) {
    this.gl = gl;
    this.vertexShader = vertexShader;
    this.fragmentShaderSource = fragmentShaderSource;
    this.programs = {};
    this.activeProgram = null;
    this.uniforms = {};
  }

  setKeywords(keywords) {
    if (!this.gl) return;

    let hash = 0;
    for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);

    let program = this.programs[hash];
    if (program == null) {
      let fragmentShader = compileShader(this.gl, this.fragmentShaderSource, this.gl.FRAGMENT_SHADER);
      program = createProgram(this.gl, this.vertexShader, fragmentShader);
      this.programs[hash] = program;
    }

    if (program == this.activeProgram) return;

    this.uniforms = getUniforms(this.gl, program);
    this.activeProgram = program;
  }

  bind() {
    if (this.gl && this.activeProgram) {
      this.gl.useProgram(this.activeProgram);
    }
  }

  attach(textureUnit, name) {
    if (!this.gl || !this.activeProgram || !this.uniforms[name]) return;
    
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.uniform1i(this.uniforms[name], textureUnit);
  }
}

export class Program {
  constructor(gl, vertexShader, fragmentShader) {
    this.gl = gl;
    this.program = createProgram(gl, vertexShader, fragmentShader);
    if (!this.program) {
      console.error('Failed to create program');
      return;
    }
    this.uniforms = getUniforms(gl, this.program);
  }

  bind() {
    if (this.gl && this.program) {
      this.gl.useProgram(this.program);
    }
  }

  attach(textureUnit, name) {
    if (!this.gl || !this.program || !this.uniforms[name]) return;
    
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.uniform1i(this.uniforms[name], textureUnit);
  }
}

function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  if (!vertexShader || !fragmentShader) {
    console.error('Missing vertex or fragment shader');
    return null;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function getUniforms(gl, program) {
  if (!program) {
    console.error('Invalid program');
    return {};
  }

  const uniforms = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  
  for (let i = 0; i < uniformCount; i++) {
    const uniformInfo = gl.getActiveUniform(program, i);
    if (uniformInfo) {
      uniforms[uniformInfo.name] = gl.getUniformLocation(program, uniformInfo.name);
    }
  }
  
  return uniforms;
}

function hashCode(s) {
  if (s.length == 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function initPrograms(gl) {
  const programs = {};

  // Compile shaders
  const baseVertexShaderObj = compileShader(gl, baseVertexShader, gl.VERTEX_SHADER);
  const blurVertexShaderObj = compileShader(gl, blurVertexShader, gl.VERTEX_SHADER);
  const blurShaderObj = compileShader(gl, blurShader, gl.FRAGMENT_SHADER);
  const copyShaderObj = compileShader(gl, copyShader, gl.FRAGMENT_SHADER);
  const clearShaderObj = compileShader(gl, clearShader, gl.FRAGMENT_SHADER);
  const colorShaderObj = compileShader(gl, colorShader, gl.FRAGMENT_SHADER);
  const checkerboardShaderObj = compileShader(gl, checkerboardShader, gl.FRAGMENT_SHADER);
  const displayShaderObj = compileShader(gl, displayShaderSource, gl.FRAGMENT_SHADER);
  const bloomPrefilterShaderObj = compileShader(gl, bloomPrefilterShader, gl.FRAGMENT_SHADER);
  const bloomBlurShaderObj = compileShader(gl, bloomBlurShader, gl.FRAGMENT_SHADER);
  const bloomFinalShaderObj = compileShader(gl, bloomFinalShader, gl.FRAGMENT_SHADER);
  const sunraysMaskShaderObj = compileShader(gl, sunraysMaskShader, gl.FRAGMENT_SHADER);
  const sunraysShaderObj = compileShader(gl, sunraysShader, gl.FRAGMENT_SHADER);
  const splatShaderObj = compileShader(gl, splatShader, gl.FRAGMENT_SHADER);
  const advectionShaderObj = compileShader(gl, advectionShader, gl.FRAGMENT_SHADER);
  const divergenceShaderObj = compileShader(gl, divergenceShader, gl.FRAGMENT_SHADER);
  const curlShaderObj = compileShader(gl, curlShader, gl.FRAGMENT_SHADER);
  const vorticityShaderObj = compileShader(gl, vorticityShader, gl.FRAGMENT_SHADER);
  const pressureShaderObj = compileShader(gl, pressureShader, gl.FRAGMENT_SHADER);
  const gradientSubtractShaderObj = compileShader(gl, gradientSubtractShader, gl.FRAGMENT_SHADER);

  // Create programs
  if (baseVertexShaderObj && clearShaderObj) {
    programs.clearProgram = new Program(gl, baseVertexShaderObj, clearShaderObj);
  }
  if (baseVertexShaderObj && colorShaderObj) {
    programs.colorProgram = new Program(gl, baseVertexShaderObj, colorShaderObj);
  }
  if (baseVertexShaderObj && checkerboardShaderObj) {
    programs.checkerboardProgram = new Program(gl, baseVertexShaderObj, checkerboardShaderObj);
  }
  if (blurVertexShaderObj && blurShaderObj) {
    programs.blurProgram = new Program(gl, blurVertexShaderObj, blurShaderObj);
  }
  if (baseVertexShaderObj && copyShaderObj) {
    programs.copyProgram = new Program(gl, baseVertexShaderObj, copyShaderObj);
  }
  if (baseVertexShaderObj && displayShaderObj) {
    programs.displayMaterial = new Program(gl, baseVertexShaderObj, displayShaderObj);
  }
  if (baseVertexShaderObj && bloomPrefilterShaderObj) {
    programs.bloomPrefilterProgram = new Program(gl, baseVertexShaderObj, bloomPrefilterShaderObj);
  }
  if (blurVertexShaderObj && bloomBlurShaderObj) {
    programs.bloomBlurProgram = new Program(gl, blurVertexShaderObj, bloomBlurShaderObj);
  }
  if (baseVertexShaderObj && bloomFinalShaderObj) {
    programs.bloomFinalProgram = new Program(gl, baseVertexShaderObj, bloomFinalShaderObj);
  }
  if (baseVertexShaderObj && sunraysMaskShaderObj) {
    programs.sunraysMaskProgram = new Program(gl, baseVertexShaderObj, sunraysMaskShaderObj);
  }
  if (blurVertexShaderObj && sunraysShaderObj) {
    programs.sunraysProgram = new Program(gl, blurVertexShaderObj, sunraysShaderObj);
  }
  if (baseVertexShaderObj && splatShaderObj) {
    programs.splatProgram = new Program(gl, baseVertexShaderObj, splatShaderObj);
  }
  if (baseVertexShaderObj && advectionShaderObj) {
    programs.advectionProgram = new Program(gl, baseVertexShaderObj, advectionShaderObj);
  }
  if (baseVertexShaderObj && divergenceShaderObj) {
    programs.divergenceProgram = new Program(gl, baseVertexShaderObj, divergenceShaderObj);
  }
  if (baseVertexShaderObj && curlShaderObj) {
    programs.curlProgram = new Program(gl, baseVertexShaderObj, curlShaderObj);
  }
  if (baseVertexShaderObj && vorticityShaderObj) {
    programs.vorticityProgram = new Program(gl, baseVertexShaderObj, vorticityShaderObj);
  }
  if (baseVertexShaderObj && pressureShaderObj) {
    programs.pressureProgram = new Program(gl, baseVertexShaderObj, pressureShaderObj);
  }
  if (baseVertexShaderObj && gradientSubtractShaderObj) {
    programs.gradienSubtractProgram = new Program(gl, baseVertexShaderObj, gradientSubtractShaderObj);
  }

  return programs;
} 