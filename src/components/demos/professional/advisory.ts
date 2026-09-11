/**
 * 見本「霜月会計事務所」の顧問料。架空の事務所の、架空の料金。
 * 表示の順もこの配列の順に従う。
 * 「年間の目安」は金額の行から組み立てる ── 数字を二か所に書くと、片方だけ直したときに食い違うため。
 */

export type AdvisoryPlanId = "sole" | "corp" | "spot";

/** 料金の単位。month は毎月、year は年に 1 回、spot は単発 */
export type AdvisoryUnit = "month" | "year" | "spot";

export const UNIT_LABELS: Record<AdvisoryUnit, string> = {
  month: "／月",
  year: "／年",
  spot: "／回",
};

export type AdvisoryLine = {
  label: string;
  /** 税込みの金額（円） */
  price: number;
  unit: AdvisoryUnit;
};

export type AdvisoryPlan = {
  id: AdvisoryPlanId;
  /** 切替のボタンに出す短い名前 */
  name: string;
  /** 誰向けかの一行 */
  audience: string;
  /** 金額の行。先頭の行だけ大きく出す */
  lines: readonly AdvisoryLine[];
  /** 料金に含むもの */
  includes: readonly string[];
  /** カードの結びの一行 */
  note: string;
};

export const ADVISORY_PLANS: readonly AdvisoryPlan[] = [
  {
    id: "sole",
    name: "個人事業",
    audience: "売上 1,000 万円までの個人事業の方へ",
    lines: [
      { label: "月額顧問料", price: 15000, unit: "month" },
      { label: "決算・確定申告", price: 80000, unit: "year" },
    ],
    includes: [
      "月 1 回のオンライン面談",
      "記帳の確認と月次の報告",
      "確定申告書の作成",
      "税務調査の立ち会いは別料金",
    ],
    note: "記帳の代行が要る場合は、月額に 5,000 円を足します。",
  },
  {
    id: "corp",
    name: "法人",
    audience: "従業員 20 人までの法人へ",
    lines: [
      { label: "月額顧問料", price: 30000, unit: "month" },
      { label: "決算・申告", price: 150000, unit: "year" },
    ],
    includes: [
      "月 1 回のオンライン面談",
      "記帳の確認と月次の報告",
      "決算書と申告書の作成",
      "年末調整と法定調書",
      "年 1 回までの立ち会い",
    ],
    note: "消費税の申告が要る場合も、この料金のままです。",
  },
  {
    id: "spot",
    name: "スポット",
    audience: "顧問契約はせず、要るときだけ頼みたい方へ",
    lines: [
      { label: "税務調査の立ち会い（1 日）", price: 80000, unit: "spot" },
      { label: "決算・申告だけ", price: 120000, unit: "spot" },
      { label: "経理研修（半日）", price: 60000, unit: "spot" },
    ],
    includes: [
      "事前の打ち合わせ（1 時間）",
      "当日の立ち会い",
      "調査のあとの対応（1 回まで）",
    ],
    note: "顧問契約への切り替えは、いつでもできます。",
  },
];

export function advisoryPlanById(id: AdvisoryPlanId): AdvisoryPlan {
  const plan = ADVISORY_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`知らないプラン: ${id}`);
  return plan;
}

/**
 * 年間の目安。「／月」の行は 12 倍、「／年」の行はそのまま足す。
 * 単発（spot）しか無いプランは顧問契約が無いので null を返す ── 0 円ではない。
 */
export function yearlyEstimate(lines: readonly AdvisoryLine[]): number | null {
  let total = 0;
  let recurring = false;
  for (const line of lines) {
    if (line.unit === "month") {
      total += line.price * 12;
      recurring = true;
    } else if (line.unit === "year") {
      total += line.price;
      recurring = true;
    }
  }
  return recurring ? total : null;
}
