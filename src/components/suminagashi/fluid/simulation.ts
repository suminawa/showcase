/**
 * Stable Fluids 法の WebGL2 実装（依存ゼロ・React 非依存）。
 * モジュールスコープで window / document に触れない（Vitest の node 環境で import されるため）。
 */
import {
  advectionShader,
  baseVertexShader,
  clearShader,
  copyShader,
  curlShader,
  displayShader,
  divergenceShader,
  gradientSubtractShader,
  pressureShader,
  splatShader,
  vorticityShader,
} from "./shaders";

// ---- 純粋関数・定数（テスト対象） ----

export type InkName = "indigo" | "carbon";

/** 紙白からの吸収量（表示色 = PAPER − 吸収） */
export const INK_ABSORPTION: Record<InkName, [number, number, number]> = {
  indigo: [0.83, 0.71, 0.5],
  carbon: [0.86, 0.855, 0.82],
};

/** 紙白 #f6f3ed 相当 */
export const PAPER: [number, number, number] = [0.965, 0.953, 0.929];

export type EntranceDrop = {
  atMs: number;
  x: number;
  y: number;
  ink: InkName;
  radius: number;
};

/** エントランス演出: 4 滴が時間差で落ちる */
export const ENTRANCE_DROPS: EntranceDrop[] = [
  { atMs: 300, x: 0.5, y: 0.55, ink: "carbon", radius: 0.0034 },
  { atMs: 950, x: 0.44, y: 0.5, ink: "indigo", radius: 0.0046 },
  { atMs: 1600, x: 0.58, y: 0.46, ink: "indigo", radius: 0.0038 },
  { atMs: 2200, x: 0.52, y: 0.62, ink: "carbon", radius: 0.003 },
];

/** (prevMs, nowMs] に落ちるべき滴を返す */
export function dropsBetween(
  prevMs: number,
  nowMs: number,
  drops: EntranceDrop[] = ENTRANCE_DROPS,
): EntranceDrop[] {
  return drops.filter((drop) => drop.atMs > prevMs && drop.atMs <= nowMs);
}

/** タップ n 回目のインク。墨 1 : 藍 2 の繰り返し */
export function pickInk(index: number): InkName {
  return index % 3 === 0 ? "carbon" : "indigo";
}

/** スプラット半径のアスペクト補正 */
export function correctRadius(
  radius: number,
  width: number,
  height: number,
): number {
  const aspect = width / height;
  return aspect > 1 ? radius * aspect : radius;
}

// ---- WebGL エンジン ----

type ProgramInfo = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  read: FBO;
  write: FBO;
  swap: () => void;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
};

const SIM_RES_STEPS = [256, 192, 128];
const DYE_RES_STEPS = [1024, 768, 512];
const PRESSURE_ITERATIONS = 24;
const CURL_STRENGTH = 6;
const VELOCITY_DISSIPATION = 0.35;
const DYE_DISSIPATION = 0.015;
const SPLAT_FORCE = 5200;
const BASE_SPLAT_RADIUS = 0.0022;
const MAX_DPR = 2;

export class FluidSimulation {
  supported = false;

  private canvas: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private linearFiltering = false;
  private resStep = 0;

  private programs!: {
    copy: ProgramInfo;
    clear: ProgramInfo;
    splat: ProgramInfo;
    advection: ProgramInfo;
    divergence: ProgramInfo;
    curl: ProgramInfo;
    vorticity: ProgramInfo;
    pressure: ProgramInfo;
    gradient: ProgramInfo;
    display: ProgramInfo;
  };

  private velocity!: DoubleFBO;
  private dye!: DoubleFBO;
  private pressure!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;

