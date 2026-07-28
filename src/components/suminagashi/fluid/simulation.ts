/**
 * Stable Fluids 法の WebGL2 実装（依存ゼロ・React 非依存）。
 * モジュールスコープで window / document に触れない（Vitest の node 環境で import されるため）。
 *
 * 染料テクスチャ（RGBA16F）の 4 成分は「species ごとの濃度」を表す。
 * 表示は `PAPER − Σ cᵢ·palette[i]` の線形写像なので、既定パレット
 * `[carbon, indigo, UNDYED, UNDYED]` のもとでは「染料 = 吸収そのもの」だった
 * 従来の実装と同じ出力になる（splatInk は splatSpecies へ委譲する）。
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
  idmapShader,
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

/** 素水。濃度 1 で存在するが顔料を持たないので紙白のまま見える */
export const UNDYED: [number, number, number] = [0, 0, 0];

/** 染料テクスチャ 1 枚が扱える species 数（RGBA の 4 成分） */
export const SPECIES_PER_TEXTURE = 4;

/**
 * パレット既定値。現行の作品ページと完全に一致する割り当て:
 * species 0 = 墨 / species 1 = 藍 / 2, 3 は未使用（素水）。
 */
export const DEFAULT_PALETTE: Array<[number, number, number]> = [
  [...INK_ABSORPTION.carbon],
  [...INK_ABSORPTION.indigo],
  [...UNDYED],
  [...UNDYED],
];

/** 紙白 #f6f3ed 相当 */
export const PAPER: [number, number, number] = [0.965, 0.953, 0.929];

/** 水面に広がった一滴の半径（UV 単位）。輪は sqrt(滴数) で外へ育つ */
export const DROP_RADIUS = 0.075;

/** 当たり判定用 id map の一辺。RGBA8 で 96×96 = 36KB */
export const ID_MAP_SIZE = 96;
/** これ未満の総濃度は「空の水域」 */
export const ID_MIN_DENSITY = 0.05;
/** これ未満の占有率は「どの作品とも言い切れない」 */
export const ID_MIN_DOMINANCE = 0.45;

export type IdSample = {
  species: number;
  dominance: number;
  density: number;
};

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

/** インク名 → species index。既定パレットと対応する */
export function speciesOfInk(ink: InkName): number {
  return ink === "carbon" ? 0 : 1;
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

function clampInt(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * id map の読み戻しバッファから座標 (u, v) の作品を決める純関数。
 *
 * **行順**: readPixels の行 0 は下端で、v は GL 座標（y 上向き）なので
 * `row = floor(v * size)` でそのまま一致する。ここは最も間違えやすいので
 * テストで固定してある。
 *
 * 3×3 近傍の density 重み付き多数決。各セルは総濃度 density を全体へ、
 * `density × そのセルの占有率` を勝者へ投じる。混ざりきった水域では
 * 占有率が下がって null になる。
 */
export function sampleIdMap(
  buf: Uint8Array,
  size: number,
  u: number,
  v: number,
): IdSample | null {
  const col = clampInt(Math.floor(u * size), 0, size - 1);
  const row = clampInt(Math.floor(v * size), 0, size - 1);

  const votes = [0, 0, 0, 0];
  let densitySum = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = clampInt(row + dr, 0, size - 1);
      const c = clampInt(col + dc, 0, size - 1);
      const i = (r * size + c) * 4;
      const density = buf[i + 2] / 255;
      votes[buf[i] & 3] += density * (buf[i + 1] / 255);
      densitySum += density;
    }
  }
  if (densitySum <= 0) return null;

  let species = 0;
  for (let s = 1; s < votes.length; s++) {
    if (votes[s] > votes[species]) species = s;
  }
  const dominance = votes[species] / densitySum;
  const density = densitySum / 9;
  if (density < ID_MIN_DENSITY || dominance < ID_MIN_DOMINANCE) return null;
  return { species, dominance, density };
}

/** id map から species の重心と占有面積を求める純関数。y は GL 座標（上向き） */
export function centroidFromIdMap(
  buf: Uint8Array,
  size: number,
  species: number,
): { x: number; y: number; area: number } | null {
  let weight = 0;
  let sx = 0;
  let sy = 0;
  let cells = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const i = (row * size + col) * 4;
      if ((buf[i] & 3) !== species) continue;
      const w = (buf[i + 2] / 255) * (buf[i + 1] / 255);
      if (w <= 0) continue;
      weight += w;
      sx += (w * (col + 0.5)) / size;
      sy += (w * (row + 0.5)) / size;
      cells += 1;
    }
  }
  if (weight <= 0) return null;
  return { x: sx / weight, y: sy / weight, area: cells / (size * size) };
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

