"use client";

/*
 * 会話の再生。実物の MCP サーバーはブラウザでは動かないので、キットを見本のデータ
 * （MCP_DEMO=1）で起こして stdio でつなぎ、tools/list と tools/call を記録した JSON
 * （public/demos/mcp-server/exchanges.json）を 1 手ずつ見せる。
 *
 * - 問いを選ぶと、問い → ツールの呼び出し（名前と引数）→ 結果 → 答え の順に現れる
 * - 書くツールは「書く」（MCP_WRITE=true）のときだけ一覧に出る。読むだけのときに
 *   書く問いを選ぶと、AI は探すところまでで止まる ── その違いを切り替えで見せる
 * - 書く手前では、Claude Desktop と同じく「許可しますか」で止まり、押すまで進まない
 * - prefers-reduced-motion では間を置かずに並べる
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import m from "./mcp-server.module.css";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type Row = Record<string, Json>;

type CallStep = { kind: "call"; tool: string; arguments: Record<string, Json>; result: Row };
type ConfirmStep = { kind: "confirm"; tool: string };
type Step = CallStep | ConfirmStep;

type Play = { steps: Step[]; answer: string; denied?: string };

type Scene = {
  id: string;
  topic: string;
  kit: string;
  question: string;
  writes?: boolean;
  steps?: Step[];
  answer?: string;
  read?: Play;
  write?: Play;
};

type Tool = { name: string; title: string; write: boolean };

type Recording = {
  recordedOn: string;
  tools: { read: Tool[]; write: Tool[] };
  scenes: Scene[];
};

type Mode = "read" | "write";
type Decision = "pending" | "allowed" | "denied";

const STEP_MS = 850;

/** 表に出す列。結果の JSON は全部の列を持つので、読む人が一目で分かる列だけを選ぶ */
const TABLE_COLUMNS: Record<string, string[]> = {
  顧客: ["会社名", "状況", "最終連絡日", "要注意"],
  対応履歴: ["日付", "顧客", "種別", "内容"],
  bookings: ["日付", "開始", "サービス", "状態"],
  documents: ["請求元", "請求書番号", "支払期限", "合計金額"],
};

function playOf(scene: Scene, mode: Mode): Play {
  if (scene.writes) return (mode === "write" ? scene.write : scene.read) as Play;
  return { steps: scene.steps ?? [], answer: scene.answer ?? "" };
}

