'use client';

import Link from 'next/link';
import { Invoice } from '@/lib/types';
import StatusPill from './StatusPill';
import { retryInvoice, deleteInvoice } from '@/lib/data';
import { useState } from 'react';

function getShortFileName(fileUrl: string): string {
  try {
    // Extract just the filename from the full Supabase storage URL
    const parts = fileUrl.split('/');
    let filename = parts[parts.length - 1];
    // Remove the timestamp prefix (e.g., "1787842043090-")
    const dashIdx = filename.indexOf('-');
    if (dashIdx > 0 && dashIdx < 20) {
      filename = filename.substring(dashIdx + 1);
    }
    // Decode URL encoding
    filename = decodeURIComponent(filename);
    // Truncate if still too long
    if (filename.length > 35) {
      filename = filename.substring(0, 32) + '...';
    }
    return filename;
  } catch {
    return 'invoice-file';
  }
}

export default function InvoiceTable({
  invoices,
  onRetried,
  onDeleted,
}: {
  invoices: Invoice[];
  onRetried: (id: string) => void;
  onDeleted: (id: string) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  async function handleRetry(id: string) {
    setRetryingId(id);
    try {
      await retryInvoice(id);
      onRetried(id);
    } finally {
      setRetryingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteInvoice(id);
      onDeleted(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (invoices.length === 0) {
    return <div className="text-sm text-gray-400 py-6">No invoices uploaded yet.</div>;
  }

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          {['File', 'Status', 'Total CO2e', 'Uploaded', ''].map((h) => (
            <th key={h || 'actions'} className="text-left text-gray-600 font-bold text-[11.5px] uppercase tracking-wide py-2.5 px-3 border-b-2 border-gray-200">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id} className={`border-b border-gray-100 hover:bg-gray-50 ${deletingId === inv.id ? 'opacity-40' : ''}`}>
            <td className="p-3 max-w-[250px]">
              <Link href={`/invoices/${inv.id}`} className="text-teal hover:underline font-medium" title={inv.file_url}>
                📄 {getShortFileName(inv.file_url)}
              </Link>
              {(inv.status === 'Pending' || inv.status === 'Processing') && (
                <div className="text-[11px] text-amber-600 mt-0.5 animate-pulse">
                  ⏳ {inv.status === 'Pending' ? 'Queued for processing...' : 'AI is extracting data...'}
                </div>
              )}
            </td>
            <td className="p-3">
              <StatusPill status={inv.status} />
              {inv.status === 'Failed' && (
                <button
                  onClick={() => handleRetry(inv.id)}
                  disabled={retryingId === inv.id}
                  className="text-teal text-xs font-semibold ml-2 hover:underline disabled:opacity-50"
                >
                  {retryingId === inv.id ? 'Retrying...' : 'Retry'}
                </button>
              )}
            </td>
            <td className="p-3">
              {inv.status === 'Processed' ? `${inv.total_co2e.toLocaleString(undefined, { maximumFractionDigits: 1 })} tCO2e` : '—'}
            </td>
            <td className="p-3">{inv.created_at.slice(0, 10)}</td>
            <td className="p-3">
              <button
                onClick={() => handleDelete(inv.id)}
                disabled={deletingId === inv.id}
                className="text-red-400 hover:text-red-600 text-xs font-semibold hover:underline disabled:opacity-50"
                title="Delete this invoice"
              >
                {deletingId === inv.id ? 'Deleting...' : '✕ Remove'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
