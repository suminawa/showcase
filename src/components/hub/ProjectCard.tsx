import Link from "next/link";
import { projectHref, type Project } from "@/lib/projects";

/**
 * Featured 作品ペイン — 壁の中で最大のアンバー色ガラス。
 * ロード時に一度だけガラスから琥珀へ flood し、ホバーで明るく灯る。
 */
export function ProjectCard({
  project,
  number,
  className = "",
}: {
  project: Project;
  number: string;
  className?: string;
}) {
  return (
    <Link
      href={projectHref(project)}
      className={`pane-amber pane-lit pane-flood-in on-color group flex flex-col justify-between gap-10 p-[clamp(20px,3vw,40px)] ${className}`}
    >
      <div>
        <p className="font-display text-[0.8125rem] font-semibold tracking-[0.14em] uppercase">
          {number}
        </p>
        <h2 className="mt-5 max-w-[22ch] text-[clamp(1.5rem,2.5vw,2rem)] leading-snug font-bold">
          {project.title}
        </h2>
        <p className="mt-4 max-w-[40ch] text-[0.9375rem] leading-[1.9] text-amber-ink">
          {project.description}
        </p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <p className="text-[0.8125rem] text-amber-ink">
          {project.tags.join(" · ")}
        </p>
        <p className="shrink-0 text-[0.9375rem] font-bold">
          作品を開く <span aria-hidden="true">→</span>
        </p>
      </div>
    </Link>
  );
}