function yen(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function cell(value: Json | undefined): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "あり" : "";
  if (typeof value === "number") return yen(value);
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * 引数を短く書く。上の段の鍵ごとに 1 行、中の値は 1 行に畳む（絞り込みは 1 件 1 行）。
 * JSON.stringify(…, null, 2) のままだと、絞り込み 2 つで 20 行を超え、会話が引数に埋もれる。
 */
function compact(args: Record<string, Json>): string {
  const inline = (v: Json) => JSON.stringify(v).replace(/,"/g, ', "').replace(/":/g, '": ');
  const lines = Object.entries(args).map(([k, v]) => {
    if (Array.isArray(v) && v.length > 1) {
      return `  "${k}": [\n${v.map((x) => `    ${inline(x)}`).join(",\n")}\n  ]`;
    }
    return `  "${k}": ${inline(v)}`;
  });
  return `{\n${lines.join(",\n")}\n}`;
}

/** 結果の一行目。何が何件返ったかだけを言う */
function summary(step: CallStep): string {
  const r = step.result;
  if (Array.isArray(r.rows)) return `「${cell(r.table)}」から ${cell(r.total)} 行`;
  if (Array.isArray(r.bookings)) return `予約 ${cell(r.total)} 件`;
  if (Array.isArray(r.documents)) return `書類 ${cell(r.total)} 行`;
  if (step.tool.startsWith("add_row_")) return `「${cell(r.table)}」に 1 行登録（ID ${cell(r.id)}）`;
  if (step.tool === "cancel_booking") return `状態を「${cell(r["状態"])}」に`;
  if (r.booking) return "予約 1 件";
  return "結果";
}

function ResultBody({ step }: { step: CallStep }) {
  const r = step.result;
  const key = ["rows", "bookings", "documents"].find((k) => Array.isArray(r[k]));
  if (key) {
    const rows = r[key] as Row[];
    const labels = (r.labels ?? {}) as Record<string, Json>;
    const columns = TABLE_COLUMNS[key === "rows" ? cell(r.table) : key] ?? Object.keys(rows[0] ?? {}).slice(0, 4);
    return (
      <div className={m.tableWrap}>
        <table className={m.table}>
          <thead>
            <tr>
              <th scope="col">ID</th>
              {columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${cell(row["ID"] ?? row["書類ID"])}-${i}`}>
                <td className={m.mono}>{cell(row["ID"] ?? row["書類ID"])}</td>
                {columns.map((c) => {
                  const raw = row[c];
                  // 参照の列は、サーバーが labels に添えた表示名で読む
                  const label = typeof raw === "string" && labels[raw] ? cell(labels[raw]) : null;
                  return <td key={c}>{label ?? cell(raw)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  // 1 件の結果: 空でない値だけを並べる
  const record = ((r.row ?? r.booking ?? r) as Row) || {};
  const entries = Object.entries(record).filter(([k, v]) => v !== "" && v !== null && typeof v !== "object" && k !== "作成日時");
  return (
    <>
      <dl className={m.fields}>
        {entries.map(([k, v]) => (
          <div key={k} className={m.field}>
            <dt>{k}</dt>
            <dd>{cell(v)}</dd>
          </div>
        ))}
      </dl>
      {typeof r.note === "string" && <p className={m.serverNote}>{r.note}</p>}
    </>
  );
}

function CallBlock({ step, title }: { step: CallStep; title: string }) {
  return (
    <li className={m.call}>
      <p className={m.callHead}>
        <span className={m.callVerb}>ツールを使いました</span>
        <code className={m.toolName}>{step.tool}</code>
        <span className={m.toolTitle}>{title}</span>
      </p>
      <pre className={m.args} aria-label="引数">
        {compact(step.arguments)}
      </pre>
      <p className={m.resultHead}>
        <span className={m.callVerb}>結果</span>
        {summary(step)}
      </p>
      <ResultBody step={step} />
      <details className={m.raw}>
        <summary>返った JSON をすべて見る</summary>
        <pre>{JSON.stringify(step.result, null, 2)}</pre>
      </details>
    </li>
  );
}

export function Replay({ src }: { src: string }) {
  const [rec, setRec] = useState<Recording | null>(null);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState<Mode>("read");
  const [sceneId, setSceneId] = useState<string>("");
  // 見せた手の数。steps.length + 1 で答えまで出た
  const [pos, setPos] = useState(0);
  const [decision, setDecision] = useState<Decision>("pending");
  const [reduced, setReduced] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const modeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: Recording) => {
        if (!alive) return;
        setRec(data);
        // 最初の問いは、答えまで出した状態で置いておく（開いたときに空の画面を見せない）
        const first = data.scenes[0];
        setSceneId(first.id);
        setPos(playOf(first, "read").steps.length + 1);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [src]);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);

  const scene = rec?.scenes.find((s) => s.id === sceneId) ?? null;
  const play = scene ? playOf(scene, mode) : null;
  const tools = rec ? rec.tools[mode] : [];
  const titles = useMemo(() => new Map(rec?.tools.write.map((t) => [t.name, t.title]) ?? []), [rec]);

  const end = play ? play.steps.length + 1 : 0;
  const waiting = play !== null && pos > 0 && play.steps[pos - 1]?.kind === "confirm" && decision === "pending";
  const finished = play !== null && (pos >= end || decision === "denied");

  // 1 手ずつ進める。許可の確認で止まり、断られたらそこで終わる
  useEffect(() => {
    if (!play || waiting || finished) return;
    const id = window.setTimeout(() => setPos((p) => p + 1), reduced ? 0 : STEP_MS);
    return () => window.clearTimeout(id);
  }, [play, pos, waiting, finished, reduced]);

  const start = useCallback((id: string) => {
    setSceneId(id);
    setPos(0);
    setDecision("pending");
  }, []);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    // 書く問いを見ているときは、切り替えた設定で最初から見せ直す
    if (scene?.writes) {
      setPos(0);
      setDecision("pending");
    }
  };

  const decide = (d: Decision) => {
    setDecision(d);
    if (d === "allowed") setPos((p) => p + 1);
    // 押したボタンが消えるので、読む場所（会話）へ焦点を渡す
    logRef.current?.focus();
  };

  const onModeKey = (e: React.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next: Mode = mode === "read" ? "write" : "read";
    switchMode(next);
    modeRefs.current[next === "read" ? 0 : 1]?.focus();
  };

  if (failed) {
    return <p className={m.status}>記録を読み込めませんでした。ページを開き直してください。</p>;
  }
  if (!rec || !scene || !play) {
    return (
      <p className={m.status} aria-busy="true">
        記録を読み込んでいます…
      </p>
    );
  }

  const shownSteps = play.steps.slice(0, Math.min(pos, play.steps.length));
  const answer = decision === "denied" ? play.denied : pos >= end ? play.answer : null;
  const hiddenWrites = rec.tools.write.filter((t) => t.write).length;

  return (
    <div className={m.replay}>
      <div className={m.bar}>
        <div className={m.modeGroup}>
          <span className={m.modeLabel} id="mode-label">
            サーバーの設定
          </span>
          <div role="radiogroup" aria-labelledby="mode-label" className={m.modes} onKeyDown={onModeKey}>
            {(["read", "write"] as const).map((value, i) => (
              <button
                key={value}
                ref={(el) => {
                  modeRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={mode === value}
                tabIndex={mode === value ? 0 : -1}
                className={m.mode}
                onClick={() => switchMode(value)}
              >
                <span className={m.mark} aria-hidden="true" />
                {value === "read" ? "読むだけ" : "書く"}
                <code className={m.env}>MCP_WRITE={value === "read" ? "false" : "true"}</code>
              </button>
            ))}
          </div>
        </div>
        <details className={m.toolList}>
          <summary>
            AI に見えているツール {tools.length} 本
            {mode === "read" && <span className={m.muted}>（書くツール {hiddenWrites} 本は出ていません）</span>}
          </summary>
          <ul>
            {tools.map((t) => (
              <li key={t.name}>
                <code className={m.mono}>{t.name}</code>
                <span>{t.title}</span>
                {t.write && <span className={m.writeTag}>書く</span>}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className={m.stage}>
        <div className={m.questions}>
          <p className={m.questionsHead} id="questions-head">
            聞いてみる
          </p>
          <ul aria-labelledby="questions-head">
            {rec.scenes.map((s) => (
              <li key={s.id}>
                <button type="button" className={m.question} aria-pressed={s.id === sceneId} onClick={() => start(s.id)}>
                  <span className={m.mark} aria-hidden="true" />
                  <span className={m.qTopic}>
                    {s.topic}
                    <span className={m.qKit}>{s.kit}</span>
                    {s.writes && <span className={m.writeTag}>書く</span>}
                  </span>
                  <span className={m.qText}>{s.question}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={m.chat} ref={logRef} tabIndex={-1} aria-label="会話" role="log" aria-live="polite">
          <ol className={m.turns}>
            <li className={m.user}>
              <span className={m.who}>あなた</span>
              <p>{scene.question}</p>
            </li>
            {shownSteps.map((step, i) =>
              step.kind === "call" ? (
                <CallBlock key={`${scene.id}-${mode}-${i}`} step={step} title={titles.get(step.tool) ?? ""} />
              ) : (
                <li key={`${scene.id}-${mode}-${i}`} className={m.confirm}>
                  <p className={m.confirmText}>
                    <code className={m.toolName}>sheets</code> のツール <code className={m.toolName}>{step.tool}</code>
                    （{titles.get(step.tool)}）を使います。許可しますか？
                  </p>
                  {decision === "pending" ? (
                    <div className={m.confirmActions}>
                      <button type="button" className={m.verb} onClick={() => decide("allowed")}>
                        許可する
                      </button>
                      <button type="button" className={m.verb} onClick={() => decide("denied")}>
                        許可しない
                      </button>
                    </div>
                  ) : (
                    <p className={m.muted}>{decision === "allowed" ? "許可しました" : "許可しませんでした"}</p>
                  )}
                </li>
              ),
            )}
            {!answer && !waiting && (
              <li className={m.thinking} aria-hidden="true">
                …
              </li>
            )}
            {answer && (
              <li className={m.assistant}>
                <span className={m.who}>AI</span>
                <p>{answer}</p>
              </li>
            )}
          </ol>
          {finished && (
            <div className={m.after}>
              <button type="button" className={m.verb} onClick={() => start(scene.id)}>
                もう一度再生する
              </button>
              {scene.writes && mode === "read" && (
                <button type="button" className={m.verb} onClick={() => switchMode("write")}>
                  「書く」に切り替えて見る
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
