import { InvoiceStatus } from '@/lib/types';

const STYLES: Record<InvoiceStatus, string> = {
  Pending: 'bg-gray-100 text-gray-600',
  Processing: 'bg-amber-100 text-amber-700',
  Processed: 'bg-emerald-100 text-emerald-700',
  Failed: 'bg-red-100 text-red-700',
};

export default function StatusPill({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STYLES[status]}`}>
      {status}
    </span>
  );
}
