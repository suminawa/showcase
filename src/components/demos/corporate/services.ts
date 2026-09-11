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
  /** 仕事の進め方 */
  steps: string[];
  /** 使う機材 */
  gear: string[];
};

export const PILLARS: readonly Pillar[] = [
  {
    id: "survey",
    name: "海域調査",
    summary:
      "船を出し、水深と流れ、底の質を測ります。工事の前後を比べる調査でもご利用いただいています。",
    body: "船を出し、水深と流れ、底の質を測ります。護岸工事の前後を比べる調査や、漁場の状態を調べる調査でご依頼をいただいています。",
    steps: ["調査計画のご提案", "現地での計測", "図と表の作成"],
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
    summary: "ご指定の地点に機器を設置し、水質と水温を一年を通して記録します。",
    body: "ご指定の地点に機器を設置し、水質と水温を一年を通して記録します。数値があらかじめ決めた範囲を外れたときは、その日のうちにご連絡します。",
    steps: [
      "地点の選定",
      "機器の設置",
      "定期点検とデータの回収",
      "月ごとのご報告",
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
      "集めた記録をまとめ、図と報告書にします。解析だけのご依頼もお受けします。",
    body: "集めた記録をまとめ、図と報告書にします。他社が測ったデータの解析だけでもお引き受けします。",
    steps: [
      "データのお預かり",
      "欠測と異常値の確認",
      "図と統計の作成",
      "報告書へのとりまとめ",
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
