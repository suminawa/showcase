/*
 * GAS キット 3 本の見本ページ（/projects/deadline・/projects/form・/projects/inbox-triage）の結び。
 * 中身・導入の時間・無料の道具との比べ方を、ここ一箇所に置く。
 *
 * 比べる相手と数字の出どころは、買い手の目で横に並べた調べ（2026-09-29 に各ページを読んだもの）。
 * 数字を書くときは、その数字が載っている公式のページを必ず href に置く ── 出どころの無い数字は書かない。
 */
import type { LinkKey } from "./go";
import { nextDate, priceNow, shortDate, yen } from "./prices";
import { projects } from "./projects";

export type KitDemoSlug = "deadline" | "form" | "inbox-triage";

/** 比べる相手 1 つ。note は相手のページに書いてあることだけ */
export type Alternative = { name: string; href: string; note: string };

export type KitDemo = {
  slug: KitDemoSlug;
  /** links.json の鍵（/go/<鍵>/note|booth） */
  linkKey: LinkKey;
  name: string;
  /** 値段の一句（税込・買い切り） */
  price: string;
  /** 値段に添える一文（期限つきの値のときだけ） */
  priceNote?: string;
  box: string[];
  setup: string;
  /** 無料の道具で足りる方 */
  freeEnough: { who: string; alt: Alternative }[];
  /** このキットが合う方。数字を書く行は、出どころを alts に置く */
  fits: { who: string; alts?: Alternative[] }[];
};

/** 比べる相手のページを読んだ日 */
export const CHECKED_ON = "2026-09-29";

function listPrice(slug: string): number {
  const price = projects.find((p) => p.slug === slug)?.sale?.price;
  if (price == null) throw new Error(`定価が無い: ${slug}`);
  return price;
}

/**
 * いま払う値段の一句と、発売記念の期間中だけ添える一文。
 * 定価はレジストリ（projects.ts の sale.price）、記念の値と最終日は src/lib/prices.ts の表から引く。
 * 最終日の翌 00:00（日本時間）に定価の一句へ切り替わり、添える一文も消える ── ここは手で直さない。
 */
export function kitPrice(slug: KitDemoSlug, now: Date = new Date()): { price: string; priceNote?: string } {
  const current = priceNow(slug, listPrice(slug), now);
  const price = `${yen(current.price)}（税込）の買い切り`;
  if (!current.intro) return { price };
  const { until, list } = current.intro;
  return {
    price,
    priceNote: `${shortDate(until)} までの発売記念の値で、${shortDate(nextDate(until))} から定価 ${yen(list)} になります。`,
  };
}

const GAS_SETUP =
  "スプレッドシートにコードを貼り、メニューから初期化するまで 15〜20 分ほどです。途中で Google の確認画面（「このアプリは Google で確認されていません」）が出ます。ご自身で貼ったスクリプトなので出るのが正常で、手順書に進み方を画面の言葉のまま書いてあります。";

const LICENSE_LINE = "LICENSE.md（ご購入者の業務で自由にお使いいただけます。改変したものをお客さまのスプレッドシートに組み込んで納品することもできます。再配布・転売はできません）";

/** 値段を除いた、日付で変わらない部分 */
type KitDemoBase = Omit<KitDemo, "price" | "priceNote">;

