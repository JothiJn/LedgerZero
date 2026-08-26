# LedgerZero Frontend

Complete Next.js (App Router) + TypeScript + Tailwind frontend for LedgerZero,
built directly against the real Supabase schema.

## Getting started

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

If you leave `.env.local` empty, the app runs in **Demo Mode** automatically:
every page falls back to in-memory mock data (`src/lib/demoData.ts`) shaped
exactly like the real tables, so the UI is fully browsable and interactive
(including a simulated upload -> processing -> processed pipeline) with zero
backend setup.

To connect your real Supabase project, fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=invoices
```
Only the **anon key** is ever used here — the service role key belongs
exclusively to the n8n backend and must never appear in this codebase.

## Project structure

```
src/
  app/
    layout.tsx              Root layout, sidebar shell, demo-mode banner
    dashboard/page.tsx       KPIs, donut chart, bar chart
    import/page.tsx          Upload + live status table (Realtime)
    inventory/page.tsx        extracted_items joined to invoices
    invoices/[id]/page.tsx    Document detail + pipeline stepper
    reports/page.tsx          Filterable table + CSV export
    factors/page.tsx          Emission factor library
    boundaries|target|simulation|request|status/page.tsx
                               Honest empty states (no backing tables yet)
  components/
    Sidebar.tsx, Header.tsx, KpiCard.tsx, DonutChart.tsx, BarChart.tsx,
    Stepper.tsx, StatusPill.tsx, EmptyState.tsx,
    UploadDropzone.tsx, InvoiceTable.tsx   (client components)
  lib/
    supabase.ts    Supabase client + isDemoMode flag
    types.ts        Types mirroring the real schema exactly
    data.ts          Single data-access layer (demo/live switch lives here)
    demoData.ts       In-memory mock data
```

## The bug this project fixes

The original build failed with:

```
You're importing a module that depends on `useEffect` into a React Server
Component module. ./src/app/inventory/page.tsx (1:10)
```

Next.js App Router treats every file under `app/` as a Server Component by
default. Any page or component using React hooks, browser APIs, or the
Supabase client directly must start with `'use client';`. Every data-driven
page in this project (`dashboard`, `import`, `inventory`, `reports`,
`factors`, `invoices/[id]`) is explicitly marked this way. The static empty
state pages (`boundaries`, `target`, `simulation`, `request`, `status`)
intentionally stay Server Components since they don't need hooks.

## Known schema gaps (do not fake this data)

The current schema has no `scope` column, no `organizations` table, and no
`reporting_periods` table. Every place this matters is marked in the code
with a `// TODO: schema gap` comment and rendered as an honest pending state
(see the Scope 1/2/3 KPI cards on the Dashboard, and the disabled org/period
selectors in the header) rather than invented numbers.

## Real schema (for reference)

```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    file_url TEXT NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Processed', 'Failed')),
    total_co2e NUMERIC(10, 4) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE emission_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name TEXT NOT NULL UNIQUE,
    factor NUMERIC(10, 4) NOT NULL,
    unit TEXT NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE extracted_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    quantity NUMERIC(10, 4) NOT NULL,
    unit TEXT NOT NULL,
    calculated_co2e NUMERIC(10, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);
```

## Auth

Real RLS depends on `auth.uid()`, which requires a real Supabase Auth
session. This project currently uses a placeholder `DEMO_USER_ID` in
`src/app/import/page.tsx` — swap this for the logged-in user's id from
`supabase.auth.getUser()` once login/signup screens are added.
