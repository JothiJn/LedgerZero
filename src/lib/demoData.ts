import { Invoice, EmissionFactor, ExtractedItem } from './types';

// In-memory demo data, shaped exactly like the real schema. Used only when
// isDemoMode is true (no Supabase env vars configured). Mutated in place so
// the demo pipeline simulation (see UploadDropzone) can update it live.

export const demoInvoices: Invoice[] = [
  { id: 'inv-1', user_id: 'demo-user', file_url: 'diesel-delivery-mar.pdf', status: 'Processed', total_co2e: 842.5, created_at: '2024-03-02', updated_at: '2024-03-02' },
  { id: 'inv-2', user_id: 'demo-user', file_url: 'steel-order-q1.pdf', status: 'Processed', total_co2e: 1220.0, created_at: '2024-02-18', updated_at: '2024-02-18' },
  { id: 'inv-3', user_id: 'demo-user', file_url: 'electricity-bill-feb.pdf', status: 'Processed', total_co2e: 1874.2, created_at: '2024-02-05', updated_at: '2024-02-05' },
  { id: 'inv-4', user_id: 'demo-user', file_url: 'freight-invoice-jan.pdf', status: 'Processing', total_co2e: 0, created_at: '2024-04-10', updated_at: '2024-04-10' },
  { id: 'inv-5', user_id: 'demo-user', file_url: 'packaging-order.pdf', status: 'Failed', total_co2e: 0, created_at: '2024-04-09', updated_at: '2024-04-09' },
];

export const demoExtractedItems: ExtractedItem[] = [
  { id: 'ei-1', invoice_id: 'inv-1', item_description: 'Delivery Truck (Diesel)', quantity: 82, unit: 'km', calculated_co2e: 842.5, created_at: '2024-03-02' },
  { id: 'ei-2', invoice_id: 'inv-2', item_description: 'Steel', quantity: 1000, unit: 'kg', calculated_co2e: 1220.0, created_at: '2024-02-18' },
  { id: 'ei-3', invoice_id: 'inv-3', item_description: 'Grid Electricity', quantity: 4200, unit: 'kWh', calculated_co2e: 1874.2, created_at: '2024-02-05' },
];

export const demoEmissionFactors: EmissionFactor[] = [
  { id: 'ef-1', item_name: 'Beef Production', factor: 60.0, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-2', item_name: 'Aluminum', factor: 11.0, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-3', item_name: 'Steel', factor: 1.85, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-4', item_name: 'Cement', factor: 0.85, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-5', item_name: 'Food Waste (Landfill)', factor: 2.5, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-6', item_name: 'Plastic (PET)', factor: 2.55, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-7', item_name: 'Hard Coal (Anthracite)', factor: 2.72, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-8', item_name: 'Diesel / Fuel Oil', factor: 3.15, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-9', item_name: 'Petrol / Gasoline', factor: 3.10, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-10', item_name: 'Natural Gas', factor: 2.75, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
  { id: 'ef-11', item_name: 'LPG (Propane/Butane)', factor: 3.00, unit: 'kgCO2e/kg', source: 'Database Average', created_at: '2024-01-01' },
];
