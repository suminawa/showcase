/** ベイ（カテゴリ区画）のラベルペイン */
export function CategoryLabel({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`pane flex items-end p-[clamp(20px,3vw,32px)] ${className}`}
    >
      <p className="font-display text-[0.8125rem] font-semibold tracking-[0.14em] uppercase">
        {label}
      </p>
    </div>
  );
}
