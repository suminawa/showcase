/*
 * 見本: BtoB・SaaS の LP。架空の勤怠・工数 SaaS「Tabane Works」の 1 ページ。
 * 提案文から来た人が「速さ・崩れなさ・動きの滑らかさ」を確かめるための見本。
 * 写真を使わず、色・形・CSS・canvas だけで作る。フォームはどこにも送らない。
 */
import type { Metadata } from "next";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { DemoForm, type DemoField } from "@/components/demos/DemoForm";
import { HeroField } from "@/components/demos/saas/HeroField";
import { PricingTable } from "@/components/demos/saas/PricingTable";

import s from "./saas.module.css";

const BRAND = "Tabane Works";

export const metadata: Metadata = {
  title: "見本 ｜ BtoB・SaaS の LP",
  description:
    "架空の勤怠・工数 SaaS「Tabane Works」の 1 ページ LP。料金切替と FAQ、フォームまで動く見本。",
};

const ISSUES = [
  {
    title: "打刻と工数が別のツールにある",
    body: "二重入力になり、締めのたびに突き合わせが要ります。",
  },
  {
    title: "集計が手作業",
    body: "スプレッドシートに貼り直す作業が、毎月 3 時間かかっています。",
  },
  {
    title: "誰が何にどれだけ使ったか、見えない",
    body: "案件ごとの原価が分かるのは翌月です。",
  },
];

const FEATURES = [
  {
    title: "一画面で打刻と工数",
    body: "出勤ボタンの横に今日の案件が並び、入力は 10 秒で終わります。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="6" width="28" height="24" rx="3" />
        <path d="M4 14h28M12 22h6" />
      </svg>
    ),
  },
  {
    title: "毎晩の自動集計",
    body: "日次で案件別・人別の集計が閉じるので、月末にまとめて直す作業がありません。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="18" r="13" />
        <path d="M18 10v8l6 4" />
      </svg>
    ),
  },
  {
    title: "会計・給与ソフトへの書き出し",
    body: "CSV と API で、使っているソフトにそのまま渡せます。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 5v18M11 16l7 7 7-7" />
        <path d="M6 26v4h24v-4" />
      </svg>
    ),
  },
];

const STEPS = [
  { title: "社員と案件を CSV で取り込む", time: "30 分" },
  { title: "打刻と工数の入力ルールを決める", time: "1 時間" },
  { title: "翌朝から集計が届く", time: "" },
];

const FAQ = [
  {
    q: "既存の勤怠ツールから移れますか。",
    a: "主要な勤怠ツールの CSV 形式に対応しています。過去 12 か月分まで取り込めます。",
  },
  {
    q: "スマホで打刻できますか。",
    a: "できます。ブラウザから使えるので、アプリの配布は要りません。",
  },
  {
    q: "承認は必要ですか。",
    a: "スタンダード以上で承認フローを使えます。承認なしの運用もできます。",
  },
  {
    q: "データはどこに保存されますか。",
    a: "国内のデータセンターに保存し、毎日バックアップします。",
  },
  {
    q: "途中でプランを変えられますか。",
    a: "月の途中でも変えられます。差額は日割りで計算します。",
  },
];

const CONTACT_FIELDS: DemoField[] = [
  { name: "company", label: "会社名", required: true, placeholder: "例: 株式会社〇〇" },
  { name: "email", label: "メールアドレス", type: "email", required: true, placeholder: "you@example.com" },
  { name: "message", label: "相談したいこと", type: "textarea", placeholder: "人数や、いま使っているツールなど" },
];

export default function SaasLpPage() {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href="#top" className={s.brand}>
            {BRAND}
          </a>
          <nav className={s.nav} aria-label="ページ内">
            <a href="#issues">課題</a>
            <a href="#features">機能</a>
            <a href="#pricing">料金</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a href="#contact" className={`${s.primary} ${s.small} ${s.headerCta}`}>
            無料で試す
          </a>
        </div>
      </header>

      <main id="top">
        <section className={s.hero}>
          <HeroField className={s.field} />
          <div className={s.container}>
            <p className={s.eyebrow}>勤怠・工数管理 SaaS</p>
            <h1 className={s.h1}>勤怠と工数を、ひとつに束ねる。</h1>
            <p className={s.lead}>
              打刻も工数の入力も、同じ画面で 10 秒。集計は毎晩自動で終わり、月末に慌てなくなります。
            </p>
            <p className={s.ctas}>
              <a href="#contact" className={s.primary}>
                14 日間無料で試す
              </a>
              <a href="#features" className={s.secondary}>
                資料を見る
              </a>
            </p>
            <p className={s.fine}>クレジットカード不要。最短 1 日で導入できます。</p>
          </div>
        </section>

        <section id="issues" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>月末の「あの作業」をなくす</h2>
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

        <section id="features" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>三つの機能で、締めが軽くなる</h2>
            <ul className={s.grid3}>
              {FEATURES.map((feature) => (
                <li key={feature.title} className={s.card}>
                  <span className={s.icon} aria-hidden="true">
                    {feature.icon}
                  </span>
                  <h3 className={s.cardTitle}>{feature.title}</h3>
                  <p className={s.cardBody}>{feature.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pricing" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>人数に応じた、シンプルな料金</h2>
            <PricingTable />
          </div>
        </section>

        <section id="flow" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>導入は三つの段階で、最短 1 日</h2>
            <ol className={s.steps}>
              {STEPS.map((step) => (
                <li key={step.title} className={s.step}>
                  <p className={s.stepTitle}>{step.title}</p>
                  {step.time ? <p className={s.stepTime}>{step.time}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="faq" className={s.section}>
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

        <section id="contact" className={`${s.section} ${s.soft}`}>
          <div className={`${s.container} ${s.contact}`}>
            <div>
              <h2 className={s.h2}>まずは 14 日間、無料で</h2>
              <p className={s.contactLead}>
                会社名、メールアドレス、相談したいことを入れて送ってください。営業日の翌日までに返事をします。
              </p>
            </div>
            <DemoForm fields={CONTACT_FIELDS} submitLabel="無料で試す" />
          </div>
        </section>
      </main>

      <div className={s.container}>
        <DemoFooter brand={BRAND} />
      </div>
    </div>
  );
}
