/*
 * THESIS: 作品集は作品集ではなく、現場で書きつけた「記録」である。
 * OWN-WORLD: 測量野帳 — 胸ポケットの硬表紙。方眼が画面の唯一の構造で、
 *   余白・行送り・表の桁・図面まで、すべての寸法が 1 マス（--cell）の整数倍。
 *   和文 1 字 = 1 マス、欧文 1 字 = 1/2 マス。半端な位置には何も置かない。
 * 数値は飾りではない。B.M. → No.1 → No.2 の水準測量として実際に閉合する:
 *   ΣB.S. 2.791 − ΣF.S. 3.441 = −0.650 ／ G.H. 11.182 − 11.832 = −0.650。
 *   No.3（GAMES）は未観測なので、全欄が空欄のまま残る。
 * 触れると、測点番号に朱の丸が引かれ、図面の測点に朱が打たれる。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono } from "next/font/google";
import styles from "./yacho.module.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "測量野帳 — Preview",
  description: "Things I've built. 測量野帳の記録として組んだトップページ案",
};

/* 欧文の塊。1 字 = 1/2 マスで送り、折り返しで桁を崩さない */
function Lat({ children }: { children: string }) {
  return <span className={styles.lat}>{children}</span>;
}

function Field({
  label,
  children,
  tall,
}: {
  label: string;
  children: React.ReactNode;
  tall?: boolean;
}) {
  return (
    <div className={`${styles.field}${tall ? ` ${styles.tall}` : ""}`}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{children}</dd>
    </div>
  );
}

function Head({ jp, en }: { jp: string; en: string }) {
  return (
    <div className={styles.head}>
      <h2 className={styles.headJp}>{jp}</h2>
      <span className={styles.headEn}>{en}</span>
    </div>
  );
}

function Sheet({
  tab,
  page,
  children,
  side,
  station,
  creased,
  dogEared,
}: {
  tab: string;
  page: string;
  children: React.ReactNode;
  side: "left" | "right";
  station?: boolean;
  creased?: boolean;
  dogEared?: boolean;
}) {
  const cls = [
    styles.sheet,
    side === "left" ? styles.sheetLeft : styles.sheetRight,
    station ? styles.station : "",
    creased ? styles.creased : "",
    dogEared ? styles.dogEared : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <section className={cls}>
      <div className={styles.body}>{children}</div>
      <div className={styles.foot}>
        <span className={styles.footTab}>{tab}</span>
        <span>{page}</span>
      </div>
      {dogEared ? <span className={styles.dogEar} aria-hidden="true" /> : null}
    </section>
  );
}

/* 測点番号に引かれる朱の丸。走り書きの一筆なので閉じきらず、少し重ねる */
function CircleMark() {
  return (
    <svg
      className={styles.circleMark}
      viewBox="0 0 62 28"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        pathLength={100}
        d="M52 7 C45 2 22 1 11 6 C1 11 3 22 15 25 C29 28 52 27 58 19 C62 14 60 8 53 5"
      />
    </svg>
  );
}

/* 図面上の測点に打たれる朱。円を一周させてから中心に点を落とす */
function Stamp({ x, y }: { x: number; y: number }) {
  return (
    <g className={styles.stamp}>
      <circle
        className={styles.stampRing}
        cx={x}
        cy={y}
        r={0.62}
        pathLength={100}
      />
      <circle className={styles.stampDot} cx={x} cy={y} r={0.16} />
    </g>
  );
}

/* ------------------------------------------------------------------ 図面 */

