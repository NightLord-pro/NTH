import React, { useState } from 'react';
import {
  Shield,
  Server,
  Users,
  HardDrive,
  Cpu,
  DollarSign,
  Ticket,
  Key,
  Bell,
  Wrench,
  Activity,
  Layers,
  Percent,
  Lock,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
} from 'lucide-react';
import { PanelSettings } from '../types';

interface AdminPanelProps {
  settings: PanelSettings;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'security' | 'notifications'>('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const stats = [
    { title: 'Total Users', value: '1,428', icon: Users, color: 'text-purple-400' },
    { title: 'Total Servers', value: '3,890', icon: Server, color: 'text-blue-400' },
    { title: 'Online Servers', value: '3,412', icon: CheckCircle2, color: 'text-emerald-400' },
    { title: 'Offline Servers', value: '478', icon: AlertTriangle, color: 'text-amber-400' },
    { title: 'Total Nodes', value: '12', icon: Globe, color: 'text-cyan-400' },
    { title: 'Active Backups', value: '14.2 TB', icon: HardDrive, color: 'text-teal-400' },
    { title: 'Monthly Revenue', value: '$18,450', icon: DollarSign, color: 'text-emerald-400' },
    { title: 'Open Tickets', value: '4', icon: Ticket, color: 'text-rose-400' },
  ];

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-purple-500/30 rgb-glow">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase">
              Root Administration
            </span>
            <span className="text-xs text-slate-400 font-mono">Panel Version 4.2.0</span>
          </div>
          <h1 className="text-xl font-black text-white font-mono uppercase tracking-wider mt-1">
            Enterprise Admin Control Center
          </h1>
          <p className="text-xs text-slate-400">
            Global system governance, resource quotas, API authorization tokens, cluster billing analytics & infrastructure controls.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              maintenanceMode
                ? 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>{maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card p-3 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[9px] font-mono font-bold uppercase truncate">{s.title}</span>
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Resource Allocation & Governance
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Plans, Coupons & Revenue
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          API Keys & Security Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Notifications & Broadcast
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-purple-400" /> Default Server Quotas
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Max RAM per instance (GB)
                </label>
                <input
                  type="number"
                  defaultValue={16}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Max CPU Allocation (% threads)
                </label>
                <input
                  type="number"
                  defaultValue={400}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Max NVMe Storage per server (GB)
                </label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-blue-400" /> Anti-DDoS & Security Mode
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">TCP BungeeGuard Enforcement</div>
                  <div className="text-[10px] text-slate-500">Prevent spoofed proxy handshake packets</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle cursor-pointer accent-purple-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">Strict Rate Limiting</div>
                  <div className="text-[10px] text-slate-500">Max 5 connections per IP per second</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle cursor-pointer accent-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 max-w-2xl font-mono text-xs">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Megaphone className="w-4 h-4 text-purple-400" /> Broadcast Global Alert to All Server Consoles
          </h3>
          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                In-Game & Panel Notification Message
              </label>
              <textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="[GLOBAL NOTICE] Maintenance scheduled tonight at 02:00 UTC..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 text-white font-bold rounded-xl cursor-pointer"
            >
              Dispatch Broadcast
            </button>

            {broadcastSent && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Message broadcasted to all connected server nodes!
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
