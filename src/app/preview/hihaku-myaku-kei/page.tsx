/*
 * THESIS: 筆脈（縦）と界線（横）を同じ紙に置くと、素朴に足せば【格子】＝方眼になる。
 *   方眼はこのリポジトリの別世界（測量野帳）の骨であり、そこへ落ちた瞬間に飛白は死ぬ。
 *   だからこの案は二つを足さない。二つを【一枚の料紙の支度】へ畳む。
 *   和装本の版面は、横の界線と、その左を限る一本の匡郭（きょうかく）で出来ている。
 *   界線は字を載せる線、匡郭は版面の際を示す線 ── もともと一組の道具である。
 *   飛白の版面は段ごとに右へ階段を上る（名乗り=1列目 / 作品=6列目 / 結び=1列目）から、
 *   その左辺を限る匡郭は【動かなければならない】。動く匡郭は、もう罫ではなく筆脈になる。
 *   よってこの紙には線が二本あるのではない。線は一組で、版面に接するところでは匡郭、
 *   版面が無いところでは筆脈と呼ばれる。同じ墨が、紙の都合で名前を変えるだけである。
 * NOT-A-GRID: 格子にならないための担保は三つ。すべて実装で保証してある。
 *   (1) 場所を共有しない。界線は各段の版面（左端が段ごとに右へ階段を上る）にだけ引かれ、
 *       筆脈は「起点の斜行で左に溜まった余白」だけを降りる。脈の座標は x=0 が紙の左端、
 *       x=100 が作品欄の左端で、脈は x>100 へ一度も出ない。罫は x<100 へ一度も出ない。
 *       二本は接するが、交わる点が一つも無い。交わらない縦と横は格子にならない。
 *   (2) 濃度が一段違う。脈の墨は color-mix(--hi-sumi 42%) ── 罫の書き出し（alpha 0.40）と
 *       同じ一つの値から出しており、罫の墨溜まり（0.58 相当）より必ず淡い。
 *       静止時に最も濃い墨は「罫の書き始め」であって脈ではない。
 *   (3) 脈が直線でない。三度、版面の左肩へ着地しては大きく左へ帰る。振幅は降るほど深くなる。
 *       直線的に降りる縦線は格子の一辺になるが、罫を斜めに離れていく線は軌跡として読まれる。
 * ROLE: 【構造】＝筆脈（＝匡郭）。静止時から在り、触れても一切動かない。
 *       【出来事】＝界線。触れたその一件の版面の罫だけが墨を得る。起きるのはこれ一つだけ。
 * REMOVED: 降格した筆脈から、機能を二つ完全に削った。弱めて残してはいない。
 *   ・ホバー反応（上流の区間が濃くなる .wet 層一式）── 濃い層の SVG、mask-position の
 *     transition、区間ごとの --myaku-dur / --myaku-in / --myaku-out、:has() の兄弟結合子、
 *     すべて削除。この案の筆脈にはホバーに関わる宣言が一行も無い。
 *   ・読み込み時の描き下ろし（clip-path で上から引かれる animation と keyframes）── 削除。
 *     料紙の支度に時間は無い。罫と同じく、脈も最初から紙に在る。動くのは墨の二筆だけ。
 *   結果、筆脈の DOM は元案の半分（区間あたり 6 path → 3 path）になった。
 * MECHANISM: 脈は 5 区間。頭（名乗りの空白）／導入（作品欄までの間）／作品1〜3。
 *   区間 w1・w2 は「その作品の上端から次の作品の上端まで」を器にする。だから y=0 は
 *   必ず作品の版面の左肩 ── そこで脈は x=100 に着地し、三筋が閉じて一本になる（穂が閉じる）。
 *   離れると三筋がまた割れる（肥痩）。着地点は、触れたときに真墨になる題の一本の真横にある。
 * COLOR: 紙 #F6F3EB / 墨 #1C1A15。唯一の色は朱 #A63A2E の落款ひとつ。
 * FORM: hihaku-myaku-kei — 筆脈＋界線（組み合わせ案 C・比較用）
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Hina_Mincho, Shippori_Mincho } from "next/font/google";

import s from "./hihaku-myaku-kei.module.css";

/**
 * 大の一行だけに使う明朝。日本語書体の細身のローマンで、
 * 太い墨のかたまりと並べたときに髪の毛のような線として残る。
 */
