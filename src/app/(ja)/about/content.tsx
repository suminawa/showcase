/*
 * 運営者について。全ページの共通の一行（SiteFooter）から結ぶ紙。
 * 名義・経歴・作っているもの・お取引の決まり・プライバシー方針を、日本語だけで置く（2026-10-16 監査 改善 2）。
 *
 * 書いてよい経歴の範囲は suminawa-ops の experience-facts.md（会社名・案件名・氏名は書かない。年数は「3 年以上」まで）。
 * 氏名・所在地は紙に載せない ── 商品の販売は BOOTH と note が売り手で、この紙は売り場ではない。
 * 契約と請求の書面でお知らせする、と書くにとどめる。インボイスの登録番号は無い（direct-sales.md §5-4）。
 * FORM: 方眼（DESIGN.md）。文は前の版のまま、組み方だけを替えた（2026-10-17）。
 */
import Link from "next/link";

import u from "@/components/site/ui.module.css";
import { ContactMail } from "@/components/track/ContactMail";
import { pageMetadata } from "@/i18n/meta";

import s from "./about.module.css";

const PAGE = {
  title: "運営者について",
  latin: "About",
  lede: "suminawa（墨縄）を運営している者の名義・経歴と、お取引とプライバシーの決まりです。",
};

/** 名義の段。dt / dd の組で、問い合わせの紙の「よくあるご質問」と同じ組み方 */
const OPERATOR: { q: string; a: React.ReactNode }[] = [
  { q: "名義", a: "suminawa（墨縄）。個人で運営しています。" },
  { q: "所在地", a: "神奈川県。氏名と所在地は、契約と請求の書面でお知らせします。" },
  {
    q: "連絡先",
    a: (
      <>
        <ContactMail className={u.link} /> ── 3 営業日以内に返信します。
      </>
    ),
  },
  { q: "この紙の最終更新", a: "2026 年 10 月 16 日" },
];

/** お取引の決まり。数字と文言は /contact と /projects の返品の一文に合わせる（食い違わせない） */
const TERMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "商品（キット）の販売",
    a: "BOOTH と note で販売しています。売り手の表記・決済・領収書は、それぞれのサービスの定めによります。ご購入から 14 日は、手順書どおりに動かないときにメールで設置まで一緒に確かめます。デジタル商品のため、返品・返金はお受けしていません。",
  },
  {
    q: "制作のご依頼",
    a: (
      <>
        ココナラ・ランサーズ・クラウドワークスを通して、またはメールで直接お受けします。範囲と納品物を先に文章で固め、お見積もりに修正の回数まで書きます。目安は{" "}
        <Link href="/contact" className={u.link}>
          制作のご相談
        </Link>
        {" "}の紙に。
      </>
    ),
  },
  { q: "お支払い", a: "直接のご依頼は銀行振込か請求書払い。適格請求書（インボイス）の登録番号はありません。" },
  { q: "秘密保持", a: "秘密保持契約の締結に応じます。お客さまの名前・案件の内容は、実績として公開しません。" },
  {
    q: "AI の道具の使い方",
    a: "下書きや雛形には AI の道具を使いますが、動作の確認と納品物の確認は自分で行います。納品物は通常のコードで、文章や設定をお客さまご自身で直せる形でお渡しします。",
  },
];

/** プライバシー方針。計測の中身は RootDocument（Vercel Web Analytics）と /go（押した数）、/api の見本の 3 つだけ */
const PRIVACY: { q: string; a: string }[] = [
  {
    q: "アクセスの計測",
    a: "Vercel Web Analytics で、ページの閲覧数と、売り場や問い合わせへ進んだ数を数えています。Cookie は使わず、個人を特定する情報は持ちません。",
  },
  {
    q: "お問い合わせのメール",
    a: "いただいた内容は、返信とお見積もりのためだけに使います。第三者に渡すことはありません。",
  },
  {
    q: "AI の見本に入力した内容",
    a: "AI 案内窓口・書類の読み取り・LINE の見本に入力した内容は、答えを作るために Anthropic の API へ送られます。見本には個人情報や機密を入れないでください。",
  },
  {
    q: "見本サイト・ツールの入力",
    a: "ブラウザの中だけで動く見本の入力は、お使いの端末の中にとどまり、こちらには送られません。",
  },
];

function Pairs({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <dl className={s.pairs}>
      {items.map((item) => (
        <div key={item.q} className={s.pair}>
          <dt>{item.q}</dt>
          <dd>{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <section className={s.section} aria-label={name}>
      <h2 className={u.h2}>{name}</h2>
      {children}
    </section>
  );
}

// 日本語だけの紙なので、英仏の道は添えない（pageMetadata は三言語の組を付ける）
export const aboutMetadata = {
  ...pageMetadata("ja", "/about", { title: PAGE.title, description: PAGE.lede }),
  alternates: { canonical: "/about" },
};

export function AboutPage() {
  return (
    <main id="main" className={s.page}>
      <div className={u.wrap}>
        <header className={s.head}>
          <h1 className={s.title}>{PAGE.title}</h1>
          <p className={u.lede}>{PAGE.lede}</p>
        </header>
      <Section name="名義と連絡先">
        <Pairs items={OPERATOR} />
      </Section>

      <Section name="経歴">
        <p className={s.text}>
          仕事で、Web システムの開発・保守（PHP・JavaScript・PostgreSQL）、発注者側の SE
          として要件定義から受入テスト・本番適用まで、受託システムの品質保証と設計レビュー、Excel（VBA）と Python
          による業務の自動化ツールの開発を、あわせて 3 年以上担当してきました。
        </p>
        <p className={s.text}>
          いまは、小さな会社の事務を Google スプレッドシートと Apps Script、Claude API
          で自動化するキットと、業種別の見本サイトを自主制作で作り、このサイトで公開しています。会社名・案件名は出さず、自分で作って動かしているものだけを実績として載せています。G
          検定 合格（2026 年 1 月）。
        </p>
      </Section>

      <Section name="作っているもの">
        <p className={s.text}>
          <Link href="/kits" className={u.link}>
            業務キット
          </Link>
          （期限アラート・フォーム受付・予約ページなど、買い切りで自分で入れられるもの）、
          <Link href="/sites" className={u.link}>
            業種別の見本サイト
          </Link>
          、業務への AI の組み込み（案内窓口・書類の読み取り・問い合わせの仕分け）。見本はすべてその場で動きます。
        </p>
      </Section>

      <Section name="お取引の決まり">
        <Pairs items={TERMS} />
      </Section>

      <Section name="プライバシー方針">
        <Pairs items={PRIVACY} />
      </Section>
        <p className={s.close}>
          <Link href="/contact" className={u.btn}>
            頼み方と料金を見る
          </Link>
        </p>
      </div>
    </main>
  );
}
