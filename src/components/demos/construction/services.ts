/**
 * 見本「灯月設備」の対応メニュー。架空の会社の、架空の品目と値段。
 * 表示の順もこの配列の順に従う（水まわり 3 つ → 電気と空調 3 つ）。
 */
import { formatYenSuffix } from "@/lib/format";

export type ServiceId =
  | "leak"
  | "clog"
  | "water-heater"
  | "outlet"
  | "panel"
  | "aircon";

export type ConstructionService = {
  id: ServiceId;
  name: string;
  /** 目安の下限（税込・円）。表示は「8,800 円〜」 */
  from: number;
  note: string;
};

export const SERVICES: readonly ConstructionService[] = [
  {
    id: "leak",
    name: "水漏れの修理",
    from: 8800,
    note: "蛇口、排水管、トイレのにじみを止めます。部品の交換が要る場合は部品代を足します。",
  },
  {
    id: "clog",
    name: "排水の詰まり抜き",
    from: 11000,
    note: "台所、洗面、トイレの詰まりを抜きます。高圧洗浄が要るときは別に見積もります。",
  },
  {
    id: "water-heater",
    name: "給湯器の交換",
    from: 88000,
    note: "本体と工事を合わせた金額です。号数と設置の場所で変わります。在庫のある型なら、その日のうちに交換できます。",
  },
  {
    id: "outlet",
    name: "コンセントの増設",
    from: 16500,
    note: "壁の中に配線を通します。壁を壊さずに済むことが多いです。",
  },
  {
    id: "panel",
    name: "分電盤の交換",
    from: 44000,
    note: "ブレーカーがよく落ちる家に向いています。作業は半日で終わります。",
  },
  {
    id: "aircon",
    name: "エアコンの取り付け",
    from: 14300,
    note: "標準工事の金額です。配管が 4 m を超えると足します。",
  },
];

/** 8800 -> "8,800 円〜"。下限であることを「〜」で示す */
export function formatFrom(amount: number): string {
  return `${formatYenSuffix(amount)}〜`;
}
