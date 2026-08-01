import React, { useState } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Globe,
  Radio,
  Thermometer,
  ShieldCheck,
  RotateCw,
  PauseCircle,
  Wrench,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
} from 'lucide-react';
import { PanelSettings } from '../types';

interface NodeItem {
  id: string;
  name: string;
  location: string;
  flag: string;
  cpuPercent: number;
  ramUsageGB: number;
  ramMaxGB: number;
  storageGB: number;
  storageMaxGB: number;
  networkInMbps: number;
  networkOutMbps: number;
  dockerStatus: 'Online' | 'Restarting' | 'Maintenance' | 'Offline';
  uptimeDays: number;
  temperatureC: number;
  healthScore: number;
  ipAddress: string;
  isMaintenance?: boolean;
}

interface NodeManagerViewProps {
  settings: PanelSettings;
}

export const NodeManagerView: React.FC<NodeManagerViewProps> = ({ settings }) => {
  const [nodes, setNodes] = useState<NodeItem[]>([
    {
      id: 'node-us-east',
      name: 'US-East-Primary-01',
      location: 'Ashburn, VA (USA)',
      flag: '🇺🇸',
      cpuPercent: 18,
      ramUsageGB: 12.4,
      ramMaxGB: 64,
      storageGB: 140,
      storageMaxGB: 1000,
      networkInMbps: 240,
      networkOutMbps: 580,
      dockerStatus: 'Online',
      uptimeDays: 42,
      temperatureC: 38,
      healthScore: 99,
      ipAddress: '192.168.1.10',
    },
    {
      id: 'node-eu-central',
      name: 'EU-Central-Frankfurt',
      location: 'Frankfurt, DE (Germany)',
      flag: '🇩🇪',
      cpuPercent: 32,
      ramUsageGB: 28.1,
      ramMaxGB: 64,
      storageGB: 320,
      storageMaxGB: 1000,
      networkInMbps: 410,
      networkOutMbps: 890,
      dockerStatus: 'Online',
      uptimeDays: 18,
      temperatureC: 41,
      healthScore: 98,
      ipAddress: '192.168.2.14',
    },
    {
      id: 'node-asia-tokyo',
      name: 'ASIA-East-Tokyo-02',
      location: 'Tokyo, JP (Japan)',
      flag: '🇯🇵',
      cpuPercent: 11,
      ramUsageGB: 8.2,
      ramMaxGB: 32,
      storageGB: 95,
      storageMaxGB: 500,
      networkInMbps: 120,
      networkOutMbps: 210,
      dockerStatus: 'Online',
      uptimeDays: 9,
      temperatureC: 36,
      healthScore: 100,
      ipAddress: '192.168.3.8',
    },
  ]);

  const [terminalNode, setTerminalNode] = useState<NodeItem | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[Docker Daemon] Connected to unix:///var/run/docker.sock',
    '[Node Monitor] Healthcheck ping success - 0ms packet loss',
    '[Cgroup Manager] Memory limit enforced per container instance',
  ]);

  const handleToggleMaintenance = (id: string) => {
    setNodes(prev =>
      prev.map(n => {
        if (n.id === id) {
          const nextMaint = !n.isMaintenance;
          return {
            ...n,
            isMaintenance: nextMaint,
            dockerStatus: nextMaint ? 'Maintenance' : 'Online',
          };
        }
        return n;
      })
    );
  };

  const handleRestartNode = (node: NodeItem) => {
    setTerminalLogs(prev => [
      ...prev,
      `[Node Control] Requesting graceful restart on daemon daemon://${node.ipAddress}:2375...`,
      `[Docker Engine] Restarting containers on ${node.name}...`,
      `[Node Control] Node ${node.name} online & healthy!`,
    ]);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded uppercase">
              Infrastructure
            </span>
            <span className="text-xs text-slate-400 font-mono">3 Global Bare-Metal Clusters</span>
          </div>
          <h1 className="text-xl font-black text-white font-mono uppercase tracking-wider mt-1">
            Global Node Cluster Manager
          </h1>
          <p className="text-xs text-slate-400">
            Monitor Docker daemon health, host hardware temperature, network throughput, and execute remote cluster maintenance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-1.5 cursor-pointer">
            <Server className="w-4 h-4" />
            <span>Deploy New Node</span>
          </button>
        </div>
      </div>

      {/* Nodes Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="glass-card p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all space-y-4 relative overflow-hidden"
          >
            {/* Top Node Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{node.flag}</span>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm font-mono flex items-center gap-1.5">
                    {node.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-400" /> {node.location}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  node.dockerStatus === 'Online' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  node.dockerStatus === 'Maintenance' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  Docker {node.dockerStatus}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">IP: {node.ipAddress}</span>
              </div>
            </div>

            {/* Hardware Metrics Progress Bars */}
            <div className="space-y-3 font-mono text-xs">
              {/* CPU */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-purple-400" /> CPU Allocation
                  </span>
                  <span className="text-slate-200 font-bold">{node.cpuPercent}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all"
                    style={{ width: `${node.cpuPercent}%` }}
                  />
                </div>
              </div>

              {/* RAM */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-blue-400" /> RAM Memory
                  </span>
                  <span className="text-slate-200 font-bold">
                    {node.ramUsageGB} / {node.ramMaxGB} GB
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{ width: `${(node.ramUsageGB / node.ramMaxGB) * 100}%` }}
                  />
                </div>
              </div>

              {/* Storage */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-teal-400" /> NVMe SSD Storage
                  </span>
                  <span className="text-slate-200 font-bold">
                    {node.storageGB} / {node.storageMaxGB} GB
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-400 h-full transition-all"
                    style={{ width: `${(node.storageGB / node.storageMaxGB) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Health, Temp & Network Row */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 text-[9px] block uppercase">Uptime</span>
                <span className="text-slate-200 font-bold">{node.uptimeDays} Days</span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] block uppercase">Temp</span>
                <span className={`font-bold flex items-center justify-center gap-0.5 ${
                  node.temperatureC > 60 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  <Thermometer className="w-3 h-3" /> {node.temperatureC}°C
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[9px] block uppercase">Health Score</span>
                <span className="text-purple-400 font-bold">{node.healthScore}/100</span>
              </div>
            </div>

            {/* Node Actions Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleRestartNode(node)}
                className="py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-xl text-[11px] font-mono text-slate-200 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <RotateCw className="w-3 h-3 text-purple-400" /> Restart
              </button>

              <button
                onClick={() => handleToggleMaintenance(node.id)}
                className={`py-1.5 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer border ${
                  node.isMaintenance
                    ? 'bg-amber-600/30 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Wrench className="w-3 h-3 text-amber-400" /> Maint
              </button>

              <button
                onClick={() => setTerminalNode(node)}
                className="py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 text-purple-300 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <Terminal className="w-3 h-3 text-purple-400" /> Terminal
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Terminal Modal */}
      {terminalNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-3xl bg-[#0f0f17] border border-purple-500/40 rounded-2xl shadow-2xl p-5 space-y-4 glass-panel">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="font-mono font-bold text-sm text-slate-100">
                  Live Terminal: {terminalNode.name} ({terminalNode.ipAddress})
                </h3>
              </div>
              <button
                onClick={() => setTerminalNode(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 space-y-1 h-64 overflow-y-auto border border-slate-800">
              {terminalLogs.map((log, idx) => (
                <div key={idx}>&gt; {log}</div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTerminalNode(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
