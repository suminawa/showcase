"use client";

/*
 * 見本: 3D 商品コンフィギュレーター。three.js はこの画面だけで要るので、ssr: false でここから読む。
 * 読み終わるまでは枠だけ置いて、高さが動かないようにする。
 */
import dynamic from "next/dynamic";

import s from "./configurator.module.css";

const ProductConfigurator = dynamic(
  () => import("@suminawa/product-configurator/react").then((m) => m.ProductConfigurator),
  { ssr: false, loading: () => <p className={s.loading}>読み込み中…</p> },
);

/** 見本の商品は架空の工房のステンレスタンブラー。設定は売り物に同梱の見本と同じ */
const CONFIG = {
  product: { name: "ステンレスタンブラー", sku: "TB-01" },
  model: { src: "/models/tumbler.glb", camera: { distance: 2.6, elevation: 16, azimuth: -28 } },
  scene: { background: "#f4efe6", floor: "#e8e2d6", autoRotate: true },
  price: { base: 3800, currency: "JPY", note: "税込・送料別" },
  groups: [
    {
      id: "body",
      label: "本体の色",
      type: "color",
      target: ["body-350", "body-500"],
      required: true,
      options: [
        { id: "navy", label: "ネイビー", color: "#243a5e" },
        { id: "black", label: "マットブラック", color: "#1c1a15", roughness: 0.85 },
        { id: "white", label: "ホワイト", color: "#f2efe8", roughness: 0.6 },
        { id: "olive", label: "オリーブ", color: "#5b6b3a" },
        { id: "terracotta", label: "テラコッタ", color: "#b5573a" },
        { id: "silver", label: "シルバー（ヘアライン）", color: "#c9c9c9", roughness: 0.3, metalness: 1, price: 200 },
      ],
    },
    {
      id: "lid",
      label: "フタ",
      type: "material",
      target: ["lid"],
      required: true,
      options: [
        { id: "steel", label: "ステンレス", color: "#b8b8b8", roughness: 0.35, metalness: 0.9 },
        { id: "black", label: "マットブラック", color: "#26231e", roughness: 0.9, metalness: 0.1, price: 300 },
        { id: "walnut", label: "ウォールナット調", color: "#5a3a22", roughness: 0.7, metalness: 0, price: 500 },
      ],
    },
    {
      id: "size",
      label: "容量",
      type: "variant",
      required: true,
      options: [
        { id: "350", label: "350 ml", show: ["body-350"], hide: ["body-500"] },
        { id: "500", label: "500 ml", show: ["body-500"], hide: ["body-350"], price: 400 },
      ],
    },
    { id: "strap", label: "ストラップ", type: "variant", options: [{ id: "leather", label: "本革", show: ["strap"], price: 600 }] },
    {
      id: "engrave",
      label: "刻印（英数字 12 字まで）",
      type: "text",
      target: ["label"],
      maxChars: 12,
      pattern: "[A-Za-z0-9 .&-]*",
      placeholder: "例: MINATO 2026",
      font: "serif",
      color: "#1c1a15",
      background: "#f4efe6",
      price: 500,
    },
    { id: "logo", label: "ロゴ入れ（PNG / JPEG / SVG、2 MB まで）", type: "image", target: ["label"], background: "#f4efe6", price: 800 },
  ],
};

export function Tool() {
  return (
    <div className={s.tool}>
      <ProductConfigurator config={CONFIG} />
    </div>
  );
}