const display = Hina_Mincho({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--hi-display",
});

/** 極端に小さい補足はすべてこの明朝。小さくても骨が残る 500 を併せて持つ。 */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--hi-mincho",
});

export const metadata: Metadata = {
  title: "筆脈＋界線 — 料紙の匡郭",
  description:
    "Things I've built. — 横の界線と、それを左で限る一本の匡郭。匡郭は版面が階段を上るので動き、動いた匡郭は筆脈になる",
};

const WORKS = [
  {
    cat: "SITES",
    title: "墨流し — Suminagashi",
    desc: "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    href: "/projects/suminagashi",
  },
  {
    cat: "TOOLS",
    title: "見積もりシミュレーター",
    desc: "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    href: "/projects/quote-simulator",
  },
];

/* ==========================================================================
   匡郭（＝筆脈）の道
   --------------------------------------------------------------------------
   座標系は区間ごとに viewBox="0 0 100 100" / preserveAspectRatio="none"。
     x =   0 … 紙の左端（1 列目の起点）
     x = 100 … 作品欄の左端（6 列目の起点）＝【界線の書き始め】
   x=100 は罫の左端そのものなので、脈が x=100 に触れる＝匡郭が版面の際に接する。
   脈は x>100 へ一度も出ない。ここが「交わらない」の実体である。

   縦の器は段の実寸に貼り付ける（ページ全長を JS で測らない）。
     head … 名乗りの空白の行（.mark の 1fr）
     lead … 作品欄までの間（52svh）。下端＝作品1の上端
     w1   … 作品1の上端 → 作品2の上端
     w2   … 作品2の上端 → 作品3の上端
     w3   … 作品3の上端 → 結びの版面の 3.4 行手前（そこで筆は浮く）
   w1・w2 は y=0 と y=100 の両方が「作品の上端」に一致する。だから着地は
   必ず作品の左肩に来て、ビューポート高が変わっても位置がずれない。
   ========================================================================== */

/** 一区間の道。segs は三次ベジェの [c1x,c1y,c2x,c2y,x,y]。sp は節点ごとの穂の割れ幅 */
type Route = {
  readonly x0: number;
  readonly segs: readonly (readonly [
    number,
    number,
    number,
    number,
    number,
    number,
  ])[];
  /** 節点ごとの割れ幅（符号つき）。0 のところで三筋は一本に閉じる */
  readonly sp: readonly number[];
};

type RouteKey = "head" | "lead" | "w1" | "w2" | "w3";

/*
 * 広い紙（1024px 以上）の道。通り道の実幅は約 480px。
 *
 * 物語は 起点(左) → 版面へ寄る → 三度着地する → 起点へ帰る。
 * 着地（x=100）は必ず区間の端に置き、そこでは制御点の x を終点と揃えて
 * 接線を垂直にしてある ── 縦横比の違う器をまたいでも折れて見えない。
 * 帰りの膨らみは 71 → 62 → 4 と降るほど深くなる。振れが増しながら手元へ戻る。
 */
