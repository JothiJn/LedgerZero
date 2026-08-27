// Types mirror the real Supabase schema exactly. Do not add fields that
// don't exist in the DB (e.g. no `scope`) — see README for schema gaps.

export type InvoiceStatus = 'Pending' | 'Processing' | 'Processed' | 'Failed';

export interface Invoice {
  id: string;
  user_id: string | null;
  file_url: string;
  status: InvoiceStatus;
  total_co2e: number;
  created_at: string;
  updated_at: string;
}

export interface EmissionFactor {
  id: string;
  item_name: string;
  factor: number;
  unit: string;
  source: string | null;
  created_at: string;
}

export interface ExtractedItem {
  id: string;
  invoice_id: string;
  item_description: string;
  quantity: number;
  unit: string;
  calculated_co2e: number | null;
  created_at: string;
}