  private inkCounter = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
    });
    if (!gl) return;
    this.gl = gl;

    if (!gl.getExtension("EXT_color_buffer_float")) return;
    this.linearFiltering = !!gl.getExtension("OES_texture_float_linear");

    this.compilePrograms();
    this.initGeometry();
    this.resize();
    this.supported = true;
  }

  // ---- 公開 API ----

  resize(): void {
    const gl = this.gl;
    const dpr = Math.min(
      MAX_DPR,
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    );
    const width = Math.max(2, Math.floor(this.canvas.clientWidth * dpr));
    const height = Math.max(2, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width === width && this.canvas.height === height && this.velocity) {
      return;
    }
    this.canvas.width = width;
    this.canvas.height = height;

    const simRes = this.fitResolution(SIM_RES_STEPS[this.resStep]);
    const dyeRes = this.fitResolution(DYE_RES_STEPS[this.resStep]);

    const filter = this.linearFiltering ? gl.LINEAR : gl.NEAREST;
    const oldDye = this.dye;

    this.velocity = this.createDoubleFBO(simRes.w, simRes.h, gl.RG16F, gl.RG, filter);
    this.pressure = this.createDoubleFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);
    this.divergence = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);
    this.curl = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);

    const newDye = this.createDoubleFBO(dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA, filter);
    if (oldDye) {
      this.blit(oldDye.read, newDye.read, this.programs.copy);
    }
    this.dye = newDye;
  }

  step(dtSec: number): void {
    if (!this.supported) return;
    const gl = this.gl;
    const dt = Math.min(dtSec, 1 / 30);
    gl.disable(gl.BLEND);

    // 1. curl
    this.useProgram(this.programs.curl, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.curl.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blitTo(this.curl);

    // 2. vorticity confinement
    this.useProgram(this.programs.vorticity, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.vorticity.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.programs.vorticity.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(this.programs.vorticity.uniforms.uCurlStrength, CURL_STRENGTH);
    gl.uniform1f(this.programs.vorticity.uniforms.uDt, dt);
    this.blitTo(this.velocity.write);
    this.velocity.swap();

    // 3. divergence
    this.useProgram(this.programs.divergence, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.divergence.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blitTo(this.divergence);

    // 4. pressure (jacobi)
    this.useProgram(this.programs.clear, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.clear.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(this.programs.clear.uniforms.uValue, 0.8);
    this.blitTo(this.pressure.write);
    this.pressure.swap();

    this.useProgram(this.programs.pressure, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.pressure.uniforms.uDivergence, this.divergence.attach(0));
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(this.programs.pressure.uniforms.uPressure, this.pressure.read.attach(1));
      this.blitTo(this.pressure.write);
      this.pressure.swap();
    }

    // 5. gradient subtract
    this.useProgram(this.programs.gradient, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.gradient.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.programs.gradient.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blitTo(this.velocity.write);
    this.velocity.swap();

    // 6. advect velocity
    this.useProgram(this.programs.advection, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform2f(
      this.programs.advection.uniforms.uDyeTexelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY,
    );
    gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.programs.advection.uniforms.uSource, this.velocity.read.attach(0));
    gl.uniform1f(this.programs.advection.uniforms.uDt, dt);
    gl.uniform1f(this.programs.advection.uniforms.uDissipation, VELOCITY_DISSIPATION);
    this.blitTo(this.velocity.write);
    this.velocity.swap();

    // 7. advect dye
    gl.uniform2f(
      this.programs.advection.uniforms.uDyeTexelSize,
      this.dye.texelSizeX,
      this.dye.texelSizeY,
    );
    gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.programs.advection.uniforms.uSource, this.dye.read.attach(1));
    gl.uniform1f(this.programs.advection.uniforms.uDissipation, DYE_DISSIPATION);
    this.blitTo(this.dye.write);
    this.dye.swap();
  }

  /** 微弱な漂い: 中心の周りをゆっくり巡る点から接線方向の弱い力 */
  applyDrift(timeMs: number): void {
    if (!this.supported) return;
    const angle = timeMs * 0.00012;
    const cx = 0.5 + 0.22 * Math.cos(angle);
    const cy = 0.5 + 0.22 * Math.sin(angle);
    const dx = -Math.sin(angle) * 1.6;
    const dy = Math.cos(angle) * 1.6;
    this.splatVelocityRaw(cx, cy, dx, dy, BASE_SPLAT_RADIUS * 4);
  }

  splatVelocity(x: number, y: number, dx: number, dy: number): void {
    this.splatVelocityRaw(x, y, dx * SPLAT_FORCE, dy * SPLAT_FORCE, BASE_SPLAT_RADIUS);
  }

  splatInk(x: number, y: number, ink: InkName, radius = 0.0038): void {
    if (!this.supported) return;
    const gl = this.gl;
    const absorption = INK_ABSORPTION[ink];
    this.useProgram(this.programs.splat, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.programs.splat.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform1f(this.programs.splat.uniforms.uAspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.programs.splat.uniforms.uPoint, x, y);
    gl.uniform3f(
      this.programs.splat.uniforms.uColor,
      absorption[0],
      absorption[1],
      absorption[2],
    );
    gl.uniform1f(
      this.programs.splat.uniforms.uRadius,
      correctRadius(radius, this.canvas.width, this.canvas.height),
    );
    this.blitTo(this.dye.write);
    this.dye.swap();
    // 滴が落ちた反動の弱い外向き流れ
    this.splatVelocityRaw(x, y, 0, 0.8, radius * 3);
  }

  nextInk(): InkName {
    return pickInk(this.inkCounter++);
  }

  /** 左から右へ表面を撫でる風 */
  fan(): void {
    if (!this.supported) return;
    for (let i = 0; i < 9; i++) {
      const y = 0.14 + (i / 8) * 0.72;
      this.splatVelocityRaw(0.06, y, 9.5, (Math.random() - 0.5) * 1.4, BASE_SPLAT_RADIUS * 6);
    }
  }

  /** 流れを一気に減衰させる */
  still(): void {
    if (!this.supported) return;
    const gl = this.gl;
    this.useProgram(this.programs.clear, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.clear.uniforms.uTexture, this.velocity.read.attach(0));
    gl.uniform1f(this.programs.clear.uniforms.uValue, 0.12);
    this.blitTo(this.velocity.write);
    this.velocity.swap();
  }

  clearAll(): void {
    if (!this.supported) return;
    const gl = this.gl;
    for (const target of [
      this.velocity.read,
      this.velocity.write,
      this.dye.read,
      this.dye.write,
      this.pressure.read,
      this.pressure.write,
    ]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.inkCounter = 0;
  }

  render(): void {
    if (!this.supported) return;
    const gl = this.gl;
    this.useProgram(this.programs.display, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.programs.display.uniforms.uDye, this.dye.read.attach(0));
    gl.uniform3f(this.programs.display.uniforms.uPaper, PAPER[0], PAPER[1], PAPER[2]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** render 直後に同期で toBlob（preserveDrawingBuffer なしでも同一タスク内なら有効） */
  captureBlob(): Promise<Blob | null> {
    this.render();
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  downscale(): boolean {
    if (this.resStep >= SIM_RES_STEPS.length - 1) return false;
    this.resStep += 1;
    this.canvas.width = 0; // resize を強制
    this.resize();
    return true;
  }

  destroy(): void {
    const ext = this.gl?.getExtension("WEBGL_lose_context");
    ext?.loseContext();
  }

  // ---- 内部実装 ----

  private splatVelocityRaw(
    x: number,
    y: number,
    dx: number,
    dy: number,
    radius: number,
  ): void {
    if (!this.velocity) return;
    const gl = this.gl;
    this.useProgram(this.programs.splat, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.splat.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.programs.splat.uniforms.uAspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.programs.splat.uniforms.uPoint, x, y);
    gl.uniform3f(this.programs.splat.uniforms.uColor, dx, dy, 0);
    gl.uniform1f(
      this.programs.splat.uniforms.uRadius,
      correctRadius(radius, this.canvas.width, this.canvas.height),
    );
    this.blitTo(this.velocity.write);
    this.velocity.swap();
  }

  private compilePrograms(): void {
    const defines = this.linearFiltering ? "" : "#define MANUAL_FILTERING\n";
    this.programs = {
      copy: this.createProgram(copyShader),
      clear: this.createProgram(clearShader),
      splat: this.createProgram(splatShader),
      advection: this.createProgram(
        advectionShader.replace("#version 300 es\n", `#version 300 es\n${defines}`),
      ),
      divergence: this.createProgram(divergenceShader),
      curl: this.createProgram(curlShader),
      vorticity: this.createProgram(vorticityShader),
      pressure: this.createProgram(pressureShader),
      gradient: this.createProgram(gradientSubtractShader),
      display: this.createProgram(displayShader),
    };
  }

  private createProgram(fragmentSource: string): ProgramInfo {
    const gl = this.gl;
    const vertex = this.compileShader(gl.VERTEX_SHADER, baseVertexShader);
    const fragment = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`program link failed: ${gl.getProgramInfoLog(program)}`);
    }
    const uniforms: ProgramInfo["uniforms"] = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i)!.name;
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    return { program, uniforms };
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`shader compile failed: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  }

  private initGeometry(): void {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // フルスクリーン三角形
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  private fitResolution(target: number): { w: number; h: number } {
    const aspect = this.canvas.width / this.canvas.height;
    return aspect >= 1
      ? { w: Math.round(target * aspect), h: target }
      : { w: target, h: Math.round(target / aspect) };
  }

  private createFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    filter: number,
  ): FBO {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, gl.HALF_FLOAT, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
      attach: (id: number) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  private createDoubleFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    filter: number,
  ): DoubleFBO {
    let read = this.createFBO(w, h, internalFormat, format, filter);
    let write = this.createFBO(w, h, internalFormat, format, filter);
    return {
      get read() {
        return read;
      },
      get write() {
        return write;
      },
      swap() {
        const tmp = read;
        read = write;
        write = tmp;
      },
      width: w,
      height: h,
      texelSizeX: 1 / w,
      texelSizeY: 1 / h,
    } as DoubleFBO;
  }

  private useProgram(info: ProgramInfo, texelX: number, texelY: number): void {
    const gl = this.gl;
    gl.useProgram(info.program);
    if (info.uniforms.texelSize) {
      gl.uniform2f(info.uniforms.texelSize, texelX, texelY);
    }
    if (info.uniforms.uTexelSize) {
      gl.uniform2f(info.uniforms.uTexelSize, texelX, texelY);
    }
  }

  private blitTo(target: FBO): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.width, target.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private blit(source: FBO, target: FBO, copy: ProgramInfo): void {
    const gl = this.gl;
    this.useProgram(copy, target.texelSizeX, target.texelSizeY);
    gl.uniform1i(copy.uniforms.uTexture, source.attach(0));
    this.blitTo(target);
  }
}
