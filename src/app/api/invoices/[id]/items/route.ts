import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Use admin client to bypass Row Level Security (RLS) which blocks anonymous reads by default
    const { data, error } = await supabaseAdmin
      .from('extracted_items')
      .select('*')
      .eq('invoice_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
