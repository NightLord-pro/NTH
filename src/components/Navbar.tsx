import React, { useState } from 'react';
import { ServerState, ServerMetrics, PanelSettings, ServerInstance } from '../types';
import { getThemeStyles, getSidebarBgClass } from '../utils/theme';
import {
  Play,
  Square,
  RotateCw,
  Skull,
  Terminal,
  Activity,
  Package,
  Folder,
  Users,
  Settings,
  Layers,
  Sliders,
  Copy,
  Check,
  Globe,
  Archive,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Plus,
  Server,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  serverState: ServerState;
  metrics: ServerMetrics | null;
  onServerAction: (action: 'start' | 'stop' | 'restart' | 'kill') => void;
  settings: PanelSettings;
  serverInstances?: ServerInstance[];
  activeServerId?: string;
  onSelectServer?: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  serverState,
  metrics,
  onServerAction,
  settings,
  serverInstances = [],
  activeServerId = 'srv-default',
  onSelectServer,
}) => {
  const [copied, setCopied] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const theme = getThemeStyles(settings.themeColor);
  const hudTransparent = settings.hudTransparent ?? true;

  const currentInstance = serverInstances.find((s) => s.id === activeServerId) || {
    id: activeServerId,
    name: settings.serverName || 'NightHost (NTH)',
    software: settings.activeSoftware || 'Paper',
    version: settings.activeVersion || '1.21.4',
    port: 25565,
  };

  const getBadgeColor = (state: ServerState) => {
    switch (state) {
      case 'RUNNING':
        return `${theme.bgActive} ${theme.badgeText} ${theme.borderActive} ${theme.glowShadow}`;
      case 'STARTING':
      case 'STOPPING':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse';
      case 'CRASHED':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
      case 'STOPPED':
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const navItems = [
    { id: 'console', label: 'Console', icon: Terminal },
    { id: 'servers', label: 'Server Hub (Nodes)', icon: Server },
    { id: 'versions', label: 'Versions Manager', icon: Layers },
    { id: 'worlds', label: 'World Manager', icon: Globe },
    { id: 'players', label: 'Player Manager', icon: Users },
    { id: 'backups', label: 'Backup & Restore', icon: Archive },
    { id: 'metrics', label: 'Metrics & JVM', icon: Activity },
    { id: 'plugins', label: 'Plugins & Catalog', icon: Package },
    { id: 'files', label: 'File Explorer', icon: Folder },
    { id: 'config', label: 'Server Properties', icon: Settings },
    { id: 'settings', label: 'Panel Settings', icon: Sliders },
  ];


  const handleCopyAddress = () => {
    if (settings.serverAddress) {
      navigator.clipboard.writeText(settings.serverAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderLogo = () => {
    if (settings.logoUrl) {
      return (
        <div className="relative group shrink-0">
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${theme.textGradient} rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300`}></div>
          <img
            src={settings.logoUrl}
            alt="Server Logo"
            className="relative w-11 h-11 rounded-xl object-cover border border-slate-700/80 shadow-md bg-slate-950"
          />
        </div>
      );
    }

    return (
      <div className="relative group shrink-0">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${theme.textGradient} rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300`}></div>
        <div className={`relative w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black text-xl border ${theme.borderActive} shadow-inner`}>
          <span className={`bg-gradient-to-tr ${theme.textGradient} bg-clip-text text-transparent font-sans tracking-tight`}>
            N
          </span>
        </div>
      </div>
    );
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between space-y-6">
      {/* Top Branding Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {renderLogo()}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-slate-100 text-sm sm:text-base tracking-tight truncate">
                {settings.serverName || 'NightHost (NTH)'}
              </h1>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold ${theme.bgActive} ${theme.textPrimary} border ${theme.borderActive} rounded uppercase tracking-wider flex items-center gap-0.5 shrink-0`}>
                <Sparkles className={`w-2.5 h-2.5 ${theme.textPrimary}`} /> NTH
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
              <span className={`${theme.textPrimary} font-semibold truncate`}>
                {settings.activeSoftware || 'Paper'} {settings.activeVersion || '1.21.4'}
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Server Instance Switcher (PufferPanel Style) */}
        <div className="relative">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="w-full bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-all cursor-pointer group shadow-inner"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-7 h-7 rounded-lg ${theme.bgActive} border ${theme.borderActive} flex items-center justify-center shrink-0`}>
                <Server className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-slate-500 font-mono uppercase block leading-none">
                  Active Server Node
                </span>
                <span className="text-xs font-bold text-slate-200 truncate block mt-0.5 group-hover:text-white">
                  {currentInstance.name}
                </span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Switcher Dropdown List */}
          {switcherOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl space-y-1 backdrop-blur-xl animate-fade-in">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 font-mono flex items-center justify-between">
                <span>Select Instance</span>
                <span className="text-emerald-400">{serverInstances.length} Available</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                {serverInstances.map((srv) => {
                  const isCur = srv.id === activeServerId;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => {
                        if (onSelectServer) onSelectServer(srv.id);
                        setSwitcherOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                        isCur
                          ? `${theme.bgActive} ${theme.textPrimary} font-bold border ${theme.borderActive}`
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block truncate font-sans font-semibold">{srv.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {srv.software} • :{srv.port}
                        </span>
                      </div>
                      {isCur && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setActiveTab('servers');
                  setSwitcherOpen(false);
                }}
                className={`w-full py-2 px-2.5 mt-1 rounded-lg ${theme.bgSolid} ${theme.bgSolidHover} text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Server Instances Manager</span>
              </button>
            </div>
          )}
        </div>

        {/* Server Address Pill & Status Badge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleCopyAddress}
              className="flex-1 text-slate-200 hover:text-white bg-slate-950/80 hover:bg-slate-900 px-2.5 py-1.5 rounded-xl text-xs font-mono border border-slate-800 flex items-center justify-between cursor-pointer transition-all backdrop-blur-sm group"
              title="Click to copy server address"
            >
              <span className="truncate text-slate-300 font-medium">{settings.serverAddress || 'localhost:25565'}</span>
              {copied ? <Check className={`w-3.5 h-3.5 ${theme.textPrimary} shrink-0 ml-1`} /> : <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0 ml-1" />}
            </button>

            <div className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shrink-0 ${getBadgeColor(serverState)}`}>
              <span className={`w-2 h-2 rounded-full ${
                serverState === 'RUNNING' ? 'bg-emerald-400 animate-ping' :
                serverState === 'STARTING' || serverState === 'STOPPING' ? 'bg-amber-400' :
                serverState === 'CRASHED' ? 'bg-rose-400' : 'bg-slate-400'
              }`} />
              <span>{serverState}</span>
            </div>
          </div>
        </div>

        {/* Server Power Control Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onServerAction('start')}
              disabled={serverState === 'RUNNING' || serverState === 'STARTING'}
              className={`px-3 py-2 ${theme.bgSolid} ${theme.bgSolidHover} disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed border ${theme.borderActive}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>

            <button
              onClick={() => onServerAction('restart')}
              disabled={serverState === 'STOPPED' || serverState === 'STOPPING'}
              className="px-3 py-2 bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950/40 active:scale-95 cursor-pointer disabled:cursor-not-allowed border border-indigo-500/30"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onServerAction('stop')}
              disabled={serverState === 'STOPPED' || serverState === 'STOPPING'}
              className="col-span-2 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 active:scale-95 cursor-pointer disabled:cursor-not-allowed border border-amber-500/30"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>

            <button
              onClick={() => onServerAction('kill')}
              className="px-2 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800/60 text-rose-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-md shadow-rose-950/40 active:scale-95 cursor-pointer"
              title="Force Kill Process"
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Kill</span>
            </button>
          </div>

          {/* Discord Community Link */}
          <a
            href="https://discord.gg/DURnWu87CZ"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-3 py-2 bg-[#5865F2]/80 hover:bg-[#5865F2] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5865F2]/20 active:scale-95 cursor-pointer border border-[#7983f5]/50 group"
            title="Join NightHost Official Discord Community"
          >
            <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,0,106,106,0,0,0,22.77,8.07C2.79,37.56-2.61,66.33,1,94.75a105.73,105.73,0,0,0,32.17,16.24,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a73.57,73.57,0,0,0,64.68,0c.87.69,1.76,1.37,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.24c4.32-34.19-7-62.61-26.27-86.68ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.87,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.11,53,91.08,65.69,84.69,65.69Z"/>
            </svg>
            <span>NightHost Discord</span>
          </a>
        </div>
      </div>

      {/* Main Vertical Navigation Menu */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1 font-mono">
          Navigation Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileOpen(false);
              }}
              className={`w-full px-3 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-between transition-all cursor-pointer ${
                isActive
                  ? `${theme.bgActive} ${theme.badgeText} border ${theme.borderActive} shadow-md backdrop-blur-md`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? theme.textPrimary : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <div className={`w-1.5 h-1.5 rounded-full ${theme.bgSolid} shadow-sm`} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Metrics Performance Widget */}
      {metrics && (
        <div className={`${hudTransparent ? 'bg-slate-950/70 border-slate-800/80 backdrop-blur-md' : 'bg-slate-950 border-slate-800'} border rounded-2xl p-3 space-y-2 text-xs font-mono shadow-inner`}>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans font-bold uppercase border-b border-slate-800/60 pb-1.5">
            <span>Live Metrics</span>
            <span className={`${theme.textPrimary} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${theme.bgSolid} animate-pulse`} /> Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 text-[10px] block">CPU Usage</span>
              <span className="text-slate-200 font-bold">{metrics.cpuPercent}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">TPS</span>
              <span className={`font-bold ${metrics.tps >= 19 ? theme.textPrimary : 'text-amber-400'}`}>
                {metrics.tps}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Memory</span>
              <span className="text-slate-200 font-bold">
                {(metrics.memoryUsageMB / 1024).toFixed(1)}GB / {(metrics.memoryMaxMB / 1024).toFixed(1)}GB
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Players</span>
              <span className={`${theme.textPrimary} font-bold`}>
                {metrics.onlinePlayers} / {metrics.maxPlayers}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside className={`hidden md:flex flex-col w-72 h-screen sticky top-0 ${getSidebarBgClass(hudTransparent)} z-30 p-4 shrink-0 overflow-y-auto`}>
        {renderSidebarContent()}
      </aside>

      {/* Mobile Header Bar */}
      <div className={`md:hidden sticky top-0 z-40 ${hudTransparent ? 'bg-slate-900/90 backdrop-blur-xl' : 'bg-slate-900'} border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-xl`}>
        <div className="flex items-center gap-2.5">
          {renderLogo()}
          <div>
            <h1 className="font-bold text-slate-100 text-sm truncate max-w-[150px]">
              {settings.serverName || 'NightHost (NTH)'}
            </h1>
            <div className={`flex items-center gap-1.5 text-[10px] font-mono ${theme.textPrimary}`}>
              <span>{serverState}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-start">
          <div className={`w-80 max-w-[85vw] h-full ${hudTransparent ? 'bg-slate-900/95 backdrop-blur-xl' : 'bg-slate-900'} border-r border-slate-800 p-4 overflow-y-auto flex flex-col justify-between shadow-2xl animate-fade-in`}>
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase">Menu & Controls</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarContent()}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
};
