/*
 * 余白の索引。Server Component — 0ms から完全に読めて押せる。
 *
 * 枠線・罫線・角丸・背景色の切り替え・チップ・カード・gap による区切りは
 * 一つも使わない。構造は縦の余白のリズムだけが作る。
 * カテゴリ = 顔料。作品 = その顔料の一塊。
 */

import {
  INK_ABSORPTION,
  UNDYED,
} from "@/components/suminagashi/fluid/simulation";
import {
  CATEGORIES,
  projectHref,
  projects,
  projectsByCategory,
  type ProjectCategory,
} from "@/lib/projects";
import type { BasinSpecies } from "./basinBridge";
import {
  BasinIndexItem,
  BasinIndexNote,
  BasinSwatch,
} from "./BasinIndexItem";

const SUMI = "var(--sumi, #14171b)";
const SUMI_SOFT = "var(--sumi-soft, #5a564c)";

/** カテゴリ = 顔料。藍と墨しか無いのは原文のパレット制約そのもの */
const PIGMENT: Record<
  ProjectCategory,
  { name: string; tone: string | null; absorption: [number, number, number] }
> = {
  sites: { name: "藍", tone: "var(--ai, #224372)", absorption: INK_ABSORPTION.indigo },
  tools: { name: "墨", tone: SUMI, absorption: INK_ABSORPTION.carbon },
  games: { name: "素水", tone: null, absorption: UNDYED },
};

/** 素水として水面に存在する空カテゴリ。「準備中のカード」は置かない */
const UNDYED_CATEGORY: ProjectCategory = "games";

/**
 * seed 配列 = [素水, ...作品（レジストリ順）]。index がそのまま species になる。
 * 最後に落ちるのが最新の作品 = 一番濃い領域。append するだけで成立する。
 */
export const BASIN_SPECIES: BasinSpecies[] = [
  {
    species: 0,
    key: UNDYED_CATEGORY,
    title: "GAMES",
    href: null,
    inert: true,
    absorption: PIGMENT[UNDYED_CATEGORY].absorption,
    tone: PIGMENT[UNDYED_CATEGORY].tone,
  },
  ...projects.map((project, index) => ({
    species: index + 1,
    key: project.slug,
    title: project.title,
    href: projectHref(project),
    inert: false,
    absorption: PIGMENT[project.category].absorption,
    tone: PIGMENT[project.category].tone,
  })),
];

const SPECIES_OF_SLUG = new Map(
  BASIN_SPECIES.map((item) => [item.key, item.species]),
);

function speciesOf(key: string): number {
  return SPECIES_OF_SLUG.get(key) ?? 0;
}

export function BasinIndex({ className }: { className?: string }) {
  return (
    <div className={className}>
      {/* 水面は活字が持っていない情報を持たない。読み上げには一度だけ断る */}
      <p className="sr-only">
        背景は WebGL の流体シミュレーションです。操作しなくても、内容はすべてこの一覧にあります。
      </p>

      <div className="flex flex-col gap-[clamp(28px,4vh,44px)]">
        {CATEGORIES.map((category) => {
          const items = projectsByCategory(category.id);
          const pigment = PIGMENT[category.id];
          const headingId = `basin-${category.id}`;
          // 見出しのスウォッチは、そのカテゴリの最初の一塊を指す
          const headingSpecies = speciesOf(
            items[0]?.slug ?? UNDYED_CATEGORY,
          );

          return (
            <section key={category.id} aria-labelledby={headingId}>
              <h2
                id={headingId}
                className="mb-[clamp(12px,1.6vh,18px)] flex items-center gap-2.5 text-[0.8125rem] font-semibold tracking-[0.14em] uppercase"
                style={{ color: SUMI }}
              >
                <BasinSwatch species={headingSpecies} tone={pigment.tone} />
                {pigment.name} {category.label}
              </h2>

              {items.length === 0 ? (
                <BasinIndexNote species={headingSpecies}>
                  まだ何も落としていない。水面のこの一帯は、染めていない水のまま。
                </BasinIndexNote>
              ) : (
                <div className="flex flex-col gap-[clamp(18px,2.4vh,28px)]">
                  {items.map((project) => (
                    <div key={project.slug} className="flex flex-col gap-2">
                      <BasinIndexItem
                        species={speciesOf(project.slug)}
                        href={projectHref(project)}
                      >
                        {project.title}
                      </BasinIndexItem>
                      <p
                        className="max-w-[42ch] text-[0.9375rem] leading-[1.9]"
                        style={{ color: SUMI_SOFT }}
                      >
                        {project.description}
                      </p>
                      {project.hubNote ? (
                        <p
                          className="max-w-[42ch] text-[0.9375rem] leading-[1.9]"
                          style={{ color: SUMI_SOFT }}
                        >
                          {project.hubNote}
                        </p>
                      ) : null}
                      <p
                        className="text-[0.8125rem] leading-[1.7]"
                        style={{ color: SUMI_SOFT }}
                      >
                        {project.tags.join("・")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
