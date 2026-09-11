/*
 * 見本: クリニック・医院の LP。架空の歯科医院「月白歯科クリニック」の 1 ページ。
 * 診療時間の表と「いまは診療中です」、Web 予約の日付と時間帯の選択が見せどころ。
 * 写真を使わず、色・形・CSS・SVG だけで作る。院内の案内も図解で出す。
 * フォームはどこにも送らない。住所・電話番号・人名・実在の地名や駅名は書かない
 * ── だから電話の CTA も番号を持たず、予約の節へ送るだけにする（連絡先は結びのメールだけ）。
 */
import type { Metadata } from "next";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { DemoForm, type DemoField } from "@/components/demos/DemoForm";
import { HeroCircles } from "@/components/demos/clinic/HeroCircles";
import {
  AFTERNOON,
  CLINIC_DAYS,
  clinicDayLabels,
  CLOSED_NOTE,
  MARK_LABELS,
  MARK_SYMBOLS,
  markFor,
  MORNING,
  SATURDAY_AFTERNOON,
  slotOptions,
  spanLabel,
} from "@/components/demos/clinic/hours";
import type { Span } from "@/components/demos/openHours";

import { ClinicOpenNow } from "./ClinicOpenNow";
import s from "./clinic.module.css";

const BRAND = "月白歯科クリニック";

const TITLE = "見本 ｜ クリニック・医院の LP";
const DESCRIPTION =
  "架空の歯科医院「月白歯科クリニック」の 1 ページ LP。診療時間の表と Web 予約まで動く見本。";

export const metadata: Metadata = {
  // レイアウトの title.template（"%s | Showcase"）がタブに付け足されるのを防ぐ
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/demos/clinic-lp",
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

const POINTS = [
  {
    title: "痛みを減らす手順",
    body: "表面の麻酔をしてから、細い針でゆっくり注射します。麻酔液は体温に温めて使います。",
  },
  {
    title: "削る量を最小限に",
    body: "虫歯の範囲をカメラで確かめ、削る前に何をするかを画面でご説明します。",
  },
  {
    title: "予約は 30 分ずつ",
    body: "一人ずつ時間を取るので、待合で長く待つことがありません。",
  },
];

const TREATMENTS = [
  {
    title: "一般歯科",
    body: "虫歯と歯周病の治療。しみる、噛むと痛い、といったご相談から。",
    icon: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M11 7c-3 0-5 2-5 6 0 6 2 8 3 13 .5 2.5 1 4 2.5 4s2-2 2.5-5c.4-2.4 1-3.5 2-3.5s1.6 1.1 2 3.5c.5 3 1 5 2.5 5s2-1.5 2.5-4c1-5 3-7 3-13 0-4-2-6-5-6-2 0-3 1-5 1s-3-1-5-1z" />
      </svg>
    ),
  },
  {
    title: "小児歯科",
    body: "3 歳からお受けします。初回は診療台に座る練習だけで終わることもあります。",
    icon: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M13 12c-2.4 0-4 1.6-4 4.8 0 4.8 1.6 6.4 2.4 10.4.4 2 .8 3.2 2 3.2s1.6-1.6 2-4c.32-1.92.8-2.8 1.6-2.8s1.28.88 1.6 2.8c.4 2.4.8 4 2 4s1.6-1.2 2-3.2c.8-4 2.4-5.6 2.4-10.4 0-3.2-1.6-4.8-4-4.8-1.6 0-2.4.8-4 .8s-2.4-.8-4-.8z" />
        <circle cx="9" cy="7" r="1.5" />
        <circle cx="27" cy="9" r="1.5" />
      </svg>
    ),
  },
  {
    title: "予防・クリーニング",
    body: "3 か月に 1 回の定期検診と、歯石の除去。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="5" y="14" width="12" height="7" rx="2" />
        <path d="M8 14v-3M11 14v-4M14 14v-3" />
        <path d="M17 17.5h13" />
      </svg>
    ),
  },
  {
    title: "矯正相談",
    body: "相談と検査は無料です。方針と期間、費用の目安をお伝えします。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18h30" />
        <rect x="5" y="14" width="6" height="8" rx="1.5" />
        <rect x="15" y="14" width="6" height="8" rx="1.5" />
        <rect x="25" y="14" width="6" height="8" rx="1.5" />
      </svg>
    ),
  },
  {
    title: "ホワイトニング",
    body: "医院で行う方法と、自宅で続ける方法の 2 つがあります。",
    icon: (
      <svg
        viewBox="0 0 36 36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      >
        <path d="M13 9c-2.4 0-4 1.6-4 4.8 0 4.8 1.6 6.4 2.4 10.4.4 2 .8 3.2 2 3.2s1.6-1.6 2-4c.32-1.92.8-2.8 1.6-2.8s1.28.88 1.6 2.8c.4 2.4.8 4 2 4s1.6-1.2 2-3.2c.8-4 2.4-5.6 2.4-10.4 0-3.2-1.6-4.8-4-4.8-1.6 0-2.4.8-4 .8s-2.4-.8-4-.8z" />
        <path d="M28 4v6M25 7h6" />
      </svg>
    ),
  },
  {
    title: "インプラント相談",
    body: "骨の状態を撮影し、できるかどうかと、ほかの方法をご説明します。",
    icon: (
      <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 6h12v6H12z" />
        <path d="M18 12v18" />
        <path d="M14 16h8M14.5 20h7M15 24h6" />
      </svg>
    ),
  },
];

