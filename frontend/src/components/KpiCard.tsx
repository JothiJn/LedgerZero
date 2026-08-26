export default function KpiCard({
  label,
  sublabel,
  value,
  unit,
  delta,
  pending,
}: {
  label: string;
  sublabel: string;
  value: string;
  unit: string;
  delta?: { direction: 'up' | 'down'; text: string };
  pending?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-[10px] px-5 py-4.5">
      <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">{label}</div>
      <div className="text-xs text-gray-400 italic mt-0.5 mb-3">{sublabel}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[26px] font-extrabold text-teal">{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
      {delta && (
        <div className={`text-xs font-semibold mt-2 ${delta.direction === 'down' ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta.direction === 'down' ? '↓' : '↑'} {delta.text}
        </div>
      )}
      {pending && (
        <div className="text-[11.5px] text-gray-400 bg-gray-100 px-2 py-1 rounded mt-1.5 inline-block">
          {pending}
        </div>
      )}
    </div>
  );
}
