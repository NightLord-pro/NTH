import React, { useState } from 'react';
import { PanelSettings } from '../types';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Globe,
  Ban,
  CheckCircle2,
  Plus,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Sliders,
  Zap,
} from 'lucide-react';

interface FirewallViewProps {
  settings: PanelSettings;
}

interface BannedIp {
  id: string;
  ip: string;
  reason: string;
  dateAdded: string;
  source: string;
}

interface WhitelistedIp {
  id: string;
  ip: string;
  label: string;
  dateAdded: string;
}

interface FirewallRule {
  id: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'BOTH';
  service: string;
  status: 'ALLOWED' | 'BLOCKED' | 'RATE_LIMITED';
}

export const FirewallView: React.FC<FirewallViewProps> = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'bans' | 'whitelist' | 'ports' | 'logs'>('overview');
  
  // Security Toggles
  const [ddosProtection, setDdosProtection] = useState(true);
  const [vpnBlocking, setVpnBlocking] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [geoBlocking, setGeoBlocking] = useState(false);

  // Banned IPs list
  const [bannedIps, setBannedIps] = useState<BannedIp[]>([
    { id: '1', ip: '185.220.101.4', reason: 'Botnet SYN Flood Attack Attempt', dateAdded: '2026-07-29 14:22', source: 'Automated Shield' },
    { id: '2', ip: '45.154.255.82', reason: 'Repeated Invalid RCON Login Attempts', dateAdded: '2026-07-30 01:05', source: 'Auto-Ban Policy' },
    { id: '3', ip: '193.142.146.210', reason: 'Malicious Protocol Exploitation', dateAdded: '2026-07-30 02:40', source: 'Manual Admin' },
  ]);

  // Whitelisted IPs list
  const [whitelistedIps, setWhitelistedIps] = useState<WhitelistedIp[]>([
    { id: 'w1', ip: '127.0.0.1', label: 'Localhost Node Loopback', dateAdded: '2026-07-01' },
    { id: 'w2', ip: '192.168.1.100', label: 'Admin Management Workstation', dateAdded: '2026-07-15' },
  ]);

  // Firewall Port Rules
  const [portRules, setPortRules] = useState<FirewallRule[]>([
    { id: 'p1', port: 25565, protocol: 'BOTH', service: 'Minecraft Java Server Port', status: 'ALLOWED' },
    { id: 'p2', port: 19132, protocol: 'UDP', service: 'Geyser / Bedrock Crossplay Port', status: 'ALLOWED' },
    { id: 'p3', port: 8192, protocol: 'TCP', service: 'Votifier Vote Listener Port', status: 'ALLOWED' },
    { id: 'p4', port: 25575, protocol: 'TCP', service: 'RCON Remote Console Port', status: 'RATE_LIMITED' },
    { id: 'p5', port: 3306, protocol: 'TCP', service: 'MySQL Database Port', status: 'BLOCKED' },
  ]);

  // Modals / Form States
  const [newBanIp, setNewBanIp] = useState('');
  const [newBanReason, setNewBanReason] = useState('');
  const [newWhiteIp, setNewWhiteIp] = useState('');
  const [newWhiteLabel, setNewWhiteLabel] = useState('');

  // Add Banned IP
  const handleAddBan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanIp.trim()) return;
    setBannedIps(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        ip: newBanIp.trim(),
        reason: newBanReason.trim() || 'Manual IP Blacklist Rule',
        dateAdded: new Date().toISOString().slice(0, 16).replace('T', ' '),
        source: 'Manual Admin',
      }
    ]);
    setNewBanIp('');
    setNewBanReason('');
  };

  // Remove Banned IP
  const handleUnban = (id: string) => {
    setBannedIps(prev => prev.filter(b => b.id !== id));
  };

  // Add Whitelist IP
  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhiteIp.trim()) return;
    setWhitelistedIps(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        ip: newWhiteIp.trim(),
        label: newWhiteLabel.trim() || 'Custom Whitelisted IP',
        dateAdded: new Date().toISOString().slice(0, 10),
      }
    ]);
    setNewWhiteIp('');
    setNewWhiteLabel('');
  };

  // Remove Whitelisted IP
  const handleRemoveWhitelist = (id: string) => {
    setWhitelistedIps(prev => prev.filter(w => w.id !== id));
  };

  // Security Audit Log stream
  const securityLogs = [
    { time: '03:48:12', ip: '185.220.101.4', event: 'SYN Flood Request Dropped', action: 'BLOCKED', severity: 'HIGH' },
    { time: '03:41:05', ip: '45.154.255.82', event: 'Excessive RCON Auth Failure', action: 'AUTO-BAN', severity: 'HIGH' },
    { time: '03:30:22', ip: '104.28.192.12', event: 'VPN / Proxy Connection Detected', action: 'DENIED', severity: 'MEDIUM' },
    { time: '03:15:44', ip: '192.168.1.100', event: 'RCON Connection Authenticated', action: 'ALLOWED', severity: 'LOW' },
    { time: '02:59:01', ip: '82.102.23.44', event: 'Rate Limit (120 req/s) Exceeded', action: 'THROTTLED', severity: 'MEDIUM' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                  <span>NightHost Anti-DDoS & Firewall</span>
                  <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full font-mono font-bold uppercase">
                    Active Layer 7
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Real-time network packet inspection, IP banlist management, and threat filtering.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('bans')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === 'bans'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Banned IPs ({bannedIps.length})
            </button>
            <button
              onClick={() => setActiveSubTab('whitelist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === 'whitelist'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Whitelist ({whitelistedIps.length})
            </button>
            <button
              onClick={() => setActiveSubTab('ports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === 'ports'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Port Rules
            </button>
            <button
              onClick={() => setActiveSubTab('logs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSubTab === 'logs'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Security Logs
            </button>
          </div>
        </div>
      </div>

      {/* Security Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">DDoS Filter Status</span>
            <div className="text-base font-extrabold text-emerald-400 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{ddosProtection ? 'PROTECTED (10 Gbps)' : 'DISABLED'}</span>
            </div>
          </div>
          <button
            onClick={() => setDdosProtection(!ddosProtection)}
            className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
              ddosProtection ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {ddosProtection ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Threats Mitigated Today</span>
            <div className="text-xl font-extrabold text-slate-100 mt-1 font-mono">
              18,492 <span className="text-xs font-normal text-emerald-400">reqs</span>
            </div>
          </div>
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/30">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Active Banned IPs</span>
            <div className="text-xl font-extrabold text-rose-400 mt-1 font-mono">
              {bannedIps.length} <span className="text-xs text-slate-500">entries</span>
            </div>
          </div>
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/30">
            <Ban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">Proxy / VPN Shield</span>
            <div className="text-base font-extrabold text-purple-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>{vpnBlocking ? 'BLOCKING VPNs' : 'ALLOW ALL'}</span>
            </div>
          </div>
          <button
            onClick={() => setVpnBlocking(!vpnBlocking)}
            className={`px-3 py-1 text-xs font-bold font-mono rounded-lg transition-all cursor-pointer ${
              vpnBlocking ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {vpnBlocking ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Features & Policies Toggles */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> Security Policies & Shield Controls
              </span>
              <span className="text-xs text-slate-500 font-mono">Auto-saved to firewall.json</span>
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-200 flex items-center gap-2">
                    <span>Layer 7 HTTP / Minecraft Protocol DDoS Mitigation</span>
                    <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-400 rounded">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Filters fake handshake floods, ping attacks, and invalid packet bursts before reaching your server JVM.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={ddosProtection}
                  onChange={(e) => setDdosProtection(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                />
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-200">VPN & Anonymous Proxy Auto-Blocker</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Prevents banned players from bypassing bans using NordVPN, ExpressVPN, TOR nodes, or free proxies.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={vpnBlocking}
                  onChange={(e) => setVpnBlocking(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer shrink-0"
                />
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-200">Connection Rate-Limiting (Max 100 conns/min per IP)</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Automatically temporary-throttles IPs exceeding normal login query frequency to prevent bot joins.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={rateLimiting}
                  onChange={(e) => setRateLimiting(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 cursor-pointer shrink-0"
                />
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-200">Geo-IP Restricted ASN Filtering</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Restrict connections strictly to low-risk residential IP ranges and block datacenter ASN ranges.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={geoBlocking}
                  onChange={(e) => setGeoBlocking(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Real-time Threat Map & Live Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Firewall Traffic Engine
            </h3>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">NightHost Anycast DDoS Scrubbing Center</span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold block mt-0.5">Latency Impact: &lt; 1ms</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Traffic is routed through hardware-accelerated eBPF/XDP filters at the edge node before hitting the Minecraft server port.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Active Filtering Engine:</span>
                <span className="text-emerald-400 font-bold">XDP / eBPF Kernel</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>TCP SYN Cookie Mode:</span>
                <span className="text-blue-400 font-bold">Hardware Accelerated</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>UDP Scrubbing Capacity:</span>
                <span className="text-purple-400 font-bold">800 Gbps Peak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banned IPs Tab */}
      {activeSubTab === 'bans' && (
        <div className="space-y-6">
          {/* Add Ban Form */}
          <form onSubmit={handleAddBan} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-400" /> Add Custom IP Ban Rule
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="IP Address (e.g. 192.168.1.50)"
                value={newBanIp}
                onChange={(e) => setNewBanIp(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Griefing / Botting)"
                value={newBanReason}
                onChange={(e) => setNewBanReason(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-rose-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-950/40"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Ban IP Address</span>
              </button>
            </div>
          </form>

          {/* Banned IPs Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono">Banned IP Registry (banned-ips.json)</span>
              <span className="text-[11px] text-slate-400 font-mono">{bannedIps.length} active bans</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Date Added</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bannedIps.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-rose-400 flex items-center gap-1.5">
                        <Ban className="w-3.5 h-3.5 shrink-0" />
                        <span>{b.ip}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-sans">{b.reason}</td>
                      <td className="p-3.5 text-slate-400">{b.dateAdded}</td>
                      <td className="p-3.5 text-slate-400">
                        <span className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
                          {b.source}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleUnban(b.id)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer text-[11px] font-bold"
                          title="Unban IP"
                        >
                          Unban
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bannedIps.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                        No active IP bans. All clean!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Whitelist Tab */}
      {activeSubTab === 'whitelist' && (
        <div className="space-y-6">
          <form onSubmit={handleAddWhitelist} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Whitelist IP Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="IP Address (e.g. 192.168.1.10)"
                value={newWhiteIp}
                onChange={(e) => setNewWhiteIp(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Label (e.g. Admin Home Network)"
                value={newWhiteLabel}
                onChange={(e) => setNewWhiteLabel(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl px-4 py-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Add Whitelist</span>
              </button>
            </div>
          </form>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 font-mono">Whitelisted IP Addresses</span>
              <span className="text-[11px] text-slate-400 font-mono">{whitelistedIps.length} entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                  <tr>
                    <th className="p-3.5">IP Address</th>
                    <th className="p-3.5">Label</th>
                    <th className="p-3.5">Date Added</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {whitelistedIps.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{w.ip}</span>
                      </td>
                      <td className="p-3.5 text-slate-300 font-sans">{w.label}</td>
                      <td className="p-3.5 text-slate-400">{w.dateAdded}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleRemoveWhitelist(w.id)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                          title="Remove Whitelist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Port Rules Tab */}
      {activeSubTab === 'ports' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Network Port Forwarding & Filter Rules
          </h3>

          <div className="space-y-3">
            {portRules.map((rule) => (
              <div key={rule.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 bg-slate-800 text-emerald-400 font-bold rounded-lg border border-slate-700">
                    Port {rule.port} / {rule.protocol}
                  </div>
                  <div>
                    <span className="font-bold text-slate-200 block font-sans">{rule.service}</span>
                    <span className="text-[11px] text-slate-500 block">TCP/UDP Shield Rule Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    rule.status === 'ALLOWED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                    rule.status === 'RATE_LIMITED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    {rule.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Logs Tab */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Real-time Security Event Audit Stream
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Engine Stream
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                <tr>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Source IP</th>
                  <th className="p-3.5">Event Description</th>
                  <th className="p-3.5">Action Taken</th>
                  <th className="p-3.5 text-right">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {securityLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-slate-400">{log.time}</td>
                    <td className="p-3.5 font-bold text-slate-200">{log.ip}</td>
                    <td className="p-3.5 text-slate-300 font-sans">{log.event}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'BLOCKED' || log.action === 'AUTO-BAN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        log.action === 'THROTTLED' || log.action === 'DENIED' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold">
                      <span className={log.severity === 'HIGH' ? 'text-rose-400' : log.severity === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
