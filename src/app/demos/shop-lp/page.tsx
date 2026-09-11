/*
 * 見本: 店舗・サロンの LP。架空の焼き菓子とコーヒーの店「粉とゆげ」の 1 ページ。
 * 写真を一枚も使わずに「雰囲気」を出せること、スマホで読みやすいことが見せどころ。
 * フォームはどこにも送らない。住所・電話番号・実在の地名は書かない。
 */
import type { Metadata } from "next";
import { Shippori_Mincho } from "next/font/google";

import { DemoFooter } from "@/components/demos/DemoFooter";
import { DemoForm, type DemoField } from "@/components/demos/DemoForm";
import { HeroField } from "@/components/demos/saas/HeroField";
import {
  formatPrice,
  MENU_GROUPS,
  menuByCategory,
} from "@/components/demos/shop/menu";
import {
  closedDaysLabel,
  hoursLabel,
  lastOrderLabel,
  openDaysLabel,
} from "@/components/demos/shop/hours";
import { OpenNow } from "@/components/demos/OpenNow";

import s from "./shop.module.css";

/** 見出しの明朝。本文は layout.tsx が読んでいる Noto Sans JP（var(--font-sans)）のまま */
const mincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--d-mincho",
  preload: false,
});

const BRAND = "粉とゆげ";

/** 紙の粒の色。生成りに馴染む茶。深緑だと粒が目立ちすぎて紙に見えない */
const PAPER_RGB = "124, 106, 78";
const PAPER_COUNT = 140;

export const metadata: Metadata = {
  title: { absolute: "見本 ｜ 店舗・サロンの LP" },
  description:
    "架空の焼き菓子とコーヒーの店「粉とゆげ」の 1 ページ LP。品書きと席の予約まで動く見本。",
  openGraph: {
    title: "見本 ｜ 店舗・サロンの LP",
    description:
      "架空の焼き菓子とコーヒーの店「粉とゆげ」の 1 ページ LP。品書きと席の予約まで動く見本。",
    url: "/demos/shop-lp",
    type: "website",
    images: ["/opengraph-image.png"],
    siteName: "Showcase",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "見本 ｜ 店舗・サロンの LP",
    description:
      "架空の焼き菓子とコーヒーの店「粉とゆげ」の 1 ページ LP。品書きと席の予約まで動く見本。",
    images: ["/opengraph-image.png"],
  },
};

const POINTS = [
  {
    title: "朝に焼いて、その日に出す",
    body: "前の日のものは棚に残しません。並ぶのは今日の分だけです。",
  },
  {
    title: "豆は二週間で使い切る",
    body: "焙煎から二週間を過ぎた豆は挽きません。注文を受けてから挽いています。",
  },
  {
    title: "材料は、名前が分かるものだけ",
    body: "粉、バター、砂糖、卵、塩。紙の裏に書ける数で作ります。",
  },
];

const SEATS = [
  { term: "席", body: "席は十二。カウンターが六つ、二人がけのテーブルが三つです。" },
  { term: "音", body: "小さな音で音楽をかけています。通話はご遠慮ください。" },
  { term: "時間", body: "混んでいる日は、一時間を目安にお願いします。" },
];

const ACCESS = [
  "駅の西口から歩いて八分です。",
  "川沿いの道を上流へ。二つめの橋は渡らず、手前で左に曲がります。",
  "角に大きな銀杏の木があり、その裏の一階です。看板は出していません。緑色の扉が目印です。",
  "自転車は建物の脇に停められます。駐車場はありません。",
];

const RESERVE_FIELDS: DemoField[] = [
  { name: "date", label: "日付", type: "date", required: true },
  { name: "guests", label: "人数", type: "number", required: true, placeholder: "2" },
  { name: "name", label: "お名前", required: true },
  {
    name: "email",
    label: "メールアドレス",
    type: "email",
    required: true,
    placeholder: "you@example.com",
  },
  {
    name: "hold",
    label: "取り置き（任意）",
    type: "textarea",
    placeholder: "例: バターのスコーン 2、ほうじ茶 1",
  },
];

export default function ShopLpPage() {
  return (
    <div className={`${s.page} ${mincho.variable}`}>
      <main>
        <section className={s.hero}>
          <div className={s.wash} aria-hidden="true" />
          <HeroField className={s.field} rgb={PAPER_RGB} count={PAPER_COUNT} />
          <div className={s.container}>
            <p className={s.eyebrow}>焼き菓子と、淹れたてのコーヒー</p>
            <h1 className={s.h1}>{BRAND}</h1>
            <p className={s.tagline}>今日焼いた分だけ、並べています。</p>
            <p className={s.heroLead}>
              朝に窯から出した焼き菓子と、注文を受けてから挽くコーヒー。売り切れたらその日は終わりです。
            </p>
            <div className={s.hours}>
              <p className={s.hoursLine}>
                {openDaysLabel()} {hoursLabel()}（ラストオーダー {lastOrderLabel()}）
              </p>
              <p className={s.hoursClosed}>{closedDaysLabel()}</p>
              <p className={s.openNowRow}>
                <OpenNow className={s.openNow} />
              </p>
            </div>
            <p className={s.ctas}>
              <a href="#reserve" className={s.primary}>
                席を予約する
              </a>
              <a href="#menu" className={s.secondary}>
                お品書きを見る
              </a>
            </p>
          </div>
        </section>

        <section id="about" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>三つのこと</h2>
            <ul className={s.points}>
              {POINTS.map((point) => (
                <li key={point.title} className={s.point}>
                  <h3 className={s.pointTitle}>{point.title}</h3>
                  <p className={s.pointBody}>{point.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="menu" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>お品書き</h2>
            <div className={s.menu}>
              {MENU_GROUPS.map((group) => (
                <div key={group.category}>
                  <h3 className={s.h3}>{group.label}</h3>
                  <ul className={s.items}>
                    {menuByCategory(group.category).map((item) => (
                      <li key={item.id}>
                        <p className={s.itemHead}>
                          <span className={s.itemName}>{item.name}</span>
                          <span className={s.itemLeader} aria-hidden="true" />
                          <span className={s.itemPrice}>
                            {formatPrice(item.price)}
                          </span>
                        </p>
                        <p className={s.itemNote}>{item.note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className={s.menuNote}>価格は税込みです。品切れの日もあります。</p>
          </div>
        </section>

        <section id="seats" className={s.section}>
          <div className={s.container}>
            <h2 className={s.h2}>席と、過ごし方</h2>
            <dl className={s.seats}>
              {SEATS.map((seat) => (
                <div key={seat.term} className={s.seatRow}>
                  <dt>{seat.term}</dt>
                  <dd>{seat.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="access" className={`${s.section} ${s.soft}`}>
          <div className={s.container}>
            <h2 className={s.h2}>行き方</h2>
            <ol className={s.access}>
              {ACCESS.map((line) => (
                <li key={line} className={s.accessItem}>
                  {line}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="reserve" className={s.section}>
          <div className={`${s.container} ${s.reserve}`}>
            <div>
              <h2 className={s.h2}>席の予約</h2>
              <p className={s.reserveLead}>
                二名から承ります。焼き菓子の取り置きも一緒にどうぞ。日付と人数、お名前とメールアドレスを入れてください。
              </p>
            </div>
            <DemoForm fields={RESERVE_FIELDS} submitLabel="予約を送る" />
          </div>
        </section>
      </main>

      <div className={s.container}>
        <DemoFooter brand={BRAND} kind="店" />
      </div>
    </div>
  );
}
