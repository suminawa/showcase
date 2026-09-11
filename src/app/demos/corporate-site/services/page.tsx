/*
 * 見本: 会社案内サイトの下層（事業内容）。3 本柱の説明・流れ・使う機材。
 * 中身は src/components/demos/corporate/services.ts が持ち、この面は並べるだけ。
 */
import type { Metadata } from "next";

import { NAV_BASE } from "@/components/demos/corporate/nav";
import { PillarIcon } from "@/components/demos/corporate/PillarIcon";
import { PILLARS } from "@/components/demos/corporate/services";

import c from "../corporate.module.css";
import s from "../sub.module.css";

const TITLE = "見本 ｜ 会社案内サイト（事業内容）";
const DESCRIPTION =
  "架空の計測会社「潮見計測」の事業内容。海域調査・環境モニタリング・データ解析の見本。";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${NAV_BASE}/services`,
    type: "website",
    images: ["/opengraph-image.png"],
    siteName: "Showcase",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

export default function CorporateServicesPage() {
  return (
    <>
      <section className={c.pageHead}>
        <div className={c.container}>
          <h1 className={c.h1}>海を測り、記録し、読み解く</h1>
          <p className={c.lead}>
            三つの事業はつながっています。海で測り、機器を置いて記録し、そのデータを読み解く。現場で数字の癖をつかんでいますので、解析でも異常値を見分けられます。
          </p>
        </div>
      </section>

      <section className={c.section}>
        <div className={c.container}>
          <div className={s.blocks}>
            {PILLARS.map((pillar) => (
              <article key={pillar.id} className={s.block}>
                <div className={s.blockHead}>
                  <PillarIcon id={pillar.id} className={s.blockIcon} />
                  <h2 className={c.h2}>{pillar.name}</h2>
                  <p className={s.blockBody}>{pillar.body}</p>
                </div>
                <div className={s.blockDetail}>
                  <div>
                    <h3 className={s.detailTitle}>進め方</h3>
                    <ol className={s.flow}>
                      {pillar.steps.map((step) => (
                        <li key={step} className={s.flowStep}>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3 className={s.detailTitle}>使う機材</h3>
                    <ul className={s.gear}>
                      {pillar.gear.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
