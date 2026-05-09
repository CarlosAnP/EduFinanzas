export default function Progress({ value = 0, max = 100, color = 'emerald', size = 'md', showLabel = false, className = '' }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const isOver = value > max;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500',
    rose: 'bg-rose-500', violet: 'bg-violet-500', cyan: 'bg-cyan-500',
    orange: 'bg-orange-500', green: 'bg-green-500', slate: 'bg-slate-500',
  };
  const barColor = isOver ? 'bg-rose-500' : (colors[color] || colors.emerald);

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full ${heights[size]} overflow-hidden`}>
        <div
          className={`${barColor} ${heights[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
