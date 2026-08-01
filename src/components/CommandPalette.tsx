import React, { useState, useEffect } from 'react';
import {
  Search,
  Terminal,
  Server,
  Layers,
  Globe,
  Users,
  Archive,
  Activity,
  Package,
  Folder,
  Settings,
  Sliders,
  Play,
  Square,
  RotateCw,
  ShoppingBag,
  Shield,
  X,
  Sparkles,
  Command,
  Clock,
  BookOpen,
} from 'lucide-react';
import { PanelSettings } from '../types';
import { getThemeStyles } from '../utils/theme';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onServerAction: (action: 'start' | 'stop' | 'restart' | 'kill') => void;
  onOpenQuickGuide?: () => void;
  settings: PanelSettings;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onServerAction,
  onOpenQuickGuide,
  settings,
}) => {
  const [query, setQuery] = useState('');
  const theme = getThemeStyles(settings.themeColor || 'violet');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger parent to open
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { id: 'start', label: 'Start Minecraft Server', category: 'Power Action', icon: Play, action: () => { onServerAction('start'); onClose(); } },
    { id: 'restart', label: 'Restart Minecraft Server', category: 'Power Action', icon: RotateCw, action: () => { onServerAction('restart'); onClose(); } },
    { id: 'stop', label: 'Stop Minecraft Server', category: 'Power Action', icon: Square, action: () => { onServerAction('stop'); onClose(); } },
    { id: 'guide', label: 'Open Panel Quick Guide & Instructions', category: 'Help & Docs', icon: BookOpen, action: () => { if (onOpenQuickGuide) onOpenQuickGuide(); onClose(); } },
    { id: 'nav-dashboard', label: 'Go to Main Dashboard', category: 'Navigation', icon: Activity, action: () => { onNavigate('dashboard'); onClose(); } },
    { id: 'nav-console', label: 'Open Terminal Console', category: 'Navigation', icon: Terminal, action: () => { onNavigate('console'); onClose(); } },
    { id: 'nav-firewall', label: 'Anti-DDoS Firewall & Security', category: 'Security', icon: Shield, action: () => { onNavigate('firewall'); onClose(); } },
    { id: 'nav-schedules', label: 'Task Scheduler & Cron Jobs', category: 'Automation', icon: Clock, action: () => { onNavigate('schedules'); onClose(); } },
    { id: 'nav-servers', label: 'Server Hub & Nodes', category: 'Navigation', icon: Server, action: () => { onNavigate('servers'); onClose(); } },
    { id: 'nav-nodes', label: 'Node Manager & Health', category: 'Navigation', icon: Server, action: () => { onNavigate('nodes'); onClose(); } },
    { id: 'nav-users', label: 'User & Permissions Manager', category: 'Navigation', icon: Users, action: () => { onNavigate('users'); onClose(); } },
    { id: 'nav-marketplace', label: 'Plugin & Mod Marketplace', category: 'Navigation', icon: ShoppingBag, action: () => { onNavigate('marketplace'); onClose(); } },
    { id: 'nav-analytics', label: 'Performance & Revenue Analytics', category: 'Navigation', icon: Activity, action: () => { onNavigate('analytics'); onClose(); } },
    { id: 'nav-admin', label: 'Admin Enterprise Control Panel', category: 'Navigation', icon: Shield, action: () => { onNavigate('admin'); onClose(); } },
    { id: 'nav-files', label: 'IDE File Explorer', category: 'Navigation', icon: Folder, action: () => { onNavigate('files'); onClose(); } },
    { id: 'nav-versions', label: 'Minecraft Versions & Software', category: 'Navigation', icon: Layers, action: () => { onNavigate('versions'); onClose(); } },
    { id: 'nav-plugins', label: 'Plugins Catalog', category: 'Navigation', icon: Package, action: () => { onNavigate('plugins'); onClose(); } },
    { id: 'nav-worlds', label: 'Worlds Manager', category: 'Navigation', icon: Globe, action: () => { onNavigate('worlds'); onClose(); } },
    { id: 'nav-backups', label: 'Backups & Restores', category: 'Navigation', icon: Archive, action: () => { onNavigate('backups'); onClose(); } },
    { id: 'nav-settings', label: 'Panel Appearance & Settings', category: 'Navigation', icon: Sliders, action: () => { onNavigate('settings'); onClose(); } },
  ];

  const filteredActions = actions.filter(
    a => a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-start justify-center pt-16 px-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f0f17] border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden glass-panel rgb-glow">
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <Search className="w-5 h-5 text-purple-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, server setting, or navigate (e.g., 'start', 'nodes', 'marketplace')..."
            className="w-full bg-transparent text-slate-100 text-sm font-mono focus:outline-none placeholder-slate-500"
          />
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono bg-slate-800 text-slate-400 rounded-md border border-slate-700">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Command Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No matching commands or navigation items found.
            </div>
          ) : (
            filteredActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between hover:bg-purple-950/40 hover:border-purple-500/40 border border-transparent transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-purple-500/50 group-hover:bg-purple-900/30">
                      <Icon className="w-4 h-4 text-purple-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {item.label}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 transition-colors shrink-0" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5 text-purple-400" />
            <span>NTH Command Palette</span>
          </div>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
};
