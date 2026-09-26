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
];

export const guideHref = (guide: Guide) => `/guides/${guide.slug}`;

export function guideBySlug(slug: string): Guide {
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) throw new Error(`guide not found: ${slug}`);
  return guide;
}
