/*
 * 悩みの言葉「LINE 公式アカウントの問い合わせに、自社の資料だけで答えさせる」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 導入代行、の順に読ませる。
 * LINE 案内窓口キットは LINE の中で動くので、同じ答える部品の案内窓口の見本へ渡す。
 * FORM: 料紙（作品ページ）— 文法は DESIGN.md。朱は戻りの落款だけ。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import links from "@/data/links.json";
import { guideBySlug } from "@/lib/guides";

import { fontVars } from "../../projects/fonts";
import s from "../../projects/projects.module.css";
import g from "../guides.module.css";

const guide = guideBySlug("line-auto-reply");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n22cdeff34999";
const COCONALA = "https://coconala.com/services/4416823";
const LANCERS = "https://www.lancers.jp/menu/detail/1345031";

export const metadata: Metadata = {
  title: guide.title,
  description: guide.lede,
  openGraph: { title: guide.title, description: guide.lede, images: ["/og/ai-concierge.png"] },
  twitter: { card: "summary_large_image", images: ["/og/ai-concierge.png"] },
};

export default function LineAutoReplyGuide() {
  return (
    <main className={`${s.paper} ${fontVars}`}>
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
          <span className={s.latin}>LINE Auto Reply</span>
        </h1>
        <p className={s.lede}>{guide.lede}</p>
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>困ること</h2>
          <ul className={g.list}>
            <li>営業時間や料金、対応エリアといった同じ質問が、夜や手の離せない時間に何度も届く</li>
            <li>キーワード応答は言葉が完全に一致しないと外れ、「料金」と「費用」で答えが分かれる</li>
            <li>AI に任せると、資料に無いことまで推測で答えてしまわないかが心配になる</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>見本で何が変わるか</h2>
          <p className={g.text}>
            会社案内・料金・よくあるご質問などの文書だけを根拠に、AI が敬体で答えます。答えの下に根拠にした文書のタイトルと URL が並び、資料に無いことは「載っていません」と伝えて担当者へ引き継ぎます。LINE の中で動く部品と同じ答え方を、サイトに置いた案内窓口の見本で試せます。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/ai-concierge">
              <Image
                src="/og/ai-concierge.png"
                alt="AI 案内窓口の見本。質問に答え、根拠の文書を添える画面"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              答え方はその場で試せます ──{" "}
              <Link href="/projects/ai-concierge" className={s.textLink}>
                AI 案内窓口の見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組む手順の要点</h2>
          <ul className={g.list}>
            <li>よくある質問と答えを 1 枚の文書にまとめ、キーワード応答には表記ゆれの言葉も並べて登録する</li>
            <li>あいさつメッセージとリッチメニューで、質問の入口を先に見せる</li>
            <li>AI に答えさせるなら、根拠の文書を添えさせ、資料に無いことは担当者へ回す道を作る</li>
            <li>1 対 1 のトークだけに答え、再送された通知は 2 度処理せず、1 日の質問数に上限を切る</li>
          </ul>
          <p className={g.text}>
            詳しい手順は note の記事{" "}
            <a href={NOTE_ARTICLE} className={s.textLink}>
              「{guide.title}」
            </a>
            に書きました。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>キット</h2>
          <p className={g.text}>
            この組み方を「LINE 案内窓口キット」として販売しています（定価 ¥12,800 の買い切り）。根拠の URL つきの答え、質問の候補ボタン、担当者への引き継ぎと Slack への通知、署名の確認、1 日の上限が入っていて、Vercel にそのまま置ける Next.js のテンプレートとソース・テストも同梱しています。 ──{" "}
            <a href={links["line-concierge"].booth} className={s.textLink}>
              BOOTH
            </a>
            {" / "}
            <a href={links["line-concierge"].note} className={s.textLink}>
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>導入代行</h2>
          <p className={g.text}>
            文書の整理と索引づくり、Vercel への設置、LINE 公式アカウントの設定、引き継ぎ先と質問の候補の作り込みまで、こちらで行うこともできます。 ──{" "}
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