const BASES: Record<KitDemoSlug, KitDemoBase> = {
  deadline: {
    slug: "deadline",
    linkKey: "s2",
    name: "期限アラート GAS キット",
    box: [
      "dist/Code.gs（Apps Script に貼る 1 本）と appsscript.json",
      "見本の期限シートと設定シート（CSV）",
      "日本語の手順書（README.ja.md）。確認画面の進み方と、よくあるつまずきまで書いてあります",
      "src/ のソース一式とテスト",
      LICENSE_LINE,
    ],
    setup: GAS_SETUP + "月額の費用はかかりません。",
    freeEnough: [
      {
        who: "メールで知らせてもらえれば十分な方",
        alt: {
          name: "Add Reminders（Google Workspace Marketplace）",
          href: "https://workspace.google.com/marketplace/app/add_reminders/404177452106",
          note: "無料のアドオンです。列の日付の前後に、メールで知らせます。",
        },
      },
      {
        who: "Slack に知らせたいシートが 1 つだけの方",
        alt: {
          name: "Check Sheet Notifications（Google Workspace Marketplace）",
          href: "https://workspace.google.com/marketplace/app/check_sheet_notifications/239755856136",
          note: "無料の枠はチェック 1 本・月 500 通までです。メール・Slack・Teams・Discord・Google Chat に送れます。",
        },
      },
      {
        who: "決まった日に 1 行知らせるだけで、台帳は要らない方",
        alt: {
          name: "Slack のリマインダー（/remind）",
          href: "https://slack.com/intl/ja-jp/help/articles/208423427",
          note: "Slack に最初からある機能です。シートは読みません。",
        },
      },
    ],
    fits: [
      { who: "期限を過ぎたもの・今日のもの・N 日前のものを、毎朝 1 通にまとめて Slack か Discord で受け取りたい方" },
      { who: "完了にした行は知らせず、同じ日に二度は届かないようにしたい方" },
      {
        who: "月額をかけずに、コードごと手元に置きたい方。Check Sheet Notifications は 2 本目のチェックから月額です",
        alts: [
          {
            name: "Check Sheet Notifications の料金",
            href: "https://workspace.google.com/marketplace/app/check_sheet_notifications/239755856136",
            note: "無料の枠を超えると $9.99/月です。",
          },
        ],
      },
    ],
  },

  form: {
    slug: "form",
    linkKey: "s3",
    name: "フォーム受付 GAS キット",
    box: [
      "dist/Code.gs（Apps Script に貼る 1 本）と appsscript.json",
      "そのまま使える見本のフォーム（form-sample.html）",
      "見本の設定シート・受付シート・枠シート（CSV）",
      "日本語の手順書（README.ja.md）。ウェブアプリとして公開する手順と、よくあるつまずきまで書いてあります",
      "src/ のソース一式とテスト",
      LICENSE_LINE,
    ],
    setup:
      "スプレッドシートにコードを貼り、初期化して、ウェブアプリとして公開するまで 20 分ほどです。途中で Google の確認画面（「このアプリは Google で確認されていません」）が 2 回出ます。ご自身で貼ったスクリプトなので出るのが正常で、手順書に進み方を画面の言葉のまま書いてあります。月額の費用はかかりません。",
    freeEnough: [
      {
        who: "フォームの見た目が Google フォームで構わない方",
        alt: {
          name: "Google フォーム ＋ Email Notifications for Google Forms",
          href: "https://workspace.google.com/marketplace/app/email_notifications_for_google_forms/984866591130",
          note: "確認のメールと Slack・Discord への通知を付けられます。アドオンの無料版は 1 日 20 回答までです。",
        },
      },
      {
        who: "添付ファイルや CAPTCHA が必要で、WordPress をお使いの方",
        alt: {
          name: "Contact Form 7（WordPress のプラグイン）",
          href: "https://ja.wordpress.org/plugins/contact-form-7/",
          note: "無料です。自動返信・reCAPTCHA・添付ファイルに対応しています。このキットは添付ファイルを受けられません。",
        },
      },
    ],
    fits: [
      { who: "自社のデザインの HTML フォームのまま、送信先だけを持ちたい方" },
      {
        who: "自動返信と Slack・Discord・LINE への通知を、月額なしで付けたい方。フォームのサービスでは、どちらも有料のプランからです",
        alts: [
          {
            name: "formrun の料金",
            href: "https://form.run/home/pricing",
            note: "無料のプランでは自動返信と Slack 通知を使えません。",
          },
          {
            name: "Formspree の料金",
            href: "https://formspree.io/plans",
            note: "無料のプランは月 50 件までで、自動返信は有料のプランからです。",
          },
        ],
      },
      { who: "受付番号と、日時ごとの定員（予約枠）がほしい方" },
    ],
  },

  "inbox-triage": {
    slug: "inbox-triage",
    linkKey: "inbox-triage",
    name: "AI 問い合わせ整理キット",
    box: [
      "dist/Code.gs（Apps Script に貼る 1 本）と appsscript.json",
      "見本のメール 8 通とその答え、設定シートの見本（CSV）",
      "AI に実際に送っている文（prompt-sample.md）",
      "日本語の手順書（README.ja.md）。承認の画面の意味、費用の目安、誰のアカウントで動くかまで書いてあります",
      "src/ のソース一式とテスト（メールを送る命令と消す命令が無いことも検査しています）",
      LICENSE_LINE,
    ],
    setup:
      "スプレッドシートにコードを貼り、承認して、見本のメールで試すまで 20 分ほどです。途中で Google の確認画面が出ます。ほかに Anthropic の API キーの発行が必要で、支払い方法の登録があります。API の費用は、読んだ通数に応じてご自身の鍵にかかります。",
    freeEnough: [
      {
        who: "分類と要約をシートに残せれば十分で、下書きと通知は要らない方",
        alt: {
          name: "Qiita「GAS × Gemini で問い合わせを分類」",
          href: "https://qiita.com/rira__/items/c336673b3bbcaebdf3f8",
          note: "コードの全文が無料で公開されています。返信の下書きと通知はありません。",
        },
      },
      {
        who: "n8n をすでにお使いの方",
        alt: {
          name: "n8n のテンプレート #14852",
          href: "https://n8n.io/workflows/14852-triage-gmail-inbox-draft-replies-and-alert-urgent-emails-with-claude-and-slack/",
          note: "中身は近く、Claude で分類し、下書き・急ぎの Slack 通知・シートへの記録まで行います。テンプレートは無料で、動かす場所に n8n Cloud か自前のサーバーが必要です。",
        },
      },
      {
        who: "Google Workspace の有料プランをお使いで、Gemini と Google Chat で足りる方",
        alt: {
          name: "Google Workspace Studio",
          href: "https://support.google.com/workspace-studio/answer/16444479?hl=en",
          note: "Gmail をきっかけに Gemini で判断し、下書きや Chat への通知を画面の操作で組めます。",
        },
      },
    ],
    fits: [
      {
        who: "サーバーも月額の利用料も持たずに、Gmail とスプレッドシートの中で完結させたい方。n8n Cloud は月額です",
        alts: [{ name: "n8n の料金", href: "https://n8n.io/pricing/", note: "n8n Cloud は €20/月からです。" }],
      },
      { who: "日本語の 8 分類・緊急度・要約と、敬体の返信の下書きがほしい方。送るのは人で、自動では送りません" },
      { who: "Slack・Discord・LINE のどれにでも、要対応を先頭にした 1 通で知らせたい方" },
    ],
  },
};

/** 日本語の結び（値段を除く）。英仏の訳（src/i18n/kit-demos.ts）と形を照らすテストだけが読む */
export const BASES_FOR_TEST: Readonly<Record<KitDemoSlug, KitDemoBase>> = BASES;

/** 見本ページ 1 本の結び。値段はその時刻で決まる（ページは要求のたびに組む） */
export function kitDemo(slug: KitDemoSlug, now: Date = new Date()): KitDemo {
  return { ...BASES[slug], ...kitPrice(slug, now) };
}

/** 3 本ぶんの結び。値段はその時刻で決まる */
export function kitDemos(now: Date = new Date()): Record<KitDemoSlug, KitDemo> {
  return {
    deadline: kitDemo("deadline", now),
    form: kitDemo("form", now),
    "inbox-triage": kitDemo("inbox-triage", now),
  };
}
