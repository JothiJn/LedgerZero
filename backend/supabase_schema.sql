-- LedgerZero Supabase Schema
-- This script can be run directly in the Supabase SQL Editor by your database team.

-- 1. Create the invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Processed', 'Failed')),
    total_co2e NUMERIC(10, 4) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the emission_factors table (Database matching)
CREATE TABLE emission_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name TEXT NOT NULL UNIQUE, -- E.g., 'Delivery Truck (Diesel)', 'Steel'
    factor NUMERIC(10, 4) NOT NULL, -- E.g., 10.21
    unit TEXT NOT NULL,             -- E.g., 'kgCO2e/km'
    source TEXT,                    -- E.g., 'US EPA', 'DEFRA'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the extracted_items table (Optional but recommended for Audit-Trace UI)
CREATE TABLE extracted_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity NUMERIC(10, 4) NOT NULL,
    unit TEXT NOT NULL,
    calculated_co2e NUMERIC(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for the invoices table to protect SMB data
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);

-- Note: The n8n backend will use the Service Role Key, 
-- which automatically bypasses these RLS policies to perform updates.

-- 4. Create Storage Bucket and Policies
INSERT INTO storage.buckets (id, name, public) VALUES ('invoices', 'invoices', true) ON CONFLICT DO NOTHING;

CREATE POLICY "Allow anonymous uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices');
CREATE POLICY "Allow anonymous reads" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');

-- Fix invoices table for anonymous testing (Drop foreign key so we don't need real users)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;
CREATE POLICY "Allow anonymous inserts" ON invoices FOR INSERT WITH CHECK (true);
-- Overwrite previous restrictive select policy
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Allow anonymous selects" ON invoices FOR SELECT USING (true);


-- 5. Insert Real-World Seed Data (from standard emission databases)
INSERT INTO emission_factors (item_name, factor, unit, source) VALUES
    ('Beef Production', 60.0, 'kgCO2e/kg', 'Database Average'),
    ('Aluminum', 11.0, 'kgCO2e/kg', 'Database Average'),
    ('Steel', 1.85, 'kgCO2e/kg', 'Database Average'),
    ('Cement', 0.85, 'kgCO2e/kg', 'Database Average'),
    ('Food Waste (Landfill)', 2.5, 'kgCO2e/kg', 'Database Average'),
    ('Plastic (PET)', 2.55, 'kgCO2e/kg', 'Database Average'),
    ('Hard Coal (Anthracite)', 2.72, 'kgCO2e/kg', 'Database Average'),
    ('Diesel / Fuel Oil', 3.15, 'kgCO2e/kg', 'Database Average'),
    ('Petrol / Gasoline', 3.10, 'kgCO2e/kg', 'Database Average'),
    ('Natural Gas', 2.75, 'kgCO2e/kg', 'Database Average'),
    ('LPG (Propane/Butane)', 3.00, 'kgCO2e/kg', 'Database Average')
ON CONFLICT (item_name) DO NOTHING;
