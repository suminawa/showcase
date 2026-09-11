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
    note: "蛇口や排水管、トイレのにじみを止めます。部品の交換が必要な場合は別途部品代がかかります。",
  },
  {
    id: "clog",
    name: "排水の詰まり抜き",
    from: 11000,
    note: "台所や洗面所、トイレの詰まりを取り除きます。高圧洗浄が必要な場合は別途費用がかかります。",
  },
  {
    id: "water-heater",
    name: "給湯器の交換",
    from: 88000,
    note: "給湯器本体代と設置工事費を合わせた金額です。給湯器の号数（大きさ）と設置場所で変わります。在庫のある型なら、その日のうちに交換できます。",
  },
  {
    id: "outlet",
    name: "コンセントの増設",
    from: 16500,
    note: "壁の中に配線を通して増設します。壁を壊さずに工事できる場合が多いです。",
  },
  {
    id: "panel",
    name: "分電盤の交換",
    from: 44000,
    note: "ブレーカーがよく落ちるお住まいにおすすめです。作業は半日で終わります。",
  },
  {
    id: "aircon",
    name: "エアコンの取り付け",
    from: 14300,
    note: "標準工事の金額です。配管が 4 m を超える場合は追加費用がかかります。",
  },
];

/** 8800 -> "8,800 円〜"。下限であることを「〜」で示す */
export function formatFrom(amount: number): string {
  return `${formatYenSuffix(amount)}〜`;
}
