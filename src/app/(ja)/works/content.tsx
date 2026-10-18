/*
 * 作品と道具の全件（/works）。日本語と英仏（src/app/[lang]/works/page.tsx）が同じものを描く。
 * ここに並ぶのは、この紙の上で誰でもその場で触れるもの ── だから値段は添えない
 * （見積もり電卓はテンプレとしては売り物だが、この面では無料の道具として並ぶ。買うほうの導線は /kits と作品ページの結びにある）。
 * FORM: 方眼（DESIGN.md）。写真を持たないので帳票の並び
 */
import { CatalogPage, CatalogRows } from "@/components/site/CatalogPage";
import { localIndexPage, localProject } from "@/i18n/catalog";
import { hrefFor, type Lang } from "@/i18n/routes";
import { projectHref, projectsByCategory } from "@/lib/projects";

export function WorksPage({ lang }: { lang: Lang }) {
  const page = localIndexPage(lang, "works");
  const rows = projectsByCategory("works").map((source) => {
    const project = localProject(lang, source);
    return { href: hrefFor(lang, projectHref(project)), title: project.title, description: project.description, tags: project.tags };
  });
  return (
    <CatalogPage lang={lang} title={page.title} lede={page.lede}>
      <CatalogRows rows={rows} label={page.title} />
    </CatalogPage>
  );
}