/* 路線図（平面）。B.M. → No.1 → No.2 → No.3（未測） */
function PlanSketch() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 18 12"
      role="img"
      aria-label="路線図。基準点 B.M. から測点 No.1、No.2 を経て、未観測の No.3 に至る測線。"
    >
      <path className={styles.ink} d="M2.2 9.2 L6.6 6.4 L11.8 8.6" />
      <path className={styles.inkDashed} d="M11.8 8.6 L15.4 4.2" />

      {/* B.M. 基準点 = 角の記号 */}
      <rect
        className={styles.ink}
        x={1.75}
        y={8.75}
        width={0.9}
        height={0.9}
      />
      <circle className={styles.inkFill} cx={2.2} cy={9.2} r={0.13} />

      {/* 観測済の測点 = ⊙ */}
      <circle className={styles.ink} cx={6.6} cy={6.4} r={0.45} />
      <circle className={styles.inkFill} cx={6.6} cy={6.4} r={0.13} />
      <circle className={styles.ink} cx={11.8} cy={8.6} r={0.45} />
      <circle className={styles.inkFill} cx={11.8} cy={8.6} r={0.13} />

      {/* 未観測 = △ */}
      <path
        className={styles.inkDashed}
        d="M15.4 3.62 L15.92 4.5 L14.88 4.5 Z"
      />

      <text className={styles.sketchText} x={1.5} y={10.6}>
        B.M. 11.832
      </text>
      <text
        className={`${styles.sketchText} ${styles.sketchTextInk}`}
        x={5.5}
        y={5.5}
      >
        No.1 11.736
      </text>
      <text
        className={`${styles.sketchText} ${styles.sketchTextInk}`}
        x={10.7}
        y={9.9}
      >
        No.2 11.182
      </text>
      <text className={styles.sketchText} x={14.1} y={3.1}>
        No.3 ?
      </text>

      <text className={styles.sketchText} x={3.0} y={7.6}>
        24.60
      </text>
      <text className={styles.sketchText} x={9.3} y={7.1}>
        31.80
      </text>

      {/* 方位 */}
      <path className={styles.inkSoft} d="M1.1 2.7 L1.1 1.0" />
      <path className={styles.inkFill} d="M1.1 0.6 L1.42 1.4 L0.78 1.4 Z" />
      <text className={styles.sketchText} x={0.75} y={3.6}>
        N
      </text>
    </svg>
  );
}

/*
 * 等高線（No.1 近傍）。作品が水盤なので地形も窪地で、いちばん内側の閉曲線に
 * 内向きのケバ（示曲線）を打つ。等高線間隔 0.05 m、中心の底が G.H. 11.736。
 */
