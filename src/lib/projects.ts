export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
};

export const projects: Project[] = [
  {
    slug: "quote-simulator",
    title: "見積もりシミュレーター",
    description:
      "作業条件を入れると、見積もりの内訳と合計がその場で見える。フリーランスの「いくらでやる？」を 30 秒で形にする電卓。",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
  },
];

export function projectHref(project: Project): string {
  return `/projects/${project.slug}`;
}
