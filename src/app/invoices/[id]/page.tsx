'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import { fetchInvoice, fetchExtractedItems } from '@/lib/data';
import { Invoice, ExtractedItem } from '@/lib/types';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);
  const [items, setItems] = useState<ExtractedItem[]>([]);

  useEffect(() => {
    fetchInvoice(params.id).then((inv) => setInvoice(inv ?? null));
    fetchExtractedItems(params.id).then(setItems);
  }, [params.id]);

  if (invoice === undefined) return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  if (invoice === null) return <div className="p-8 text-sm text-red-600">Invoice not found.</div>;

  return (
    <>
      <Header title={invoice.file_url} />
      <div className="p-8 max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-[10px] p-6">
          <Stepper status={invoice.status} />
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Item', 'Qty', 'Unit', 'CO2e'].map((h) => (
                  <th key={h} className="text-left text-gray-600 font-bold text-[11.5px] uppercase tracking-wide py-2.5 px-3 border-b-2 border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-gray-400">
                    No extracted items yet — still processing.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="p-3">{item.item_description}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3">{item.calculated_co2e?.toLocaleString(undefined, { maximumFractionDigits: 1 }) ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
