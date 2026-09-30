const ja = {
  meta: {
    title: "見積もりシミュレーター",
    description: "作業条件を入力すると、見積もりの内訳と合計がリアルタイムで見える電卓",
  },
  title: "見積もりシミュレーター",
  lede: "条件を入れると、その場で内訳が見えます",
  kit: "この電卓を自分のサイトに置ける版（¥2,980 の買い切り）",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Quote Simulator",
      description: "Enter the job conditions and watch the quote breakdown and total update in real time.",
    },
    title: "Quote Simulator",
    lede: "Enter the conditions and see the breakdown instantly",
    kit: "A version of this calculator for your own site (¥2,980, one-time purchase)",
  },
  fr: {
    meta: {
      title: "Simulateur de devis",
      description: "Saisissez les conditions du travail et voyez le détail du devis et le total se mettre à jour en temps réel.",
    },
    title: "Simulateur de devis",
    lede: "Saisissez les conditions, le détail s’affiche aussitôt",
    kit: "Une version de ce calculateur pour votre propre site (2 980 ¥, achat unique)",
  },
};
