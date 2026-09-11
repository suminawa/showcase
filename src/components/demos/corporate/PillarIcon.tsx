import type { PillarId } from "./services";

/**
 * 3 本柱の自作アイコン。写真も外部の画像も使わないので、線だけで描く。
 * 図は飾りなので aria-hidden ── 意味は隣の見出しが文字で持つ。
 */
export function PillarIcon({
  id,
  className,
}: {
  id: PillarId;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === "survey" ? (
        <>
          <path d="M4 12c3-3 5-3 8 0s5 3 8 0 5-3 8 0 5 3 8 0" />
          <path d="M20 17v12" />
          <path d="M15 24l5 5 5-5" />
          <path d="M10 34h20" />
        </>
      ) : null}
      {id === "monitoring" ? (
        <>
          <path d="M20 4v10" />
          <path d="M14 7h12" />
          <circle cx="20" cy="18" r="4" />
          <path d="M4 29c3-3 5-3 8 0s5 3 8 0 5-3 8 0 5 3 8 0" />
          <path d="M4 36c3-3 5-3 8 0s5 3 8 0 5-3 8 0 5 3 8 0" />
        </>
      ) : null}
      {id === "analysis" ? (
        <>
          <path d="M6 31V16M15 31V22M24 31V8M33 31V19" />
          <path d="M4 36h32" />
          <path d="M6 12l9-6 9 6 9-6" />
        </>
      ) : null}
    </svg>
  );
}