export type FluidOptions = {
  /** 解像度段（0 = sim 256 / dye 1024）。ハブは 1 */
  resStep?: 0 | 1 | 2;
  /** Jacobi 反復回数。ハブは 16 */
  pressureIterations?: number;
  /** devicePixelRatio の上限。ハブは 1.5 */
  maxDpr?: number;
};

const SIM_RES_STEPS = [256, 192, 128];
const DYE_RES_STEPS = [1024, 768, 512];
const DEFAULT_PRESSURE_ITERATIONS = 24;
/** 渦強化。上げすぎると輪の縁が毛羽立つので、墨流しでは弱めに保つ */
const CURL_STRENGTH = 1.4;
const VELOCITY_DISSIPATION = 0.35;
const DYE_DISSIPATION = 0.015;
const SPLAT_FORCE = 5200;
const BASE_SPLAT_RADIUS = 0.0022;
const DEFAULT_MAX_DPR = 2;
/** 「風を送る」1 回で速度場へ足す横流れ（sim グリッド単位/秒） */
const FAN_VELOCITY = 90;
/** これ以上アスペクトが変われば模様が歪むので、呼び出し側に種まきをやり直させる */
const RESEED_ASPECT_RATIO = 0.1;

export class FluidSimulation {
  supported = false;

  private canvas: HTMLCanvasElement;
  private gl!: WebGL2RenderingContext;
  private linearFiltering = false;
  private resStep: 0 | 1 | 2 = 0;
  private pressureIterations = DEFAULT_PRESSURE_ITERATIONS;
  private maxDpr = DEFAULT_MAX_DPR;
  /** 渦強化。上げると細い筋が巻いて羽根状になる */
  private curlStrength = CURL_STRENGTH;
  /** 染料の拡散。上げると縁がほどけて霧になる */
  private dyeDissipation = DYE_DISSIPATION;
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
    idmap: ProgramInfo;
  };

  private velocity!: DoubleFBO;
  /** 染料。今は長さ 1（species 4 つまで）。N > 4 で枚数が増える */
  private dyes: DoubleFBO[] = [];
  /** 染料が「憶えている」配置。dyes と 1:1 で対応する */
  private rests: FBO[] = [];
  private pressure!: DoubleFBO;
  private divergence!: FBO;
  private curl!: FBO;
  private idmap?: FBO;
  private idBuffer = new Uint8Array(ID_MAP_SIZE * ID_MAP_SIZE * 4);
  private idMapReady = false;

  private palette = new Float32Array(SPECIES_PER_TEXTURE * 3);
  private highlightSpecies = -1;
  private highlightAmt = 0;
  private edgeFade = 0;
  private homing = 0;
  private lastAspect = 0;

  private inkCounter = 0;

  constructor(canvas: HTMLCanvasElement, opts: FluidOptions = {}) {
    this.canvas = canvas;
    this.resStep = opts.resStep ?? 0;
    this.pressureIterations =
      opts.pressureIterations ?? DEFAULT_PRESSURE_ITERATIONS;
    this.maxDpr = opts.maxDpr ?? DEFAULT_MAX_DPR;
    this.setPalette(DEFAULT_PALETTE);

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

    /*
     * ここから先は投げうる ── compileShader / linkProgram は失敗を throw で返す。
     *
     * context が取れても【シェーダのコンパイルやリンクだけが失敗する】環境は実在する
     * （古い / 制限されたドライバ、GPU のブラックリスト、リモートデスクトップ経由など）。
     * そのとき例外が constructor を抜けると、これを呼んでいる useEffect ごと投げ、
     * React はツリーを落とす ── 作品ページが白紙になる。
     *
     * 支援できないことは supported = false で伝えれば足りる。呼び出し側は
     * それを見てフロストペインで正直に伝える設計になっている（偽の代替表現は出さない）。
     * だから例外はここで受け止め、掴んだ GL 資源だけ返して終わる。
     */
    try {
      this.compilePrograms();
      this.initGeometry();
      this.idmap = this.createFBO(
        ID_MAP_SIZE,
        ID_MAP_SIZE,
        gl.RGBA8,
        gl.RGBA,
        gl.NEAREST,
        gl.UNSIGNED_BYTE,
      );
      this.resize();
      this.supported = true;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[fluid] GL の初期化に失敗したので非対応として扱う", error);
      }
      this.destroy();
      this.supported = false;
    }
  }

  // ---- 公開 API ----

  /**
   * アスペクトが 10% 以上変わった時だけ true。
   * 模様は解像度が変わっても blit で引き継がれるので、呼び出し側は
   * 「輪が歪むほどの変形が起きたか」だけを見て種まきをやり直せばよい。
   */
  resize(): boolean {
    const gl = this.gl;
    if (!gl) return false;
    const dpr = Math.min(
      this.maxDpr,
      typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    );
    const width = Math.max(2, Math.floor(this.canvas.clientWidth * dpr));
    const height = Math.max(2, Math.floor(this.canvas.clientHeight * dpr));
    if (
      this.canvas.width === width &&
      this.canvas.height === height &&
      this.velocity
    ) {
      return false;
    }
    const prevAspect = this.lastAspect;
    this.canvas.width = width;
    this.canvas.height = height;
    const aspect = width / height;
    this.lastAspect = aspect;

    const simRes = this.fitResolution(SIM_RES_STEPS[this.resStep]);
    const dyeRes = this.fitResolution(DYE_RES_STEPS[this.resStep]);

    const filter = this.linearFiltering ? gl.LINEAR : gl.NEAREST;
    const oldVelocity = this.velocity;
    const oldPressure = this.pressure;
    const oldDivergence = this.divergence;
    const oldCurl = this.curl;
    const oldDyes = this.dyes;
    const oldRests = this.rests;

    this.velocity = this.createDoubleFBO(simRes.w, simRes.h, gl.RG16F, gl.RG, filter);
    this.pressure = this.createDoubleFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);
    this.divergence = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);
    this.curl = this.createFBO(simRes.w, simRes.h, gl.R16F, gl.RED, gl.NEAREST);

    const count = Math.max(1, oldDyes.length);
    const newDyes: DoubleFBO[] = [];
    const newRests: FBO[] = [];
    for (let i = 0; i < count; i++) {
      const dye = this.createDoubleFBO(dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA, filter);
      const rest = this.createFBO(dyeRes.w, dyeRes.h, gl.RGBA16F, gl.RGBA, filter);
      // 旧染料・旧 rest を新解像度へ引き継いでから破棄する（模様と記憶を失わない）
      if (oldDyes[i]) this.blit(oldDyes[i].read, dye.read, this.programs.copy);
      if (oldRests[i]) this.blit(oldRests[i], rest, this.programs.copy);
      newDyes.push(dye);
      newRests.push(rest);
    }
    this.dyes = newDyes;
    this.rests = newRests;

    this.destroyDoubleFBO(oldVelocity);
    this.destroyDoubleFBO(oldPressure);
    this.destroyFBO(oldDivergence);
    this.destroyFBO(oldCurl);
    for (const dye of oldDyes) this.destroyDoubleFBO(dye);
    for (const rest of oldRests) this.destroyFBO(rest);

    if (prevAspect === 0) return true;
    return Math.abs(aspect - prevAspect) / prevAspect >= RESEED_ASPECT_RATIO;
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
    gl.uniform1f(this.programs.vorticity.uniforms.uCurlStrength, this.curlStrength);
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
    for (let i = 0; i < this.pressureIterations; i++) {
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
    // 染料と advection プログラムを共有しているので、uHoming = 0 の明示と
    // uRest のバインドを必ず行う（速度場が rest へ引かれるのを防ぐ）
    const advection = this.programs.advection;
    this.useProgram(advection, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform2f(
      advection.uniforms.uDyeTexelSize,
      this.velocity.texelSizeX,
      this.velocity.texelSizeY,
    );
    gl.uniform1i(advection.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(advection.uniforms.uSource, this.velocity.read.attach(0));
    gl.uniform1i(advection.uniforms.uRest, this.rests[0].attach(2));
    gl.uniform1f(advection.uniforms.uHoming, 0);
    gl.uniform1f(advection.uniforms.uDt, dt);
    gl.uniform1f(advection.uniforms.uDissipation, VELOCITY_DISSIPATION);
    this.blitTo(this.velocity.write);
    this.velocity.swap();

    // 7. advect dye
    for (let i = 0; i < this.dyes.length; i++) {
      const dye = this.dyes[i];
      gl.uniform2f(advection.uniforms.uDyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(advection.uniforms.uVelocity, this.velocity.read.attach(0));
      gl.uniform1i(advection.uniforms.uSource, dye.read.attach(1));
      gl.uniform1i(advection.uniforms.uRest, this.rests[i].attach(2));
      gl.uniform1f(advection.uniforms.uHoming, this.homing);
      gl.uniform1f(advection.uniforms.uDissipation, this.dyeDissipation);
      this.blitTo(dye.write);
      dye.swap();
    }
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
  splatSpecies(
    x: number,
    y: number,
    species: number,
    radius = DROP_RADIUS,
  ): void {
    if (!this.supported) return;
    const gl = this.gl;
    const aspect = this.canvas.width / this.canvas.height;
    const textureIndex = Math.floor(species / SPECIES_PER_TEXTURE);
    const dye = this.dyes[textureIndex];
    if (!dye) return;
    const channel = species % SPECIES_PER_TEXTURE;

    // 面積保存の押し退けは全テクスチャに掛ける（染料はひとつの水面なので）
    for (const target of this.dyes) {
      this.useProgram(this.programs.displace, target.texelSizeX, target.texelSizeY);
      gl.uniform1i(this.programs.displace.uniforms.uTarget, target.read.attach(0));
      gl.uniform1f(this.programs.displace.uniforms.uAspectRatio, aspect);
      gl.uniform2f(this.programs.displace.uniforms.uPoint, x, y);
      gl.uniform1f(this.programs.displace.uniforms.uAmount, radius * radius);
      this.blitTo(target.write);
      target.swap();
    }

    // 滴は 4 成分すべてを one-hot で置換する（他 species の濃度をきちんと消す）
    for (let i = 0; i < this.dyes.length; i++) {
      const target = this.dyes[i];
      this.useProgram(this.programs.drop, target.texelSizeX, target.texelSizeY);
      gl.uniform1i(this.programs.drop.uniforms.uTarget, target.read.attach(0));
      gl.uniform1f(this.programs.drop.uniforms.uAspectRatio, aspect);
      gl.uniform2f(this.programs.drop.uniforms.uPoint, x, y);
      gl.uniform4f(
        this.programs.drop.uniforms.uSpecies,
        i === textureIndex && channel === 0 ? 1 : 0,
        i === textureIndex && channel === 1 ? 1 : 0,
        i === textureIndex && channel === 2 ? 1 : 0,
        i === textureIndex && channel === 3 ? 1 : 0,
      );
      gl.uniform1f(this.programs.drop.uniforms.uRadius, radius);
      this.blitTo(target.write);
      target.swap();
    }
  }

  /** 既存シグネチャ。既定パレットのもとで挙動は従来と完全に同一 */
  splatInk(x: number, y: number, ink: InkName, radius = DROP_RADIUS): void {
    this.splatSpecies(x, y, speciesOfInk(ink), radius);
  }

  /** 顔料の割り当て。最大 4 色。足りない分は素水で埋める */
  setPalette(colors: Array<[number, number, number]>): void {
    this.palette.fill(0);
    const count = Math.min(colors.length, SPECIES_PER_TEXTURE);
    for (let i = 0; i < count; i++) {
      this.palette[i * 3] = colors[i][0];
      this.palette[i * 3 + 1] = colors[i][1];
      this.palette[i * 3 + 2] = colors[i][2];
    }
  }

  /** 今の染料を「帰る場所」として憶える */
  captureRest(): void {
    if (!this.supported) return;
    for (let i = 0; i < this.dyes.length; i++) {
      this.blit(this.dyes[i].read, this.rests[i], this.programs.copy);
    }
  }

  /** 憶えた配置へ戻る速さ（1/秒）。0 で無効 */
  setHoming(ratePerSec: number): void {
    this.homing = Math.max(0, ratePerSec);
  }

  /** 縁で染料を紙白へ溶かす幅（UV 単位）。0 でオフ */
  setEdgeFade(width: number): void {
    this.edgeFade = Math.max(0, width);
  }

  /** 渦強化と染料の拡散。既定は輪がくっきり残る値。上げるほど霧に近づく */
  setViscosityDials(opts: { curl?: number; dyeDissipation?: number }): void {
    if (opts.curl !== undefined) this.curlStrength = opts.curl;
    if (opts.dyeDissipation !== undefined) this.dyeDissipation = opts.dyeDissipation;
  }

  /** 特定 species を濃く、他を薄く。species = null で解除 */
  highlight(species: number | null, amount: number): void {
    this.highlightSpecies = species ?? -1;
    this.highlightAmt = Math.max(0, Math.min(1, amount));
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
    const targets: FBO[] = [
      this.velocity.read,
      this.velocity.write,
      this.pressure.read,
      this.pressure.write,
      ...this.rests,
    ];
    for (const dye of this.dyes) {
      targets.push(dye.read, dye.write);
    }
    for (const target of targets) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      // アルファは 0。1 にすると species 3 の濃度が全面 1.0 になり、
      // 未染色領域の argmax が常に species 3 を返してしまう
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.idMapReady = false;
    this.inkCounter = 0;
  }

  render(): void {
    if (!this.supported) return;
    const gl = this.gl;
    const dye = this.dyes[0];
    const display = this.programs.display;
    this.useProgram(display, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(display.uniforms.uDye, dye.read.attach(0));
    gl.uniform3f(display.uniforms.uPaper, PAPER[0], PAPER[1], PAPER[2]);
    // uniform 配列の location は "uPalette[0]" というキーで登録される
    gl.uniform3fv(
      display.uniforms["uPalette[0]"] ?? display.uniforms.uPalette ?? null,
      this.palette,
    );
    gl.uniform1i(display.uniforms.uHighlight, this.highlightSpecies);
    gl.uniform1f(display.uniforms.uHighlightAmt, this.highlightAmt);
    gl.uniform1f(display.uniforms.uEdgeFade, this.edgeFade);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /**
   * 当たり判定用の id map を焼いて読み戻す。
   * 同期 readPixels はパイプラインをストールさせるので、
   * 呼び出し側が 8Hz（125ms 間隔）に絞ること。
   */
  updateIdMap(): void {
    if (!this.supported || !this.idmap) return;
    const gl = this.gl;
    const dye = this.dyes[0];
    this.useProgram(this.programs.idmap, this.idmap.texelSizeX, this.idmap.texelSizeY);
    gl.uniform1i(this.programs.idmap.uniforms.uDye, dye.read.attach(0));
    gl.uniform2f(
      this.programs.idmap.uniforms.uStep,
      1 / ID_MAP_SIZE,
      1 / ID_MAP_SIZE,
    );
    this.blitTo(this.idmap);
    gl.readPixels(
      0,
      0,
      ID_MAP_SIZE,
      ID_MAP_SIZE,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.idBuffer,
    );
    this.idMapReady = true;
  }

  /** u, v は GL 座標（y 上向き）。既存の toBasinCoords がそのまま渡せる */
  sampleAt(u: number, v: number): IdSample | null {
    if (!this.idMapReady) return null;
    return sampleIdMap(this.idBuffer, ID_MAP_SIZE, u, v);
  }

  /** 直近の読み戻しから重心を求める。追加の読み戻しはしない */
  speciesCentroid(
    species: number,
  ): { x: number; y: number; area: number } | null {
    if (!this.idMapReady) return null;
    return centroidFromIdMap(this.idBuffer, ID_MAP_SIZE, species);
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
    this.resStep = (this.resStep + 1) as 0 | 1 | 2;
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
    for (const dye of this.dyes) this.destroyDoubleFBO(dye);
    for (const rest of this.rests) this.destroyFBO(rest);
    this.dyes = [];
    this.rests = [];
    this.destroyFBO(this.divergence);
    this.destroyFBO(this.curl);
    this.destroyFBO(this.idmap);
    this.idmap = undefined;
    this.idMapReady = false;
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
      idmap: this.createProgram(idmapShader),
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
      const location = gl.getUniformLocation(program, name);
      uniforms[name] = location;
      // 配列は "uPalette[0]" という名前で返る。素の名前でも引けるようにする
      if (name.endsWith("[0]")) {
        uniforms[name.slice(0, -3)] = location;
      }
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
    type?: number,
  ): FBO {
    const gl = this.gl;
    const texture = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      w,
      h,
      0,
      format,
      type ?? gl.HALF_FLOAT,
      null,
    );

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    // アルファは 0。染料テクスチャでは species 3 の濃度になるため、
    // 1 で初期化すると未染色領域の argmax が常に species 3 になってしまう
    gl.clearColor(0, 0, 0, 0);
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
    type?: number,
  ): DoubleFBO {
    let read = this.createFBO(w, h, internalFormat, format, filter, type);
    let write = this.createFBO(w, h, internalFormat, format, filter, type);
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
