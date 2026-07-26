export type ProjectCategory = "tools" | "games" | "sites";

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
};

/** 表示順もこの配列の順に従う */
export const CATEGORIES: { id: ProjectCategory; label: string }[] = [
  { id: "sites", label: "SITES" },
  { id: "tools", label: "TOOLS" },
  { id: "games", label: "GAMES" },
];

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
];

export function projectHref(project: Project): string {
  return `/projects/${project.slug}`;
}

export function projectsByCategory(category: ProjectCategory): Project[] {
  return projects.filter((project) => project.category === category);
}
