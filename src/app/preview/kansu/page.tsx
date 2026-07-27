/*
 * THESIS: 巻子（かんす）は「頁」を持たない。綴じていないから区切りが無い。
 *   右の軸から左へ繰ると、地続きの一枚の紙がただ流れ、時間が横に進む。
 *   だから画面の構造そのものを巻にした ── 天地に軸木の帯を渡し、その間に本紙を挟み、
 *   移動は横だけ。場面は「切り替わる」のではなく、同じ紙の上を通り過ぎていく。
 * OWN-WORLD: 枠が無い。囲みが無い。角丸も影も無い。図版は縁を持たず、
 *   multiply と mask で紙に滲んで melt する。場面の区切りは罫ではなく余白の幅だけ。
 *   一本の墨が全長（約 4 画面分）を貫いて流れ続ける ── sumi-wide を巻の全長に伸ばす。
 * STORY: 右端に表紙と題簽（SUMINAWA）。繰ると巻頭の詞書、一・二の場面、三の白紙、
 *   そして左端で紙が尽き、軸木が立って巻が終わる。
 * FIRST VIEWPORT: 題簽の縦組みワードマークと、巻頭の縦組み明朝のタグライン。作品名はまだ出ない。
 *   巻子は、まず「これから繰る」ことを見せる。
 * MOVEMENT: 横スクロールが唯一の移動。ホイール（縦回しも横に変換）・ドラッグ・
 *   キーボード（←→ / PageUp/Down / Home / End）・タッチ、四つ全てで繰れる。
 * FORM: kansu — 横に繰る絵巻（プレビュー案・比較用）
 */
"use client";

import Image from "next/image";
import Link from "next/link";
import { EB_Garamond, Shippori_Mincho } from "next/font/google";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import styles from "./kansu.module.css";

/** 本文はすべてこの明朝で縦に組む。少し粗い骨格が墨に合う。 */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--kn-mincho",
});

/** ラテン文字は横に小さく添えるだけ。オールドスタイルのローマン。 */
const roman = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--kn-roman",
});

type Work = {
  num: string;
  cat: string;
  title: string;
  body: string;
  tags: string[];
  href: string;
  fig: string;
  figAlt: string;
};

const WORKS: Work[] = [
  {
    num: "一",
    cat: "SITES",
    title: "墨流し — Suminagashi",
    body: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
    fig: "/ink/sites.png",
    figAlt: "藍と墨が水面で渦を巻いている図",
  },
  {
    num: "二",
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    body: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
    fig: "/ink/tools.png",
    figAlt: "淡い墨が横に流れて重なっている図",
  },
];

/** 巻の章立て。軸木の帯に出る現在地と、下の軸の目盛はこれを引く。 */
const CHAPTERS = [
  { key: "kanto", num: "", label: "巻頭", latin: "Opening" },
  { key: "sites", num: "一", label: "SITES", latin: "Sites" },
  { key: "tools", num: "二", label: "TOOLS", latin: "Tools" },
  { key: "games", num: "三", label: "GAMES", latin: "Games" },
  { key: "okugaki", num: "", label: "奥書", latin: "Colophon" },
];

const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;

const noopSubscribe = () => () => {};

