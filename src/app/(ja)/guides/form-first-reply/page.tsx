/*
 * 悩みの言葉「問い合わせは、届いてから最初の 1 通で半分決まる」の着地の紙。
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
import { GuideAnswer, GuideByline, GuideJsonLd, GuideLinks, guideMetadata } from "../parts";

const guide = guideBySlug("form-first-reply");

const NOTE_ARTICLE = "https://note.com/suminawa/n/nafdc882ae77c";
const GAS_GUIDE = "/guides/form-auto-reply";
const COCONALA = "https://coconala.com/services/4394572";
const LANCERS = "https://www.lancers.jp/menu/detail/1342848";
const SHOT = "/guides/form-auto-reply-email.png";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function FormFirstReplyGuide() {
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
          <span className={s.latin}>The First Reply to an Inquiry</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>最初の 1 通が遅れると、何が困りますか</h2>
          <ul className={g.list}>
            <li>送った方は、届いたのかどうかも分からないまま待つことになる</li>
            <li>現場に出ている日中は、フォームの通知がほかのメールに紛れる</li>
            <li>制作会社に自動返信を頼もうにも、何をどう頼めばよいかが決まっていない</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>受付と自動返信を仕組みにすると、どう変わりますか</h2>
          <p className={g.text}>
            フォームの送信先を、ご自身の Google アカウントの中に置きます。届いた内容はスプレッドシートに 1 件 1 行で貯まり、受付番号が付きます。同時に Slack・Discord・LINE（ご自身あて）へ通知が届き、送った方には受付番号の入った自動返信が 1 通届きます。見えない欄に字が入った迷惑投稿には返信しません。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/form">
              <Image
                src={SHOT}
                alt="フォーム受付 GAS キットの自動返信メール。件名に受付番号が入り、本文に送られた名前・メールアドレス・お問い合わせの内容が並ぶ"
                width={1324}
                height={425}
              />
            </Link>
            <figcaption className={g.caption}>
              送信から受付シート・通知・自動返信までの流れを試せます ──{" "}
              <Link href="/projects/form" className={s.textLink}>
                フォーム受付の見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>Gmail とスマホだけで、最初の 1 通を早く返すには</h2>
          <ul className={g.list}>
            <li>Gmail のフィルタで、フォームの通知メールにスター・重要マーク・「問い合わせ」のラベルを付ける</li>
            <li>スマホの Gmail アプリの通知を「優先度が高いもののみ」にして、問い合わせだけが鳴るようにする</li>
            <li>最初の返信を 3 行で決める。受け付けたこと、誰がいつまでに連絡するか（守れる時刻で）、急ぎの連絡先</li>
            <li>その 3 行をスマホのユーザー辞書に「うけつけ」で登録し、現場から 1 分ほどで返す</li>
            <li>制作会社に頼むなら、3 行をそのまま渡して「フォームの自動返信に、この文を入れてください」と伝える</li>
          </ul>
          <p className={g.text}>
            手順と落とし穴は、note の記事{" "}
            <a href={NOTE_ARTICLE} className={s.textLink}>
              「{guide.title}」
            </a>
            に書きました。Google Apps Script で自動返信を組む手順は{" "}
            <Link href={GAS_GUIDE} className={s.textLink}>
              「問い合わせフォームに自動返信をつける（GAS）」
            </Link>
            をご覧ください。
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            受付・通知・自動返信を組んだものを「フォーム受付 GAS キット」として販売しています（定価 ¥3,480 の買い切り。月額の費用なし）。Google スプレッドシートへの設置、通知先（Slack・Discord・LINE のどれか）の作成、フォームの送信先の差し替えはご自身で行います（20 分ほど）。制作会社が作ったフォームなら、送信先の差し替えは制作会社にご依頼ください。 ──{" "}
            <a href={goHref("s3", "booth", "/guides/form-first-reply")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
            {" / "}
            <a href={goHref("s3", "note", "/guides/form-first-reply")} rel="nofollow" className={s.textLink}>
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定・設置のご依頼</h2>
          <p className={g.text}>
            お使いのフォームのつなぎ替えから、通知と自動返信の文面の設定、動作の確認まで、こちらで行うこともできます。 ──{" "}
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
