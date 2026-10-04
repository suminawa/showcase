/*
 * 悩みの言葉「ホームページに、自社の資料だけで答える AI の窓口を置く」の着地の紙。
 * 困ること → 答え方の決まり（根拠・分からないときの道）→ 自分で組む手順 → キット → 設置代行、の順。
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
import { GuideAnswer, GuideByline, GuideJsonLd, GuideLinks, guideMetadata } from "../parts";

const IMAGE = "/og/ai-concierge.png";
const guide = guideBySlug("site-ai-faq");

const COCONALA = "https://coconala.com/services/4414572";
const LANCERS = "https://www.lancers.jp/menu/detail/1344801";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function SiteAiFaqGuide() {
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
          <span className={s.latin}>Site AI FAQ</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>よくあるご質問のページがあるのに、なぜ同じ質問が届くのですか</h2>
          <ul className={g.list}>
            <li>ページは「料金」の見出しで書いてあるのに、聞く方は「費用はいくらくらい」と聞く。言葉が違うと、探しても見つからない</li>
            <li>答えが会社概要・料金表・よくあるご質問の 3 枚に散っていて、1 つの質問に答えるのに 3 枚を読む必要がある</li>
            <li>夜や休日に届いた質問は翌営業日まで待たせるので、その間に別の会社へ問い合わせが流れる</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>AI に答えさせるとき、何を決めておく必要がありますか</h2>
          <p className={g.text}>
            AI の窓口で困るのは「資料に無いことを、それらしく答えてしまう」ことです。これは AI の賢さではなく、組み方で防ぎます。先に決めるのは次の 4 つです。
          </p>
          <ol className={g.list}>
            <li>
              <b>何を根拠にするか</b>: 会社概要・料金・対応エリア・よくあるご質問など、答えに使ってよい文書を決めます。公開しているページと、Markdown の文書を数本。最初は 5〜10 本で足ります。
            </li>
            <li>
              <b>根拠をどう見せるか</b>: 答えの下に、使った文書の題名とリンクを並べます。読んだ方が確かめられ、担当者も「どの資料を直せばよいか」が分かります。
            </li>
            <li>
              <b>分からないときにどうするか</b>: 資料に無いことは「載っていません」と言い、担当者へ問い合わせるボタンを出します。推測で埋めさせません。
            </li>
            <li>
              <b>どこまで受けるか</b>: 1 人あたりの回数と 1 日の件数に上限を置き、質問の長さも区切ります。鍵はサーバーにだけ置き、画面の JavaScript には出しません。
            </li>
          </ol>
          <figure className={g.figure}>
            <Link href="/projects/ai-concierge">
              <Image
                src={IMAGE}
                alt="AI 案内窓口の見本。質問に答え、根拠にした文書の題名とリンクを添える画面"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              根拠つきの答え方は、その場で試せます ──{" "}
              <Link href="/projects/ai-concierge" className={s.textLink}>
                AI 案内窓口の見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組むには、どういう手順ですか</h2>
          <p className={g.text}>
            仕組みは「索引を作る」「質問に近い文書を探す」「探した文書だけを渡して答えさせる」の 3 段です。検索で拾った文書を根拠に答えさせる組み方で、RAG と呼ばれます。
          </p>
          <ol className={g.list}>
            <li>
              <b>文書を整える</b>: 1 文書 1 話題にし、見出しをつけます。「料金」と「費用」のように言い方が複数あるものは、本文に両方の言葉を入れておくと探しやすくなります。
            </li>
            <li>
              <b>索引を作る</b>: 文書を見出しごとに数百字の塊に切り、それぞれを数値の並び（埋め込み）に変えて保存します。文書が数十本なら、JSON のファイル 1 つで足ります。データベースは要りません。
            </li>
            <li>
              <b>質問のたびに探す</b>: 質問も同じ数値の並びに変え、近い塊を上から 3〜5 個取ります。
            </li>
            <li>
              <b>答えさせる</b>: 取った塊だけを資料として渡し、「資料に無いことは『載っていません』と答える」「根拠の文書を示す」と指示して答えさせます。答えは書かれるそばから表示すると、待たされている感じがしません。
            </li>
            <li>
              <b>答えられなかった質問を残す</b>: 「載っていません」と答えた質問を一覧に貯めます。ここに並ぶ言葉が、次に足すべき文書です。
            </li>
          </ol>
          <p className={g.text}>
            最初の 1 週間は、担当者が一覧を毎日見て文書を 1 本ずつ足すと、答えられる範囲が目に見えて広がります。AI の設定をいじるより、文書を足す方が効きます。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>費用はどのくらいかかりますか</h2>
          <p className={g.text}>
            AI の利用料は質問の数で決まります。1 日 100 件の質問を 30 日続けた場合、渡す資料の大きさにもよりますが、月に数千円から 1〜2 万円の幅です。同じ資料を続けて渡すときに料金が下がる仕組み（プロンプトキャッシュ）を使うと、半分ほどに収まります。サイトを置く費用は、Vercel の無料枠で始められます。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            この組み方を「AI 案内窓口キット」として販売しています（定価 ¥12,800 の買い切り）。根拠の題名とリンクつきの答え、担当者へ問い合わせるボタン、答えられなかった質問の一覧と CSV の書き出し、回数と大きさの上限、Vercel にそのまま置ける Next.js のテンプレートと見本の文書 8 本が入っています。窓は右下のボタンから開く形と、ページの中に埋め込む形の 2 通りです。 ──{" "}
            <a href={goHref("ai-concierge", "booth", "/guides/site-ai-faq")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
            {" / "}
            <a href={goHref("ai-concierge", "note", "/guides/site-ai-faq")} rel="nofollow" className={s.textLink}>
              note
            </a>
          </p>
          <p className={g.text}>
            LINE 公式アカウントの中で同じ答え方をさせたい場合は、
            <Link href="/guides/line-auto-reply" className={s.textLink}>
              LINE 公式アカウントの問い合わせに、自社の資料だけで答えさせる
            </Link>
            をご覧ください。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設置まで頼めますか</h2>
          <p className={g.text}>
            文書の整理と索引づくり、Vercel への設置、サイトへの窓の埋め込み、問い合わせ先と質問の候補の作り込みまで、こちらで行うこともできます。 ──{" "}
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
