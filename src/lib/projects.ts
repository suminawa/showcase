import { demoHref, demos } from "./demos";

export type ProjectCategory = "sites" | "tools" | "games" | "challenge";

export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  category: ProjectCategory;
  /**
   * ハブ（水盤）の索引にだけ出る 1 行。作品ページは読まない。
   * ハブの素材そのものが作品と同じもののとき、その重複を明示的に引き受ける。
   */
  hubNote?: string;
  /** ハブから飛ぶ先。無ければ /projects/<slug> */
  href?: string;
};

/**
 * 表示順もこの配列の順に従う。
 * lead は分類の見出しの下に置く 1 行 ── その欄に並ぶものが何なのかを、
 * 一件ずつの説明に書かずに一度だけ言う。持たない分類のほうが多い。
 */
export const CATEGORIES: {
  id: ProjectCategory;
  label: string;
  lead?: string;
}[] = [
  { id: "sites", label: "SITES", lead: "どれも架空の会社で作った見本です。" },
  { id: "tools", label: "TOOLS" },
  { id: "games", label: "GAMES" },
  { id: "challenge", label: "CHALLENGE" },
];

/** サイトはレジストリ（demos.ts）から SITES 欄に写す。ハブは作品と同じ行として扱う */
const siteProjects: Project[] = demos.map((demo) => ({
  slug: demo.slug,
  title: demo.title,
  description: demo.description,
  tags: demo.tags,
  category: "sites",
  href: demoHref(demo),
}));

export const projects: Project[] = [
  ...siteProjects,
  {
    slug: "quote-simulator",
    title: "見積もりシミュレーター",
    description:
      "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    category: "tools",
  },
  {
    slug: "floorplan",
    title: "間取りシミュレーター",
    description:
      "間取りを描きかえ、家具を置き、3D で確かめる。マス目を塗るだけで廊下も L 字も描ける、住まいの検討用の道具。",
    tags: ["React Three Fiber", "TypeScript"],
    category: "tools",
  },
  {
    slug: "suminagashi",
    title: "墨流し — Suminagashi",
    description:
      "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    hubNote:
      "いま触っているこの水面が、その作品です。ここでは混ぜられるだけ。落として、風を送って、保存できるのは向こう側。粘りと渦のつまみも、作品の側にあります。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    category: "tools",
  },
  {
    slug: "30days",
    title: "30日 — Thirty Days",
    description:
      "AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。売上・提案数・人間の介在時間を毎日足していく公開の帳面。",
    tags: ["Next.js", "TypeScript", "公開ログ"],
    category: "challenge",
  },
];

export function projectHref(project: Project): string {
  return project.href ?? `/projects/${project.slug}`;
}

export function projectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((project) => project.category === category);
}

/** 目次の一本。分類の名と、その分類の最初の段に付けた id への飛び先 */
export type CategoryAnchor = {
  id: ProjectCategory;
  label: string;
  anchor: string;
};

/**
 * 名乗りの下に並べる分類の目次。並びは CATEGORIES そのままで、
 * 作品を持たない分類（GAMES）も段があるかぎり必ず入る ──
 * 目次は「何がここに載るか」の一覧であって、載っているものの一覧ではない。
 */
export function categoryAnchors(): CategoryAnchor[] {
  return CATEGORIES.map(({ id, label }) => ({ id, label, anchor: `#${id}` }));
}
