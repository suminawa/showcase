/*
 * 悩みの言葉「PDF の請求書をスプレッドシートに手で書き写す」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 導入代行、の順に読ませる。
 * FORM: 方眼（DESIGN.md）。枠は ../parts の GuideArticle。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NoteEmbed } from "@/components/note/NoteEmbed";
import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import g from "../guides.module.css";
import { GuideArticle, GuideLinks, guideMetadata } from "../parts";
import { ContactMail } from "@/components/track/ContactMail";

const IMAGE = "/og/doc-reader.png";
const guide = guideBySlug("pdf-to-spreadsheet");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n0f5ef06bbf69";
const ZENN_ARTICLE = "https://zenn.dev/suminawa/articles/f7c352a23e5540";
const COCONALA = "https://coconala.com/services/4414579";
const LANCERS = "https://www.lancers.jp/menu/detail/1344798";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function PdfToSpreadsheetGuide() {
  return (
    <GuideArticle guide={guide} image={IMAGE}>
        <section className={g.section}>
          <h2 className={g.heading}>請求書を手で書き写すと、何が困りますか</h2>
          <ul className={g.list}>
            <li>
              30 枚の請求書を写すのに 1
              時間ほどかかり、桁の打ち間違いは後から見つけにくい
            </li>
            <li>
              「¥12,800-」「令和8年9月13日」など、書き方が取引先ごとに違う
            </li>
            <li>
              明細の合計・税抜・税込が合っているかを、毎回電卓で確かめている
            </li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>AI に読ませると、転記はどう変わりますか</h2>
          <p className={g.text}>
            PDF や写真を置くと、決めた項目を AI
            が書き写し、確認画面に並べます。自信の無い項目と、合計が合わない書類だけが黄色になり、人はそこだけを見て確定します。確定した行だけが
            CSV かスプレッドシートに 1 行で入ります。
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
              <Link href="/projects/doc-reader" className={g.link}>
                AI 書類読み取りの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組むときは、何から決めますか</h2>
          <ul className={g.list}>
            <li>
              写す項目を先に決め、スプレッドシートの 1
              行目に並べる（請求元・発行日・税抜・消費税・合計など 9 列）
            </li>
            <li>
              日付と金額は書き方をそろえる列で変換し、「税抜 + 消費税 =
              合計」の検算列で合わない行だけに色を付ける
            </li>
            <li>
              AI
              に読ませるなら、見たままの文字と根拠と確かさだけを返させ、変換と検算はプログラムで行う
            </li>
            <li>
              負の金額（△1,000）、番号を日付と読む誤り、再送による二重登録、式として動くセルに先に手を打つ
            </li>
          </ul>
          <p className={g.text}>
            詳しい手順は note の記事{" "}
            <a href={NOTE_ARTICLE} className={g.link}>
              「{guide.title}」
            </a>
            に、Claude API と TypeScript での実装は Zenn の記事{" "}
            <a href={ZENN_ARTICLE} className={g.link}>
              「請求書 PDF をスプレッドシートに転記する処理を Claude API
              で作る」
            </a>
            に書きました。
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
            の鍵はご自身のものを使います。 ──{" "}
            <a
              href={goHref("doc-reader", "booth", "/guides/pdf-to-spreadsheet")}
              rel="nofollow"
              className={g.link}
            >
              BOOTH
            </a>
            {" / "}
            <a
              href={goHref("doc-reader", "note", "/guides/pdf-to-spreadsheet")}
              rel="nofollow"
              className={g.link}
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
            <a href={COCONALA} className={g.link}>
              ココナラ
            </a>
            {" / "}
            <a href={LANCERS} className={g.link}>
              ランサーズ
            </a>
          </p>
          <p className={g.text}>
            ご相談は{" "}
            <ContactMail className={g.link} />{" "}
            へ。3 営業日以内に返信します。
          </p>
        </section>
        <GuideLinks guide={guide} />
    </GuideArticle>
  );
}
