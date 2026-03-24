'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Flag, Map, 
  Vote, UserCheck, Activity, Shield, 
  FileText, LogOut, AlertOctagon, BookOpen,
  Lock
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'CONTENT', type: 'header' },
  { label: 'Candidates', icon: Users, href: '/candidates' },
  { label: 'Parties', icon: Flag, href: '/parties' },
  { label: 'Constituencies', icon: Map, href: '/constituencies' },
  { label: 'Issues', icon: AlertOctagon, href: '/issues' },
  { label: 'Manifestos', icon: BookOpen, href: '/manifestos' },
  { label: 'VOTING', type: 'header' },
  { label: 'Elections', icon: Vote, href: '/elections' },
  { label: 'Voters', icon: UserCheck, href: '/voters' },
  { label: 'Counting Center', icon: Lock, href: '/counting' },
  { label: 'Votes Monitor', icon: Activity, href: '/votes' },
  { label: 'SYSTEM', type: 'header' },
  { label: 'Booth Officers', icon: Shield, href: '/officers' },
  { label: 'Audit Logs', icon: FileText, href: '/audit' },
];


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-gray-400 flex flex-col z-50">
      <div className="p-6">
        <h1 className="text-2xl font-black text-orange-500 tracking-tighter uppercase">eLoktantra</h1>
        <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mt-1">Admin Control V2.0</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {navItems.map((item, idx) => {
          if (item.type === 'header') {
            return (
              <div key={idx} className="pt-6 pb-2 px-3 text-[10px] font-bold text-gray-600 tracking-widest uppercase">
                {item.label}
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = pathname.startsWith(item.href!);

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all
                ${isActive ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'hover:bg-white/5 hover:text-white border border-transparent'}
              `}
            >
              <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-orange-500' : 'text-gray-500 group-hover:text-white'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 mb-2">
          <div className="text-xs font-bold text-gray-400 truncate">admin@eloktantra.gov</div>
          <div className="text-[10px] text-gray-600 font-bold uppercase mt-1">System Administrator</div>
        </div>
      </div>
    </aside>
  );
}
