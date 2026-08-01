import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Cpu,
  HardDrive,
  Zap,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { PanelSettings } from '../types';

interface AnalyticsViewProps {
  settings: PanelSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ settings }) => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Simulated telemetry historical timelines
  const cpuData = [
    { time: '00:00', cpu: 12, ram: 1.2, network: 120, tps: 20, players: 1, revenue: 450 },
    { time: '04:00', cpu: 8, ram: 1.1, network: 80, tps: 20, players: 0, revenue: 480 },
    { time: '08:00', cpu: 22, ram: 2.1, network: 340, tps: 19.9, players: 5, revenue: 520 },
    { time: '12:00', cpu: 45, ram: 3.4, network: 780, tps: 19.8, players: 14, revenue: 680 },
    { time: '16:00', cpu: 62, ram: 3.8, network: 1100, tps: 19.5, players: 20, revenue: 840 },
    { time: '20:00', cpu: 38, ram: 2.9, network: 650, tps: 20, players: 11, revenue: 790 },
    { time: '24:00', cpu: 15, ram: 1.5, network: 190, tps: 20, players: 3, revenue: 810 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-purple-500/30 rgb-glow">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase">
              Real-time Telemetry
            </span>
            <span className="text-xs text-slate-400 font-mono">InfluxDB Time-Series Engine</span>
          </div>
          <h1 className="text-xl font-black text-white font-mono uppercase tracking-wider mt-1">
            Performance, TPS & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Interactive multi-metric historical charts for server CPU load, heap garbage collection, packet throughput & player activity.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 font-mono text-xs">
          {(['1h', '24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                timeRange === r ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: CPU & RAM Timeline */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <h3 className="font-mono font-bold text-xs text-slate-200 uppercase">
                CPU Load vs Memory Allocation
              </h3>
            </div>
            <span className="text-[10px] text-purple-400 font-mono">Max 4.0 GB Heap</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="anCpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6d28d9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f17', borderColor: '#6d28d9', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#6d28d9" fill="url(#anCpuGrad)" />
                <Area type="monotone" dataKey="ram" name="RAM (GB)" stroke="#3b82f6" fillOpacity={0.2} fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: TPS & Tick Latency */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="font-mono font-bold text-xs text-slate-200 uppercase">
                Server TPS & Tick Latency
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Target: 20.0 TPS</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cpuData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis domain={[18, 20.5]} stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f17', borderColor: '#10b981', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="tps" name="Ticks Per Second" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Network Throughput */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="font-mono font-bold text-xs text-slate-200 uppercase">
                Network Throughput (Mbps)
              </h3>
            </div>
            <span className="text-[10px] text-blue-400 font-mono">10 Gbps Uplink</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cpuData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f17', borderColor: '#3b82f6', borderRadius: '12px' }} />
                <Bar dataKey="network" name="Bandwidth Mbps" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Online Player Activity */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="font-mono font-bold text-xs text-slate-200 uppercase">
                Concurrent Player Count Timeline
              </h3>
            </div>
            <span className="text-[10px] text-amber-400 font-mono">Peak: 20 Players</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f17', borderColor: '#f59e0b', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="players" name="Players Online" stroke="#f59e0b" fill="url(#plGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