const WIDE: Record<RouteKey, Route> = {
  /* 名乗りの上に残った空白を、まだ迷いながら降りる頭。ここで筆は一度紙を離れる */
  head: {
    x0: 23,
    segs: [
      [18, 22, 28, 40, 26, 62],
      [24.5, 80, 32, 90, 31, 100],
    ],
    sp: [1, 1, 0.9],
  },
  /* 紙に戻り、一気に右（6 列目）へ寄る。起点の斜行そのもの。下端で版面の左肩に着地 */
  lead: {
    x0: 33,
    segs: [
      [37, 15, 47, 25, 58, 37],
      [70, 50, 86, 57, 94, 71],
      [99, 80, 100, 88, 100, 100],
    ],
    sp: [0.9, 1.1, 0.7, 0],
  },
  /* 作品1の左肩を離れ、間で左へ膨らみ、作品2の左肩へ着地する */
  w1: {
    x0: 100,
    segs: [
      [100, 9, 92, 15, 86, 22],
      [79, 30, 72, 38, 71, 48],
      [70, 60, 76, 68, 84, 76],
      [92, 84, 100, 90, 100, 100],
    ],
    sp: [0, -0.7, -1.1, -0.8, 0],
  },
  /* 二度目。膨らみが一つ深くなる。もう左へ帰る準備に入っている */
  w2: {
    x0: 100,
    segs: [
      [100, 9, 90, 16, 82, 24],
      [73, 33, 63, 42, 62, 53],
      [61, 65, 70, 74, 80, 81],
      [90, 88, 100, 92, 100, 100],
    ],
    sp: [0, 0.8, 1.2, 0.9, 0],
  },
  /* 三度目の着地から、1 列目へ帰りきる。結びの版面の手前で掠れて終わる */
  w3: {
    x0: 100,
    segs: [
      [100, 8, 92, 16, 84, 24],
      [70, 38, 44, 52, 26, 66],
      [14, 76, 6, 86, 4, 100],
    ],
    sp: [0, -0.9, -1.4, -1.8],
  },
};

/*
 * 狭い紙（1023px 以下）の道。
 *
 * 通り道の幅は広い紙で約 480px あるが、狭い紙では 140px 前後、
 * 767px 以下では 50px 前後しか無い。同じ道を流し込むと横の振れが数 px にしかならず、
 * 脈は【直線に見える】── それはこの案の唯一の失敗条件（格子）そのものなので、
 * 狭い紙には振れを 4〜5 倍に取った別の道を渡す。着地点・区間の物語・接線の垂直は同じ。
 */
const NARROW: Record<RouteKey, Route> = {
  head: {
    x0: 62,
    segs: [
      [60, 18, 36, 26, 32, 44],
      [28, 62, 44, 76, 46, 100],
    ],
    sp: [1, 1, 0.9],
  },
  lead: {
    x0: 36,
    segs: [
      [44, 14, 58, 22, 70, 34],
      [80, 46, 88, 60, 94, 74],
      [99, 84, 100, 92, 100, 100],
    ],
    sp: [0.9, 1.1, 0.7, 0],
  },
  w1: {
    x0: 100,
    segs: [
      [100, 8, 78, 14, 62, 22],
      [44, 32, 28, 42, 26, 54],
      [24, 66, 44, 76, 66, 84],
      [86, 90, 100, 94, 100, 100],
    ],
    sp: [0, -0.7, -1.1, -0.8, 0],
  },
  w2: {
    x0: 100,
    segs: [
      [100, 8, 74, 15, 56, 23],
      [36, 32, 19, 42, 18, 54],
      [17, 66, 40, 76, 68, 83],
      [88, 90, 100, 93, 100, 100],
    ],
    sp: [0, 0.8, 1.2, 0.9, 0],
  },
  /* 狭い紙では紙の縁まで 20px しかない。帰りきる先は x=17 で止め、線を端に貼り付けない */
  w3: {
    x0: 100,
    segs: [
      [100, 8, 80, 16, 64, 26],
      [46, 38, 30, 52, 22, 66],
      [18, 76, 17, 86, 17, 100],
    ],
    sp: [0, -0.9, -1.4, -1.8],
  },
};

/**
 * 三筋の一本を書き出す。
 *
 * 一本の線を芯・添え・乾きの三筋に割る。ずれ幅は節点ごとの sp に比例するので、
 * sp=0 の節点（＝版面の左肩への着地点）では三筋が完全に重なって一本に閉じ、
 * 離れるにつれて割れる ── 穂が紙に触れた瞬間だけ閉じる、という筆の当たり前。
 * 制御点と終点に同じずれを足すので、接線の向きは元の道と厳密に一致する
 * （区間の継ぎ目で垂直にしてある接線が、筋ごとに折れる事故が起きない）。
 */
function strand(r: Route, spread: number, drop: number): string {
  const n = (v: number) => Math.round(v * 100) / 100;
  let d = `M ${n(r.x0 + spread * r.sp[0])} ${drop}`;
  r.segs.forEach((sg, i) => {
    const a = spread * r.sp[i];
    const b = spread * r.sp[i + 1];
    d += ` C ${n(sg[0] + a)} ${sg[1]} ${n(sg[2] + b)} ${sg[3]} ${n(sg[4] + b)} ${sg[5]}`;
  });
  return d;
}