function ContourSketch() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 18 12"
      role="img"
      aria-label="測点 No.1 近傍の等高線図。中心が窪んだ水盤状の地形で、等高線間隔 0.05 メートル、底の地盤高は 11.736。"
    >
      <path
        className={styles.inkSoft}
        d="M13.99 6.00L14.36 6.45L14.73 6.97L15.01 7.54L15.14 8.14L15.05 8.73L14.74 9.26L14.23 9.69L13.58 10.02L12.87 10.24L12.14 10.40L11.43 10.51L10.76 10.62L10.12 10.73L9.49 10.85L8.85 10.96L8.20 11.03L7.54 11.02L6.88 10.93L6.26 10.77L5.68 10.54L5.14 10.27L4.61 10.01L4.06 9.76L3.47 9.53L2.82 9.29L2.13 9.02L1.46 8.69L0.86 8.27L0.43 7.76L0.22 7.18L0.27 6.58L0.57 6.00L1.06 5.48L1.68 5.03L2.31 4.67L2.88 4.36L3.34 4.06L3.67 3.74L3.91 3.37L4.09 2.94L4.30 2.45L4.58 1.96L4.98 1.50L5.48 1.10L6.09 0.80L6.76 0.60L7.47 0.49L8.20 0.44L8.93 0.44L9.67 0.47L10.42 0.53L11.17 0.65L11.89 0.84L12.55 1.14L13.10 1.54L13.50 2.05L13.72 2.62L13.78 3.22L13.73 3.80L13.62 4.33L13.54 4.79L13.56 5.21L13.71 5.60L13.99 6.00Z"
      />
      <path
        className={styles.inkSoft}
        d="M13.15 6.00L12.87 6.34L12.58 6.65L12.31 6.93L12.11 7.21L11.99 7.51L11.92 7.85L11.87 8.25L11.79 8.68L11.63 9.12L11.36 9.52L10.96 9.86L10.47 10.08L9.90 10.18L9.31 10.17L8.74 10.07L8.20 9.90L7.71 9.73L7.25 9.56L6.81 9.41L6.37 9.29L5.92 9.18L5.47 9.05L5.02 8.89L4.62 8.67L4.26 8.41L3.97 8.11L3.72 7.79L3.52 7.45L3.33 7.10L3.13 6.75L2.93 6.39L2.73 6.00L2.57 5.59L2.50 5.15L2.55 4.72L2.75 4.31L3.10 3.97L3.58 3.70L4.15 3.52L4.75 3.42L5.32 3.38L5.83 3.35L6.26 3.30L6.64 3.19L6.99 3.02L7.34 2.79L7.74 2.53L8.20 2.28L8.72 2.08L9.27 1.97L9.84 1.96L10.39 2.06L10.90 2.23L11.36 2.47L11.78 2.74L12.17 3.04L12.52 3.35L12.85 3.68L13.14 4.03L13.35 4.41L13.47 4.81L13.48 5.22L13.36 5.62L13.15 6.00Z"
      />
      <path
        className={styles.ink}
        d="M11.83 6.00L11.75 6.26L11.65 6.51L11.54 6.76L11.41 6.99L11.23 7.21L11.01 7.40L10.76 7.57L10.47 7.69L10.17 7.79L9.87 7.87L9.60 7.95L9.33 8.04L9.08 8.16L8.81 8.30L8.53 8.46L8.20 8.62L7.84 8.74L7.45 8.80L7.07 8.78L6.71 8.69L6.40 8.51L6.15 8.29L5.97 8.03L5.84 7.76L5.73 7.51L5.63 7.28L5.51 7.07L5.36 6.88L5.19 6.68L5.02 6.47L4.87 6.24L4.77 6.00L4.72 5.74L4.74 5.49L4.82 5.24L4.94 4.99L5.09 4.76L5.26 4.53L5.43 4.31L5.63 4.08L5.86 3.87L6.12 3.68L6.43 3.53L6.78 3.44L7.15 3.41L7.52 3.45L7.88 3.55L8.20 3.68L8.49 3.83L8.75 3.95L9.00 4.04L9.26 4.09L9.56 4.10L9.90 4.10L10.27 4.11L10.67 4.16L11.04 4.26L11.38 4.42L11.64 4.63L11.81 4.88L11.90 5.16L11.92 5.45L11.89 5.73L11.83 6.00Z"
      />
      <path
        className={styles.ink}
        d="M10.23 6.00L10.27 6.15L10.25 6.30L10.19 6.45L10.07 6.58L9.93 6.69L9.78 6.79L9.63 6.87L9.48 6.95L9.33 7.03L9.18 7.09L9.03 7.16L8.87 7.21L8.71 7.24L8.54 7.26L8.37 7.26L8.20 7.24L8.04 7.22L7.88 7.20L7.72 7.18L7.55 7.17L7.37 7.16L7.18 7.14L6.99 7.10L6.80 7.05L6.63 6.96L6.51 6.84L6.43 6.71L6.40 6.56L6.41 6.41L6.45 6.26L6.51 6.12L6.57 6.00L6.61 5.88L6.63 5.77L6.64 5.65L6.64 5.52L6.65 5.38L6.68 5.24L6.75 5.11L6.85 4.99L6.98 4.89L7.13 4.80L7.30 4.74L7.47 4.69L7.65 4.65L7.83 4.61L8.01 4.59L8.20 4.58L8.39 4.58L8.57 4.61L8.74 4.66L8.90 4.75L9.03 4.85L9.13 4.96L9.21 5.08L9.29 5.19L9.36 5.29L9.45 5.38L9.57 5.46L9.70 5.54L9.85 5.63L10.00 5.73L10.14 5.86L10.23 6.00Z"
      />

      {/* 示曲線のケバ。内側が低いことを示す */}
      <g className={styles.ink}>
        <path d="M10.23 6.00 L9.91 6.00" />
        <path d="M8.20 7.24 L8.20 6.92" />
        <path d="M6.40 6.56 L6.71 6.46" />
        <path d="M6.85 4.99 L7.11 5.18" />
        <path d="M8.20 4.58 L8.20 4.90" />
        <path d="M9.45 5.38 L9.16 5.52" />
      </g>

      {/* 数値は線を切って書き入れる（.sketchText の紙色の縁取り） */}
      <text
        className={styles.sketchText}
        x={8.71}
        y={7.24}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        11.75
      </text>
      <text
        className={styles.sketchText}
        x={4.77}
        y={6.0}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        11.80
      </text>
      <text
        className={styles.sketchText}
        x={8.2}
        y={2.28}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        11.85
      </text>
      <text
        className={styles.sketchText}
        x={12.87}
        y={10.24}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        11.90
      </text>

      <circle className={styles.ink} cx={8.2} cy={6.0} r={0.32} />
      <circle className={styles.inkFill} cx={8.2} cy={6.0} r={0.11} />
      <Stamp x={8.2} y={6.0} />

      <text
        className={`${styles.sketchText} ${styles.sketchTextInk}`}
        x={0.4}
        y={1.0}
      >
        No.1 G.H. 11.736
      </text>
      <text className={styles.sketchText} x={0.4} y={2.0}>
        C.I. = 0.05 m
      </text>
    </svg>
  );
}

