/*
 * 悩みの言葉「電話と LINE で受けている予約を、空いている時間から選んでもらう」の着地の紙。
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

const IMAGE = "/og/booking.png";
const guide = guideBySlug("booking-page");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n90085dbff6aa";
const ZENN_ARTICLE = "https://zenn.dev/suminawa/articles/5afc3444f9513c";
const COCONALA = "https://coconala.com/services/4414534";
const LANCERS = "https://www.lancers.jp/menu/detail/1344799";

export const metadata: Metadata = guideMetadata(guide, IMAGE);

export default function BookingPageGuide() {
  return (
    <GuideArticle guide={guide} image={IMAGE}>
        <section className={g.section}>
          <h2 className={g.heading}>
            電話と LINE で予約を受けていると、何が困りますか
          </h2>
          <ul className={g.list}>
            <li>
              施術中や接客中は電話に出られず、折り返すころには他のお店で決まっている
            </li>
            <li>
              電話と LINE の両方で受けていて、最後の 1 枠ほど二重予約になる
            </li>
            <li>
              前日のリマインドを 1
              件ずつ手で送り、忙しい日ほど送り忘れて無断キャンセルが出る
            </li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>
            スプレッドシートで予約ページは作れますか
          </h2>
          <p className={g.text}>
            スプレッドシートの「枠」シートに曜日と時間を書くと、公開した URL
            がそのまま予約ページになります。お客さまは空きカレンダーから日と時間を選び、お名前と連絡先を入れて予約を終えます。確認メールと前日のリマインドは自動で届き、最後の
            1 枠は書き込む直前に数え直すので、同じ枠に 2
            人が入ることはありません。見本はブラウザの中だけで動くので、予約を終えるところまでそのまま試せます。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/booking">
              <Image
                src="/og/booking.png"
                alt="予約ページの見本。空きカレンダーから日と時間を選ぶ画面"
                width={1200}
                height={630}
              />
            </Link>
            <figcaption className={g.caption}>
              予約の流れはその場で試せます ──{" "}
              <Link href="/projects/booking" className={g.link}>
                予約ページの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>
            予約の台帳を自分で作るには、どう進めますか
          </h2>
          <ul className={g.list}>
            <li>
              受け付ける枠を曜日・開始・終了・間隔・定員の決まりにし、休みと祝日は先に台帳へ書く
            </li>
            <li>台帳を 1 つにして、電話でも LINE でも返事をする前に書く</li>
            <li>
              確認の文面を固定し、キャンセルの締切（たとえば開始の 24
              時間前まで）を書いておく
            </li>
            <li>
              前日のリマインドは時刻を決めてまとめて送り、送った行に印を付ける
            </li>
          </ul>
          <p className={g.text}>
            詳しい手順は note の記事{" "}
            <a href={NOTE_ARTICLE} className={g.link}>
              「{guide.title}」
            </a>
            に、Google Apps Script での実装は Zenn の記事{" "}
            <a href={ZENN_ARTICLE} className={g.link}>
              「Google Apps Script で予約ページを作る」
            </a>
            に書きました。
          </p>
          <NoteEmbed url={NOTE_ARTICLE} />
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            この組み方を「予約ページ キット」として販売しています（定価 ¥7,980
            の買い切り）。サーバーも月額の費用も要らず、確認メール・前日のリマインド・お客さまご自身でのキャンセル、Google
            カレンダーへの登録（任意）、Slack・Discord・LINE
            への通知、いたずらの送信を止める仕組みが入っています。スプレッドシートに貼る
            3 ファイルと、ソース・テストも同梱しています。 ──{" "}
            <a
              href={goHref("booking", "booth", "/guides/booking-page")}
              rel="nofollow"
              className={g.link}
            >
              BOOTH
            </a>
            {" / "}
            <a
              href={goHref("booking", "note", "/guides/booking-page")}
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
            枠とサービスの設計、メールの文面、カレンダーと通知の設定、ホームページへの設置、スマートフォンでの確認まで、こちらで行うこともできます。
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
