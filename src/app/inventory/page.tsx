'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Boxes } from 'lucide-react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { fetchExtractedItems, fetchInvoices } from '@/lib/data';
import { ExtractedItem, Invoice } from '@/lib/types';

// This page was the one broken by the missing 'use client' directive in the
// original bug report. It is fixed here: the page itself is a Client
// Component because it uses useEffect/useState to fetch data.
export default function InventoryPage() {
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [query, setQuery] = useState('');
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
    .filter((r) => !query || r.item_description.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <Header title="Inventory" />
      <div className="p-8">
        <input
          type="text"
          placeholder="Search line items..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm max-w-xs mb-4.5"
        />

        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Boxes} title="No line items match" description="Line items appear here once documents finish AI extraction." />
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Item', 'Qty', 'Unit', 'CO2e', 'Source invoice', 'Date'].map((h) => (
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
                  <td className="p-3">
                    <Link href={`/invoices/${r.invoice_id}`} className="text-teal hover:underline">
                      {r.invoice?.file_url ?? '—'}
                    </Link>
                  </td>
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
