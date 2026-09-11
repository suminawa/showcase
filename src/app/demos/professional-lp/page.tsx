/*
 * 見本: 士業・研修の LP。架空の会計事務所「霜月会計事務所」の 1 ページ。
 * 税務調査という「急ぎの相談」から入る導線と、料金の透明さが見せどころ。
 * 写真を使わず、色・形・CSS・SVG だけで作る。フォームはどこにも送らない。
 * 住所・電話番号・人名・実在の地名は書かない（連絡先は結びの hello@suminawa.dev だけ）。
 */
import type { Metadata } from "next";
import { Shippori_Mincho } from "next/font/google";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { DemoForm, type DemoField } from "@/components/demos/DemoForm";
import { AdvisoryPlans } from "@/components/demos/professional/AdvisoryPlans";
import { HeroRules } from "@/components/demos/professional/HeroRules";

import s from "./professional.module.css";

/** 見出しの明朝。本文は layout.tsx が読んでいる Noto Sans JP（var(--font-sans)）のまま。
    CJK は片が多いので preload: false（先読みすると 3.7 MB になる） */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--d-mincho",
  preload: false,
});

const BRAND = "霜月会計事務所";

const TITLE = "見本 ｜ 士業・研修の LP";
const DESCRIPTION =
  "架空の会計事務所「霜月会計事務所」の 1 ページ LP。料金の切替と相談フォームまで動く見本。";

export const metadata: Metadata = {
  // レイアウトの title.template（"%s | Showcase"）がタブに付け足されるのを防ぐ
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/demos/professional-lp",
    type: "website",
    images: ["/opengraph-image.png"],
    siteName: "Showcase",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

const ISSUES = [
  {
    title: "税務署から連絡が来た",
    body: "「調査に伺います」の電話のあと、何を用意すればいいのか分からない。",
  },
  {
    title: "記帳が追いつかない",
    body: "領収書が箱のまま残り、決算の前に一年分をまとめて片づけている。",
  },
  {
    title: "経理を任せられる人がいない",
    body: "担当が辞めたあと、社長が夜に数字を入力している。",
  },
];

const SERVICES = [
  {
    title: "税務調査の立ち会い",
    body: "事前の打ち合わせから当日の立ち会い、調査のあとの対応まで引き受けます。聞かれそうなことと答え方を、先に整理します。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 4h12l6 6v22H9z" />
        <path d="M20 4v7h7" />
        <circle cx="17" cy="21" r="4.5" />
        <path d="M20.5 24.5 24 28" />
      </svg>
    ),
  },
  {
    title: "記帳と決算",
    body: "月ごとの記帳から決算・申告まで。領収書や請求書の受け渡しはオンラインで終わります。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="6" width="26" height="24" rx="3" />
        <path d="M12 6v24" />
        <path d="M17 13h9M17 19h9M17 25h5" />
      </svg>
    ),
  },
  {
    title: "経理研修",
    body: "経理の担当者に向けて、半日の研修を行います。仕訳の考え方と、月次を締めるまでの手順を扱います。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="6" width="28" height="18" rx="2" />
        <path d="M10 19l5-6 4 4 6-7" />
        <path d="M18 24v6M13 30h10" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    title: "フォームからご連絡ください",
    body: "当日か、翌営業日にご返事します。",
  },
  {
    title: "30 分の無料相談",
    body: "オンラインで状況を伺い、何が要るかをお伝えします。",
  },
  { title: "見積もりと契約", body: "料金と範囲を書面でお出しします。" },
  { title: "着手", body: "税務調査なら、事前の打ち合わせから始めます。" },
];

const CASES = [
  {
    industry: "飲食（個人事業）",
    issue: "税務署から調査の連絡",
    result: "3 年分の帳簿を先に整理し、申告の修正なく終わりました。",
  },
  {
    industry: "建設（法人・従業員 8 人）",
    issue: "記帳が 10 か月分たまっていた",
    result: "2 か月で最新の月に追いつき、いまは毎月締められています。",
  },
  {
    industry: "小売（法人・2 店舗）",
    issue: "経理の担当者が辞めた",
    result:
      "半日の研修を 2 回行い、引き継いだ方が一人で月次を締められるようになりました。",
  },
];

const FAQ = [
  {
    q: "初回の相談は本当に無料ですか。",
    a: "30 分までは無料です。延ばす場合は、先に料金をお伝えします。",
  },
  {
    q: "顧問契約をしていなくても、税務調査の立ち会いを頼めますか。",
    a: "頼めます。スポットの料金でお受けします。過去の申告書を見せていただいてから、お見積もりします。",
  },
  {
    q: "遠方でも依頼できますか。",
    a: "できます。面談も書類の受け渡しもオンラインで終わります。",
  },
  {
    q: "記帳は自分でやりたいのですが、見てもらえますか。",
    a: "見られます。会計ソフトの画面を共有していただき、仕訳の付け方を確認します。",
  },
  {
    q: "研修は何人まで受けられますか。",
    a: "1 回あたり 10 人までです。それ以上は 2 回に分けます。",
  },
];

