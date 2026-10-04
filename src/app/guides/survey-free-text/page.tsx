/*
 * 悩みの言葉「Googleフォームの自由記述を集計する｜お客様の声から改善を一つ決める」の着地の紙。
 * 困ること → 手で組む手順（記事）→ キットにすると何が変わるか → キット → 設定・設置のご依頼、の順に読ませる。
 * このキットには作品ページ（見本）が無いので、図は実際のスプレッドシートの画面（架空の回答を AI で分析したもの）。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。朱は戻りの落款だけ。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import { fontVars } from "../../projects/fonts";
import s from "../../projects/projects.module.css";
import g from "../guides.module.css";
import { GuideJsonLd, guideMetadata } from "../parts";

const guide = guideBySlug("survey-free-text");

const NOTE_ARTICLE = "https://note.com/suminawa/n/ne4f938f8fcd4";
const COCONALA = "https://coconala.com/services/4429481";
const LANCERS = "https://www.lancers.jp/menu/detail/1346436";
const ZENN_ARTICLE = "https://zenn.dev/suminawa/articles/cf361521854cb8";
const SHOT = "/guides/survey-free-text-rows.png";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function SurveyFreeTextGuide() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
      <GuideJsonLd guide={guide} image={SHOT} />
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
          <span className={s.latin}>Survey Free Text</span>
        </h1>
        <p className={s.lede}>{guide.lede}</p>
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>困ること</h2>
          <ul className={g.list}>
            <li>自由記述を上から読んでも、「待ち時間の話が多かった気がする」で終わってしまう</li>
            <li>似た声が別々の言い方で書かれていて、何件あるのかを数えられない</li>
            <li>件数だけを見て決めると、良かった点の声まで改善の対象に見えてしまう</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組む手順の要点</h2>
          <ul className={g.list}>
            <li>集計する期間を決め、元の回答はそのままにして、別のタブに「回答 ID・日付・回答本文」を写す</li>
            <li>1 つの回答に主な分類を 1 つ付け、同じ意味の声は同じ名前の分類にそろえる</li>
            <li>分類の件数と、意見の内容（不満なのか、良かった点なのか）を分けて見る</li>
            <li>いちばん多い声から自動的に決めず、原文とお店の状況を見て、次に試すことを 1 つ書く</li>
          </ul>
          <p className={g.text}>
            詳しい手順は note の記事{" "}
            <a href={NOTE_ARTICLE} className={s.textLink}>
              「{guide.title}」
            </a>
            に書きました。記事の手順は、無料で最後まで行えます。Google Apps Script から AI で分類する実装は、Zenn の記事{" "}
            <a href={ZENN_ARTICLE} className={s.textLink}>
              「Google フォームの自由記述を Claude API で分類する GAS」
            </a>
            に書きました。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>キットにすると何が変わるか</h2>
          <p className={g.text}>
            回答が続けて届き、分類と集計を毎回やり直す負担が出てきたら、同じ作業をスプレッドシートの中で続けられます。回答ごとに「分類・感情・要望・短い要約」が付き、その結果から、分類ごとの件数や多い要望、改善案がまとまります。分類は手で直せて、直した内容で件数を数えます。担当者の割り当てや、改善を実行したかどうかの管理は含みません。
          </p>
          <figure className={g.figure}>
            <Image
              src={SHOT}
              alt="Google スプレッドシートの「分析結果」シート。待ち時間についての 2 件の回答に、分類・感情・要望・要約が付いている"
              width={976}
              height={568}
            />
            <figcaption className={g.caption}>
              Google スプレッドシートの「分析結果」シート（実際の画面）。2 件の回答に、分類・感情・要望・要約が付いています。キットに同梱の架空の回答を、実際に AI で分析した結果です。実際のお客さまの回答ではありません。「回答（抜粋）」は質問文を含む先頭 60 字です。読みやすいよう列の幅と折り返しを調整し、ほかの行と列は隠しています。
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>キット</h2>
          <p className={g.text}>
            この組み方を「お客さまアンケート キット」として販売しています（定価 ¥7,980 の買い切り）。Google フォームと Google スプレッドシートで動き、キット自体の月額の費用はかかりません。初期設定はご自身で行っていただきます。実際の回答を AI で分析するには、Anthropic のアカウントと API キーの登録が必要で、API の利用料は別にかかります。 ──{" "}
            <a href={goHref("survey-analysis", "note", "/guides/survey-free-text")} rel="nofollow" className={s.textLink}>
              note
            </a>
            {" / "}
            <a href={goHref("survey-analysis", "booth", "/guides/survey-free-text")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定・設置のご依頼</h2>
          <p className={g.text}>
            質問と分類の設計から、初回の分析とまとめの読み方の説明までを、こちらで行うこともできます（料金にキット一式を含みます）。やり取りはメッセージで行います。 ──{" "}
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
      </div>
    </main>
  );
}
