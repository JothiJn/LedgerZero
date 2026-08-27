'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import StatusPill from '@/components/StatusPill';
import EmptyState from '@/components/EmptyState';
import { FileText } from 'lucide-react';
import { fetchExtractedItems, fetchInvoices } from '@/lib/data';
import { ExtractedItem, Invoice, InvoiceStatus } from '@/lib/types';

export default function ReportsPage() {
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchExtractedItems(), fetchInvoices()]).then(([i, inv]) => {
      setItems(i);
      setInvoices(inv);
      setLoading(false);
    });
  }, []);

  const rows = items
    .map((item) => ({ ...item, invoice: invoices.find((i) => i.id === item.invoice_id) }))
    .filter((r) => !statusFilter || r.invoice?.status === statusFilter);

  function exportCSV() {
    const header = 'Item,Quantity,Unit,CO2e,Status,Date';
    const lines = rows.map((r) =>
      [r.item_description, r.quantity, r.unit, r.calculated_co2e ?? '', r.invoice?.status ?? '', r.created_at.slice(0, 10)].join(',')
    );
    const blob = new Blob([`${header}\n${lines.join('\n')}`], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ledgerzero-report.csv';
    a.click();
  }

  return (
    <>
      <Header title="Reports" />
      <div className="p-8">
        <div className="flex gap-2.5 mb-4.5 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
            className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm bg-white"
          >
            <option value="">All statuses</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Processed</option>
            <option>Failed</option>
          </select>
          <button onClick={exportCSV} className="bg-teal text-white px-4.5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-darker">
            Export CSV
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={FileText} title="No records for this filter" description="Try a different status filter, or upload documents from the Import page." />
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Item', 'Qty', 'Unit', 'CO2e', 'Invoice status', 'Date'].map((h) => (
                  <th key={h} className="text-left text-gray-600 font-bold text-[11.5px] uppercase tracking-wide py-2.5 px-3 border-b-2 border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">{r.item_description}</td>
                  <td className="p-3">{r.quantity}</td>
                  <td className="p-3">{r.unit}</td>
                  <td className="p-3">{r.calculated_co2e?.toLocaleString(undefined, { maximumFractionDigits: 1 }) ?? '—'}</td>
                  <td className="p-3">{r.invoice && <StatusPill status={r.invoice.status} />}</td>
                  <td className="p-3">{r.created_at.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
