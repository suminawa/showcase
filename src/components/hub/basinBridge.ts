/**
 * 索引 ↔ 水盤の最小イベントバス。
 *
 * React にも DOM にも依存しない素のモジュールなので、Server Component から
 * 型と定数だけを読んでも安全に tree-shake される。運ぶのは **species 番号**
 * ひとつだけ: 索引の行も水面の染料チャンネルも、同じ番号で同じものを指す。
 *
 * 三つの経路しか持たない。
 *  - focus  : いまどの species が強調されているか（索引 → 水盤 / 水盤 → 索引 / 登場演出）
 *  - command: 動詞（静める / 渦を立てる / 流し直す）を水盤へ渡す
 *  - status : 水盤が動いているか・静められているか（動詞の表示と aria-pressed）
 */

/** 索引と水盤が共有する 1 species の定義。species = 染料テクスチャのチャンネル番号 */
export type BasinSpecies = {
  /** 染料テクスチャのチャンネル番号。seed 配列の index と同じ */
  species: number;
  /** 安定した識別子（slug またはカテゴリ id）。配置のハッシュに使う */
  key: string;
  /** 索引に出す名前 */
  title: string;
  /** 遷移先。null なら素水（水面の当たり判定を返さない） */
  href: string | null;
  /** 素水かどうか。濃度は持つが顔料を持たない */
  inert: boolean;
  /** 顔料の吸収ベクトル。素水は [0, 0, 0] */
  absorption: [number, number, number];
  /** 索引のスウォッチの色（CSS）。素水は null = 輪郭だけ */
  tone: string | null;
};

/** 強調を立てた主体。索引と水盤は対等で、登場演出だけが譲る */
export type BasinFocusSource = "index" | "basin" | "entrance";

export type BasinFocus = {
  /** 強調中の species。null で解除 */
  species: number | null;
  /** 0..1。hover / focus / pointerdown はいずれも 1 */
  amount: number;
  source: BasinFocusSource;
};

/** SSR とハイドレーションで同一の初期値（useSyncExternalStore の server snapshot） */
export const IDLE_BASIN_FOCUS: BasinFocus = {
  species: null,
  amount: 0,
  source: "entrance",
};

let focus: BasinFocus = IDLE_BASIN_FOCUS;
const focusListeners = new Set<() => void>();

export function getBasinFocus(): BasinFocus {
  return focus;
}

export function subscribeBasinFocus(listener: () => void): () => void {
  focusListeners.add(listener);
  return () => {
    focusListeners.delete(listener);
  };
}

/**
 * 強調を立てる。species = null で解除。
 *
 * 登場演出（対提示）は、訪問者が既に索引か水面へ触れている間は譲る。
 * 触っている人の手より演出が優先されることは無い。
 */
export function setBasinFocus(
  species: number | null,
  source: BasinFocusSource,
  amount = 1,
): void {
  if (source === "entrance" && focus.species !== null && focus.source !== "entrance") {
    return;
  }
  const next: BasinFocus =
    species === null
      ? { species: null, amount: 0, source }
      : { species, amount, source };
  if (
    next.species === focus.species &&
    next.amount === focus.amount &&
    next.source === focus.source
  ) {
    return;
  }
  focus = next;
  for (const listener of focusListeners) listener();
}

/** 自分が立てた強調だけを下ろす（別の主体が握っている間は触らない） */
export function clearBasinFocus(source: BasinFocusSource): void {
  if (focus.species === null || focus.source !== source) return;
  setBasinFocus(null, source);
}

/** ハブの動詞は 3 つだけ。「静める」は quiet / resume のトグル */
export type BasinCommand = "quiet" | "resume" | "stir" | "reflow";

const commandListeners = new Set<(command: BasinCommand) => void>();

export function subscribeBasinCommand(
  listener: (command: BasinCommand) => void,
): () => void {
  commandListeners.add(listener);
  return () => {
    commandListeners.delete(listener);
  };
}

export function sendBasinCommand(command: BasinCommand): void {
  for (const listener of commandListeners) listener(command);
}

export type BasinStatus = {
  /** 水盤が実際に動いているか。false の間は動詞を出さない */
  ready: boolean;
  /** 「静める」が押されているか（aria-pressed） */
  quiet: boolean;
};

export const INITIAL_BASIN_STATUS: BasinStatus = { ready: false, quiet: false };

let status: BasinStatus = INITIAL_BASIN_STATUS;
const statusListeners = new Set<() => void>();

export function getBasinStatus(): BasinStatus {
  return status;
}

export function subscribeBasinStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

export function patchBasinStatus(patch: Partial<BasinStatus>): void {
  const next = { ...status, ...patch };
  if (next.ready === status.ready && next.quiet === status.quiet) return;
  status = next;
  for (const listener of statusListeners) listener();
}
