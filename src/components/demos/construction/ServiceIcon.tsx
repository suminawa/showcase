import type { ServiceId } from "./services";
import s from "./parts.module.css";

/**
 * 対応メニュー 6 つの自作アイコン。写真も外部の画像も使わないので、線だけで描く。
 * 図は飾りなので aria-hidden ── 意味は隣の見出しが文字で持つ。
 */
export function ServiceIcon({
  id,
  className,
}: {
  id: ServiceId;
  className?: string;
}) {
  return (
    <svg
      className={className ? `${s.serviceIcon} ${className}` : s.serviceIcon}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {id === "leak" ? (
        <>
          <path d="M4 8h4v5H4z" />
          <path d="M8 10h8a4 4 0 0 1 4 4v2" />
          <path d="M23 27c-2.2 0-4-1.7-4-3.8 0-2.4 4-7.2 4-7.2s4 4.8 4 7.2c0 2.1-1.8 3.8-4 3.8Z" />
        </>
      ) : null}
      {id === "clog" ? (
        <>
          <path d="M7 4v10a9 9 0 0 0 18 0V4" />
          <path d="M4 4h6M22 4h6" />
          <path d="M12 18h8M13 23h6M14 28h4" />
        </>
      ) : null}
      {id === "water-heater" ? (
        <>
          <path d="M8 4h16v18H8z" />
          <path d="M12 26v3M20 26v3" />
          <path d="M16 9c2.5 2.3 3.5 3.9 3.5 5.5A3.5 3.5 0 0 1 16 18a3.5 3.5 0 0 1-3.5-3.5c0-1.6 1-3.2 3.5-5.5Z" />
        </>
      ) : null}
      {id === "outlet" ? (
        <>
          <path d="M6 5h20v22H6z" />
          <path d="M13 12v8M19 12v8" />
          <path d="M10 5V2M22 5V2" />
        </>
      ) : null}
      {id === "panel" ? (
        <>
          <path d="M4 5h24v22H4z" />
          <path d="M4 12h24" />
          <path d="M10 16v7M16 16v7M22 16v7" />
        </>
      ) : null}
      {id === "aircon" ? (
        <>
          <path d="M3 6h26v9H3z" />
          <path d="M8 11h16" />
          <path d="M9 20c0 2 2 2 2 4M16 20c0 2.5 2 2.5 2 5M23 20c0 2 2 2 2 4" />
        </>
      ) : null}
    </svg>
  );
}