/** 芯 / 添え / 乾き。割れの向きと、書き出しが紙に着く僅かな遅れ */
const STRAND = [
  { cls: "strandCore", spread: 0, drop: 0 },
  { cls: "strandSide", spread: 1, drop: 0 },
  { cls: "strandDry", spread: -1, drop: 0.6 },
] as const;

/** 区間の頭が「筆の下ろし直し」である区間だけ、乾きの筋を僅かに遅らせて置く */
const FREE_START: Record<RouteKey, boolean> = {
  head: true,
  lead: true,
  w1: false,
  w2: false,
  w3: false,
};

/**
 * 匡郭の一区間。淡い一層きり ── 濃い層は持たない（この案の筆脈は触れても動かない）。
 * かすれの mask は外側の箱に掛かるので、三筋は必ず同じ場所で途切れる＝同じ筆である。
 */
function Kyokaku({ zone, at }: { zone: string; at: RouteKey }) {
  const bundle = (cls: string, r: Route, base: number) => (
    <g className={cls}>
      {STRAND.map((st, i) => (
        <path
          key={i}
          d={strand(r, base * st.spread, FREE_START[at] ? st.drop : 0)}
          className={s[st.cls]}
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </g>
  );

  return (
    <span className={`${s.myaku} ${zone}`} aria-hidden="true">
      <svg
        className={s.vein}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {bundle(s.onWide, WIDE[at], 0.35)}
        {bundle(s.onNarrow, NARROW[at], 1.6)}
      </svg>
    </span>
  );
}

export default function HihakuMyakuKeiPreview() {
  return (
    <main className={`${s.paper} ${display.variable} ${mincho.variable}`}>
      {/* 入りの一筆。紙の右上を斜めに掠めて画面外へ抜ける */}
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      {/* 筆が紙を離れる最後の掠れ。点だけになって右下で消える */}
      <div className={s.trace} aria-hidden="true" />

      {/* 界線は要素を足さずに引く。各段の ::before が、その段の版面ぶんだけ罫を敷く
          （装飾は擬似要素なので支援技術には現れず、pointer-events も持たない） */}
      <header className={s.mark}>
        {/* 匡郭の頭。名乗りの上に残った空白の行（1fr）を、そのまま器にしている。
            この段の界線は大字の足元から下にしか無いので、頭は罫と一度も出会わない */}
        <Kyokaku zone={s.zHead} at="head" />
        <p className={s.showcase}>Showcase</p>
        <h1 className={s.wordmark}>SUMINAWA</h1>
        <p className={s.en}>{"Things I've built."}</p>
        {/* 落款。画面で色を持つのはここ一箇所だけ。寸法は界線一行ぶんの正方形に揃えた */}
        <span className={s.seal} aria-hidden="true">
          墨
        </span>
      </header>

      <ol className={s.works}>
        {WORKS.map((w, i) => (
          <li key={w.href} className={s.work}>
            {/* 作品1の上にだけ、作品欄までの間を降りてくる導入の区間が要る */}
            {i === 0 ? <Kyokaku zone={s.zLead} at="lead" /> : null}
            <Kyokaku
              zone={i === 0 ? s.zW1 : s.zW2}
              at={i === 0 ? "w1" : "w2"}
            />
            <span className={s.cat}>{w.cat}</span>
            <Link href={w.href} className={s.entry}>
              <span className={s.title}>{w.title}</span>
              <span className={s.desc}>{w.desc}</span>
              <span className={s.tags}>
                {w.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
            </Link>
          </li>
        ))}

        <li className={s.work}>
          <Kyokaku zone={s.zW3} at="w3" />
          <span className={s.cat}>GAMES</span>
          <p className={s.empty}>準備中 — 最初のゲームがここに嵌まります。</p>
        </li>
      </ol>

      <footer className={s.close}>
        <p className={s.closeLine}>すべての作品は、その場で実際に動きます。</p>
        <Link href="/preview" className={s.back}>
          ← 一覧へ
        </Link>
      </footer>
    </main>
  );
}
