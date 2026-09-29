/*
 * GAS キットの見本ページの結びと、頭の値段の一行。
 * 中身・導入の時間・比べ方の文は src/lib/kit-demos.ts の一箇所から写す。
 * 値段は要求の時刻で決まる（kitDemo は既定で今の時刻）。置くページは dynamic = "force-dynamic"。
 * 売り場への道は /go/ の渡し口（goHref）を通す。
 */
import { goHref } from "@/lib/go";
import { CHECKED_ON, kitDemo, type KitDemoSlug } from "@/lib/kit-demos";

import s from "./kit-demo.module.css";

function BuyLinks({ slug }: { slug: KitDemoSlug }) {
  const demo = kitDemo(slug);
  const from = `/projects/${slug}`;
  return (
    <span className={s.buy}>
      <a href={goHref(demo.linkKey, "note", from)} rel="nofollow" className={s.link}>
        note で詳しく読む
      </a>
      <span aria-hidden="true">／</span>
      <a href={goHref(demo.linkKey, "booth", from)} rel="nofollow" className={s.link}>
        BOOTH で購入する
      </a>
    </span>
  );
}

/** 頭の下に置く一行。値段と買う道だけ */
export function KitPriceLine({ slug }: { slug: KitDemoSlug }) {
  const demo = kitDemo(slug);
  return (
    <p className={s.priceLine}>
      <span>
        <span className={s.nowrap}>{demo.price}</span>
        {demo.priceNote && <span className={s.priceNote}>{demo.priceNote}</span>}
      </span>
      <BuyLinks slug={slug} />
    </p>
  );
}

/** 結び。これが実物の仕組みであること・値段・中身・導入の時間・比べ方・買う道 */
export function KitClose({ slug, made }: { slug: KitDemoSlug; made: string }) {
  const demo = kitDemo(slug);
  return (
    <section className={s.close} aria-labelledby="kit-close-title">
      <h2 id="kit-close-title" className={s.closeTitle}>
        この見本は『{demo.name}』の実物の仕組みです
      </h2>
      <p className={s.body}>{made}</p>
      <p className={s.body}>
        {demo.price}です。{demo.priceNote} <BuyLinks slug={slug} />
      </p>

      <div className={s.closeGrid}>
        <div>
          <h3 className={s.head}>入っているもの</h3>
          <ul className={s.list}>
            {demo.box.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={s.head}>置くのにかかる時間</h3>
          <p className={s.body}>{demo.setup}</p>
        </div>
      </div>

      <div className={s.compare}>
        <h3 className={s.head}>無料の道具で足りる方・このキットが合う方</h3>
        <div className={s.closeGrid}>
          <div>
            <p className={s.compareHead}>無料の道具で足りる方</p>
            <ul className={s.list}>
              {demo.freeEnough.map(({ who, alt }) => (
                <li key={who}>
                  <span className={s.who}>{who}</span>
                  <a href={alt.href} className={s.link} rel="noopener noreferrer">
                    {alt.name}
                  </a>
                  　{alt.note}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={s.compareHead}>このキットが合う方</p>
            <ul className={s.list}>
              {demo.fits.map((fit) => (
                <li key={fit.who}>
                  <span className={s.who}>{fit.who}</span>
                  {fit.alts?.map((alt) => (
                    <span key={alt.href} className={s.source}>
                      <a href={alt.href} className={s.link} rel="noopener noreferrer">
                        {alt.name}
                      </a>
                      　{alt.note}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={s.small}>ほかの道具の内容と値段は、{CHECKED_ON.replace(/-/g, "/")} に各社のページで確かめたものです。</p>
      </div>

      <p className={s.body}>
        {demo.price}です。 <BuyLinks slug={slug} />
      </p>
    </section>
  );
}
