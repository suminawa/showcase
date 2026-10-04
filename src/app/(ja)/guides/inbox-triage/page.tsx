/*
 * 悩みの言葉「問い合わせのメールが埋もれて、返信が遅れたり漏れたりする」の着地の紙。
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
import { GuideAnswer, GuideByline, GuideJsonLd, GuideLinks, guideMetadata } from "../parts";

const guide = guideBySlug("inbox-triage");

const NOTE_ARTICLE = "https://note.com/suminawa/n/nc261fb1a0894";
const COCONALA = "https://coconala.com/services/4415612";
const LANCERS = "https://www.lancers.jp/menu/detail/1344930";
const SHOT = "/guides/inbox-triage-sheet.png";

export const metadata: Metadata = guideMetadata(guide, SHOT);

export default function InboxTriageGuide() {
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
          <span className={s.latin}>Inbox Triage</span>
        </h1>
        <GuideAnswer guide={guide} />
        <p className={s.lede}>{guide.lede}</p>
        <GuideByline guide={guide} />
      </header>

      <div className={s.work}>
        <section className={g.section}>
          <h2 className={g.heading}>問い合わせのメールは、なぜ埋もれるのですか</h2>
          <ul className={g.list}>
            <li>営業メールと見積もり依頼が同じ受信箱に混ざり、期限つきの依頼に気づくのが前日になる</li>
            <li>開いて既読にしたところで安心して、返していないメールが未読の山より見つけにくくなる</li>
            <li>2 人で見ていると「どちらかが返したはず」で誰も返さず、クレームへの初動が翌日になる</li>
          </ul>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>AI が分類と下書きまで行うと、どう変わりますか</h2>
          <p className={g.text}>
            Gmail に届いた問い合わせを 15 分ごとに AI が読み、分類・緊急度・要約・求められていること・期限を、スプレッドシートに 1 通 1 行で書きます。期限が近いもの・クレーム・支払いの催促は「⚠ 要対応」として通知の先頭に出ます。返信は Gmail の下書きまでで、送るのは人です。配信メールと除外した差出人は読みません。見本では、架空の会社に届いた 5 通を整理した結果を 1 通ずつ読めます。
          </p>
          <figure className={g.figure}>
            <Link href="/projects/inbox-triage">
              <Image
                src={SHOT}
                alt="問い合わせシートの見本。受信日時・分類・緊急度・要約・求められていることが 1 通 1 行で並んだ表"
                width={1280}
                height={800}
              />
            </Link>
            <figcaption className={g.caption}>
              整理した回に届く通知と、1 通ずつの下書きを読めます ──{" "}
              <Link href="/projects/inbox-triage" className={s.textLink}>
                問い合わせ整理の見本を開く
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>Gmail の標準の機能だけで振り分けるには、どうしますか</h2>
          <ul className={g.list}>
            <li>ラベルを「見積もり」「質問」「クレーム」「予約・日程」「請求・支払い」「営業・勧誘」の 6 つから始め、フィルタで付ける</li>
            <li>既読を対応済みにせず、返したら「済」を付けてアーカイブし、受信箱には返していないものだけを残す</li>
            <li>スプレッドシートに 1 通 1 行の台帳（受信日・差出人・分類・状態・担当・期限）を作り、担当を書く</li>
            <li>期限は本文に書かれたものだけを写し、返信の下書きで金額・納期・在庫を約束しない</li>
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
          <h2 className={g.heading}>そのまま使えるキットはありますか</h2>
          <p className={g.text}>
            この組み方を「AI 問い合わせ整理キット」として販売しています（定価 ¥5,980 の買い切り）。Google スプレッドシートと Apps Script 1 本で動き、AI の利用料はご自身の Anthropic の API キーで 1 通 2〜4 円ほどです。分類は 8 種を同梱し、設定シートで変えられます。通知先は Slack・Discord・LINE から選べます。自動では送りません。 ──{" "}
            <a href={goHref("inbox-triage", "booth", "/guides/inbox-triage")} rel="nofollow" className={s.textLink}>
              BOOTH
            </a>
            {" / "}
            <a href={goHref("inbox-triage", "note", "/guides/inbox-triage")} rel="nofollow" className={s.textLink}>
              note
            </a>
          </p>
        </section>

        <section className={g.section}>
          <h2 className={g.heading}>設定や設置まで頼めますか</h2>
          <p className={g.text}>
            分類の設計、返信の方針と署名の作り込み、通知先とラベルの設定、トリガーの導入まで、こちらで行うこともできます。実際の問い合わせ（内容を伏せたもので構いません）を 10 通ほどお預かりし、分類と返信案の言い回しを合わせます。 ──{" "}
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
