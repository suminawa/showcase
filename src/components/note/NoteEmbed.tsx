/*
 * note の記事をカードで埋め込む。note の公式の埋め込み（iframe + embed.js）をそのまま使う。
 * embed.js は iframe からの postMessage（height::<src>::<px>）を受けて、同じ src の iframe の高さを直す。
 * 記事でない URL（プロフィールなど）は埋め込めないので何も出さない
 */
import Script from "next/script";

import s from "./note-embed.module.css";

const KEY = /^https:\/\/note\.com\/[^/]+\/n\/(n[0-9a-f]+)\/?$/;

export function noteEmbedSrc(url: string): string | null {
  const m = KEY.exec(url);
  return m ? `https://note.com/embed/notes/${m[1]}` : null;
}

export function NoteEmbed({
  url,
  title = "note の記事",
}: {
  url: string;
  title?: string;
}) {
  const src = noteEmbedSrc(url);
  if (!src) return null;
  return (
    <>
      <iframe
        className={`note-embed ${s.embed}`}
        src={src}
        height={400}
        loading="lazy"
        title={title}
      />
      <Script
        src="https://note.com/scripts/embed.js"
        strategy="afterInteractive"
      />
    </>
  );
}
