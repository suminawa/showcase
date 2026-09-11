import s from "./heroCircles.module.css";

/**
 * ヒーローの背景。淡い円が三つ、ゆっくり漂う。
 * JS を使わない（CSS だけ）ので、サーバー部品のまま置ける。
 * 減速の設定（prefers-reduced-motion: reduce）のときは animation が付かず、止まった円だけが残る。
 * className には位置と切り取り（overflow: hidden）を持つページ側のクラスを渡す。
 */
export function HeroCircles({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className={`${s.circle} ${s.one}`} />
      <div className={`${s.circle} ${s.two}`} />
      <div className={`${s.circle} ${s.three}`} />
    </div>
  );
}
