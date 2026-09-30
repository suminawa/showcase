import type { PriceNow } from "@/lib/prices";
import { listOf, longDate, money } from "@/i18n/ui";

const ja = {
  meta: {
    title: "3D 商品コンフィギュレーター",
    description: "商品を 3D で回しながら、色・素材・パーツ・刻印・ロゴを選び、価格をその場で確かめる。商品ページに置ける道具。",
  },
  title: "3D 商品コンフィギュレーター",
  lede: "商品を回しながら色・素材・パーツ・刻印・ロゴを選ぶと、価格がその場で変わります",
  how: "商品は glTF のモデル 1 つと JSON の設定 1 つでできています。ロゴの画像はお使いのブラウザの中だけで扱い、サーバーには送りません。",
  kit: (p: PriceNow) =>
    `この 3D 商品コンフィギュレーターを自分のサイトに置ける版（定価 ${money("ja", listOf(p))} の買い切り${p.intro ? `。${longDate("ja", p.intro.until)}までは発売記念 ${money("ja", p.price)}` : ""}。見本のモデルと設定つき）`,
  shopifyHeading: "Shopify 版",
  shopifyAbout: "同じコンフィギュレーターを、Shopify の商品ページに置ける形にした版です。アプリではなく、テーマにファイルを足して使うので、審査も月額の利用料も要りません。選んだ色・容量・刻印は、カートの商品と注文の詳細に残ります。",
  shopifyDemo: "下は架空の店「みなと工房」の商品ページの見本です。カートは本物ではなく、「カートに入れる」を押すと、カートに届く内容をページの下に表示します。ページの上の「English」を押すと、英語の表示に切り替わります。",
  shopifyStatus: "Shopify 版は発売前です ──",
  shopifyOpen: "見本を別の画面で開く",
};

export const copy: Record<"ja" | "en" | "fr", typeof ja> = {
  ja,
  en: {
    meta: {
      title: "3D Product Configurator",
      description: "Rotate a product in 3D while choosing colors, materials, parts, engraving, and a logo, and check the price on the spot. A tool for your product pages.",
    },
    title: "3D Product Configurator",
    lede: "Rotate the product and choose colors, materials, parts, engraving, and a logo; the price updates as you go",
    how: "Each product is one glTF model plus one JSON configuration. Logo images are handled only in your browser and never sent to a server.",
    kit: (p: PriceNow) =>
      `A version of this 3D product configurator for your own site (regular price ${money("en", listOf(p))}, one-time purchase${p.intro ? `; launch price ${money("en", p.price)} until ${longDate("en", p.intro.until)}` : ""}; includes sample models and configurations)`,
    shopifyHeading: "Shopify edition",
    shopifyAbout: "The same configurator, packaged for Shopify product pages. It isn’t an app: you add files to your theme, so there’s no app review and no monthly fee. The chosen color, capacity, and engraving stay on the cart item and in the order details.",
    shopifyDemo: "Below is a sample product page for a fictional workshop. The cart isn’t real: the add-to-cart button shows, at the bottom of the page, what would reach the cart. Press “English” at the top of the page to switch it to English.",
    shopifyStatus: "The Shopify edition is not released yet —",
    shopifyOpen: "Open the sample in a new window",
  },
  fr: {
    meta: {
      title: "Configurateur de produit 3D",
      description: "Faites tourner un produit en 3D en choisissant couleurs, matières, pièces, gravure et logo, et voyez le prix aussitôt. Un outil pour vos pages produit.",
    },
    title: "Configurateur de produit 3D",
    lede: "Faites tourner le produit et choisissez couleurs, matières, pièces, gravure et logo : le prix se met à jour aussitôt",
    how: "Chaque produit se compose d’un modèle glTF et d’une configuration JSON. Les images de logo restent dans votre navigateur et ne sont jamais envoyées à un serveur.",
    kit: (p: PriceNow) =>
      `Une version de ce configurateur 3D pour votre propre site (prix normal ${money("fr", listOf(p))}, achat unique${p.intro ? ` ; prix de lancement ${money("fr", p.price)} jusqu’au ${longDate("fr", p.intro.until)}` : ""} ; modèles et configurations d’exemple inclus)`,
    shopifyHeading: "Version Shopify",
    shopifyAbout: "Le même configurateur, adapté aux pages produit Shopify. Ce n’est pas une application : on ajoute des fichiers au thème, donc ni validation ni abonnement. La couleur, la contenance et la gravure choisies restent sur l’article du panier et dans le détail de la commande.",
    shopifyDemo: "Ci-dessous, une page produit d’exemple pour un atelier fictif. Le panier n’est pas réel : le bouton d’ajout au panier affiche en bas de page ce qui arriverait dans le panier. Le bouton « English » en haut de la page passe l’affichage en anglais.",
    shopifyStatus: "La version Shopify n’est pas encore sortie —",
    shopifyOpen: "Ouvrir l’exemple dans une nouvelle fenêtre",
  },
};
