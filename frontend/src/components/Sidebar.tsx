'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity, LayoutGrid, FileText, Target, Waves, Mail,
  Upload, Boxes, LandPlot, Search,
} from 'lucide-react';

const NAV = [
  { href: '/status', label: 'Status Overview', icon: Activity },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/target', label: 'Target', icon: Target },
  { href: '/simulation', label: 'Simulation', icon: Waves },
  { href: '/request', label: 'Request', icon: Mail },
  { href: '/import', label: 'Import', icon: Upload },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/boundaries', label: 'Boundaries', icon: LandPlot },
  { href: '/factors', label: 'Factor Library', icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[250px] shrink-0 bg-teal-dark text-white flex flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5 font-bold text-lg border-b border-white/10">
        <span className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center text-sm">L</span>
        LedgerZero
      </div>

      <nav className="flex-1 p-2.5 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                active ? 'bg-teal font-semibold text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-xs text-white/55">
        <div>Want help?</div>
        <a href="#" className="block mt-1.5 text-white/70 hover:text-white">Contact support</a>
        <a href="#" className="block mt-1.5 text-white/70 hover:text-white">View help pages</a>
        <a href="#" className="block mt-1.5 text-white/70 hover:text-white">Software validation statement</a>
      </div>
    </aside>
  );
}
