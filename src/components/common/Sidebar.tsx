import React from 'react';
import {
  LayoutDashboard,
  Users,
  QrCode,
  MessageSquare,
  Settings,
  Server,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivePage } from '../../types';

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, unreadTotal, sessions, currentUser } = useApp();

  const connectedCount = sessions.filter((s) => s.status === 'connected').length;

  const navItems: {
    id: ActivePage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    sublabel?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      sublabel: 'Traffic & KPIs',
    },
    {
      id: 'chat',
      label: 'Live Chat Inbox',
      icon: MessageSquare,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
      badgeColor: 'bg-emerald-500 text-white',
      sublabel: 'Team Multi-Chat',
    },
    {
      id: 'whatsapp-channels',
      label: 'Add WhatsApp',
      icon: QrCode,
      badge: `${connectedCount} Online`,
      badgeColor: 'bg-emerald-950 text-emerald-400 border border-emerald-700/50',
      sublabel: 'QR Scanner & Devices',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      sublabel: 'Roles & Access',
      badge: currentUser?.role === 'super_admin' ? 'Admin' : undefined,
      badgeColor: 'bg-purple-950 text-purple-300 border border-purple-800/50',
    },
    {
      id: 'settings',
      label: 'Settings & Bots',
      icon: Settings,
      sublabel: 'Auto-reply & Templates',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 select-none">
      <div className="p-4 space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-left">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      {item.sublabel && (
                        <div
                          className={`text-[10px] ${
                            isActive ? 'text-emerald-100' : 'text-slate-500'
                          }`}
                        >
                          {item.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Server & Gateway Health Widget */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gateway Engine</span>
            </div>
            <span className="flex items-center text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
              99.98%
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between text-[11px]">
              <span>Active Sockets:</span>
              <span className="text-slate-200 font-medium">{connectedCount} Active</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Multi-Device Sync:</span>
              <span className="text-emerald-400 font-medium flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-0.5 inline" /> Operational
              </span>
            </div>
          </div>

          <button
            onClick={() => setActivePage('whatsapp-channels')}
            className="w-full text-center text-xs py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            Manage Channels →
          </button>
        </div>
      </div>

      {/* Role & User Footer Pill */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 truncate">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="truncate">Node: Jakarta-01</span>
          </div>
          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
            TLS 1.3
          </span>
        </div>
      </div>
    </aside>
  );
};