const ROOMS = [
  {
    title: "入口とスロープ",
    body: "段差はありません。ベビーカーと車いすは、そのまま診療室まで入れます。",
    figure: (
      <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 66h108" />
        <path d="M18 66 62 40h18v26" />
        <rect x="80" y="18" width="30" height="48" rx="2" />
        <path d="M88 30h14v36H88z" />
        <path d="M96 46v6" />
      </svg>
    ),
  },
  {
    title: "診療室",
    body: "半個室が 4 台です。となりの音や話し声が気になりにくいように、台のあいだに壁を立てています。",
    figure: (
      <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="10" width="108" height="60" rx="3" />
        <path d="M33 10v60M60 10v60M87 10v60" />
        <rect x="12" y="28" width="15" height="26" rx="4" />
        <rect x="39" y="28" width="15" height="26" rx="4" />
        <rect x="66" y="28" width="15" height="26" rx="4" />
        <rect x="93" y="28" width="15" height="26" rx="4" />
      </svg>
    ),
  },
  {
    title: "キッズスペース",
    body: "待合の一角に、靴を脱いで上がれる場所があります。診療のあいだも、スタッフが様子を見ています。",
    figure: (
      <svg viewBox="0 0 120 80" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="6" y="14" width="108" height="52" rx="3" />
        <rect x="14" y="24" width="44" height="34" rx="8" />
        <path d="M22 58v-8h12v8M40 50h10v8" />
        <path d="M70 58h36M70 46h24" />
        <circle cx="94" cy="32" r="6" />
      </svg>
    ),
  },
];

const FAQ = [
  {
    q: "予約なしでも診てもらえますか。",
    a: "急な痛みなら、当日の空きにお入れします。まずはご連絡ください。予約の方が先になります。",
  },
  {
    q: "子どもは何歳から診てもらえますか。",
    a: "3 歳からお受けします。初回は診療台に座る練習から始めます。",
  },
  {
    q: "治療は何回くらいかかりますか。",
    a: "小さな虫歯なら 1 回か 2 回です。神経の治療が要る場合は、4 回から 6 回が目安です。",
  },
  {
    q: "保険は使えますか。",
    a: "一般歯科と小児歯科、歯周病の治療は保険で行います。矯正とホワイトニングは保険の対象外です。",
  },
  {
    q: "駐車場はありますか。",
    a: "医院の駐車場はありません。近くのコインパーキングをご利用ください。",
  },
];

const RESERVE_FIELDS: DemoField[] = [
  { name: "name", label: "お名前", required: true },
  {
    name: "tel",
    label: "電話番号",
    type: "tel",
    required: true,
    placeholder: "日中つながる番号",
  },
  { name: "date", label: "希望の日", type: "date", required: true },
  {
    name: "slot",
    label: "時間帯",
    type: "select",
    required: true,
    options: slotOptions(),
    placeholder: "選んでください",
  },
  {
    name: "symptom",
    label: "気になること",
    type: "textarea",
    placeholder: "例: 右下の奥歯がしみます",
  },
];

/** 表のます目。記号は目で読み、同じ意味の語を読み上げに渡す */
function HoursCell({ span, standard }: { span: Span | null; standard: Span }) {
  const mark = markFor(span, standard);
  return (
    <td data-mark={mark}>
      <span aria-hidden="true">{MARK_SYMBOLS[mark]}</span>
      <span className={s.srOnly}>{MARK_LABELS[mark]}</span>
    </td>
  );
}

