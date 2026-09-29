/**
 * 発売記念の価格の表と、「いま払う値段」を決める一つの関数。
 *
 * 定価は src/lib/projects.ts の sale.price が持つ（そちらは定価だけで、日付を持たない）。
 * ここに置くのは **期限つきの値段だけ** で、1 行 = キットの slug・記念の価格・最終日。
 *
 *   until は記念価格の **最終日**（日本時間、その日を含む）。
 *   翌日の 00:00（日本時間）から定価に切り替わる ── note のタイムセールが切れるのと同じ時刻。
 *
 * 期限が過ぎた行は残しておいてよい（過ぎれば定価を返すだけで、画面は古くならない）。
 * 新しいキットの発売で記念価格を付けるときは、ここに 1 行足す。ページの文は直さなくてよい。
 * 出どころは ops の承認ボード（board.md の「商品の値段」）で、ここで新しい値を作らない。
 */
export type IntroPrice = {
  /** 記念の価格（税込・円） */
  price: number;
  /** 最終日（日本時間、YYYY-MM-DD。この日の 23:59:59 まで） */
  until: string;
};

export const INTRO_PRICES: Readonly<Record<string, IntroPrice>> = {
  "inbox-triage": { price: 4980, until: "2026-09-29" },
  dashboard: { price: 8800, until: "2026-09-29" },
  "line-concierge": { price: 9800, until: "2026-09-30" },
  configurator: { price: 9800, until: "2026-09-30" },
  "saas-starter": { price: 16800, until: "2026-09-30" },
  "sheet-app": { price: 9800, until: "2026-10-02" },
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** その時刻の、日本時間での日付（YYYY-MM-DD） */
export function jstDate(now: Date): string {
  return new Date(now.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

export type PriceNow = {
  /** いま払う値段 */
  price: number;
  /** 記念価格の期間中だけ持つ: 定価と最終日 */
  intro?: { list: number; until: string };
};

/**
 * いま払う値段。記念価格の期間中なら記念の値に、定価と最終日を添えて返す。
 * 記念の値が定価以上のとき（表の書き違い）は、嘘の「値引き」を出さず定価に倒す。
 */
export function priceNow(slug: string, list: number, now: Date = new Date()): PriceNow {
  const intro = INTRO_PRICES[slug];
  if (intro && intro.price < list && jstDate(now) <= intro.until) {
    return { price: intro.price, intro: { list, until: intro.until } };
  }
  return { price: list };
}

/** 3 桁ごとの区切り。Intl に頼らないので、どこで組んでも同じ字が出る */
export function yen(price: number): string {
  return `¥${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/** 「2026-09-29」→「2026-09-30」（暦の翌日） */
export function nextDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** 「2026-10-02」→「10/2」 */
export function shortDate(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}
