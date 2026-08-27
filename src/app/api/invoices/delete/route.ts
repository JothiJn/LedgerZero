import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return NextResponse.json({ error: 'Missing invoice_id' }, { status: 400 });
    }

    // 1. Get invoice to find file path
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('file_url')
      .eq('id', invoice_id)
      .single();

    // 2. Delete extracted items for this invoice
    await supabaseAdmin
      .from('extracted_items')
      .delete()
      .eq('invoice_id', invoice_id);

    // 3. Delete the invoice row
    await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('id', invoice_id);

    // 4. Try to delete the file from storage
    if (invoice?.file_url) {
      try {
        // Extract storage path from the public URL
        const urlParts = invoice.file_url.split('/storage/v1/object/public/invoices/');
        if (urlParts.length === 2) {
          const storagePath = decodeURIComponent(urlParts[1]);
          await supabaseAdmin.storage.from('invoices').remove([storagePath]);
        }
      } catch (_) { /* ignore storage cleanup errors */ }
    }

    return NextResponse.json({ status: 'deleted' });
  } catch (err: any) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
