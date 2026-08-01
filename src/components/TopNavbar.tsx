import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  User,
  Sparkles,
  Server,
  Command,
  Sun,
  Moon,
  ChevronDown,
  Shield,
  Activity,
  LogOut,
  Check,
  X,
  BookOpen,
} from 'lucide-react';
import { ServerState, PanelSettings } from '../types';
import { getThemeStyles } from '../utils/theme';

interface TopNavbarProps {
  serverState: ServerState;
  settings: PanelSettings;
  currentUser?: any;
  hasServerAllocated?: boolean;
  onLogout?: () => void;
  onOpenCommandPalette: () => void;
  onOpenQuickGuide?: () => void;
  onNavigate: (tab: string) => void;
  onSettingsUpdate?: (updated: Partial<PanelSettings>) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  serverState,
  settings,
  currentUser,
  hasServerAllocated = true,
  onLogout,
  onOpenCommandPalette,
  onOpenQuickGuide,
  onNavigate,
  onSettingsUpdate,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'PaperMC Server Ready', desc: '1.21.11 Paper server initialized on port 25565', time: '2 mins ago', read: false },
    { id: '2', title: 'Backup Created', desc: 'Automated daily backup completed successfully', time: '1 hour ago', read: false },
    { id: '3', title: 'Node US-East-1 Online', desc: 'Docker daemon ping: 12ms uptime 99.99%', time: '3 hours ago', read: true },
  ]);

  const theme = getThemeStyles(settings.themeColor || 'violet');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getStatusColor = (state: ServerState) => {
    switch (state) {
      case 'RUNNING':
        return 'bg-emerald-500 shadow-emerald-500/50';
      case 'STARTING':
      case 'STOPPING':
        return 'bg-amber-500 shadow-amber-500/50 animate-pulse';
      case 'CRASHED':
        return 'bg-rose-500 shadow-rose-500/50';
      case 'STOPPED':
      default:
        return 'bg-slate-500 shadow-slate-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0b0b0f]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left Branding & Quick Search Trigger */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-purple-500/40 text-white font-extrabold text-lg shadow-lg">
              <span className="bg-gradient-to-tr from-purple-400 to-blue-400 bg-clip-text text-transparent">
                N
              </span>
            </div>
          </div>
          <div className="hidden sm:block min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-100 tracking-tight">
                {settings.serverName || 'NightHost (NTH)'}
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase font-mono">
                Enterprise
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono block">
              Node: <span className={hasServerAllocated ? "text-blue-400 font-bold" : "text-amber-400 font-bold"}>
                {hasServerAllocated ? 'US-East-Primary' : 'None'}
              </span>
            </span>
          </div>
        </div>

        {/* Search Bar Trigger for Ctrl+K */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center justify-between gap-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-purple-500/40 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer w-64 lg:w-80 shadow-inner group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-purple-400 group-hover:text-blue-400 transition-colors" />
            <span className="font-sans">Search servers, commands, nodes...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 text-slate-400 rounded border border-slate-700/80 flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 cursor-pointer"
          title="Search (Ctrl + K)"
        >
          <Search className="w-4 h-4 text-purple-400" />
        </button>

        {/* Quick Guide & Panel Instructions Button */}
        {onOpenQuickGuide && (
          <button
            onClick={onOpenQuickGuide}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            title="Quick Guide & Instructions"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-mono">Quick Guide</span>
          </button>
        )}

        {/* Quick Action: Create Server */}
        <button
          onClick={() => onNavigate('servers')}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border border-purple-400/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Server</span>
        </button>

        {/* Notifications Button & Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#12121a] border border-purple-500/30 rounded-2xl shadow-2xl p-3 z-50 glass-panel animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-purple-400" /> Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-purple-400 hover:text-purple-300 font-mono cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto mt-2 space-y-1 divide-y divide-slate-800/40">
                {notifications.map((n) => (
                  <div key={n.id} className="pt-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Discord Community Link */}
        <a
          href="https://discord.gg/udUdNKzz7P"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-[#5865F2] hover:text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer group"
          title="NightHost Official Discord Server"
        >
          <svg className="w-3.5 h-3.5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 127.14 96.36">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,0,106,106,0,0,0,22.77,8.07C2.79,37.56-2.61,66.33,1,94.75a105.73,105.73,0,0,0,32.17,16.24,77.7,77.7,0,0,0,6.89-11.11,68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a73.57,73.57,0,0,0,64.68,0c.87.69,1.76,1.37,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.24c4.32-34.19-7-62.61-26.27-86.68ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.87,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.11,53,91.08,65.69,84.69,65.69Z"/>
          </svg>
          <span>Discord Server</span>
        </a>

        {/* Server Live Status Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full shadow-lg ${hasServerAllocated ? getStatusColor(serverState) : 'bg-amber-500 shadow-amber-500/50'}`} />
          <span className={hasServerAllocated ? "text-slate-300 font-bold" : "text-amber-300 font-bold"}>
            {hasServerAllocated ? serverState : 'Node: None'}
          </span>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/30 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all cursor-pointer group"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-xs font-extrabold shadow shrink-0">
              {(currentUser?.username || 'Admin').substring(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left min-w-0">
              <span className="text-xs font-bold text-slate-200 block leading-tight truncate group-hover:text-white">
                {currentUser?.name || currentUser?.username || 'Administrator'}
              </span>
              <span className="text-[10px] text-purple-400 font-mono block leading-none">
                {currentUser?.role || 'Administrator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#12121a] border border-purple-500/30 rounded-2xl shadow-2xl p-2 z-50 glass-panel animate-fade-in font-sans text-xs">
              <div className="p-2 border-b border-slate-800/80 mb-1">
                <div className="font-bold text-slate-100">{currentUser?.name || currentUser?.username || 'Administrator'}</div>
                <div className="text-[10px] text-slate-400 font-mono">{currentUser?.email || 'admin@example.com'}</div>
              </div>

              <button
                onClick={() => { onNavigate('admin'); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-purple-950/50 hover:text-purple-300 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Panel</span>
              </button>

              <button
                onClick={() => { onNavigate('users'); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-purple-950/50 hover:text-purple-300 flex items-center gap-2 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>User Accounts</span>
              </button>

              <button
                onClick={() => { onNavigate('settings'); setUserDropdownOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:bg-purple-950/50 hover:text-purple-300 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Panel Appearance</span>
              </button>

              {onOpenQuickGuide && (
                <button
                  onClick={() => { onOpenQuickGuide(); setUserDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-purple-300 hover:bg-purple-950/50 flex items-center gap-2 transition-all cursor-pointer font-bold"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>⚡ Quick Guide & Tour</span>
                </button>
              )}

              <div className="my-1 border-t border-slate-800/80" />

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
