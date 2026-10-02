/*
 * 悩みから読む紙（/guides）の目録。1 件 = 受注サイトで繰り返し出ている悩みの言葉 1 つ。
 * 題は悩みの言葉そのまま。見本（作品ページ）と、手で組む手順の記事へ渡すための着地の紙。
 */
export interface Guide {
  slug: string;
  /** 悩みの言葉そのまま。紙の題と metadata の title を兼ねる */
  title: string;
  /** 一覧と metadata の description に使う一行 */
  lede: string;
  /** 結びつける作品ページのキー（/projects/<kit>） */
  kit: string;
  /** 公開日（YYYY-MM-DD） */
  date: string;
}

export const guides: Guide[] = [
  {
    slug: "pdf-to-spreadsheet",
    title: "PDF の請求書をスプレッドシートに手で書き写す作業を減らす",
    lede: "請求書の PDF から請求元・日付・金額を表に移す手間を、手持ちの道具で減らす手順と、仕組みにするときの組み方です。",
    kit: "doc-reader",
    date: "2026-09-25",
  },
  {
    slug: "customer-sheet",
    title: "顧客管理のスプレッドシートが、いつの間にか崩れていく",
    lede: "お客さまの一覧を表で持ったまま、入力の揺れ・重複・上書きを防ぐ手順と、画面を足すときの組み方です。",
    kit: "sheet-app",
    date: "2026-09-26",
  },
  {
    slug: "line-auto-reply",
    title: "LINE 公式アカウントの問い合わせに、自社の資料だけで答えさせる",
    lede: "LINE に同じ質問が何度も届くとき、標準の機能でできることと、資料を根拠に AI が答えて担当者へ引き継ぐ組み方です。",
    kit: "ai-concierge",
    date: "2026-09-27",
  },
  {
    slug: "booking-page",
    title: "電話と LINE で受けている予約を、空いている時間から選んでもらう",
    lede: "電話と LINE に分かれた予約の受付を 1 つの台帳にまとめる手順と、空いている時間から選んでもらう予約ページの組み方です。",
    kit: "booking",
    date: "2026-09-28",
  },
  {
    slug: "monthly-sales-report",
    title: "毎月の売上の集計とグラフを、スプレッドシートで手で作り直している",
    lede: "月例の集計表とグラフを毎月作り直す手間を減らす手順と、集計の決まりを 1 か所に書いて 1 枚の画面にする組み方です。",
    kit: "dashboard",
    date: "2026-09-29",
  },
  {
    slug: "inbox-triage",
    title: "問い合わせのメールが埋もれて、返信が遅れたり漏れたりする",
    lede: "見積もり依頼・クレーム・営業が同じ受信箱に混ざるとき、Gmail の標準の機能で仕分ける手順と、分類と返信の下書きまでを仕組みにする組み方です。",
    kit: "inbox-triage",
    date: "2026-09-30",
  },
  {
    slug: "deadline-alert",
    title: "契約の更新や点検の期限を、スプレッドシートに書いたまま見落とす",
    lede: "車検・賃貸契約・ドメイン・資格の更新期限を表に並べたまま見落とすとき、スプレッドシートだけでできる手順と、毎朝 1 通で知らせに来させる組み方です。",
    kit: "deadline",
    date: "2026-10-01",
  },
  {
    slug: "survey-free-text",
    title: "Googleフォームの自由記述を集計する｜お客様の声から改善を一つ決める",
    lede: "アンケートの自由記述を上から読むだけで終わってしまうとき、スプレッドシートで分類して数え、原文と見比べて改善を一つ決める手順と、分類と集計を続ける組み方です。",
    kit: "survey-analysis",
    date: "2026-10-02",
  },
  {
    slug: "lp-structure",
    title: "LPの構成を自分で決める｜載せる内容と順番を1枚の表に書き出す",
    lede: "広告や新しいサービスのために 1 枚のページを用意したいのに、何をどの順で載せるかが決まらないとき、最初の画面から問い合わせまでを 7 つの段で 1 枚の表に書き出す手順と、書いた内容をページにする組み方です。",
    kit: "lp-pack",
    date: "2026-10-03",
  },
];

export const guideHref = (guide: Guide) => `/guides/${guide.slug}`;

export function guideBySlug(slug: string): Guide {
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) throw new Error(`guide not found: ${slug}`);
  return guide;
}
