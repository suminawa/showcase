/*
 * 検索の言葉「スプレッドシート 予約 受付」「予約フォーム 無料 作り方」の着地の紙。
 * 困ること → 無料でできる 3 つ（Google フォーム・カレンダーの予約スケジュール・台帳を 1 つに）→ 比べる表 →
 * 足りなくなるとき → キット → 設置を頼む、の順に読ませる。
 * キットの事実は ops 30days/products/booking-gas/booth-description.md だけから取る。
 * FORM: 方眼（DESIGN.md）。枠は ../parts の GuideArticle。
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { NoteEmbed } from "@/components/note/NoteEmbed";
import { ContactMail } from "@/components/track/ContactMail";
import { goHref } from "@/lib/go";
import { guideBySlug } from "@/lib/guides";

import g from "../guides.module.css";
import { GuideArticle, GuideCompare, GuideLinks, guideMetadata } from "../parts";

const IMAGE = "/og/booking.png";
const guide = guideBySlug("booking-page");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n90085dbff6aa";
/** note の記事の題（記事の側の題なので、この紙の題を直しても変えない） */
const NOTE_TITLE = "電話と LINE で受けている予約を、空いている時間から選んでもらう";
const ZENN_ARTICLE = "https://zenn.dev/suminawa/articles/5afc3444f9513c";
const COCONALA = "https://coconala.com/services/4414534";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function BookingPageGuide() {
  return (
    <GuideArticle guide={guide} image={IMAGE}>
      <section className={g.section}>
        <h2 className={g.heading}>電話と LINE で予約を受けていると、何が困りますか</h2>
        <ul className={g.list}>
          <li>施術中や接客中は電話に出られず、折り返すころには他のお店で決まっている</li>
          <li>電話と LINE の両方で受けていて、最後の 1 枠ほど二重予約になる</li>
          <li>前日のリマインドを 1 件ずつ手で送り、忙しい日ほど送り忘れて無断キャンセルが出る</li>
        </ul>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>無料で予約を受け付けるには、どうしますか</h2>
        <ol className={g.list}>
          <li>
            <b>台帳を 1 つにする</b>: 道具を変える前に、スプレッドシートに「日付・時間・お名前・連絡先・状態」の台帳を作り、電話でも LINE
            でも返事をする前にここへ書きます。受付の窓口が分かれていても、書く場所が 1 つなら二重予約はほぼ防げます。
          </li>
          <li>
            <b>Google フォームで受け付ける</b>: 日付と時間の質問を置いたフォームを作り、「回答」タブからスプレッドシートにつなぐと、予約が 1 行ずつたまります。作るのは 10
            分ほどで、費用はかかりません。ただし、フォームは空いている時間を見せられず、同じ時間に 2 人が送っても止められません。確定は、台帳を見てから手で返します。
          </li>
          <li>
            <b>Google カレンダーの予約スケジュール</b>: カレンダーに受け付ける時間を決めると、空いている時間から選んでもらえるページができます。無料の Google
            アカウントで作れる予約ページは 1 つで、リマインドのメールの自動送信などは有料の Google Workspace の機能です。予約はスプレッドシートではなくカレンダーに入ります。
          </li>
        </ol>
        <p className={g.text}>
          受け付ける枠は、曜日・開始・終了・間隔・定員の決まりにしておくと、どの方法でも迷いません。休みと祝日は先に台帳へ書き、キャンセルの締切（たとえば開始の 24
          時間前まで）を確認の文面に入れておきます。詳しい手順は note の記事{" "}
          <a href={NOTE_ARTICLE} className={g.link}>
            「{NOTE_TITLE}」
          </a>
          に、Google Apps Script（GAS）での組み方は Zenn の記事{" "}
          <a href={ZENN_ARTICLE} className={g.link}>
            「Google Apps Script で予約ページを作る」
          </a>
          に書きました。
        </p>
        <NoteEmbed url={NOTE_ARTICLE} />
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>Google フォーム・カレンダー・予約サービス・キットは、何が違いますか</h2>
        <GuideCompare
          rows={[
            {
              way: "Google フォーム＋スプレッドシート",
              cost: "0 円",
              fits: "予約が 1 日数件で、確定の返事を手で送れる",
              limit: "空いている時間を見せられず、二重予約を止められない",
            },
            {
              way: "Google カレンダーの予約スケジュール",
              cost: "0 円（一部は有料プラン）",
              fits: "1 人の空き時間から選んでもらいたい",
              limit: "無料では予約ページが 1 つ。リマインドの自動送信は有料。予約はスプレッドシートに残らない",
            },
            {
              way: "予約の専用サービス",
              cost: "無料プラン〜月額",
              fits: "決済やスタッフの指名まで任せたい",
              limit: "予約の記録はそのサービスの中。機能を増やすと月額がかかる",
            },
          ]}
          kit={{
            way: "booking",
            fits: "空きから選んでもらい、予約はスプレッドシートに残したい",
            limit: "オンライン決済・複数店舗・スタッフの指名には対応していない",
          }}
        />
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>予約ページ キットでは、何ができますか</h2>
        <p className={g.text}>
          スプレッドシートの「枠」シートに受け付ける曜日と時間を書くと、公開した URL
          がそのまま予約ページになります。お客さまは空きカレンダーから日と時間を選び、お名前と連絡先を入れて予約を終えます。Google
          アカウントは要りません。予約は「予約」シートに 1 行ずつたまり、確認メール・お店へのお知らせ・前日のリマインドを自動で送れます。最後の 1
          枠は書き込む直前に残りを数え直すので、同じ枠に 2 人が入りません。
        </p>
        <ul className={g.list}>
          <li>キャンセルは、確認メールの URL からお客さまご自身で手続きできます。締切は設定で決められます</li>
          <li>Google カレンダーへの登録は任意です。Slack・Discord・LINE へも知らせられます</li>
          <li>サーバーも月額の費用も要りません。メールは Google の枠で、1 日に個人の Gmail で 100 通、Google Workspace で 1,500 通まで送れます</li>
        </ul>
        <figure className={g.figure}>
          <Link href="/projects/booking">
            <Image src={IMAGE} alt="予約ページの見本。空きカレンダーから日と時間を選ぶ画面" width={1200} height={630} />
          </Link>
          <figcaption className={g.caption}>
            見本はブラウザの中だけで動くので、予約を終えるところまでそのまま試せます ──{" "}
            <Link href="/projects/booking" className={g.link}>
              予約ページの見本を開く
            </Link>
          </figcaption>
        </figure>
        <p className={g.text}>
          価格は ¥7,980（税込・買い切り）です。スプレッドシートに 3 ファイルを貼ってウェブアプリとして公開する形で、置き方は 15 分ほどです。 ──{" "}
          <a href={goHref("booking", "booth", "/guides/booking-page")} rel="nofollow" className={g.link}>
            BOOTH
          </a>
          {" / "}
          <a href={goHref("booking", "note", "/guides/booking-page")} rel="nofollow" className={g.link}>
            note
          </a>
        </p>
      </section>

      <section className={g.section}>
        <h2 className={g.heading}>設置まで頼めますか</h2>
        <p className={g.text}>
          <a href={COCONALA} className={g.link}>
            ココナラ
          </a>
          で、設置込みのご依頼もできます。枠とサービスの設計やホームページへの置き方のご相談は、 <ContactMail className={g.link} />{" "}
          へお送りください。3 営業日以内に返信します。
        </p>
      </section>
      <GuideLinks guide={guide} />
    </GuideArticle>
  );
}
