"use client";
/*
 * 日本語だけの紙（見本サイト /demos・悩みから読む紙 /guides）の頭に出す、英仏の断り書き。
 * 英仏を選んだ人（Cookie）、Cookie が無ければブラウザの言語が日本語でない人にだけ出す。
 * 日本語の人には何も出さない ── 紙そのものは今のまま静的に配り、ここだけがブラウザで決める。
 */
import { useSyncExternalStore } from "react";

import { noteLang } from "@/i18n/detect";
import { LANG_COOKIE, localePath, type ForeignLang } from "@/i18n/routes";

const COOKIE = new RegExp(`(?:^|;\\s*)${LANG_COOKIE}=([^;]*)`);

import s from "./japanese-only.module.css";

const TEXT = {
  demos: {
    en: "This is a sample site for a fictional Japanese company, so it is in Japanese.",
    fr: "Ceci est un site d’exemple pour une entreprise japonaise fictive ; il est donc en japonais.",
  },
  guides: {
    en: "This guide is available in Japanese only.",
    fr: "Ce guide n’existe qu’en japonais.",
  },
  back: { en: "Back to Showcase", fr: "Retour à Showcase" },
};

function readLang(): ForeignLang | null {
  const m = COOKIE.exec(document.cookie);
  return noteLang(m ? decodeURIComponent(m[1]) : null, navigator.languages?.[0] ?? navigator.language);
}

const subscribeNothing = () => () => {};

export function JapaneseOnlyNote({ kind }: { kind: "demos" | "guides" }) {
  const lang = useSyncExternalStore(subscribeNothing, readLang, () => null);
  if (!lang) return null;
  const back = kind === "demos" ? "/sites" : "/kits";
  return (
    <aside className={kind === "guides" ? `${s.note} ${s.paperNote}` : s.note} lang={lang}>
      <span>{TEXT[kind][lang]}</span>{" "}
      <a className={s.link} href={localePath(lang, back)}>
        {TEXT.back[lang]}
      </a>
    </aside>
  );
}
