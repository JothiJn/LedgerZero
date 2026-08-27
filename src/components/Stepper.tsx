import { InvoiceStatus } from '@/lib/types';

const STAGES = ['Pending', 'Processing', 'AI Extraction', 'Factor Match', 'Processed'];

export default function Stepper({ status }: { status: InvoiceStatus }) {
  const currentIdx =
    status === 'Failed' ? 1 : status === 'Processed' ? STAGES.length - 1 : status === 'Processing' ? 1 : 0;

  return (
    <div className="flex justify-between relative mb-6">
      <div className="absolute top-[13px] left-5 right-5 h-0.5 bg-gray-200 z-0" />
      {STAGES.map((label, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={label} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
            <div
              className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-bold text-white ${
                done ? 'bg-emerald-600' : active ? 'bg-teal' : 'bg-gray-200'
              }`}
            >
              {done ? '✓' : idx + 1}
            </div>
            <div className="text-[11px] text-gray-600 text-center">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
