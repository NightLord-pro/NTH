import React, { useState } from 'react';
import {
  Server,
  Shield,
  Cpu,
  HardDrive,
  Zap,
  Globe,
  Database,
  Terminal,
  FolderTree,
  Puzzle,
  RefreshCw,
  Send,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { PanelSettings } from '../types';
import { getThemeStyles } from '../utils/theme';

interface MemberNoServerGUIProps {
  currentUser: any;
  settings?: PanelSettings;
  onNavigate: (tab: string) => void;
}

export const MemberNoServerGUI: React.FC<MemberNoServerGUIProps> = ({
  currentUser,
  settings,
  onNavigate,
}) => {
  const [requestSent, setRequestSent] = useState(false);
  const [serverNameReq, setServerNameReq] = useState(`${currentUser?.username || 'Player'}'s SMP`);
  const [softwareReq, setSoftwareReq] = useState('PaperMC');
  const [ramReq, setRamReq] = useState('4GB');
  const [motdReq, setMotdReq] = useState('Welcome to my Minecraft Server!');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const theme = getThemeStyles(settings?.themeColor || 'violet');

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setRequestSent(false);
    }, 2000);
  };

  const hostingFeatures = [
    {
      icon: Terminal,
      title: 'Real-time Web Console',
      desc: 'Interactive live console with instant color-coded logs, auto-op tools, and quick macro commands.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      icon: FolderTree,
      title: 'Drag & Drop File Manager',
      desc: 'Upload, edit, unzip, and modify server configuration files directly in your browser with code highlighting.',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    },
    {
      icon: Puzzle,
      title: '1-Click Plugin & Mod Installer',
      desc: 'Search & install over 10,000+ plugins including EssentialsX, LuckPerms, Vault, WorldEdit, and ViaVersion.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      icon: Database,
      title: 'Automated Cloud Backups',
      desc: 'Scheduled automated backups with 1-click restore to keep your world data safe against corruption.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      icon: Globe,
      title: 'Custom Subdomains & Ports',
      desc: 'Connect using clean addresses like player.nighthost.me with instant SRV record auto-generation.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      icon: Shield,
      title: 'Path.net 2.4 Tbps DDoS Shield',
      desc: 'Always-on enterprise DDoS mitigation filtering malicious layer 4/7 attacks without ping spikes.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
  ];

  const nodeStats = [
    { name: 'Node 01 - US East (NVMe)', cpu: 'AMD Ryzen 9 7950X', ram: '128 GB DDR5', ping: '12ms', status: 'Online', uptime: '99.98%' },
    { name: 'Node 02 - EU Central (Frankfurt)', cpu: 'AMD EPYC 9654', ram: '256 GB ECC', ping: '28ms', status: 'Online', uptime: '100%' },
    { name: 'Node 03 - Asia Pacific (Singapore)', cpu: 'Intel Xeon Platinum', ram: '128 GB DDR4', ping: '45ms', status: 'Online', uptime: '99.95%' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950 border border-purple-500/30 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-xs font-mono font-bold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Member Hosting Portal
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-300">@{currentUser?.username || 'Member'}</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              You are signed in to <strong className="text-white">{settings?.serverName || 'NightHost Panel'}</strong>. Your account currently has <span className="text-amber-400 font-mono font-bold">0 assigned Minecraft server instances</span>. Once assigned by an Owner or Administrator, all management features will automatically unlock for you.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-2xl shadow-xl shadow-purple-950/80 border border-purple-400/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Request Server Instance</span>
            </button>
          </div>
        </div>

        {/* Current Allocation Alert Box */}
        <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 text-amber-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-100 block">Active Server Node: <span className="text-amber-400">None</span></span>
              <span className="text-slate-400 text-[11px] block">Contact Administrator <strong className="text-purple-300">@admin</strong> to bind a Minecraft server instance to your profile.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <a
              href="https://discord.gg/udUdNKzz7P"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Discord Support</span>
            </a>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">Role: Member</span>
          </div>
        </div>
      </div>

      {/* Hosting Features Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>High-Performance Hosting Features Included</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Powered by NightHost Core</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hostingFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all space-y-3 relative group"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-100 font-mono group-hover:text-purple-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Infrastructure Node Cluster Overview */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-100 uppercase">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>Cluster Infrastructure & Hardware Nodes</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> All Systems Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodeStats.map((node, i) => (
            <div key={i} className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                <span className="font-bold text-slate-200 truncate">{node.name}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] rounded-full font-bold">
                  {node.status}
                </span>
              </div>
              <div className="space-y-1.5 text-slate-400 text-[11px]">
                <div className="flex justify-between">
                  <span>Processor:</span>
                  <span className="text-slate-200 font-bold">{node.cpu}</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory Pool:</span>
                  <span className="text-slate-200 font-bold">{node.ram}</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className="text-cyan-400 font-bold">{node.ping}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-emerald-400 font-bold">{node.uptime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hosting Tiers Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Starter Plan */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">Free Member Tier</span>
              <h3 className="text-lg font-black text-white font-mono">Standard SMP Hosting</h3>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>

          <ul className="space-y-2 text-xs font-mono text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Up to 4GB DDR5 Dedicated RAM</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>20GB NVMe High-Speed Storage</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Paper / Purpur / Fabric / Forge Engines</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Free Custom Subdomain (`.nighthost.me`)</span>
            </li>
          </ul>

          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full py-2.5 bg-slate-800 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 font-mono font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Request Free Standard Allocation
          </button>
        </div>

        {/* Pro Plan */}
        <div className="glass-card p-6 rounded-2xl border border-purple-500/50 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 space-y-4 relative overflow-hidden">
          <div className="absolute top-3 right-3 px-2.5 py-0.5 bg-purple-600 text-white font-mono font-extrabold text-[10px] rounded-full uppercase tracking-wider">
            High Priority
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">PRO Member Tier</span>
            <h3 className="text-lg font-black text-white font-mono">Extreme Performance Node</h3>
          </div>

          <ul className="space-y-2 text-xs font-mono text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Up to 16GB Dedicated RAM</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Unlimited NVMe Enterprise Storage</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Dedicated Port & Priority CPU Threading</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Automated Daily Backups & VIP Discord Role</span>
            </li>
          </ul>

          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Apply for Pro Node Instance
          </button>
        </div>
      </div>

      {/* REQUEST SERVER MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono font-bold text-sm text-slate-100">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Submit Server Request to Administrator</span>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-slate-800 cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {requestSent ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-mono font-extrabold text-base text-slate-100">
                  Request Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
                  The panel administrator (<strong className="text-purple-300">@admin</strong>) has been notified. Your server instance will appear on your dashboard once approved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Requested Server Name</label>
                  <input
                    type="text"
                    value={serverNameReq}
                    onChange={(e) => setServerNameReq(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-300">Engine / Software</label>
                    <select
                      value={softwareReq}
                      onChange={(e) => setSoftwareReq(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="PaperMC">PaperMC (Recommended)</option>
                      <option value="Purpur">Purpur (High Performance)</option>
                      <option value="Fabric">Fabric (Modded)</option>
                      <option value="Forge">Forge (Modded)</option>

                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold text-slate-300">RAM Memory</label>
                    <select
                      value={ramReq}
                      onChange={(e) => setRamReq(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="2GB">2 GB RAM</option>
                      <option value="4GB">4 GB RAM</option>
                      <option value="8GB">8 GB RAM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">MOTD / Description</label>
                  <input
                    type="text"
                    value={motdReq}
                    onChange={(e) => setMotdReq(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg cursor-pointer"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
