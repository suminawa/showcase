/**
 * 提案文や各媒体のリンクに付ける ?ref= の値。ここにある値だけを数える（知らない値・空は数えない）。
 * cw = CrowdWorks、lc = Lancers、cn = ココナラ、ほかは suminawa 名義の置き場。
 */
const REFS: ReadonlySet<string> = new Set(["cw", "lc", "cn", "yt", "yts", "x", "zenn", "line", "note", "booth"]);

/** ?ref= の値が数える対象ならその値、そうでなければ null */
export function arriveRef(search: string): string | null {
  const ref = new URLSearchParams(search).get("ref");
  return ref !== null && REFS.has(ref) ? ref : null;
}
