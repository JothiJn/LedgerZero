// Central data-access layer. Every page imports from here instead of calling
// Supabase directly, so there is exactly one place that knows about
// isDemoMode vs. real queries.

import { supabase, isDemoMode, STORAGE_BUCKET } from './supabase';
import { demoInvoices, demoExtractedItems, demoEmissionFactors } from './demoData';
import { Invoice, ExtractedItem, EmissionFactor } from './types';

export async function fetchInvoices(): Promise<Invoice[]> {
  if (isDemoMode) return [...demoInvoices];
  const { data, error } = await supabase!
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Invoice[];
}

export async function fetchInvoice(id: string): Promise<Invoice | undefined> {
  if (isDemoMode) return demoInvoices.find((i) => i.id === id);
  const { data, error } = await supabase!.from('invoices').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Invoice;
}

export async function fetchExtractedItems(invoiceId?: string): Promise<ExtractedItem[]> {
  if (isDemoMode) {
    return invoiceId
      ? demoExtractedItems.filter((e) => e.invoice_id === invoiceId)
      : [...demoExtractedItems];
  }
  let query = supabase!.from('extracted_items').select('*').order('created_at', { ascending: false });
  if (invoiceId) query = query.eq('invoice_id', invoiceId);
  const { data, error } = await query;
  if (error) throw error;
  return data as ExtractedItem[];
}

export async function fetchEmissionFactors(): Promise<EmissionFactor[]> {
  if (isDemoMode) return [...demoEmissionFactors];
  const { data, error } = await supabase!.from('emission_factors').select('*').order('item_name');
  if (error) throw error;
  return data as EmissionFactor[];
}

// Uploads directly to Supabase Storage (anon key), then inserts a `Pending`
// row into `invoices`. In demo mode, simulates the same shape locally.
export async function uploadInvoice(
  file: File,
  userId: string | null
): Promise<Invoice> {
  if (isDemoMode) {
    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      user_id: userId,
      file_url: file.name,
      status: 'Pending',
      total_co2e: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoInvoices.unshift(invoice);
    return invoice;
  }

  const path = `${userId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase!.storage.from(STORAGE_BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase!.storage.from(STORAGE_BUCKET).getPublicUrl(path);

  const { data, error } = await supabase!
    .from('invoices')
    .insert({ user_id: userId, file_url: urlData.publicUrl, status: 'Pending' })
    .select()
    .single();
  if (error) throw error;

  // Trigger the Python Backend Webhook
  const webhookUrl = '/api/webhook/ledgerzero-ingest';
  
  if (webhookUrl) {
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: data.id,
          file_url: urlData.publicUrl,
        }),
      });

      if (!webhookResponse.ok) {
        console.error('Webhook failed:', webhookResponse.statusText);
      }
    } catch (webhookErr) {
      console.error('Warning: Failed to trigger backend webhook', webhookErr);
    }
  }

  return data as Invoice;
}

export async function retryInvoice(id: string): Promise<void> {
  if (isDemoMode) {
    const inv = demoInvoices.find((i) => i.id === id);
    if (inv) inv.status = 'Pending';
    return;
  }
  const { error } = await supabase!.from('invoices').update({ status: 'Pending' }).eq('id', id);
  if (error) throw error;
}

// Demo-only: fakes the n8n pipeline advancing a Pending invoice through to
// Processed, so the realtime-style UI can be exercised without a backend.
export function simulateDemoPipeline(id: string, onUpdate: (inv: Invoice) => void) {
  if (!isDemoMode) return;
  setTimeout(() => {
    const inv = demoInvoices.find((i) => i.id === id);
    if (inv) { inv.status = 'Processing'; onUpdate({ ...inv }); }
  }, 1400);
  setTimeout(() => {
    const inv = demoInvoices.find((i) => i.id === id);
    if (inv) {
      inv.status = 'Processed';
      inv.total_co2e = Math.round(Math.random() * 900 + 150);
      onUpdate({ ...inv });
    }
  }, 3600);
}
