export default function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (!data.length) {
    return <div className="text-sm text-gray-400 py-10 text-center">No processed invoices yet</div>;
  }

  return (
    <div className="flex items-end gap-8 h-[220px] pt-5">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center justify-end h-full flex-1">
          <div className="text-xs font-bold text-gray-800 mb-1.5">
            {d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div
            className="w-[56%] bg-teal rounded-t"
            style={{ height: `${(d.value / max) * 160}px` }}
          />
          <div className="text-xs text-gray-600 mt-2">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
