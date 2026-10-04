import { describe, expect, it } from "vitest";

import { articleJsonLd, breadcrumbJsonLd, productJsonLd, serializeJsonLd, siteJsonLd } from "./jsonld";
import { SITE_NAME } from "./site";

const roundTrip = (data: Parameters<typeof serializeJsonLd>[0]) => JSON.parse(serializeJsonLd(data));

describe("jsonld", () => {
  it("書き出しは < を残さず、元の値に戻る（</script> で閉じられない）", () => {
    const data = { "@type": "Thing", name: "</script><b>x</b>" };
    const out = serializeJsonLd(data);
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual(data);
  });

  it("根は Organization と WebSite。名乗り・URL・sameAs を持ち、LINE は入れない", () => {
    const [org, site] = roundTrip(siteJsonLd());
    expect(org["@context"]).toBe("https://schema.org");
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe(SITE_NAME);
    expect(org.url).toMatch(/^https?:\/\/.+\/$/);
    expect(org.logo).toMatch(/\/icon\.svg$/);
    expect(org.sameAs).toEqual(
      expect.arrayContaining([
        "https://note.com/suminawa",
        "https://suminawa.booth.pm",
        "https://x.com/suminawa_dev",
        "https://www.youtube.com/@suminawa",
      ]),
    );
    expect(org.sameAs.some((u: string) => u.includes("lin.ee"))).toBe(false);
    expect(site["@type"]).toBe("WebSite");
    expect(site.name).toBe(SITE_NAME);
    expect(site.publisher["@id"]).toBe(org["@id"]);
    expect(JSON.stringify([org, site])).not.toMatch(/Showcase/);
  });

  it("パンくずは 1 から数え、item は絶対 URL", () => {
    const b = roundTrip(
      breadcrumbJsonLd([
        { name: SITE_NAME, path: "/" },
        { name: "キットとテンプレート", path: "/kits" },
        { name: "予約ページ キット", path: "/projects/booking" },
      ]),
    );
    expect(b["@type"]).toBe("BreadcrumbList");
    expect(b.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2, 3]);
    expect(b.itemListElement[2].item).toMatch(/^https?:\/\/.+\/projects\/booking$/);
    expect(b.itemListElement.every((i: { name: string }) => i.name)).toBe(true);
  });

  it("Product は name と Offer（円・在庫あり・URL）を持つ", () => {
    const p = roundTrip(
      productJsonLd({ name: "予約ページ キット", description: "d", path: "/projects/booking", price: 7980, image: "/og/booking.png" }),
    );
    expect(p["@type"]).toBe("Product");
    expect(p.name).toBe("予約ページ キット");
    expect(p.image).toMatch(/^https?:\/\/.+\/og\/booking\.png$/);
    expect(p.offers).toMatchObject({
      "@type": "Offer",
      price: 7980,
      priceCurrency: "JPY",
      availability: "https://schema.org/InStock",
    });
    expect(p.offers.url).toMatch(/\/projects\/booking$/);
  });

  it("Article は見出し・日付（ISO）・書き手・日本語を持つ", () => {
    const a = roundTrip(
      articleJsonLd({
        headline: "h",
        description: "d",
        path: "/guides/booking-page",
        datePublished: "2026-09-28",
        dateModified: "2026-10-04",
      }),
    );
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe("h");
    expect(new Date(a.datePublished).toISOString()).toBe("2026-09-27T15:00:00.000Z");
    expect(Date.parse(a.dateModified)).toBeGreaterThan(Date.parse(a.datePublished));
    expect(a.author).toMatchObject({ "@type": "Organization", name: SITE_NAME });
    expect(a.inLanguage).toBe("ja");
  });
});
