/*
 * 3D の枠（@react-three/fiber の Canvas）を、開いただけで描き始めさせるための一押し。
 *
 * Canvas は枠の大きさを測れるまで中身（モデルの読み込み・建物の組み立て）を始めない。
 * 測るのは react-use-measure で、知らせは ResizeObserver・window の resize・scroll の
 * 三つから来る。ところが ResizeObserver はブラウザが画面を描くときにしか知らせないので、
 * 背面のタブ・隠れた窓・自動操作のブラウザでは知らせが来ず、枠は 300×150 のまま
 * 「読み込み中…」で止まる。人が一度スクロールすると scroll の知らせで測れて動き出す ──
 * これが「スクロールするまで出ない」の正体だった。
 *
 * そこで、枠の中に canvas が現れたら、測り終えるまで window に resize を送る。
 * react-use-measure はこれを受けて getBoundingClientRect で測り直す（描画を待たない）。
 * 測れた canvas は幅と高さが既定の 300×150 から変わるので、そこで止める。
 */

/** 測る前の canvas の大きさ（HTML の既定値） */
const UNSIZED_WIDTH = 300;
const UNSIZED_HEIGHT = 150;

export type CanvasSize = { width: number; height: number };

export type KickDeps = {
  /** 枠の中の canvas。まだ無ければ null（three.js の束を読んでいる途中） */
  findCanvas: () => CanvasSize | null;
  /** 測り直しを促す（window に resize を送る） */
  kick: () => void;
  /** 一定の間隔で fn を呼ぶ。止める関数を返す */
  every: (fn: () => void, ms: number) => () => void;
};

export type KickOptions = {
  intervalMs?: number;
  /** これだけ見回ったら諦める。束が読めない・WebGL が無いときに回り続けないため */
  maxTicks?: number;
};

/** canvas が Canvas に測られたか。測る前は HTML の既定の 300×150 のまま */
export function isSized(canvas: CanvasSize): boolean {
  return !(canvas.width === UNSIZED_WIDTH && canvas.height === UNSIZED_HEIGHT);
}

/**
 * canvas が測られるまで、間隔を置いて測り直しを促す。止める関数を返す。
 * 見回りのたびに: canvas が無ければ待つ、測られていれば止める、測られていなければ促す。
 */
export function kickUntilSized(
  deps: KickDeps,
  { intervalMs = 200, maxTicks = 100 }: KickOptions = {},
): () => void {
  let ticks = 0;
  let stopped = false;
  let cancel: () => void = () => {};
  const stop = () => {
    if (stopped) return;
    stopped = true;
    cancel();
  };
  const tick = () => {
    if (stopped) return;
    ticks += 1;
    const canvas = deps.findCanvas();
    if (canvas && isSized(canvas)) {
      stop();
      return;
    }
    if (canvas) deps.kick();
    if (ticks >= maxTicks) stop();
  };
  cancel = deps.every(tick, intervalMs);
  if (stopped) cancel();
  return stop;
}
