'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import UploadDropzone from '@/components/UploadDropzone';
import InvoiceTable from '@/components/InvoiceTable';
import { fetchInvoices } from '@/lib/data';
import { supabase, isDemoMode } from '@/lib/supabase';
import { Invoice } from '@/lib/types';

// Demo user id — replace with the real authenticated user's id once
// Supabase Auth is wired up (see README "Auth" section).
const DEMO_USER_ID = 'demo-user';

export default function ImportPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices().then((data) => {
      setInvoices(data);
      setLoading(false);
    });

    // Realtime subscription: keeps status pills live as n8n processes
    // documents, with no polling. No-ops automatically in demo mode.
    if (!isDemoMode && supabase) {
      const channel = supabase
        .channel('invoices-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoices' },
          (payload) => {
            setInvoices((prev) => {
              const updated = payload.new as Invoice;
              const exists = prev.some((i) => i.id === updated.id);
              return exists
                ? prev.map((i) => (i.id === updated.id ? updated : i))
                : [updated, ...prev];
            });
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }
  }, []);

  function handleUploaded(invoice: Invoice, isUpdate?: boolean) {
    setInvoices((prev) => {
      if (isUpdate) return prev.map((i) => (i.id === invoice.id ? invoice : i));
      return [invoice, ...prev];
    });
  }

  function handleRetried(id: string) {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'Pending' } : i)));
  }

  return (
    <>
      <Header title="Import" />
      <div className="p-8">
        <UploadDropzone userId={DEMO_USER_ID} onUploaded={handleUploaded} />
        <div className="text-[15px] font-bold mb-3.5">Recent uploads</div>
        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : (
          <InvoiceTable invoices={invoices} onRetried={handleRetried} />
        )}
      </div>
    </>
  );
}
