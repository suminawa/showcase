const ja = {
  meta: {
    title: "税込からの逆算",
    description: "切りのいい税込価格を決めたあと、請求書に書く税抜と消費税を出す電卓",
  },
  title: "税込からの逆算",
  lede: "切りのいい税込の額から、請求書に書く税抜と消費税を出します",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "Tax-Inclusive Price Breakdown",
      description: "Once you’ve set a round tax-inclusive price, get the pre-tax amount and Japanese consumption tax to put on the invoice.",
    },
    title: "Tax-Inclusive Price Breakdown",
    lede: "From a round tax-inclusive amount, get the pre-tax amount and consumption tax for your invoice",
  },
  fr: {
    meta: {
      title: "Du prix TTC au montant HT",
      description: "Une fois le prix TTC arrondi fixé, obtenez le montant HT et la taxe à la consommation japonaise à indiquer sur la facture.",
    },
    title: "Du prix TTC au montant HT",
    lede: "À partir d’un montant TTC arrondi, obtenez le montant HT et la taxe à la consommation pour votre facture",
  },
};
