import Link from "next/link";
import { projectHref, type Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={projectHref(project)}
      className="group block rounded-2xl border border-neutral-200 p-6 transition-colors hover:border-neutral-400"
    >
      <h2 className="text-xl font-semibold tracking-tight group-hover:underline">
        {project.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        {project.description}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
          >
            {tag}
          </li>
        ))}
      </ul>
    </Link>
  );
}
