'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';
import { fetchEmissionFactors } from '@/lib/data';
import { EmissionFactor } from '@/lib/types';

export default function FactorsPage() {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmissionFactors().then((data) => {
      setFactors(data);
      setLoading(false);
    });
  }, []);

  const rows = factors.filter((f) => !query || f.item_name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <Header title="Factor Library" />
      <div className="p-8">
        <input
          type="text"
          placeholder="Search emission factors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-200 rounded-lg px-3.5 py-2 text-sm max-w-xs mb-4.5"
        />

        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : rows.length === 0 ? (
          <EmptyState icon={Search} title="No matching factors" description="Try a different search term." />
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {['Item name', 'Factor', 'Unit', 'Source'].map((h) => (
                  <th key={h} className="text-left text-gray-600 font-bold text-[11.5px] uppercase tracking-wide py-2.5 px-3 border-b-2 border-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">{f.item_name}</td>
                  <td className="p-3">{f.factor}</td>
                  <td className="p-3">{f.unit}</td>
                  <td className="p-3">{f.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
