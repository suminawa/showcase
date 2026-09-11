/**
 * 見本「潮見計測」の 3 本柱。TOP は name と summary だけ、事業内容の面は全部を使う。
 * 表示の順もこの配列の順に従う。
 */
export type PillarId = "survey" | "monitoring" | "analysis";

export type Pillar = {
  id: PillarId;
  name: string;
  /** TOP の 3 本柱で出す一文 */
  summary: string;
  /** 事業内容の面で出す説明 */
  body: string;
  /** 仕事の進み方 */
  steps: string[];
  /** 使う機材 */
  gear: string[];
};

export const PILLARS: readonly Pillar[] = [
  {
    id: "survey",
    name: "海域調査",
    summary:
      "船を出し、水深と流れ、底の質を測ります。工事の前後をくらべる調査にも使われます。",
    body: "船を出し、水深と流れ、底の質を測ります。護岸工事の前後をくらべる調査や、漁場の状態を調べる仕事で使われます。",
    steps: ["計画をつくる", "現地で測る", "図と表にまとめる"],
    gear: [
      "音響測深機（浅い海域用と深い海域用）",
      "流向流速計",
      "採泥器",
      "水質計",
      "衛星測位の装置",
    ],
  },
  {
    id: "monitoring",
    name: "環境モニタリング",
    summary: "決めた地点に機器を置き、水質と水温を一年を通して記録します。",
    body: "決めた地点に機器を置き、水質と水温を一年を通して記録します。数値が決めた幅を外れたら、その日のうちにご連絡します。",
    steps: [
      "地点を決める",
      "機器を設置する",
      "定期に点検してデータを回収する",
      "月ごとに報告する",
    ],
    gear: [
      "観測ブイ（太陽電池式）",
      "自動採水器",
      "水位計",
      "データロガー",
      "通信ユニット",
    ],
  },
  {
    id: "analysis",
    name: "データ解析",
    summary:
      "集めた記録をまとめ、図と報告書にします。他社が測ったデータだけでも引き受けます。",
    body: "集めた記録をまとめ、図と報告書にします。他社が測ったデータの解析だけでも引き受けます。",
    steps: [
      "データを受け取る",
      "欠測と異常値を整理する",
      "図と統計にする",
      "報告書にまとめる",
    ],
    gear: [
      "解析用のワークステーション",
      "大容量のストレージ",
      "地理情報システム",
      "作図と製図の道具",
    ],
  },
];

export function pillarById(id: string): Pillar | undefined {
  return PILLARS.find((pillar) => pillar.id === id);
}
