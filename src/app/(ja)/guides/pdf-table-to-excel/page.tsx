/*
 * 悩みの言葉「PDF の表を Excel やスプレッドシートに移すと、列が崩れる」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 導入代行、の順に読ませる。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。朱は戻りの落款だけ。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NoteEmbed } from "@/components/note/NoteEmbed";
import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import { fontVars } from "../../projects/fonts";
import s from "../../projects/projects.module.css";
import g from "../guides.module.css";
import {
  GuideAnswer,
  GuideByline,
  GuideJsonLd,
  GuideLinks,
  guideMetadata,
} from "../parts";

const IMAGE = "/og/doc-reader.png";
const guide = guideBySlug("pdf-table-to-excel");

const NOTE_ARTICLE = "https://note.com/suminawa/n/neeaf12edf05f";
const INVOICE_GUIDE = "/guides/pdf-to-spreadsheet";
const COCONALA = "https://coconala.com/services/4414579";
const LANCERS = "https://www.lancers.jp/menu/detail/1344798";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function PdfTableToExcelGuide() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      <GuideJsonLd guide={guide} image={IMAGE} />
      <div className={s.stroke} aria-hidden="true">
        <span className={`${s.ink} ${s.inkKasure}`} />
        <span className={`${s.ink} ${s.inkCore}`} />
      </div>

      <header className={s.head}>
        <Link href="/guides" className={s.back}>
          <span className={s.seal} aria-hidden="true">
            墨
          </span>
          悩みから読む へ戻る
        </Link>
        <h1 className={s.title}>
          {guide.title}
          <span className={s.latin}>PDF Table to Excel</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>
            PDF の表をコピーして貼ると、どう崩れますか
          </h2>
          <ul className={g.list}>
            <li>
              PDF の表をコピーして貼ると、品番も品名も金額も 1 つのセルに詰まる
            </li>
            <li>
              2 ページ目の見出しの行が混ざり、ページをまたいだ行が 2 行に割れる
            </li>
            <li>「¥1,280」「1,280円」が文字のままで、合計しても 0 になる</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>AI に読み取らせると、どう変わりますか</h2>
          <p className={g.text}>
            請求書や注文書の PDF を 1 枚ずつ置くと、決めた項目と明細を AI
            が書き写し、確認画面に並べます。明細の合計と税抜が合わない書類と、自信の無い項目だけが黄色になり、人はそこだけを見て確定します。明細のある型は、明細の
            CSV も別に出せます。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/doc-reader">
              <Image
                src="/og/doc-reader.png"
                alt="AI 書類読み取りの見本。書類を置くと項目が確認画面に並ぶ"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              見本はその場で試せます ──{" "}
              <Link href="/projects/doc-reader" className={s.textLink}>
                AI 書類読み取りの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>表を表のまま取り出すには、どうしますか</h2>
          <ul className={g.list}>
            <li>
              表の文字をドラッグで選べるかを先に見る。選べないスキャンの PDF
              は、先に OCR が要る
            </li>
            <li>
              Windows の Microsoft 365 の Excel
              は「データ」→「データの取得」→「ファイルから」→「PDF
              から」で表を選んで取り込む
            </li>
            <li>
              Mac やスプレッドシートなら、PDF を Word で開いて表にしてから貼る
            </li>
            <li>
              取り込んだら、混ざった見出しの行・割れた行・文字のままの数字を直し、金額の合計と行数を
              PDF と突き合わせる
            </li>
          </ul>
          <p className={g.text}>
            詳しい手順は note の記事{" "}
            <a href={NOTE_ARTICLE} className={s.textLink}>
              「{guide.title}」
            </a>
            に書きました。書類 1 枚ずつから請求元や金額を拾う場合は{" "}
            <Link href={INVOICE_GUIDE} className={s.textLink}>
              「PDF の請求書をスプレッドシートに手で書き写す作業を減らす」
            </Link>
            をご覧ください。
          </p>
          <NoteEmbed url={NOTE_ARTICLE} />
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            見本と同じものを「AI 書類読み取りキット」として販売しています（定価
            ¥16,800 の買い切り）。書類ごとの読み取り設定（帳票の型）5
            種、確認画面つきの Next.js
            テンプレ、スプレッドシートの受け口が入っていて、API
            の鍵はご自身のものを使い、読んだ枚数ぶんの API
            の費用が別にかかります。何十ページもある報告書の表を丸ごと移す用途には作っていません。
            ──{" "}
            <a
              href={goHref("doc-reader", "booth", "/guides/pdf-table-to-excel")}
              rel="nofollow"
              className={s.textLink}
            >
              BOOTH
            </a>
            {" / "}
            <a
              href={goHref("doc-reader", "note", "/guides/pdf-table-to-excel")}
              rel="nofollow"
              className={s.textLink}
            >
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定や設置まで頼めますか</h2>
          <p className={g.text}>
            帳票の型の作り込み・スプレッドシート連携・配置まで、こちらで行うこともできます。
            ──{" "}
            <a href={COCONALA} className={s.textLink}>
              ココナラ
            </a>
            {" / "}
            <a href={LANCERS} className={s.textLink}>
              ランサーズ
            </a>
          </p>
          <p className={g.text}>
            ご相談は{" "}
            <a href="mailto:hello@suminawa.dev" className={s.textLink}>
              hello@suminawa.dev
            </a>{" "}
            へ。3 営業日以内に返信します。
          </p>
        </section>
        <GuideLinks guide={guide} />
      </div>
    </main>
  );
}
