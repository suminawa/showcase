import { ProjectCard } from "@/components/hub/ProjectCard";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Showcase</h1>
        <p className="mt-3 text-lg text-neutral-500">
          Things I&apos;ve built. 口で説明するより、見た方が早い。
        </p>
      </header>
      <section className="mt-16 grid gap-6 sm:grid-cols-2" aria-label="作品一覧">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </section>
    </main>
  );
}
