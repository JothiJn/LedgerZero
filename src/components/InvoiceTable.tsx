'use client';

import Link from 'next/link';
import { Invoice } from '@/lib/types';
import StatusPill from './StatusPill';
import { retryInvoice } from '@/lib/data';

export default function InvoiceTable({
  invoices,
  onRetried,
}: {
  invoices: Invoice[];
  onRetried: (id: string) => void;
}) {
  async function handleRetry(id: string) {
    await retryInvoice(id);
    onRetried(id);
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {['File', 'Status', 'Total CO2e', 'Uploaded'].map((h) => (
            <th key={h} className="text-left text-gray-600 font-bold text-[11.5px] uppercase tracking-wide py-2.5 px-3 border-b-2 border-gray-200">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="p-3">
              <Link href={`/invoices/${inv.id}`} className="text-teal hover:underline">
                {inv.file_url}
              </Link>
            </td>
            <td className="p-3">
              <StatusPill status={inv.status} />
              {inv.status === 'Failed' && (
                <button
                  onClick={() => handleRetry(inv.id)}
                  className="text-teal text-xs font-semibold ml-2 hover:underline"
                >
                  Retry
                </button>
              )}
            </td>
            <td className="p-3">
              {inv.status === 'Processed' ? `${inv.total_co2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e` : '—'}
            </td>
            <td className="p-3">{inv.created_at.slice(0, 10)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
