import { demoHref, demos } from "./demos";

export type ProjectCategory = "tools" | "games" | "sites" | "samples";

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

/** 表示順もこの配列の順に従う */
export const CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: "sites", label: "SITES" },
  { id: "tools", label: "TOOLS" },
  { id: "samples", label: "SAMPLES" },
  { id: "games", label: "GAMES" },
];

/** 見本はレジストリ（demos.ts）から SAMPLES 欄に写す。ハブは作品と同じ行として扱う */
const sampleProjects: Project[] = demos.map((demo) => ({
  slug: demo.slug,
  title: demo.title,
  description: demo.description,
  tags: demo.tags,
  category: "samples",
  href: demoHref(demo),
}));

export const projects: Project[] = [
  {
    slug: "suminagashi",
    title: "墨流し — Suminagashi",
    description:
      "藍と墨が水面で渦を巻く、GPU 流体の水盤。指でかき混ぜ、墨を落とし、気に入った模様はそのまま保存できる。",
    hubNote:
      "いま触っているこの水面が、その作品です。ここでは混ぜられるだけ。落として、風を送って、保存できるのは向こう側。粘りと渦のつまみも、作品の側にあります。",
    tags: ["WebGL2", "GLSL", "TypeScript"],
    category: "sites",
  },
  {
    slug: "quote-simulator",
    title: "見積もりシミュレーター",
    description:
      "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    category: "tools",
  },
  {
    slug: "30days",
    title: "30日 — Thirty Days",
    description:
      "AIエージェントに全部やらせて、30日で1から稼げるだけ稼ぐ。売上・提案数・人間の介在時間を毎日足していく公開の帳面。",
    tags: ["Next.js", "TypeScript", "公開ログ"],
    category: "tools",
  },
  ...sampleProjects,
];

export function projectHref(project: Project): string {
  return project.href ?? `/projects/${project.slug}`;
}

export function projectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((project) => project.category === category);
}
