/**
 * Stable Fluids 法の WebGL2 実装（依存ゼロ・React 非依存）。
 * モジュールスコープで window / document に触れない（Vitest の node 環境で import されるため）。
 */
import {
  advectionShader,
  baseVertexShader,
  breezeShader,
  clearShader,
  copyShader,
  curlShader,
  displaceShader,
  displayShader,
  divergenceShader,
  dropShader,
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

/** 水面に広がった一滴の半径（UV 単位）。輪は sqrt(滴数) で外へ育つ */
export const DROP_RADIUS = 0.075;

export type EntranceDrop = {
  atMs: number;
  x: number;
  y: number;
  ink: InkName;
  radius: number;
};

/**
 * エントランス演出。本物の墨流しと同じ手順を再現する:
 * ほぼ同じ一点へ墨と藍を交互に落とすと、後の滴が先の滴を外へ押し広げ、
 * 同心円のリングが育つ。撫でるのはリングが出来てから（Basin 側の演出）。
 */
export const ENTRANCE_DROPS: EntranceDrop[] = Array.from(
  { length: 26 },
  (_, index): EntranceDrop => {
    // 手仕事のばらつき: 落とす位置をわずかにずらす（決定論的な擬似ランダム）
    const jitter = Math.sin(index * 12.9898) * 0.007;
    return {
      atMs: 240 + index * 108,
      x: 0.5 + jitter,
      y: 0.5 + Math.cos(index * 7.233) * 0.006,
      ink: index % 2 === 0 ? "carbon" : "indigo",
      radius: DROP_RADIUS,
    };
  },
);

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
/** 渦強化。上げすぎると輪の縁が毛羽立つので、墨流しでは弱めに保つ */
const CURL_STRENGTH = 1.4;
const VELOCITY_DISSIPATION = 0.35;
const DYE_DISSIPATION = 0.015;
const SPLAT_FORCE = 5200;
const BASE_SPLAT_RADIUS = 0.0022;
const MAX_DPR = 2;
/** 「風を送る」1 回で速度場へ足す横流れ（sim グリッド単位/秒） */
const FAN_VELOCITY = 90;

export class FluidSimulation {
  supported = false;

  private canvas: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private linearFiltering = false;
  private resStep = 0;
  private vao: WebGLVertexArrayObject | null = null;
  private vertexBuffer: WebGLBuffer | null = null;

  private programs!: {
    copy: ProgramInfo;
    clear: ProgramInfo;
    splat: ProgramInfo;
    displace: ProgramInfo;
    drop: ProgramInfo;
    breeze: ProgramInfo;
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

  /** 実際に解像度が変わった時だけ true。呼び出し側が演出のやり直しを判断できる */
  resize(): boolean {
    const gl = this.gl;
    if (!gl) return false;
    const dpr = Math.min(
      MAX_DPR,
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    );
    const width = Math.max(2, Math.floor(this.canvas.clientWidth * dpr));
    const height = Math.max(2, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width === width && this.canvas.height === height && this.velocity) {
      return false;
    }
    this.canvas.width = width;
    this.canvas.height = height;

    const simRes = this.fitResolution(SIM_RES_STEPS[this.resStep]);
    const dyeRes = this.fitResolution(DYE_RES_STEPS[this.resStep]);

    const filter = this.linearFiltering ? gl.LINEAR : gl.NEAREST;
    const oldVelocity = this.velocity;
    const oldPressure = this.pressure;
    const oldDivergence = this.divergence;
    const oldCurl = this.curl;
    const oldDye = this.dye;

    this.velocity = this.createDoubleFBO(simRes.w, simRes.h, gl.RG16F, gl.RG, filter);
    this.pressure = this.createDoubleFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);
    this.divergence = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);
    this.curl = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);

    const newDye = this.createDoubleFBO(dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA, filter);
    if (oldDye) {
      // 旧染料を新解像度へ引き継いでから破棄する（模様を失わない）
      this.blit(oldDye.read, newDye.read, this.programs.copy);
    }
    this.dye = newDye;

    this.destroyDoubleFBO(oldVelocity);
    this.destroyDoubleFBO(oldPressure);
    this.destroyFBO(oldDivergence);
    this.destroyFBO(oldCurl);
    this.destroyDoubleFBO(oldDye);
    return true;
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

  /**
   * 一滴落とす。radius は水面に広がった滴の半径（UV 単位）。
   * 既存の染料を面積保存で外へずらしてから、中心に滴を置く = 同心円が育つ。
   */
  splatInk(x: number, y: number, ink: InkName, radius = DROP_RADIUS): void {
    if (!this.supported) return;
    const gl = this.gl;
    const aspect = this.canvas.width / this.canvas.height;

    this.useProgram(this.programs.displace, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.programs.displace.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform1f(this.programs.displace.uniforms.uAspectRatio, aspect);
    gl.uniform2f(this.programs.displace.uniforms.uPoint, x, y);
    gl.uniform1f(this.programs.displace.uniforms.uAmount, radius * radius);
    this.blitTo(this.dye.write);
    this.dye.swap();

    const absorption = INK_ABSORPTION[ink];
    this.useProgram(this.programs.drop, this.dye.texelSizeX, this.dye.texelSizeY);
    gl.uniform1i(this.programs.drop.uniforms.uTarget, this.dye.read.attach(0));
    gl.uniform1f(this.programs.drop.uniforms.uAspectRatio, aspect);
    gl.uniform2f(this.programs.drop.uniforms.uPoint, x, y);
    gl.uniform3f(
      this.programs.drop.uniforms.uColor,
      absorption[0],
      absorption[1],
      absorption[2],
    );
    gl.uniform1f(this.programs.drop.uniforms.uRadius, radius);
    this.blitTo(this.dye.write);
    this.dye.swap();
  }

  nextInk(): InkName {
    return pickInk(this.inkCounter++);
  }

  /**
   * 水面を横切る風。輪が羽根状に引き伸ばされて墨流しの模様になる。
   * 一直線ではなく上下に波打たせ、櫛で梳いたような筋を作る。
   */
  fan(strength = 1, phase = Math.random() * Math.PI * 2): void {
    if (!this.supported) return;
    const gl = this.gl;
    this.useProgram(this.programs.breeze, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.breeze.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.programs.breeze.uniforms.uStrength, FAN_VELOCITY * strength);
    gl.uniform1f(this.programs.breeze.uniforms.uPhase, phase);
    this.blitTo(this.velocity.write);
    this.velocity.swap();
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
    if (!this.supported) return false;
    if (this.resStep >= SIM_RES_STEPS.length - 1) return false;
    this.resStep += 1;
    this.canvas.width = 0; // resize を強制
    this.resize();
    return true;
  }

  /**
   * GPU リソースを解放する。
   * WEBGL_lose_context は呼ばない: canvas は 1 つのコンテキストしか持てず、
   * 失わせると同じ canvas に再マウントした次のインスタンスが復帰できない
   * （React の再マウントやクライアント遷移で必ず踏む）。コンテキスト自体は
   * canvas が破棄されるときに GC される。
   */
  destroy(): void {
    if (!this.gl) return;
    this.destroyDoubleFBO(this.velocity);
    this.destroyDoubleFBO(this.pressure);
    this.destroyDoubleFBO(this.dye);
    this.destroyFBO(this.divergence);
    this.destroyFBO(this.curl);
    for (const info of Object.values(this.programs ?? {})) {
      this.gl.deleteProgram(info.program);
    }
    if (this.vao) this.gl.deleteVertexArray(this.vao);
    if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
    this.vao = null;
    this.vertexBuffer = null;
    this.supported = false;
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
      displace: this.createProgram(displaceShader),
      drop: this.createProgram(dropShader),
      breeze: this.createProgram(breezeShader),
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
    this.vao = vao;
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    this.vertexBuffer = buffer;
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

  private destroyFBO(target: FBO | undefined): void {
    if (!target) return;
    this.gl.deleteFramebuffer(target.fbo);
    this.gl.deleteTexture(target.texture);
  }

  private destroyDoubleFBO(target: DoubleFBO | undefined): void {
    if (!target) return;
    this.destroyFBO(target.read);
    this.destroyFBO(target.write);
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
