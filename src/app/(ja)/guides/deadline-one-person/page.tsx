/*
 * 悩みの言葉「期限を覚えているのが総務の 1 人だけ、という会社で起きること」の着地の紙。
 * 困ること → 見本で何が変わるか → 自分で組む手順（記事）→ キット → 設定・設置のご依頼、の順に読ませる。
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

const guide = guideBySlug("deadline-one-person");

const NOTE_ARTICLE = "https://note.com/suminawa/n/nca9eff6df2ee";
const SHEET_GUIDE = "/guides/deadline-alert";
const COCONALA = "https://coconala.com/services/4427437";
const LANCERS = "https://www.lancers.jp/menu/detail/1342848";
const SHOT = "/guides/deadline-alert-notice.png";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function DeadlineOnePersonGuide() {
  return (
    <GuideArticle guide={guide} image={SHOT}>
        <section className={g.section}>
          <h2 className={g.heading}>
            期限を 1 人が覚えていると、何が困りますか
          </h2>
          <ul className={g.list}>
            <li>その人が休んだ日は、誰も期限を見ない</li>
            <li>1 件でも過ぎると、責任がその 1 人にかかる</li>
            <li>
              毎朝シートを上から見直しても、「どこかで見落としているかも」が消えない
            </li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>毎朝 1 通で知らせると、どう変わりますか</h2>
          <p className={g.text}>
            スプレッドシートに書いた期限を、毎朝 1 回、Slack・Discord・メール・Google Chat のうち選んだ先へ 1
            通でお知らせします。期限を過ぎたもの・今日が期限のもの・3
            日後が期限のものの順に並びます。上司も同じチャンネルにいれば同じ通知が届くので、見落としの責任が
            1
            人に寄りません。知らせる期限が無い朝は何も届かず、読み取りに失敗した日はエラーが届きます。
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
              <Link href="/projects/deadline" className={g.link}>
                期限アラートの見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>
            スプレッドシートとカレンダーだけで、1 人から抜けるには
          </h2>
          <ul className={g.list}>
            <li>
              頭の中にだけある期限（契約・車検・点検・資格）を書き出して、1
              行ずつシートに足す
            </li>
            <li>
              シートに「担当」と「次に見る人」の 2
              列を足す。担当が休んだ日に代わりに気づく人を決める
            </li>
            <li>
              Google カレンダーに「期限」の共有カレンダーを作り、30 日前と 7
              日前の予定を入れる。上司にも通知を設定してもらう
            </li>
            <li>
              月に 1 回、2 人で 10 分だけ、シートとカレンダーを突き合わせる
            </li>
          </ul>
          <p className={g.text}>
            手順と落とし穴は、note の記事{" "}
            <a href={NOTE_ARTICLE} className={g.link}>
              「{guide.title}」
            </a>
            に書きました。期限シートの作り方と色分けは{" "}
            <Link href={SHEET_GUIDE} className={g.link}>
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
            ファイルを貼って使います。通知先（Slack・Discord・メール・Google Chat）の設定と設定シートの記入はご自身で行います。LINE
            への通知は含みません。 ──{" "}
            <a
              href={goHref("s2", "booth", "/guides/deadline-one-person")}
              rel="nofollow"
              className={g.link}
            >
              BOOTH
            </a>
            {" / "}
            <a
              href={goHref("s2", "note", "/guides/deadline-one-person")}
              rel="nofollow"
              className={g.link}
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