/* 縦断面図。表の G.H. をそのまま高さに写す（縦倍率 7.2 マス/m） */
function ProfileSketch() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 18 12"
      role="img"
      aria-label="縦断面図。基準面 11.000 から、B.M. 11.832、No.1 11.736、No.2 11.182 と下る地盤線。No.2 より先は未測のため破線。"
    >
      {/* 基準面 */}
      <path className={styles.ink} d="M0.6 10.6 L17.4 10.6" />
      <text className={styles.sketchText} x={0.7} y={10.15}>
        D.L. = 11.000
      </text>

      {/* 地盤線 */}
      <path
        className={styles.ink}
        d="M0.8 4.40 L1.6 4.61 L3.0 4.72 L4.5 4.95 L6.0 5.30 L7.6 6.30 L9.4 7.70 L11.6 9.29"
      />
      <path
        className={styles.inkDashed}
        d="M11.6 9.29 L12.8 9.10 L14.0 8.70 L15.4 8.35 L16.8 8.30"
      />

      {/* 測点の垂線 */}
      <path className={styles.inkSoft} d="M1.6 4.61 L1.6 10.6" />
      <path className={styles.inkSoft} d="M6.0 5.30 L6.0 10.6" />
      <path className={styles.inkSoft} d="M11.6 9.29 L11.6 10.6" />
      <path className={styles.inkDashed} d="M15.4 8.35 L15.4 10.6" />

      <circle className={styles.inkFill} cx={1.6} cy={4.61} r={0.12} />
      <circle className={styles.inkFill} cx={6.0} cy={5.3} r={0.12} />
      <circle className={styles.ink} cx={11.6} cy={9.29} r={0.32} />
      <circle className={styles.inkFill} cx={11.6} cy={9.29} r={0.11} />
      <Stamp x={11.6} y={9.29} />

      <text className={styles.sketchText} x={0.8} y={3.9}>
        11.832
      </text>
      <text className={styles.sketchText} x={5.2} y={4.6}>
        11.736
      </text>
      <text
        className={`${styles.sketchText} ${styles.sketchTextInk}`}
        x={12.2}
        y={9.0}
      >
        No.2 11.182
      </text>
      <text className={styles.sketchText} x={14.8} y={7.6}>
        ?
      </text>

      <text className={styles.sketchText} x={1.2} y={11.5}>
        0.00
      </text>
      <text className={styles.sketchText} x={5.4} y={11.5}>
        24.60
      </text>
      <text className={styles.sketchText} x={11.0} y={11.5}>
        56.40
      </text>
    </svg>
  );
}

