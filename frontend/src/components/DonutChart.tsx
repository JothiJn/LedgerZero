// Pure presentational component — no hooks, safe as a server or client child.
// Center label is a flex-column stack so it can never overlap, at any digit count.
const COLORS = ['#8B1E3F', '#6B2C91', '#E08E2A', '#2F8F6E', '#1B7F7A'];

export default function DonutChart({
  segments,
  total,
  unit,
}: {
  segments: { label: string; value: number }[];
  total: number;
  unit: string;
}) {
  let cumulative = 0;
  const stops = segments
    .map((s, i) => {
      const pct = total ? (s.value / total) * 100 : 0;
      const start = cumulative;
      cumulative += pct;
      return `${COLORS[i % COLORS.length]} ${start}% ${cumulative}%`;
    })
    .join(', ');

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-[190px] h-[190px] shrink-0">
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(${stops || '#E4E6E6 0% 100%'})`,
            WebkitMask: 'radial-gradient(circle, transparent 62px, #000 63px)',
            mask: 'radial-gradient(circle, transparent 62px, #000 63px)',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[22px] font-extrabold text-gray-800 leading-tight">
            {total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">{unit}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {segments.length ? (
          segments.map((s, i) => {
            const pct = total ? ((s.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={s.label} className="flex items-center gap-2 text-sm text-gray-800">
                <span className="w-2.5 h-2.5 rounded shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                {s.label} <span className="text-gray-400 text-xs">({pct}%)</span>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-400">No processed invoices yet</div>
        )}
      </div>
    </div>
  );
}
