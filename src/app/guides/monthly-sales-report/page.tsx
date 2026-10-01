/*
 * 悩みの言葉「毎月の売上の集計とグラフを、スプレッドシートで手で作り直している」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 導入代行、の順に読ませる。
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

const guide = guideBySlug("monthly-sales-report");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n456f5b6b9f79";
const COCONALA = "https://coconala.com/services/4415622";
const LANCERS = "https://www.lancers.jp/menu/detail/1344931";

export const metadata: Metadata = {
  title: guide.title,
  description: guide.lede,
  openGraph: { title: guide.title, description: guide.lede, images: ["/og/dashboard.png"] },
  twitter: { card: "summary_large_image", images: ["/og/dashboard.png"] },
};

export default function MonthlySalesReportGuide() {
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
          <span className={s.latin}>Monthly Report</span>
        </h1>
        <p className={s.lede}>{guide.lede}</p>
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>困ること</h2>
          <ul className={g.list}>
            <li>月が変わるたびにピボットとグラフの範囲を手で広げ、広げ忘れると最新の月が出ない</li>
            <li>月の途中の先月比を、先月まるごとと比べてしまい、いつも下がって見える</li>
            <li>「1,200円」や全角の数字が合計から黙って漏れ、チャネルの色も月ごとに入れ替わる</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>見本で何が変わるか</h2>
          <p className={g.text}>
            集計の決まりを設定に 1 つずつ書くと、数字・折れ線・棒・目標・表の部品が並んだ 1 枚の画面になります。期間やチャネルを上の 1 行で選ぶと、下の部品がすべて同時に変わります。前の期間との増減は同じ日数どうしで比べ、解約や経費のように下がると良い数は色の向きを逆にします。数として読めない行は 0 として足さず、のぞいた件数を札の下に出します。見本は架空のお店の 6 か月ぶんの売上で動きます。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/dashboard">
              <Image
                src="/og/dashboard.png"
                alt="ダッシュボードの見本。KPI・折れ線・棒・目標・表が 1 枚に並んだ画面"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              絞り込みと「表で見る」はその場で試せます ──{" "}
              <Link href="/projects/dashboard" className={s.textLink}>
                ダッシュボードの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組む手順の要点</h2>
          <ul className={g.list}>
            <li>生データは 1 シートに 1 行 1 取引で置き、日付は 2026-09-19 の形にそろえる</li>
            <li>集計は別のシートで、範囲を列ごと（A:A）に指定して、行が増えても式を直さずに済ませる</li>
            <li>先月比は同じ日数どうしで比べ、目標は「月・目標額」の表から当月の行だけを引く</li>
            <li>数として読めない行を数えて横に出し、グラフには同じ数字の表を添える</li>
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
            この組み方を「ダッシュボード キット」として販売しています（定価 ¥9,800 の買い切り）。置き方は、いまのサイトへの埋め込み・Next.js のひな型・Google スプレッドシートの 3 通りで、外部の API を使わないので月額の費用はかかりません。前の期間との比較、月ごとの目標、絞り込んだ画面を URL で渡すしくみ、表での表示と CSV の書き出しが入っています。ソースと検査も同梱しています。 ──{" "}
            <a href={goHref("dashboard", "booth", "/guides/monthly-sales-report")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
            {" / "}
            <a href={goHref("dashboard", "note", "/guides/monthly-sales-report")} rel="nofollow" className={s.textLink}>
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定・設置のご依頼</h2>
          <p className={g.text}>
            どの数字をどの部品で見せるかのご相談から、いまのスプレッドシートや CSV をつないで画面を置くところ、見方のご説明まで、こちらで行うこともできます。 ──{" "}
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
