/**
 * 見本「粉とゆげ」の品書き。架空の店の、架空の品と値段。
 * 表示の順もこの配列の順に従う（組ごとの並べ替えはしない）。
 */
export type MenuCategory = "bake" | "drink";

export type MenuItem = {
  id: string;
  name: string;
  /** 税込みの価格（円） */
  price: number;
  category: MenuCategory;
  /** 品書きに一行だけ添える説明 */
  note: string;
};

export const MENU: readonly MenuItem[] = [
  {
    id: "scone",
    name: "バターのスコーン",
    price: 380,
    category: "bake",
    note: "外は硬め、中はほろりと崩れます。",
  },
  {
    id: "weekend",
    name: "レモンのウィークエンド",
    price: 420,
    category: "bake",
    note: "皮ごと煮たレモンを生地に混ぜ、表に砂糖の膜をかけます。",
  },
  {
    id: "cookie",
    name: "塩のクッキー（三枚）",
    price: 360,
    category: "bake",
    note: "甘さは控えめです。コーヒーのあとに一枚ずつ。",
  },
  {
    id: "coffee",
    name: "本日のコーヒー",
    price: 520,
    category: "drink",
    note: "豆は週ごとに変わります。産地は黒板に書いています。",
  },
  {
    id: "milk-brew",
    name: "ミルクブリュー",
    price: 580,
    category: "drink",
    note: "一晩かけて牛乳で出したコーヒーです。氷を入れずに冷やして出します。",
  },
  {
    id: "hojicha",
    name: "ほうじ茶",
    price: 480,
    category: "drink",
    note: "挽いた茶葉を、その場で急須に入れます。",
  },
];

/** 品書きの組。表示の順もこの配列の順 */
export const MENU_GROUPS: readonly { category: MenuCategory; label: string }[] =
  [
    { category: "bake", label: "焼き菓子" },
    { category: "drink", label: "飲みもの" },
  ];

export function menuByCategory(category: MenuCategory): MenuItem[] {
  return MENU.filter((item) => item.category === category);
}

/** 380 -> "380 円"。店の品書きなので通貨記号ではなく「円」で出す（書式は共通のものを使う） */
export { formatYenSuffix as formatPrice } from "@/lib/format";