const CONTACT_FIELDS: DemoField[] = [
  { name: "name", label: "お名前", required: true },
  {
    name: "email",
    label: "メールアドレス",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    name: "tel",
    label: "電話番号",
    type: "tel",
    required: true,
    placeholder: "日中つながる番号",
  },
  {
    name: "message",
    label: "相談したいこと",
    type: "textarea",
    required: true,
    placeholder: "例: 税務署から調査の連絡がありました",
  },
  {
    name: "when",
    label: "希望の日時",
    placeholder: "例: 平日の午前中、来週の水曜",
  },
];

export default function ProfessionalLpPage() {
  return (
    <div className={`${s.page} ${mincho.variable}`}>
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href="#top" className={s.brand}>
            {BRAND}
          </a>
          <nav className={s.nav} aria-label="ページ内">
            <a href="#issues">こまりごと</a>
            <a href="#services">サービス</a>
            <a href="#pricing">料金</a>
            <a href="#faq">よくある質問</a>
          </nav>
          <a
            href="#contact"
            className={`${s.primary} ${s.small} ${s.headerCta}`}
          >
            無料で相談する
          </a>
        </div>
      </header>

      <main id="top" className={s.main}>
        <section className={s.hero}>
          <HeroRules className={s.rulesLayer} />
          <div className={s.container}>
            <p className={s.eyebrow}>税務調査の立ち会いと、記帳・決算</p>
            <h1 className={s.h1}>
              税務調査の連絡が来たら、まず 30 分ご相談ください
            </h1>
            <p className={s.lead}>
              何を聞かれるのか、何を用意すればいいのか。初回の 30
              分は無料です。オンラインで全国からご相談いただけます。
            </p>
            <p className={s.ctas}>
              <a href="#contact" className={s.primary}>
                無料で 30 分相談する
              </a>
              <a href="#services" className={s.secondary}>
                サービスを見る
              </a>
            </p>
            <p className={s.fine}>
              初回の相談は無料です。オンラインのみで承ります。
            </p>
          </div>
        </section>

        <section id="issues" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>こんなときに、ご相談ください</h2>
            <ul className={s.grid3}>
              {ISSUES.map((issue) => (
                <li key={issue.title} className={s.card}>
                  <h3 className={s.cardTitle}>{issue.title}</h3>
                  <p className={s.cardBody}>{issue.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="services" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>三つのサービス</h2>
            <ul className={s.grid3}>
              {SERVICES.map((service) => (
                <li key={service.title} className={s.card}>
                  <span className={s.icon} aria-hidden="true">
                    {service.icon}
                  </span>
                  <h3 className={s.cardTitle}>{service.title}</h3>
                  <p className={s.cardBody}>{service.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pricing" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>顧問料の目安</h2>
            <AdvisoryPlans />
            <p className={s.pricingNote}>
              価格は税込みです。記帳の代行や、過去の分の申告が要る場合は、範囲を伺ってから別にお見積もりします。
            </p>
          </div>
        </section>

        <section id="flow" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>ご相談から着手まで</h2>
            <ol className={s.steps}>
              {STEPS.map((step) => (
                <li key={step.title} className={s.step}>
                  <h3 className={s.stepTitle}>{step.title}</h3>
                  <p className={s.stepBody}>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="cases" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>これまでの例</h2>
            <ul className={s.cases}>
              {CASES.map((item) => (
                <li key={item.industry} className={s.case}>
                  <dl className={s.caseRow}>
                    <dt className={s.caseTerm}>業種</dt>
                    <dd className={s.caseBody}>{item.industry}</dd>
                  </dl>
                  <dl className={s.caseRow}>
                    <dt className={s.caseTerm}>ご相談</dt>
                    <dd className={s.caseBody}>{item.issue}</dd>
                  </dl>
                  <dl className={s.caseRow}>
                    <dt className={s.caseTerm}>結果</dt>
                    <dd className={`${s.caseBody} ${s.caseResult}`}>
                      {item.result}
                    </dd>
                  </dl>
                </li>
              ))}
            </ul>
            <p className={s.casesNote}>いずれも架空の例です。</p>
          </div>
        </section>

        <section id="faq" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>よくある質問</h2>
            <div className={s.faq}>
              {FAQ.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className={s.section}>
          <div className={`${s.container} ${s.contact}`}>
            <div>
              <h2 className={s.h2}>30 分の無料相談</h2>
              <p className={s.contactLead}>
                お名前、メールアドレス、電話番号、相談したいこと、希望の日時を入れてください。当日か翌営業日にご返事します。
              </p>
            </div>
            <DemoForm
              fields={CONTACT_FIELDS}
              submitLabel="無料相談を申し込む"
            />
          </div>
        </section>
      </main>

      <div className={s.container}>
        <DemoFooter brand={BRAND} kind="会計事務所" />
      </div>
    </div>
  );
}
