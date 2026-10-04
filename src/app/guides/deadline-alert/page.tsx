/*
 * 悩みの言葉「契約の更新や点検の期限を、スプレッドシートに書いたまま見落とす」の着地の紙。
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
import { GuideJsonLd, guideMetadata } from "../parts";

const guide = guideBySlug("deadline-alert");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n60440b87a271";
const COCONALA = "https://coconala.com/services/4427437";
const LANCERS = "https://www.lancers.jp/menu/detail/1342848";
const SHOT = "/guides/deadline-alert-notice.png";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function DeadlineAlertGuide() {
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
          <span className={s.latin}>Deadline Alert</span>
        </h1>
        <p className={s.lede}>{guide.lede}</p>
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>困ること</h2>
          <ul className={g.list}>
            <li>車検・保険・賃貸契約・ドメインの期限を表に並べてあっても、開かなかった日に期限が過ぎる</li>
            <li>件数が増えると、どれが近いのかを毎回探すことになり、種類ごとに月もばらばらになる</li>
            <li>担当が 2 人いると「相手が見ているはず」で誰も動かず、気づくのが期限の翌日になる</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>見本で何が変わるか</h2>
          <p className={g.text}>
            スプレッドシートに書いた期限を、毎朝 8 時に Slack か Discord へ 1 通でお知らせします。1 通の中は、期限を過ぎたもの・今日が期限のもの・3 日後が期限のものの順に並び、いちばん危ないものが先頭に来ます。「状態」が「完了」の行は知らせません。同じ日に 2 回動いても同じ行は 2 度送らず、読み取りに失敗したときは同じ通知先にエラーを送ります。見本では、架空の会社の期限シートを書き換えると、届く 1 通がその場で変わります。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/deadline">
              <Image
                src={SHOT}
                alt="期限アラートの見本。期限を過ぎたもの・今日が期限のもの・3 日後が期限のものが 1 通にまとまった通知"
                width={1282}
                height={600}
              />
            </Link>
            <figcaption className={g.caption}>
              期限や状態を書き換えて、届く 1 通がどう変わるかを試せます ──{" "}
              <Link href="/projects/deadline" className={s.textLink}>
                期限アラートの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>自分で組む手順の要点</h2>
          <ul className={g.list}>
            <li>期限シートの列を「件名・期限・担当・状態」の 4 つにし、期限は文字列ではなく日付型で入れる</li>
            <li>条件付き書式で、30 日以内は黄色・7 日以内はオレンジ・超過は赤にする</li>
            <li>更新が済んだ行は消さずに「完了」と書き、フィルタで外して見る</li>
            <li>車検のように準備が要るものは、何日前に知らせるかを件ごとに決める。タイムゾーンは東京にする</li>
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
            この組み方を「期限アラート GAS キット」として販売しています（定価 ¥2,980 の買い切り）。Google スプレッドシートと Apps Script 1 ファイルで動き、月額の費用はかかりません。何日前に知らせるか・通知先・文面・列名は設定シートで変えられます。 ──{" "}
            <a href={goHref("s2", "booth", "/guides/deadline-alert")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
            {" / "}
            <a href={goHref("s2", "note", "/guides/deadline-alert")} rel="nofollow" className={s.textLink}>
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定・設置のご依頼</h2>
          <p className={g.text}>
            お使いのスプレッドシートに期限の通知を 1 本つなぐところから、複数のシートや独自の条件での設定まで、こちらで行うこともできます。 ──{" "}
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