export default function KansuPreview() {
  const rootRef = useRef<HTMLElement | null>(null);
  const honRef = useRef<HTMLDivElement | null>(null);
  const reelRef = useRef<HTMLDivElement | null>(null);
  const sceneRefs = useRef<Array<HTMLElement | null>>([]);
  const rafRef = useRef(0);
  const glideRef = useRef(0);
  const reducedRef = useRef(false);

  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  /** 各章の、巻全長に対する位置（0 = 巻頭 / 1 = 巻末）。軸の目盛に使う */
  const [marks, setMarks] = useState<number[]>([]);
  const [dragging, setDragging] = useState(false);
  /** JS が動いている時だけ出す操作系（軸の目盛・繰るボタン）。無 JS でも本文は届く */
  const live = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  /** 章 i を巻の右端に合わせるのに必要な scrollLeft（rtl なので 0 〜 -max） */
  const targetFor = useCallback((i: number) => {
    const hon = honRef.current;
    const reel = reelRef.current;
    const scene = sceneRefs.current[i];
    if (!hon || !reel || !scene) return 0;
    const max = Math.max(0, reel.offsetWidth - hon.clientWidth);
    const d = reel.offsetWidth - (scene.offsetLeft + scene.offsetWidth);
    return -clamp(d, 0, max);
  }, []);

  const measure = useCallback(() => {
    const hon = honRef.current;
    const reel = reelRef.current;
    if (!hon || !reel) return;
    const max = Math.max(1, reel.offsetWidth - hon.clientWidth);
    setMarks(
      CHAPTERS.map((_, i) => {
        const scene = sceneRefs.current[i];
        if (!scene) return 0;
        const d = reel.offsetWidth - (scene.offsetLeft + scene.offsetWidth);
        return clamp(d, 0, max) / max;
      }),
    );
  }, []);

  const sample = useCallback(() => {
    const hon = honRef.current;
    if (!hon) return;
    const max = hon.scrollWidth - hon.clientWidth;
    setProgress(max > 0 ? clamp(Math.abs(hon.scrollLeft) / max, 0, 1) : 0);
    const box = hon.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    let found = 0;
    for (let i = 0; i < sceneRefs.current.length; i += 1) {
      const s = sceneRefs.current[i];
      if (!s) continue;
      const r = s.getBoundingClientRect();
      if (r.left <= cx && r.right >= cx) {
        found = i;
        break;
      }
      if (r.right < cx) found = i;
    }
    setActive(found);
  }, []);

  const stopGlide = useCallback(() => {
    if (glideRef.current) cancelAnimationFrame(glideRef.current);
    glideRef.current = 0;
  }, []);

  /*
   * rtl のスクローラでは scrollTo({left: 負, behavior:"smooth"}) が
   * Chromium で 0 に丸められてしまう（scrollLeft への直接代入は効く）。
   * だから繰りのアニメーションは自前で回す。reduce 指定なら一息で飛ぶ。
   */
  const glide = useCallback(
    (to: number) => {
      const hon = honRef.current;
      if (!hon) return;
      stopGlide();
      const from = hon.scrollLeft;
      const dist = to - from;
      if (reducedRef.current || Math.abs(dist) < 2) {
        hon.scrollLeft = to;
        return;
      }
      const dur = clamp(Math.abs(dist) * 0.5, 380, 900);
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = clamp((now - t0) / dur, 0, 1);
        hon.scrollLeft = from + dist * (1 - Math.pow(1 - t, 3));
        glideRef.current = t < 1 ? requestAnimationFrame(frame) : 0;
      };
      glideRef.current = requestAnimationFrame(frame);
    },
    [stopGlide],
  );

  const go = useCallback(
    (i: number) => {
      glide(targetFor(clamp(i, 0, CHAPTERS.length - 1)));
    },
    [glide, targetFor],
  );

  /** 現在地の一つ先／手前へ。位置が半端でも必ず動くように現在値から判定する */
  const step = useCallback(
    (dir: 1 | -1) => {
      const hon = honRef.current;
      if (!hon) return;
      const cur = hon.scrollLeft;
      let next = active + dir;
      // 章の途中にいるなら、まず同じ章の頭に吸い付ける（進行方向が逆の時）
      if (dir === -1 && cur < targetFor(active) - 24) next = active;
      go(next);
    },
    [active, go, targetFor],
  );

  // ── 計測とスクロール追従 ──────────────────────────────────────────
  useEffect(() => {
    // クライアント側の頁なので metadata を書き出せない。表題はここで入れる
    document.title = "巻子 — 横に繰る絵巻 | Showcase";

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    const onMq = () => {
      reducedRef.current = mq.matches;
    };
    mq.addEventListener("change", onMq);

    const hon = honRef.current;
    const reel = reelRef.current;
    if (!hon || !reel) return () => mq.removeEventListener("change", onMq);

    const tick = () => {
      rafRef.current = 0;
      sample();
    };
    const onScroll = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    hon.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      measure();
      sample();
    });
    ro.observe(hon);
    ro.observe(reel);
    measure();
    sample();
    // 画像の読み込みで幅が変わるので、落ち着いた頃にもう一度測る
    const t = window.setTimeout(() => {
      measure();
      sample();
    }, 600);

    return () => {
      mq.removeEventListener("change", onMq);
      hon.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (glideRef.current) cancelAnimationFrame(glideRef.current);
    };
  }, [measure, sample]);

  // ── ホイール：縦回しも横の送りに変換する ──────────────────────────
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      const hon = honRef.current;
      if (!hon || e.ctrlKey) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // 横回しは素通し
      const unit =
        e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? hon.clientWidth : 1;
      const max = hon.scrollWidth - hon.clientWidth;
      const next = clamp(hon.scrollLeft - e.deltaY * unit, -max, 0);
      if (Math.abs(next - hon.scrollLeft) < 0.5) return; // 端では素通し
      stopGlide();
      hon.scrollLeft = next;
      e.preventDefault();
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [stopGlide]);

  // ── キーボード：← → / PageDown PageUp / Home End / Space ───────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const interactive = tag === "BUTTON" || tag === "A";
      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          step(1);
          break;
        case "ArrowRight":
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          step(-1);
          break;
        case " ":
          if (interactive) return;
          e.preventDefault();
          step(e.shiftKey ? -1 : 1);
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(CHAPTERS.length - 1);
          break;
        default:
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, step]);

  // ── ドラッグ：紙を掴んで繰る（マウスのみ。タッチは素の慣性に任せる）──
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const hon = honRef.current;
      if (!hon) return;
      stopGlide();
      const startX = e.clientX;
      const startScroll = hon.scrollLeft;
      const max = hon.scrollWidth - hon.clientWidth;
      let moved = 0;
      setDragging(true);

      const move = (ev: PointerEvent) => {
        const d = ev.clientX - startX;
        if (Math.abs(d) > moved) moved = Math.abs(d);
        hon.scrollLeft = clamp(startScroll - d, -max, 0);
      };
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
        setDragging(false);
        if (moved > 5) {
          // 繰っただけの時はリンクを踏ませない
          const kill = (ev: MouseEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
          };
          document.addEventListener("click", kill, {
            capture: true,
            once: true,
          });
          window.setTimeout(
            () => document.removeEventListener("click", kill, true),
            80,
          );
        }
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    },
    [stopGlide],
  );

  const chapter = CHAPTERS[active] ?? CHAPTERS[0];

  return (
    <main
      ref={rootRef}
      className={`${styles.root} ${mincho.variable} ${roman.variable} ${
        dragging ? styles.isDragging : ""
      }`}
    >
      {/* ── 天の軸木 ───────────────────────────────────────────── */}
      <div className={`${styles.rod} ${styles.rodTop}`}>
        <p className={styles.worldTag}>
          <span className={styles.worldJa}>巻子</span>
          <span className={styles.worldLatin}>Kansu — a handscroll</span>
        </p>
        <p className={styles.here} aria-live="polite">
          {chapter.num && <span className={styles.hereNum}>{chapter.num}</span>}
          <span className={styles.hereLabel}>{chapter.label}</span>
          <span className={styles.hereLatin}>{chapter.latin}</span>
        </p>
      </div>

      {/* ── 本紙 ──────────────────────────────────────────────── */}
      <div
        ref={honRef}
        className={styles.hon}
        tabIndex={0}
        role="region"
        aria-label="巻子 — 右から左へ繰る。左右キーで繰れます"
        onPointerDown={onPointerDown}
      >
        <div ref={reelRef} className={styles.reel}>
          {/* 全長を一本で貫く墨。場面ごとに切れない ＝ 地続きの紙 */}
          <div className={styles.river} aria-hidden="true" />

          {/* 表紙と題簽 */}
          <div className={styles.hyoshi}>
            <div className={styles.daisen}>
              <h1 className={styles.wordmark}>SUMINAWA</h1>
              <p className={styles.daisenSub}>Showcase</p>
            </div>
          </div>

          {/* 巻頭 */}
          <section
            ref={(el) => {
              sceneRefs.current[0] = el;
            }}
            className={`${styles.scene} ${styles.sceneKanto}`}
            aria-labelledby="kn-kanto"
          >
            <div className={styles.kotoba}>
              <div className={styles.kantoAside}>
                <div className={styles.kantoLatin}>
                  <p id="kn-kanto" className={styles.taglineEn}>
                    {"Things I've built."}
                  </p>
                  <p className={styles.kantoNote}>右から左へ繰ります。</p>
                </div>
                <div
                  className={styles.hint}
                  style={{ opacity: Math.max(0, 1 - progress * 9) }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 64 8" className={styles.hintArrow}>
                    <path
                      d="M63 4H2M6.4 0.8 1.6 4l4.8 3.2"
                      stroke="currentColor"
                      strokeWidth="1"
                      fill="none"
                    />
                  </svg>
                  <span className={styles.hintText}>繰る</span>
                  <span className={styles.hintLatin}>scroll · drag · ← →</span>
                </div>
              </div>
            </div>
          </section>

          {/* 一・二 — 巻の中の場面 */}
          {WORKS.map((w, i) => (
            <section
              key={w.href}
              ref={(el) => {
                sceneRefs.current[i + 1] = el;
              }}
              className={`${styles.scene} ${styles.sceneWork}`}
              aria-labelledby={`kn-w${i}`}
            >
              <div className={styles.kotoba}>
                <div className={styles.titleCol}>
                  <p className={styles.cat}>
                    <span className={styles.catNum}>{w.num}</span>
                    <span className={styles.catName}>{w.cat}</span>
                  </p>
                  <h2 id={`kn-w${i}`} className={styles.title}>
                    <Link href={w.href} className={styles.titleLink}>
                      {w.title}
                    </Link>
                  </h2>
                </div>
                <p className={styles.body}>{w.body}</p>
                <ul className={styles.tags}>
                  {w.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <Link href={w.href} className={styles.zu}>
                <Image
                  className={styles.zuImg}
                  src={w.fig}
                  alt={w.figAlt}
                  width={1600}
                  height={1100}
                  sizes="(max-width: 720px) 66vw, 52vw"
                  preload={i === 0}
                />
                <span className={styles.zuMark}>ひらく</span>
              </Link>
            </section>
          ))}

          {/* 三 — まだ描かれていない紙 */}
          <section
            ref={(el) => {
              sceneRefs.current[3] = el;
            }}
            className={`${styles.scene} ${styles.sceneEmpty}`}
            aria-labelledby="kn-games"
          >
            <div className={styles.kotoba}>
              <div className={styles.titleCol}>
                <p className={styles.cat}>
                  <span className={styles.catNum}>三</span>
                  <span className={styles.catName}>GAMES</span>
                </p>
                <p id="kn-games" className={styles.soon}>
                  準備中 — 最初のゲームがここに嵌まります。
                </p>
              </div>
            </div>
            <div className={styles.shitae} aria-hidden="true" />
          </section>

          {/* 奥書 — 紙が尽きて軸が立つ */}
          <section
            ref={(el) => {
              sceneRefs.current[4] = el;
            }}
            className={`${styles.scene} ${styles.sceneEnd}`}
            aria-labelledby="kn-okugaki"
          >
            <div className={styles.kotoba}>
              <p id="kn-okugaki" className={styles.okugaki}>
                巻、ここに畢る。
              </p>
              <p className={styles.okugakiLatin}>
                Kansu — the scroll ends at the left.
              </p>
            </div>
          </section>
          <div className={styles.jiku} aria-hidden="true">
            <span className={styles.jikuCap} />
            <span className={styles.jikuCap} />
          </div>
        </div>
      </div>

      {/* ── 地の軸木 ───────────────────────────────────────────── */}
      <div className={`${styles.rod} ${styles.rodBottom}`}>
        <div className={styles.rodLeft}>
          <Link href="/preview" className={styles.back}>
            ← 一覧へ
          </Link>
        </div>

        {live && (
          <div className={styles.kuri}>
            <button
              type="button"
              className={styles.kuriBtn}
              onClick={() => step(1)}
              aria-label="次の場面へ繰る"
            >
              <span aria-hidden="true">◀</span>
            </button>
            <div className={styles.rail}>
              <span className={styles.railTrack} aria-hidden="true" />
              <span
                className={styles.railFill}
                style={{ width: `${progress * 100}%` }}
                aria-hidden="true"
              />
              {marks.map((m, i) => (
                <button
                  key={CHAPTERS[i].key}
                  type="button"
                  className={`${styles.tick} ${
                    i === active ? styles.tickOn : ""
                  }`}
                  style={{ right: `${m * 100}%` }}
                  onClick={() => go(i)}
                  aria-label={`${CHAPTERS[i].label} へ`}
                  aria-current={i === active ? "true" : undefined}
                >
                  <span className={styles.tickHit} />
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.kuriBtn}
              onClick={() => step(-1)}
              aria-label="前の場面へ戻す"
            >
              <span aria-hidden="true">▶</span>
            </button>
          </div>
        )}

        <p className={styles.colophon}>
          すべての作品は、その場で実際に動きます。
        </p>
      </div>
    </main>
  );
}
