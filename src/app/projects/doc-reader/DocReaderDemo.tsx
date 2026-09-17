"use client";

/*
 * 読み取りの実物。キットの本体（確認・編集・送信つきのテンプレ）ではなく、
 * 「書類を渡すと、型に沿って読み取って返す」という核だけを見せる 1 枚もの。
 * サーバーとのやり取りは @suminawa/doc-reader/ui の型だけを使い、値の描画は
 * すべて文字列（React の子要素）── dangerouslySetInnerHTML は一度も使わない。
 */
import { useEffect, useState } from "react";
import type { Extraction, FormSummary, ScalarValue } from "@suminawa/doc-reader/ui";

import c from "./doc-reader.module.css";

interface Sample {
  file: string;
  title: string;
  form: string;
}

/** reader/samples/index.json と同じ 5 本。public/reader-samples/ に同じファイルを置いてある */
const SAMPLES: Sample[] = [
  { file: "invoice-01.pdf", title: "請求書（設備工事）", form: "invoice" },
  { file: "receipt-01.jpg", title: "レシート（コンビニ風）", form: "receipt" },
  { file: "purchase-order-01.pdf", title: "注文書（空調）", form: "purchase-order" },
  { file: "business-card-01.jpg", title: "名刺", form: "business-card" },
  { file: "application-01.pdf", title: "申込書", form: "application" },
];

const FALLBACK_MAX_BYTES = 4 * 1024 * 1024;
const UNAVAILABLE_MESSAGE = "いまは読み取れません。しばらくしてからもう一度お試しください。";

function showValue(value: ScalarValue, type: string): string {
  if (value === null) return "―";
  if (typeof value === "boolean") return value ? "はい" : "いいえ";
  if (typeof value === "number") {
    const formatted = value.toLocaleString("ja-JP");
    return type === "money" ? `¥${formatted}` : formatted;
  }
  return value;
}

export function DocReaderDemo() {
  const [forms, setForms] = useState<FormSummary[]>([]);
  const [defaultForm, setDefaultForm] = useState("invoice");
  const [maxFileBytes, setMaxFileBytes] = useState(FALLBACK_MAX_BYTES);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<Extraction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [configRes, formsRes] = await Promise.all([fetch("/api/reader/config"), fetch("/api/reader/forms")]);
        const config = (await configRes.json()) as { defaultForm: string; limits: { maxFileBytes: number } };
        const formsBody = (await formsRes.json()) as { forms: FormSummary[] };
        setDefaultForm(config.defaultForm);
        setMaxFileBytes(config.limits.maxFileBytes);
        setForms(formsBody.forms);
      } catch {
        setNotice("設定を読み込めませんでした。ページを読み直してください。");
      }
    })();
  }, []);

  const run = async (file: File, form: string) => {
    setBusy(true);
    setNotice(null);
    setFileName(file.name);
    setResult(null);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("form", form);
      const res = await fetch("/api/reader/extract", { method: "POST", body });
      const json = (await res.json()) as Extraction;
      setResult(json);
    } catch {
      setResult({ ok: false, code: "unavailable", message: UNAVAILABLE_MESSAGE });
    } finally {
      setBusy(false);
    }
  };

  const onSample = (sample: Sample) => {
    void (async () => {
      try {
        const res = await fetch(`/reader-samples/${sample.file}`);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        await run(new File([blob], sample.file, { type: blob.type }), sample.form);
      } catch {
        setNotice("見本を読み込めませんでした。ページを読み直してください。");
      }
    })();
  };

  const onOwnFile = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (file === undefined) return;
    if (file.size > maxFileBytes) {
      const mb = Math.round((file.size / 1024 / 1024) * 10) / 10;
      setNotice(`4 MB を超えています(この書類は ${mb} MB です)。もう少し小さい書類でお試しください。`);
      return;
    }
    void run(file, defaultForm);
  };

  const form = result !== null && result.ok ? (forms.find((f) => f.id === result.form) ?? null) : null;
  const scalarFields = form?.fields.filter((f) => f.type !== "table") ?? [];
  const tableFields = form?.fields.filter((f) => f.type === "table") ?? [];

  return (
    <div className={c.shell}>
      <div className={c.layout}>
        <div className={c.left}>
          <section>
            <p className={c.sectionHead}>同梱の見本で試す</p>
            <ul className={c.samples}>
              {SAMPLES.map((sample) => (
                <li key={sample.file} className={c.sample}>
                  <a href={`/reader-samples/${sample.file}`} target="_blank" rel="noopener noreferrer" className={c.sampleLink}>
                    {sample.title}
                  </a>
                  <button aria-label={`${sample.title} を読み取る`} type="button" className={c.action} disabled={busy || forms.length === 0} onClick={() => onSample(sample)}>
                    読み取る
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <p className={c.sectionHead}>自分の書類で試す</p>
            <p className={c.note}>
              アップロードした書類はサーバーに保存しません。対応形式は PDF・JPEG・PNG・WebP、4 MB までです。1
              日に読み取れる件数には上限（50 件）があります。
            </p>
            <label className={c.fileField} htmlFor="dr-own-file">
              書類を選ぶ
              <input
                id="dr-own-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                disabled={busy}
                onChange={(event) => {
                  onOwnFile(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </section>

          {notice !== null && (
            <p className={c.notice} role="status">
              {notice}
            </p>
          )}
        </div>

        <div className={c.right}>
          <p className={c.sectionHead}>結果{fileName !== null ? `　${fileName}` : ""}</p>

          {busy && (
            <p className={c.status} role="status">
              読み取っています…
            </p>
          )}

          {!busy && result === null && <p className={c.placeholder}>左の見本を選ぶか、書類をアップロードすると、ここに結果が出ます。</p>}

          {!busy && result !== null && !result.ok && (
            <p className={c.error} role="alert">
              {result.message}
            </p>
          )}

          {!busy && result !== null && result.ok && (
            <div className={c.result}>
              <table className={c.table}>
                <thead>
                  <tr>
                    <th scope="col">項目</th>
                    <th scope="col">値</th>
                    <th scope="col">信頼度</th>
                  </tr>
                </thead>
                <tbody>
                  {scalarFields.map((field) => {
                    const cell = result.fields[field.key];
                    return (
                      <tr key={field.key}>
                        <th scope="row">{field.label}</th>
                        <td>{showValue(cell?.value ?? null, field.type)}</td>
                        <td className={c.confidence}>{cell === undefined ? "" : `${Math.round(cell.confidence * 100)}%`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {tableFields.map((field) => {
                const rows = result.tables[field.key]?.rows ?? [];
                const columns = field.columns ?? [];
                return (
                  <div key={field.key} className={c.lines}>
                    <p className={c.sectionHead}>{field.label}</p>
                    {rows.length === 0 ? (
                      <p className={c.placeholder}>明細はありません。</p>
                    ) : (
                      <table className={c.table}>
                        <thead>
                          <tr>
                            {columns.map((column) => (
                              <th key={column.key} scope="col">
                                {column.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, index) => (
                            <tr key={index}>
                              {columns.map((column) => (
                                <td key={column.key}>{showValue(row[column.key] ?? null, column.type)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}

              {result.warnings.length > 0 && (
                <ul className={c.warnings}>
                  {result.warnings.map((warning, index) => (
                    <li key={index}>{warning.message}</li>
                  ))}
                </ul>
              )}

              <p className={c.meta}>
                ms: {result.ms} ・ cacheReadTokens: {result.usage.cacheReadTokens}
              </p>

              <details className={c.jsonBlock}>
                <summary>JSON で見る</summary>
                <pre className={c.json}>{JSON.stringify(result, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
