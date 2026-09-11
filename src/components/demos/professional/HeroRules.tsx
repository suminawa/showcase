import s from "./heroRules.module.css";

/**
 * ヒーローの背景の罫線。帳簿の罫を思わせる横罫と縦罫が、1 行ぶんずつ静かに流れる。
 * JS を使わない（CSS だけ）ので、サーバー部品のまま置ける ── canvas より軽い。
 * 減速の設定（prefers-reduced-motion: reduce）のときは animation が付かず、止まった罫だけが残る。
 * className には位置と切り取り（overflow: hidden）を持つページ側のクラスを渡す。
 */
export function HeroRules({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <div className={s.rules} />
    </div>
  );
}
