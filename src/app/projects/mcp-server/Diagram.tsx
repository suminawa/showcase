/*
 * 仕組みの図。AI のアプリ → MCP サーバー → Google スプレッドシート の三つだけを置く。
 * 箱は描かない（料紙の世界に枠は無い）。字の塊と、手で引いた墨の矢印だけで組む。
 * 読むは常に、書くは MCP_WRITE=true のときだけ ── 書くの線は点線にして、上の切り替えと同じ言葉を添える。
 * 広い紙は横の一枚、せまい紙（640px 未満）は縦の一枚を出す。SVG の字は折り返さないので、二枚を描き分ける。
 */
import m from "./mcp-server.module.css";

const TITLE = "仕組みの図";
const DESC =
  "Claude Desktop・Claude Code・Cursor は stdio で、ChatGPT と claude.ai は HTTP で、お手元のパソコンかお使いのサーバーで動く MCP サーバーにつながります。MCP サーバーは Google の Sheets API で、業務アプリ・予約ページ・書類読み取りのスプレッドシートを読みます。書き込みは MCP_WRITE=true のときだけです。";

/** 手の線の矢印。まっすぐに見えて、わずかに撓む */
function Arrow({ d, head, dashed }: { d: string; head: string; dashed?: boolean }) {
  return (
    <g className={dashed ? m.dgWrite : m.dgRead}>
      <path d={d} fill="none" strokeLinecap="round" strokeDasharray={dashed ? "2 7" : undefined} />
      <path d={head} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function Wide() {
  return (
    <svg className={m.dgWide} viewBox="0 0 960 250" role="img" aria-labelledby="dg-w-t dg-w-d">
      <title id="dg-w-t">{TITLE}</title>
      <desc id="dg-w-d">{DESC}</desc>

      {/* 左: AI のアプリ */}
      <text x="0" y="46" className={m.dgHead}>
        AI のアプリ
      </text>
      <text x="0" y="86" className={m.dgText}>
        Claude Desktop
      </text>
      <text x="0" y="112" className={m.dgText}>
        Claude Code・Cursor
      </text>
      <text x="0" y="150" className={m.dgText}>
        ChatGPT・claude.ai
      </text>

      {/* 左 → 中 */}
      <Arrow d="M 196 96 C 240 93, 290 99, 336 96" head="M 326 89 L 337 96 L 326 103" />
      <text x="266" y="80" textAnchor="middle" className={m.dgSmall}>
        stdio
      </text>
      <Arrow d="M 196 146 C 240 149, 290 143, 336 146" head="M 326 139 L 337 146 L 326 153" />
      <text x="266" y="176" textAnchor="middle" className={m.dgSmall}>
        HTTP（合い言葉つき）
      </text>

      {/* 中: MCP サーバー */}
      <text x="360" y="46" className={m.dgHead}>
        MCP サーバー
      </text>
      <text x="360" y="86" className={m.dgText}>
        このキット
      </text>
      <text x="360" y="112" className={m.dgText}>
        お手元のパソコンか、
      </text>
      <text x="360" y="138" className={m.dgText}>
        お使いのサーバーで動く
      </text>

      {/* 中 → 右（読む）と 右 → 中（書く） */}
      <Arrow d="M 560 96 C 604 93, 654 99, 700 96" head="M 690 89 L 701 96 L 690 103" />
      <text x="630" y="80" textAnchor="middle" className={m.dgSmall}>
        読む
      </text>
      <Arrow d="M 560 146 C 604 149, 654 143, 700 146" head="M 690 139 L 701 146 L 690 153" dashed />
      <text x="630" y="176" textAnchor="middle" className={m.dgSmall}>
        書く（MCP_WRITE=true）
      </text>
      <text x="630" y="222" textAnchor="middle" className={m.dgSmall}>
        Sheets API
      </text>

      {/* 右: スプレッドシート */}
      <text x="724" y="46" className={m.dgHead}>
        Google スプレッドシート
      </text>
      <text x="724" y="86" className={m.dgText}>
        業務アプリ（顧客・対応履歴）
      </text>
      <text x="724" y="112" className={m.dgText}>
        予約ページ（予約）
      </text>
      <text x="724" y="138" className={m.dgText}>
        書類読み取り（読み取り）
      </text>
    </svg>
  );
}

function Narrow() {
  return (
    <svg className={m.dgNarrow} viewBox="0 0 340 560" role="img" aria-labelledby="dg-n-t dg-n-d">
      <title id="dg-n-t">{TITLE}</title>
      <desc id="dg-n-d">{DESC}</desc>

      <text x="0" y="28" className={m.dgHead}>
        AI のアプリ
      </text>
      <text x="0" y="62" className={m.dgText}>
        Claude Desktop・Claude Code・Cursor
      </text>
      <text x="0" y="90" className={m.dgText}>
        ChatGPT・claude.ai
      </text>

      <Arrow d="M 24 112 C 21 140, 27 168, 24 196" head="M 17 186 L 24 197 L 31 186" />
      <text x="48" y="150" className={m.dgSmall}>
        stdio
      </text>
      <text x="48" y="174" className={m.dgSmall}>
        HTTP（合い言葉つき）
      </text>

      <text x="0" y="234" className={m.dgHead}>
        MCP サーバー
      </text>
      <text x="0" y="268" className={m.dgText}>
        このキット。お手元のパソコンか、
      </text>
      <text x="0" y="294" className={m.dgText}>
        お使いのサーバーで動く
      </text>

      <Arrow d="M 24 316 C 21 344, 27 372, 24 400" head="M 17 390 L 24 401 L 31 390" />
      <Arrow d="M 150 316 C 153 344, 147 372, 150 400" head="M 143 390 L 150 401 L 157 390" dashed />
      <text x="40" y="352" className={m.dgSmall}>
        読む
      </text>
      <text x="166" y="352" className={m.dgSmall}>
        書く
      </text>
      <text x="166" y="376" className={m.dgSmall}>
        （MCP_WRITE=true）
      </text>

      <text x="0" y="438" className={m.dgHead}>
        Google スプレッドシート
      </text>
      <text x="0" y="472" className={m.dgText}>
        業務アプリ（顧客・対応履歴）
      </text>
      <text x="0" y="498" className={m.dgText}>
        予約ページ（予約）
      </text>
      <text x="0" y="524" className={m.dgText}>
        書類読み取り（読み取り）
      </text>
    </svg>
  );
}

export function Diagram() {
  return (
    <figure className={m.diagram}>
      <Wide />
      <Narrow />
    </figure>
  );
}