/* 未観測区画。境界だけが引かれ、中身は空のまま残る */
function VacantSketch() {
  return (
    <svg
      className={styles.sketch}
      viewBox="0 0 18 12"
      role="img"
      aria-label="未観測の区画。境界のみが破線で引かれ、測点 No.3 の三角標が置かれている。"
    >
      <path
        className={styles.inkDashed}
        d="M1 1.5 L17 1.5 L17 10.5 L1 10.5 Z"
      />
      <path className={styles.inkSoft} d="M1 3.4 L2.9 1.5" />
      <path className={styles.inkSoft} d="M1 5.3 L4.8 1.5" />
      <path className={styles.inkSoft} d="M1 7.2 L6.7 1.5" />
      <path className={styles.inkSoft} d="M14.3 10.5 L17 7.8" />
      <path className={styles.inkSoft} d="M16.2 10.5 L17 9.7" />

      <path className={styles.ink} d="M9 4.7 L9.85 6.2 L8.15 6.2 Z" />
      <circle className={styles.inkFill} cx={9} cy={5.9} r={0.12} />
      <text
        className={`${styles.sketchText} ${styles.sketchTextInk}`}
        x={9.9}
        y={5.9}
      >
        No.3
      </text>
      <text className={styles.sketchText} x={7.5} y={7.6}>
        NOT SURVEYED
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ 記録 */

function StationPlate({
  sketch,
  gear,
  href,
  bearing,
  distance,
}: {
  sketch: React.ReactNode;
  gear: string[];
  href: string;
  bearing: string;
  distance: string;
}) {
  return (
    <>
      <div className={styles.plate}>
        <div>
          {sketch}
          <span className={styles.sketchCaption}>Sketch</span>
        </div>
        <dl className={styles.specs}>
          <div className={styles.specRow}>
            <dt className={styles.specLabel}>器材</dt>
            <dd className={styles.specValue}>
              {gear.map((g) => (
                <span key={g} className={styles.gear}>
                  {g}
                </span>
              ))}
            </dd>
          </div>
          <div className={styles.specRow}>
            <dt className={styles.specLabel}>方位</dt>
            <dd className={styles.specValue}>{bearing}</dd>
          </div>
          <div className={styles.specRow}>
            <dt className={styles.specLabel}>測線長</dt>
            <dd className={styles.specValue}>{distance}</dd>
          </div>
        </dl>
      </div>
      {/* 参照先は頁いっぱいの一行で。折り返すと桁が方眼から外れる */}
      <dl className={`${styles.specs} ${styles.refRow}`}>
        <div className={styles.specRow}>
          <dt className={styles.specLabel}>参照</dt>
          <dd className={styles.specValue}>{href}</dd>
        </div>
      </dl>
    </>
  );
}

export default function YachoPreview() {
  return (
    <main className={`${plexMono.variable} ${styles.root}`}>
      <div className={styles.desk}>
        <div className={styles.deskHead} aria-hidden="true">
          <span className={styles.jpSmall}>測量野帳</span>
          <span>Level Book No.001</span>
        </div>

        <div className={styles.book}>
          {/* ================================================ 見開き 1 */}
          <div className={styles.spread}>
            <Sheet tab="標題" page="001" side="left">
              <Head jp="標題" en="Title" />
              <dl className={styles.fields}>
                <Field label="業務名" tall>
                  <span className={styles.wordmark}>SUMINAWA</span>
                  <span className={styles.wordmarkSub}>Showcase</span>
                </Field>
                <Field label="件名">
                  <span className={styles.tagEn}>{"Things I've built."}</span>
                </Field>
                <Field label="観測者">
                  <Lat>SUMINAWA</Lat>
                </Field>
                <Field label="観測日">
                  <Lat>2026-07-27</Lat>
                </Field>
                <Field label="測点数">
                  <Lat>003</Lat>
                </Field>
              </dl>

              <div className={styles.tocGap} />
              <Head jp="目次" en="Index" />
              <div className={styles.toc}>
                <div className={`${styles.tocRow} ${styles.tocHead}`}>
                  <span>STA</span>
                  <span>CLASS</span>
                  <span>PAGE</span>
                  <span className={styles.tocJp}>状態</span>
                </div>
                <div className={styles.tocRow}>
                  <span>No.1</span>
                  <span>SITES</span>
                  <span>003</span>
                  <span className={styles.tocJp}>観測済</span>
                </div>
                <div className={styles.tocRow}>
                  <span>No.2</span>
                  <span>TOOLS</span>
                  <span>004</span>
                  <span className={styles.tocJp}>観測済</span>
                </div>
                <div className={`${styles.tocRow} ${styles.tocIdle}`}>
                  <span>No.3</span>
                  <span>GAMES</span>
                  <span>005</span>
                  <span className={styles.tocJp}>未観測</span>
                </div>
              </div>
              <p className={styles.note}>
                ※<Lat> B.M.</Lat>　は基準点。<Lat>No.3</Lat>
                　は未観測につき、欄は空のまま。
              </p>
            </Sheet>

            <div className={styles.gutter} aria-hidden="true" />

            <Sheet tab="水準測量" page="002" side="right">
              <Head jp="水準測量 記録" en="Level" />
              <table className={styles.table}>
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">STA</th>
                    <th scope="col">B.S.</th>
                    <th scope="col">I.H.</th>
                    <th scope="col">F.S.</th>
                    <th scope="col">G.H.</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={styles.rowStation}>
                    <th scope="row">B.M.</th>
                    <td>1.284</td>
                    <td>13.116</td>
                    <td>—</td>
                    <td>11.832</td>
                  </tr>
                  <tr className={styles.rowStation}>
                    <th scope="row">No.1</th>
                    <td>1.507</td>
                    <td>13.243</td>
                    <td>1.380</td>
                    <td>11.736</td>
                  </tr>
                  <tr className={styles.rowStation}>
                    <th scope="row">No.2</th>
                    <td>—</td>
                    <td>—</td>
                    <td className={styles.cellCorrected}>
                      <span>2.061</span>
                    </td>
                    <td>11.182</td>
                  </tr>
                  <tr className={styles.rowIdle}>
                    <th scope="row">No.3</th>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>

              <p className={styles.check}>
                ΣB.S. 2.791 − ΣF.S. 3.441 = −0.650
                <br />
                G.H. 11.182 − 11.832 = −0.650
                <br />
                <span className={styles.checkOk}>差 0.000 — 検算 OK</span>
              </p>

              <p className={styles.note}>
                ※<Lat> No.2 F.S.</Lat>　読み違いにつき<Lat> 2.601</Lat>
                　を消し<Lat> 2.061</Lat>　に訂正。
              </p>

              <div className={styles.plate}>
                <div>
                  <PlanSketch />
                  <span className={styles.sketchCaption}>Plan</span>
                </div>
                <dl className={styles.specs}>
                  <div className={styles.specRow}>
                    <dt className={styles.specLabel}>器械</dt>
                    <dd className={styles.specValue}>AUTO LEVEL 32x</dd>
                  </div>
                  <div className={styles.specRow}>
                    <dt className={styles.specLabel}>基準点</dt>
                    <dd className={styles.specValue}>B.M. 11.832</dd>
                  </div>
                  <div className={styles.specRow}>
                    <dt className={styles.specLabel}>路線長</dt>
                    <dd className={styles.specValue}>56.40 m</dd>
                  </div>
                  <div className={styles.specRow}>
                    <dt className={styles.specLabel}>天候</dt>
                    <dd className={styles.specValue}>晴 / 風弱</dd>
                  </div>
                </dl>
              </div>
            </Sheet>
          </div>

          {/* ================================================ 見開き 2 */}
          <div className={styles.spread}>
            <Sheet tab="測点 No.1" page="003" side="left" station>
              <Head jp="測点記録" en="Sites" />
              <dl className={styles.fields}>
                <Field label="測点">
                  <span className={styles.stationNo}>
                    No.1
                    <CircleMark />
                  </span>
                </Field>
                <Field label="題">
                  <h3 className={styles.title}>
                    <Link
                      href="/projects/suminagashi"
                      className={styles.titleLink}
                    >
                      墨流し
                      <Lat>{" — Suminagashi"}</Lat>
                    </Link>
                  </h3>
                </Field>
                <Field label="観測">
                  <span className={styles.mono}>
                    B.S. 1.507 / I.H. 13.243
                    <br />
                    F.S. 1.380 / G.H. 11.736
                  </span>
                </Field>
              </dl>

              <p className={styles.desc}>
                藍と墨が水面で渦を巻く、<Lat>{"GPU "}</Lat>
                流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。
              </p>

              <StationPlate
                sketch={<ContourSketch />}
                gear={["WebGL2", "GLSL", "TypeScript"]}
                href="/projects/suminagashi"
                bearing="N 32° 30' E"
                distance="24.60 m"
              />
            </Sheet>

            <div className={styles.gutter} aria-hidden="true" />

            <Sheet tab="測点 No.2" page="004" side="right" station creased>
              <Head jp="測点記録" en="Tools" />
              <dl className={styles.fields}>
                <Field label="測点">
                  <span className={styles.stationNo}>
                    No.2
                    <CircleMark />
                  </span>
                </Field>
                <Field label="題">
                  <h3 className={styles.title}>
                    <Link
                      href="/projects/quote-simulator"
                      className={styles.titleLink}
                    >
                      見積もりシミュレーター
                    </Link>
                  </h3>
                </Field>
                <Field label="観測">
                  <span className={styles.mono}>
                    B.S. —&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / I.H. —
                    <br />
                    F.S. 2.061 / G.H. 11.182
                  </span>
                </Field>
              </dl>

              <p className={styles.desc}>
                作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を
                <Lat>{" 30 "}</Lat>秒で形にする電卓。
              </p>

              <StationPlate
                sketch={<ProfileSketch />}
                gear={["Next.js", "TypeScript", "Tailwind CSS"]}
                href="/projects/quote-simulator"
                bearing="S 68° 10' E"
                distance="31.80 m"
              />
            </Sheet>
          </div>

          {/* ================================================ 見開き 3 */}
          <div className={styles.spread}>
            <Sheet tab="測点 No.3" page="005" side="left">
              <Head jp="測点記録" en="Games" />
              <dl className={styles.fields}>
                <Field label="測点">
                  <span className={`${styles.stationNo} ${styles.soft}`}>
                    No.3
                  </span>
                </Field>
                <Field label="題">
                  <span className={`${styles.title} ${styles.soft}`}>
                    未観測
                  </span>
                </Field>
                <Field label="観測">
                  <span className={`${styles.mono} ${styles.soft}`}>
                    B.S. —&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / I.H. —
                    <br />
                    F.S. —&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / G.H. —
                  </span>
                </Field>
              </dl>

              <p className={styles.desc}>
                準備中<span className={styles.dash2}> — </span>
                最初のゲームがここに嵌まります。
              </p>

              <div className={styles.plate}>
                <div>
                  <VacantSketch />
                  <span className={styles.sketchCaption}>Vacant</span>
                </div>
                <dl className={styles.specs}>
                  <div className={styles.specRow}>
                    <dt className={styles.specLabel}>器材</dt>
                    <dd className={`${styles.specValue} ${styles.soft}`}>—</dd>
                  </div>
                  <div className={styles.specRow}>
                    <dt className={styles.specLabel}>方位</dt>
                    <dd className={`${styles.specValue} ${styles.soft}`}>—</dd>
                  </div>
                  <div className={styles.specRow}>
                    <dt className={styles.specLabel}>測線長</dt>
                    <dd className={`${styles.specValue} ${styles.soft}`}>
                      未測
                    </dd>
                  </div>
                </dl>
              </div>
              <dl className={`${styles.specs} ${styles.refRow}`}>
                <div className={styles.specRow}>
                  <dt className={styles.specLabel}>参照</dt>
                  <dd className={`${styles.specValue} ${styles.soft}`}>—</dd>
                </div>
              </dl>
            </Sheet>

            <div className={styles.gutter} aria-hidden="true" />

            <Sheet tab="凡例・結" page="006" side="right" dogEared>
              <Head jp="凡例" en="Legend" />
              <dl className={styles.legend}>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>B.S.</dt>
                  <dd className={styles.legendVal}>後視</dd>
                </div>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>I.H.</dt>
                  <dd className={styles.legendVal}>器械高</dd>
                </div>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>F.S.</dt>
                  <dd className={styles.legendVal}>前視</dd>
                </div>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>G.H.</dt>
                  <dd className={styles.legendVal}>地盤高</dd>
                </div>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>D.L.</dt>
                  <dd className={styles.legendVal}>基準面</dd>
                </div>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>⊙</dt>
                  <dd className={styles.legendVal}>観測済の測点</dd>
                </div>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>△</dt>
                  <dd className={styles.legendVal}>未観測の測点</dd>
                </div>
                <div className={styles.legendRow}>
                  <dt className={styles.legendKey}>- - -</dt>
                  <dd className={styles.legendVal}>未測の測線</dd>
                </div>
              </dl>

              <p className={styles.closing}>
                すべての作品は、その場で実際に動きます。
              </p>

              <div className={styles.sign}>
                <svg
                  className={styles.sealBox}
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <circle className={styles.sealRing} cx={24} cy={24} r={21} />
                  <text className={styles.sealText} x={24} y={20}>
                    墨縄
                  </text>
                  <text className={styles.sealText} x={24} y={36}>
                    検
                  </text>
                </svg>
                <span>
                  検印 2026-07-27
                  <br />
                  野帳 001 / 頁 006
                </span>
              </div>
            </Sheet>
          </div>
        </div>

        <div className={styles.deskFoot}>
          <Link href="/preview" className={styles.backLink}>
            ← 一覧へ
          </Link>
          <span>Sheet 006 / 006</span>
        </div>
      </div>
    </main>
  );
}
