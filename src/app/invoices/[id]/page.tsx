'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Stepper from '@/components/Stepper';
import { fetchInvoice, fetchExtractedItems } from '@/lib/data';
import { supabase, isDemoMode } from '@/lib/supabase';
import { Invoice, ExtractedItem } from '@/lib/types';

function getShortFileName(fileUrl: string): string {
  try {
    const parts = fileUrl.split('/');
    let filename = parts[parts.length - 1];
    const dashIdx = filename.indexOf('-');
    if (dashIdx > 0 && dashIdx < 20) {
      filename = filename.substring(dashIdx + 1);
    }
    return decodeURIComponent(filename);
  } catch {
    return 'Invoice';
  }
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null | undefined>(undefined);
  const [items, setItems] = useState<ExtractedItem[]>([]);

  useEffect(() => {
    fetchInvoice(params.id).then((inv) => setInvoice(inv ?? null));
    fetchExtractedItems(params.id).then(setItems);

    // Listen for realtime updates so the stepper and items update live
    if (!isDemoMode && supabase) {
      const channel = supabase
        .channel(`invoice-${params.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'invoices', filter: `id=eq.${params.id}` },
          (payload) => setInvoice(payload.new as Invoice)
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'extracted_items', filter: `invoice_id=eq.${params.id}` },
          (payload) => setItems((prev) => [...prev, payload.new as ExtractedItem])
        )
        .subscribe();

      return () => { supabase?.removeChannel(channel); };
    }
  }, [params.id]);

  if (invoice === undefined) return <div className="p-8 text-sm text-gray-400">Loading...</div>;
  if (invoice === null) return <div className="p-8 text-sm text-red-600">Invoice not found.</div>;

  const isProcessing = invoice.status === 'Pending' || invoice.status === 'Processing';

  return (
    <>
      <Header title={getShortFileName(invoice.file_url)} />
      <div className="p-8 max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-[10px] p-6">
          <Stepper status={invoice.status} />

          {isProcessing && (
            <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 animate-pulse">
              ⏳ <strong>{invoice.status === 'Pending' ? 'Queued' : 'Processing'}:</strong>{' '}
              AI is analyzing your invoice. This usually takes a few seconds.
            </div>
          )}

          {invoice.status === 'Failed' && (
            <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              ❌ <strong>Processing failed.</strong> Please go back and use the Retry button, or re-upload the file.
            </div>
          )}

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
                    {isProcessing
                      ? 'Waiting for AI extraction results...'
                      : invoice.status === 'Failed'
                      ? 'No data extracted — processing failed.'
                      : 'No extracted items.'}
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
