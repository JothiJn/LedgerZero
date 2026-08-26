import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { isDemoMode } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'LedgerZero',
  description: 'Carbon accounting for SMBs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            {isDemoMode && (
              <div className="bg-amber-100 text-amber-800 text-xs font-semibold text-center py-1.5">
                Demo Mode — no Supabase project configured. Showing local mock data. See .env.local.example.
              </div>
            )}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
