import Link from "next/link";
import { projectHref, type Project } from "@/lib/projects";

const VARIANT_STYLES = {
  marble: {
    pane: "pane-marble pane-lit pane-flood-in on-color text-marble-fg",
    secondary: "text-marble-fg-soft",
  },
  amber: {
    pane: "pane-amber pane-lit on-color",
    secondary: "text-amber-ink",
  },
} as const;

/** 作品ペイン。marble = 主役（藍のマーブルガラス + ロード時 flood）、amber = ツール系 */
export function ProjectCard({
  project,
  variant,
  className = "",
}: {
  project: Project;
  variant: keyof typeof VARIANT_STYLES;
  className?: string;
}) {
  const styles = VARIANT_STYLES[variant];
  return (
    <Link
      href={projectHref(project)}
      className={`${styles.pane} group flex flex-col justify-between gap-10 p-[clamp(20px,3vw,40px)] ${className}`}
    >
      <div>
        <h2 className="max-w-[22ch] text-[clamp(1.5rem,2.5vw,2rem)] leading-snug font-bold text-balance [word-break:auto-phrase]">
          {project.title}
        </h2>
        <p
          className={`mt-4 max-w-[40ch] text-[0.9375rem] leading-[1.9] ${styles.secondary}`}
        >
          {project.description}
        </p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <p className={`text-[0.8125rem] ${styles.secondary}`}>
          {project.tags.join(" · ")}
        </p>
        <p className="shrink-0 text-[0.9375rem] font-bold">
          作品を開く <span aria-hidden="true">→</span>
        </p>
      </div>
    </Link>
  );
}
