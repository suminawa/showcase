/*
 * 悩みの言葉「LPの構成を自分で決める｜載せる内容と順番を1枚の表に書き出す」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 設定・設置のご依頼、の順に読ませる。
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

const guide = guideBySlug("lp-structure");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n10a6e8fbcbfd";
const COCONALA = "https://coconala.com/services/4394533";
const LANCERS = "https://www.lancers.jp/menu/detail/1342847";
const SHOT = "/og/sites.png";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function LpStructureGuide() {
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
          <span className={s.latin}>LP Structure</span>
        </h1>
        <p className={s.lede}>{guide.lede}</p>
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>困ること</h2>
          <ul className={g.list}>
            <li>広告や新しいサービスのために 1 枚のページが要るのに、何をどの順で載せるかが決まらない</li>
            <li>制作を頼もうにも、渡す原稿が無く、見積もりの前提がそろわない</li>
            <li>電話・フォーム・LINE のボタンを全部並べてしまい、読む人にしてほしいことが 1 つに定まらない</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>見本で何が変わるか</h2>
          <p className={g.text}>
            見本の LP は業種ごとに 5 本あります。BtoB・SaaS の見本は、最初の画面・課題・機能・料金・導入の流れ・よくある質問・問い合わせフォームの順に並んでいます。建設・工事の見本は料金の目安が平日と夜間・休日で切り替わり、店舗・サロンの見本は営業時間から「いまは開いています」を出します。どれも写真を使わずに作ってあります。社名や料金は、すべて架空のものです。
          </p>
          <figure className={g.figure}>
            <Link href="/sites" tabIndex={-1} aria-hidden="true">
              <Image src={SHOT} alt="業種別の LP と会社案内サイトの見本の一覧" width={1200} height={630} />
            </Link>
            <figcaption className={g.caption}>
              書き出した内容がページになったときの並びを、業種ごとの見本で確かめられます ──{" "}
              <Link href="/sites" className={s.textLink}>
                LP の見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組む手順の要点</h2>
          <ul className={g.list}>
            <li>先に 3 つ決める。誰に・何をしてほしいか（電話・フォーム・予約のどれか 1 つ）・どこから来るか</li>
            <li>スプレッドシートか文書に「段・載せること・例」の 3 列を作り、最初の画面から問い合わせまでの 7 行を埋める</li>
            <li>料金の目安には、その金額に含むものと含まないものを書く。金額を出せないときは、何が分かれば見積もれるかを書く</li>
            <li>書き終えたら、金額・日数・返事の目安が段どうしで食い違っていないかを上から読み直す</li>
          </ul>
          <p className={g.text}>
            詳しい手順は note の記事{" "}
            <a href={NOTE_ARTICLE} className={s.textLink}>
              「{guide.title}」
            </a>
            に書きました。記事の手順は、無料で最後まで行えます。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>キット</h2>
          <p className={g.text}>
            見本の 5 本の LP と 4 ページの会社案内サイトを、「業種別 LP テンプレ パック」として販売しています（定価 ¥6,980 の買い切り）。文言はテンプレートごとの設定ファイル、色は 1 つのファイルを書き換えます。書き換えと公開はご自身で行っていただきます。書き出しには Node.js（20.9 以上）が必要で、置く場所（Vercel やお使いのサーバー）と、フォームの送信を受ける先は別にご用意いただきます。サーバーやドメインの費用は別にかかります。文章の作成、写真の撮影、広告の運用は含みません。 ──{" "}
            <a href={goHref("lp", "note", "/guides/lp-structure")} rel="nofollow" className={s.textLink}>
              note
            </a>
            {" / "}
            <a href={goHref("lp", "booth", "/guides/lp-structure")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定・設置のご依頼</h2>
          <p className={g.text}>
            原稿の整理から公開までを、こちらで行うこともできます。テンプレートの設定ではなく、1 ページの LP を設計から作る制作のご依頼です。やり取りはメッセージで行います。 ──{" "}
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
