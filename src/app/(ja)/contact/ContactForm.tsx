"use client";
/*
 * 問い合わせのフォーム。送信先は自社の「フォーム受付 GAS キット」のウェブアプリ（持ち主のアカウントで公開）。
 * URL は環境変数 NEXT_PUBLIC_CONTACT_ENDPOINT で入り、無いときはこの節ごと出さない（content.tsx）。
 * 送り方はキットの手順 4 のとおり: text/plain の JSON（application/json だとプリフライトで届かない）。
 * 見えない欄 homepage は迷惑投稿よけ（キットのハニーポット）。計測は track("contact") に from だけ。
 */
import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import s from "@/components/kit-demo/kit-demo.module.css";

const BUDGETS = ["5 万円未満", "5〜15 万円", "15 万円以上", "未定"];

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done"; id?: string } | { kind: "error"; message: string };

export function ContactForm({ endpoint }: { endpoint: string }) {
  const id = useId();
  const from = usePathname();
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (!values.name?.trim() || !values.email?.trim() || !values.message?.trim()) {
      setState({ kind: "error", message: "お名前・メール・ご相談内容の 3 つをお書きください。" });
      return;
    }
    values.page = location.href;
    setState({ kind: "sending" });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(values),
      });
      const answer = (await response.json()) as { ok: boolean; id?: string; message?: string };
      if (answer.ok) {
        track("contact", { from: `${from}#form` });
        form.reset();
        setState({ kind: "done", id: answer.id });
      } else {
        setState({ kind: "error", message: answer.message ?? "受け付けられませんでした。" });
      }
    } catch {
      setState({ kind: "error", message: "送信できませんでした。時間をおいてもう一度お試しいただくか、下のメールへお送りください。" });
    }
  }

  if (state.kind === "done") {
    return (
      <p className={s.body} role="status">
        受け付けました。{state.id ? `受付番号は ${state.id} です。` : ""}
        同じ内容の確認メールをお送りしました。3 営業日以内にお返事します。
      </p>
    );
  }

  return (
    <form className={s.col} onSubmit={submit} noValidate>
      <label className={s.field} htmlFor={`${id}-name`}>
        お名前
        <input id={`${id}-name`} name="name" className={s.input} autoComplete="name" required />
      </label>
      <label className={s.field} htmlFor={`${id}-email`}>
        メール
        <input id={`${id}-email`} name="email" type="email" className={s.input} autoComplete="email" required />
      </label>
      <label className={s.field} htmlFor={`${id}-budget`}>
        ご予算の目安
        <select id={`${id}-budget`} name="budget" className={s.input} defaultValue="未定">
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
      <label className={s.field} htmlFor={`${id}-message`}>
        ご相談内容
        <textarea id={`${id}-message`} name="message" className={s.input} rows={5} required placeholder="何を自動化したいか、いま使っているもの、希望の時期" />
      </label>
      {/* 迷惑投稿よけの見えない欄。人には見えず、読み上げもされない。bot だけが埋める */}
      <div className={s.trap} aria-hidden="true">
        <label>
          homepage
          <input name="homepage" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className={s.verbs}>
        <button type="submit" className={`${s.verb} ${s.verbMain}`} disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "送信しています…" : "送信する"}
        </button>
      </div>
      {state.kind === "error" && (
        <p className={s.body} role="alert">
          {state.message}
        </p>
      )}
      <p className={s.small}>いただいた内容は、返信とお見積もりのためだけに使います。受付の控えが自動返信で届きます。</p>
    </form>
  );
}