export default function ClinicLpPage() {
  const dayLabels = clinicDayLabels();

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={`${s.container} ${s.headerRow}`}>
          <a href="#top" className={s.brand}>
            {BRAND}
          </a>
          <nav className={s.nav} aria-label="ページ内">
            <a href="#about">特長</a>
            <a href="#treatments">診療内容</a>
            <a href="#hours">診療時間</a>
            <a href="#faq">よくある質問</a>
          </nav>
          <a
            href="#reserve"
            className={`${s.primary} ${s.small} ${s.headerCta}`}
          >
            Web で予約する
          </a>
        </div>
      </header>

      <main id="top" className={s.main}>
        <section className={s.hero}>
          <HeroCircles className={s.circlesLayer} />
          <div className={s.container}>
            <p className={s.eyebrow}>駅前の歯科医院</p>
            <h1 className={s.h1}>痛みの少ない治療と、通いやすい予約</h1>
            <p className={s.heroLead}>
              麻酔は表面麻酔をしてから、細い針でゆっくり入れます。予約は 30
              分ずつ取るので、待合で長く待つことがありません。
            </p>
            <div className={s.heroHours}>
              <p>午前 {spanLabel(MORNING)}</p>
              <p>午後 {spanLabel(AFTERNOON)}</p>
              <p>{CLOSED_NOTE}</p>
            </div>
            <p className={s.heroWalk}>駅の東口から徒歩 3 分</p>
            <p className={s.ctas}>
              <a href="#reserve" className={s.primary}>
                Web で予約する
              </a>
              <a href="#reserve" className={s.secondary}>
                電話で予約する
              </a>
            </p>
            <p className={s.fine}>
              見本のため、電話番号と住所は載せていません。ご予約は下のフォームからどうぞ。
            </p>
          </div>
        </section>

        <section id="about" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>医院の三つの特長</h2>
            <ul className={s.grid3}>
              {POINTS.map((point) => (
                <li key={point.title} className={s.card}>
                  <h3 className={s.cardTitle}>{point.title}</h3>
                  <p className={s.cardBody}>{point.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="treatments" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>診療内容</h2>
            <ul className={s.grid3}>
              {TREATMENTS.map((item) => (
                <li key={item.title} className={s.card}>
                  <span className={s.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <h3 className={s.cardTitle}>{item.title}</h3>
                  <p className={s.cardBody}>{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="hours" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>診療時間</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <caption className={s.srOnly}>曜日ごとの診療時間</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className={s.srOnly}>時間帯</span>
                    </th>
                    {dayLabels.map((label) => (
                      <th key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">午前 {spanLabel(MORNING)}</th>
                    {CLINIC_DAYS.map((entry) => (
                      <HoursCell
                        key={entry.day}
                        span={entry.morning}
                        standard={MORNING}
                      />
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">午後 {spanLabel(AFTERNOON)}</th>
                    {CLINIC_DAYS.map((entry) => (
                      <HoursCell
                        key={entry.day}
                        span={entry.afternoon}
                        standard={AFTERNOON}
                      />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={s.legend}>
              <span>{MARK_SYMBOLS.open} 診療</span>
              <span>
                {MARK_SYMBOLS.short} 土曜の午後は {spanLabel(SATURDAY_AFTERNOON)}
              </span>
              <span>{MARK_SYMBOLS.closed} 休診</span>
            </p>
            <p className={s.closedNote}>{CLOSED_NOTE}</p>
            <p className={s.openNowRow}>
              <ClinicOpenNow className={s.openNow} />
            </p>
          </div>
        </section>

        <section id="rooms" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>院内のご案内</h2>
            <ul className={s.rooms}>
              {ROOMS.map((room) => (
                <li key={room.title} className={s.room}>
                  <span className={s.roomFigure} aria-hidden="true">
                    {room.figure}
                  </span>
                  <h3 className={s.cardTitle}>{room.title}</h3>
                  <p className={s.cardBody}>{room.body}</p>
                </li>
              ))}
            </ul>
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

        <section id="reserve" className={`${s.section} ${s.soft}`}>
          <div className={`${s.container} ${s.reserve}`}>
            <div>
              <h2 className={s.h2}>Web 予約</h2>
              <p className={s.reserveLead}>
                お名前、電話番号、希望の日、時間帯、気になることを入れてください。翌診療日までに、こちらからご連絡します。
              </p>
              <p className={s.reserveNote}>
                予約が決まるのは、こちらからの連絡のあとです。
              </p>
            </div>
            <DemoForm fields={RESERVE_FIELDS} submitLabel="予約を申し込む" />
          </div>
        </section>
      </main>

      <div className={s.container}>
        <DemoFooter brand={BRAND} kind="歯科医院" entity="医院" />
      </div>
    </div>
  );
}
