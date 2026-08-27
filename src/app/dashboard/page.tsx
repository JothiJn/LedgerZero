'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import KpiCard from '@/components/KpiCard';
import DonutChart from '@/components/DonutChart';
import BarChart from '@/components/BarChart';
import { fetchInvoices } from '@/lib/data';
import { Invoice } from '@/lib/types';

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

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices().then(setInvoices).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="p-8 text-red-600 text-sm">Failed to load dashboard: {error}</div>;
  if (!invoices) return <div className="p-8 text-gray-400 text-sm">Loading dashboard...</div>;

  const processed = invoices.filter((i) => i.status === 'Processed');
  const total = processed.reduce((sum, i) => sum + i.total_co2e, 0);

  const byYear: Record<string, number> = {};
  processed.forEach((i) => {
    const year = i.created_at.slice(0, 4);
    byYear[year] = (byYear[year] || 0) + i.total_co2e;
  });
  const barData = Object.entries(byYear)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));

  const donutSegments = processed.map((i) => ({ label: getShortFileName(i.file_url), value: i.total_co2e }));

  return (
    <>
      <Header title="Dashboard">
        <select disabled title="TODO: schema gap - needs organizations table" className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm bg-white">
          <option>Acme Corp</option>
        </select>
        <select className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm bg-white">
          <option>All time</option>
        </select>
        <a href="/import" className="bg-teal text-white px-4.5 py-2.5 rounded-lg text-sm font-semibold hover:bg-teal-darker">
          + New Upload
        </a>
      </Header>

      <div className="p-8">
        <div className="grid grid-cols-5 gap-4 mb-6">
          <KpiCard
            label="Total"
            sublabel="Scope 1, 2 & 3"
            value={total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            unit="tCO2e"
            delta={{ direction: 'down', text: '4.8% vs last period' }}
          />
          <KpiCard label="Scope 1" sublabel="Direct combustion" value="-" unit="tCO2e" pending="Awaiting scope classification" />
          <KpiCard label="Scope 2" sublabel="Purchased electricity" value="-" unit="tCO2e" pending="Awaiting scope classification" />
          <KpiCard label="Scope 3 (Up)" sublabel="Upstream travel & waste" value="-" unit="tCO2e" pending="Awaiting scope classification" />
          <KpiCard label="Scope 3 (Down)" sublabel="Downstream logistics" value="-" unit="tCO2e" pending="Awaiting scope classification" />
        </div>

        <div className="grid grid-cols-[1fr_1.3fr] gap-4">
          <div className="bg-white border border-gray-200 rounded-[10px] p-5.5">
            <div className="flex justify-between items-center mb-4.5">
              <h3 className="text-[15.5px] font-bold">Emissions by Scope</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded" title="TODO: schema gap - needs scope column on emission_factors">
                Pending schema
              </span>
            </div>
            <DonutChart segments={donutSegments} total={total} unit="tCO2e" />
          </div>

          <div className="bg-white border border-gray-200 rounded-[10px] p-5.5">
            <div className="flex justify-between items-center mb-4.5">
              <h3 className="text-[15.5px] font-bold">Emissions Over Time</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded">tCO2e / year</span>
            </div>
            <BarChart data={barData} />
          </div>
        </div>
      </div>
    </>
  );
}
