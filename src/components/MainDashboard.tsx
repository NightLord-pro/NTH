import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Users,
  Play,
  Square,
  RotateCw,
  Skull,
  Terminal,
  Clock,
  Sparkles,
  Zap,
  Globe,
  Shield,
  Layers,
  BarChart3,
  ArrowUpRight,
  TrendingUp,
  Radio,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ServerState, ServerMetrics, PanelSettings, ServerInstance, ConsoleLog } from '../types';
import { getThemeStyles } from '../utils/theme';

interface MainDashboardProps {
  serverState: ServerState;
  metrics: ServerMetrics | null;
  settings: PanelSettings;
  serverInstances: ServerInstance[];
  logs: ConsoleLog[];
  onServerAction: (action: 'start' | 'stop' | 'restart' | 'kill') => void;
  onNavigate: (tab: string) => void;
  onSelectServer: (id: string) => void;
  currentUser?: any;
  onOpenQuickGuide?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  serverState,
  metrics,
  settings,
  serverInstances,
  logs,
  onServerAction,
  onNavigate,
  onSelectServer,
  currentUser,
}) => {
  const theme = getThemeStyles(settings.themeColor || 'violet');

  const isOwner = !currentUser || currentUser.role === 'Administrator' || currentUser.role === 'Owner';
  
  // Filter servers for regular members
  const memberServers = isOwner 
    ? serverInstances 
    : serverInstances.filter(s => s.assignedUser && s.assignedUser.toLowerCase() === currentUser?.username?.toLowerCase());

  const hasAssignedServer = isOwner || memberServers.length > 0;

  // Generate historical timeline data for Recharts
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cpu = metrics?.cpuPercent ?? Math.floor(Math.random() * 15 + 10);
    const ram = metrics ? +(metrics.memoryUsageMB / 1024).toFixed(2) : 1.2;
    const tps = metrics?.tps ?? 20;
    const players = metrics?.onlinePlayers ?? 2;

    setHistoryData(prev => {
      const next = [...prev, { time: timeStr, cpu, ram, tps, players }];
      if (next.length > 15) return next.slice(next.length - 15);
      return next;
    });
  }, [metrics]);

  const activeServerCount = memberServers.filter(s => s.status === 'RUNNING').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#0b0b0f] to-blue-950/40 rgb-glow">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" /> NTH Host v4.2
              </span>
              <span className="text-xs text-slate-400 font-mono">Docker Cluster: Healthy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back to <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">{settings.serverName || 'NightHost Panel'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              High-performance PaperMC 1.21.11 Minecraft hosting environment with zero-latency Docker nodes, real-time JVM metrics & instant auto-scaling.
            </p>
          </div>

          {/* Quick Power Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            {!hasAssignedServer && (
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg flex items-center gap-1">
                <Shield className="w-3 h-3" /> No Server Allocated
              </span>
            )}
            <button
              onClick={() => hasAssignedServer && onServerAction('start')}
              disabled={!hasAssignedServer || serverState === 'RUNNING' || serverState === 'STARTING'}
              title={!hasAssignedServer ? 'No server instance allocated to your account' : ''}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>
            <button
              onClick={() => hasAssignedServer && onServerAction('restart')}
              disabled={!hasAssignedServer || serverState === 'STOPPED'}
              title={!hasAssignedServer ? 'No server instance allocated to your account' : ''}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-950/50 cursor-pointer active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
            <button
              onClick={() => hasAssignedServer && onServerAction('stop')}
              disabled={!hasAssignedServer || serverState === 'STOPPED'}
              title={!hasAssignedServer ? 'No server instance allocated to your account' : ''}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-amber-950/50 cursor-pointer active:scale-95"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
            <button
              onClick={() => hasAssignedServer && onServerAction('kill')}
              disabled={!hasAssignedServer}
              title={!hasAssignedServer ? 'No server instance allocated to your account' : ''}
              className="px-2.5 py-2 bg-rose-950/80 hover:bg-rose-900 disabled:opacity-40 disabled:cursor-not-allowed text-rose-300 border border-rose-800/80 font-bold text-xs rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Kill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: CPU Usage */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">CPU Usage</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {metrics?.cpuPercent ?? 12}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics?.cpuPercent ?? 12)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: RAM Usage */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">RAM Usage</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {metrics ? (metrics.memoryUsageMB / 1024).toFixed(1) : '1.4'} <span className="text-xs text-slate-400">/ 4.0 GB</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-teal-400 h-full transition-all duration-500"
              style={{ width: `${metrics ? (metrics.memoryUsageMB / metrics.memoryMaxMB) * 100 : 35}%` }}
            />
          </div>
        </div>

        {/* Metric 3: TPS */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">Server TPS</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {metrics?.tps ?? '20.0'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Tick rate 100% optimal
          </div>
        </div>

        {/* Metric 4: Online Players */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">Online Players</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {metrics?.onlinePlayers ?? 2} <span className="text-xs text-slate-400">/ {metrics?.maxPlayers ?? 20}</span>
          </div>
          <div className="text-[10px] text-amber-400 font-mono">
            2 Players Active
          </div>
        </div>

        {/* Metric 5: Active Nodes */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">Active Nodes</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            3 <span className="text-xs text-slate-400">/ 3 Cluster</span>
          </div>
          <div className="text-[10px] text-cyan-400 font-mono">
            US-East, EU-Central, ASIA
          </div>
        </div>

        {/* Metric 6: Total Instances */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono font-bold uppercase">Servers Owned</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {serverInstances.length || 3}
          </div>
          <div className="text-[10px] text-purple-400 font-mono">
            {activeServerCount} Currently Running
          </div>
        </div>
      </div>

      {/* Main Grid: Performance Timeline Chart & Live Console Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Performance Timeline Graph */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold text-slate-100 text-sm font-mono uppercase tracking-wider">
                Live Resource Telemetry Timeline
              </h2>
            </div>
            <span className="text-[11px] text-purple-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> 1s Refresh Rate
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6d28d9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f0f17', borderColor: '#6d28d9', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#6d28d9" fillOpacity={1} fill="url(#cpuGrad)" />
                <Area type="monotone" dataKey="ram" name="RAM (GB)" stroke="#3b82f6" fillOpacity={1} fill="url(#ramGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Console Output Stream */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs text-slate-200 font-mono uppercase">
                Console Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigate('console')}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 cursor-pointer"
            >
              Full Terminal <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 bg-slate-950/90 rounded-xl p-3 font-mono text-[11px] space-y-1.5 overflow-y-auto max-h-56 text-slate-300 border border-slate-800/80">
            {logs.slice(-8).map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 leading-tight">
                <span className="text-slate-500 shrink-0 text-[10px]">{log.timestamp}</span>
                <span className={`break-all ${
                  log.type === 'error' ? 'text-rose-400 font-bold' :
                  log.type === 'warn' ? 'text-amber-300' :
                  log.text.includes('Done') || log.text.includes('Online') ? 'text-emerald-400 font-bold' : 'text-slate-300'
                }`}>
                  {log.text}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('console')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-xl text-xs text-purple-300 font-mono font-bold transition-all cursor-pointer text-center"
          >
            Type Commands & Access Terminal
          </button>
        </div>
      </div>

      {/* Member No-Server Allocation Alert */}
      {!isOwner && memberServers.length === 0 && (
        <div className="p-6 bg-slate-900/90 border border-amber-500/30 rounded-2xl text-center space-y-3 max-w-3xl mx-auto shadow-2xl">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-100 font-mono">
            No Minecraft Server Allocated to @{currentUser?.username || 'Member'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto font-sans leading-relaxed">
            By system security policy, newly registered member accounts start with <strong>0 assigned server instances</strong>.
            Please request the Panel Owner / Administrator (<span className="text-purple-300 font-bold">@admin</span>) to allocate a Minecraft server instance to your username.
          </p>
        </div>
      )}

      {/* Live Server Instances Grid */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-slate-100 text-sm font-mono uppercase tracking-wider">
              {isOwner ? 'All Managed Hosting Instances' : 'Your Assigned Server Instances'}
            </h2>
          </div>
          {isOwner && (
            <button
              onClick={() => onNavigate('servers')}
              className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Manage / Assign Servers
            </button>
          )}
        </div>

        {memberServers.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
            {isOwner ? 'No server instances created yet. Click "Manage / Assign Servers" to create one.' : 'No Minecraft server instance allocated to your account yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberServers.map((srv) => (
              <div
                key={srv.id}
                onClick={() => onSelectServer(srv.id)}
                className="glass-card p-4 rounded-xl border border-white/10 hover:border-purple-500/60 transition-all cursor-pointer group space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
                      MC
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 group-hover:text-purple-300 transition-colors">
                        {srv.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Port :{srv.port} • {srv.software} {srv.version}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    srv.status === 'RUNNING' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {srv.status}
                  </span>
                </div>

                {/* Server IP Connection Address Badge */}
                <div className="bg-slate-950/80 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg text-[11px] font-mono flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-slate-400 text-[10px]">Server IP:</span>
                    <span className="text-cyan-300 font-bold truncate">
                      {srv.serverAddress || `play.nighthost.in:${srv.port || 25565}`}
                    </span>
                  </div>
                </div>

                {/* Assigned User Badge */}
                <div className="flex items-center justify-between text-[10px] font-mono bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400">Assigned Owner:</span>
                  <span className="text-purple-300 font-bold">@{srv.assignedUser || 'admin'}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[9px] block uppercase">RAM</span>
                    <span className="text-slate-200 font-bold">{srv.maxRamGb}GB</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block uppercase">Players</span>
                    <span className="text-slate-200 font-bold">2 / {srv.maxPlayers}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block uppercase">Node</span>
                    <span className="text-blue-400 font-bold text-[10px] truncate block">{srv.nodeName || 'US-East'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
