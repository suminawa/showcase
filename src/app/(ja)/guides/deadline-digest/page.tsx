/*
 * 悩みの言葉「期限の通知が毎日 5 通来ると、全部読まなくなる」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 設定・設置のご依頼、の順に読ませる。
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
import { ContactMail } from "@/components/track/ContactMail";

const guide = guideBySlug("deadline-digest");

const NOTE_ARTICLE = "https://note.com/suminawa/n/n3a2329111cc7";
const SHEET_GUIDE = "/guides/deadline-alert";
const COCONALA = "https://coconala.com/services/4427437";
const LANCERS = "https://www.lancers.jp/menu/detail/1342848";
const SHOT = "/guides/deadline-alert-notice.png";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function DeadlineDigestGuide() {
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
          <span className={s.latin}>Five Deadline Alerts, One Message</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>
            通知が毎日何通も来ると、何が困りますか
          </h2>
          <ul className={g.list}>
            <li>同じ件が 3 日前・前日・当日と何度も来て、1 通ごとの重みが下がる</li>
            <li>5 通のうち本当に危ないのは 1 通だけでも、見た目は同じ 5 通になる</li>
            <li>
              済んだ件の通知が鳴り続けると読み飛ばす癖がつき、読み飛ばした日に期限切れが混じる
            </li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>毎朝 1 通で知らせると、どう変わりますか</h2>
          <p className={g.text}>
            スプレッドシートに書いた期限を、毎朝 1 回、Slack か Discord へ 1
            通でお知らせします。期限を過ぎたもの・今日が期限のもの・3
            日後が期限のものの順に並びます。同じ件の知らせは 1 通の中の 1 行になるので、「また来た」という通知の山になりません。完了の行は飛ばし、同じ日に 2 回動いても同じ行は 2 度送りません。
            知らせる期限が無い朝は何も届かず、読み取りに失敗した日はエラーが届きます。
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
          <h2 className={g.heading}>
            スプレッドシートだけで、通知を 1 つの表にまとめるには
          </h2>
          <ul className={g.list}>
            <li>期限の列を日付型にそろえ、隣に「あと何日」の列を足す</li>
            <li>
              「区分」の列で、超過・当日・3
              日前以内の 3 つに仕分ける。完了の行は消さずにフィルタで外す
            </li>
            <li>
              区分が超過・当日・3
              日前以内の行だけを表示するフィルタ表示を保存し、毎朝見る場所をそこ 1
              つにする
            </li>
            <li>個別の通知は切る。完了にし忘れた行が残らないよう、ときどき見直す</li>
          </ul>
          <p className={g.text}>
            手順と落とし穴は、note の記事{" "}
            <a href={NOTE_ARTICLE} className={s.textLink}>
              「{guide.title}」
            </a>
            に書きました。期限シートの作り方と色分けは{" "}
            <Link href={SHEET_GUIDE} className={s.textLink}>
              「契約の更新や点検の期限を、スプレッドシートに書いたまま見落とす」
            </Link>
            をご覧ください。
          </p>
          <NoteEmbed url={NOTE_ARTICLE} />
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            毎朝 1 通の通知を組んだものを「期限アラート GAS
            キット」として販売しています（定価 ¥2,980
            の買い切り。月額の費用なし）。今のスプレッドシートに Apps Script 1
            ファイルを貼って使います。Slack か Discord の Webhook
            の作成と設定シートの記入はご自身で行います。メールや LINE
            への通知は含みません。 ──{" "}
            <a
              href={goHref("s2", "booth", "/guides/deadline-digest")}
              rel="nofollow"
              className={s.textLink}
            >
              BOOTH
            </a>
            {" / "}
            <a
              href={goHref("s2", "note", "/guides/deadline-digest")}
              rel="nofollow"
              className={s.textLink}
            >
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定・設置のご依頼</h2>
          <p className={g.text}>
            お使いのスプレッドシートに期限の通知を 1
            本つなぐところから、複数のシートや独自の条件での設定まで、こちらで行うこともできます。
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
            <ContactMail className={s.textLink} />{" "}
            へ。3 営業日以内に返信します。
          </p>
        </section>
        <GuideLinks guide={guide} />
      </div>
    </main>
  );
}
