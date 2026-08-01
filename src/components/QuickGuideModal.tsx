import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Terminal,
  Server,
  Shield,
  Clock,
  FolderTree,
  Puzzle,
  Users,
  Settings,
  Globe,
  HardDrive,
  Command,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Play,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { PanelSettings } from '../types';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  settings: PanelSettings;
  currentUser?: any;
  hasServerAllocated?: boolean;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  settings,
  currentUser,
  hasServerAllocated = true,
}) => {
  const [activeCategory, setActiveCategory] = useState<'welcome' | 'steps' | 'users' | 'shortcuts' | 'faq'>('welcome');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const serverAddr = settings.serverAddress && !settings.serverAddress.includes('run.app')
    ? settings.serverAddress
    : 'play.nighthost.in:25565';

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hostpanel_guide_dismissed', 'true');
    }
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(serverAddr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0f0f17] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-purple-900/60 via-slate-900 to-blue-900/60 border-b border-purple-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 p-0.5 shadow-lg shadow-purple-950/60 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">NightHost Panel Quick Guide & Instructions</h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  v2.5 Full Panel Guide
                </span>
              </div>
              <p className="text-xs text-slate-300">
                A complete walkthrough of panel features, server addresses, console commands & security controls
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-slate-950/80 border-b border-slate-800/80 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveCategory('welcome')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeCategory === 'welcome'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            1. Panel Overview
          </button>

          <button
            onClick={() => setActiveCategory('steps')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeCategory === 'steps'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            2. Step-by-Step Instructions
          </button>

          <button
            onClick={() => setActiveCategory('users')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeCategory === 'users'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            3. Users & Sub-Permissions
          </button>

          <button
            onClick={() => setActiveCategory('shortcuts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeCategory === 'shortcuts'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Command className="w-3.5 h-3.5 text-emerald-400" />
            4. Power Shortcuts
          </button>

          <button
            onClick={() => setActiveCategory('faq')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeCategory === 'faq'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            5. FAQ & Troubleshooting
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-sm leading-relaxed flex-1">
          
          {/* TAB 1: WELCOME & OVERVIEW */}
          {activeCategory === 'welcome' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-blue-950/40 border border-purple-500/30 rounded-2xl p-5 space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Welcome to NightHost Enterprise Minecraft Control Panel!
                </h3>
                <p className="text-slate-300 text-xs">
                  Aapka account successfully setup aur ready ho gaya hai! NightHost panel se aap apne Minecraft server ko fully control kar sakte hain: live console monitoring, plugin installs, custom domain & dedicated IP, auto-backups, Anti-DDoS firewall, and multi-node instances.
                </p>
                
                {/* Active Server IP Card */}
                {hasServerAllocated ? (
                  <div className="bg-slate-950/90 border border-cyan-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                        Your Dedicated Server IP Address
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {serverAddr}
                      </span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedAddress ? 'Copied!' : 'Copy IP Address'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner font-mono">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                        Your Dedicated Server IP Address
                      </span>
                      <span className="text-sm font-bold text-amber-300">
                        No Server Allocated
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 italic">
                      Contact Admin / Request Server
                    </span>
                  </div>
                )}
              </div>

              {/* Panel Major Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 text-purple-400 font-bold text-xs">
                    <Terminal className="w-4 h-4" />
                    <span>1. Terminal Console & Logs</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time WebSocket terminal for running Minecraft server commands (`/op player`, `/gamemode`), viewing live colorized startup logs, and controlling memory.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs">
                    <FolderTree className="w-4 h-4" />
                    <span>2. Web File Explorer</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Browser-based file manager to directly edit `.yml` files (`server.properties`, `spigot.yml`, `paper-global.yml`), upload plugin `.jar` files, and manage directories.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs">
                    <Puzzle className="w-4 h-4" />
                    <span>3. Plugin & Software Installer</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    1-click installer for popular plugins like GeyserMC (Bedrock cross-play), EssentialX, LuckPerms, Vault, ViaVersion, and Paper/Velocity jar versions.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs">
                    <Shield className="w-4 h-4" />
                    <span>4. Anti-DDoS Firewall & Task Cron</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Real-time rate-limiting, IP whitelist/blacklist protection, and automated scheduled tasks for periodic server restarts and automatic world backups.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP BY STEP INSTRUCTIONS */}
          {activeCategory === 'steps' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Step-by-Step Instructions: Server ko kaise setup aur chalayein
              </h3>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white">Server Start karein (Power Controls)</h4>
                    <p className="text-slate-300">
                      Sidebar mein top controller or main dashboard se <strong>Start</strong> button dabayein. Status badge <strong>RUNNING</strong> hote hi console logs live print hona start ho jayenge.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white">Server Address/IP connect karein</h4>
                    <p className="text-slate-300">
                      Copy karein apna Server IP address: <code className="bg-slate-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">{serverAddr}</code>.
                      Minecraft Game launch karke Multi-player &gt; Direct Connect mein yeh address enter karke join karein.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white">Apne Player ko OP (Admin) banayein</h4>
                    <p className="text-slate-300">
                      <strong>Console</strong> tab par jayein aur command box mein type karein: <code className="bg-slate-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">op your_username</code> and Enter dabayein. Game mein full OP rights mil jayenge.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white">Config Editor se Server Domain / Custom IP change karein</h4>
                    <p className="text-slate-300">
                      Agar aap apna custom domain lagana chahte hain (e.g. <code className="text-amber-300">mycustomserver.net</code> or <code className="text-amber-300">play.nighthost.in:25565</code>), toh <strong>Config Editor</strong> tab mein Dedicated Server Connection Address field change karke Save Settings dabayein.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    5
                  </div>
                  <div className="space-y-1 text-xs">
                    <h4 className="font-bold text-white">Backups & Firewall Security Enable karein</h4>
                    <p className="text-slate-300">
                      Server crash ya corruption se bachne ke liye <strong>Backups</strong> tab se 1-click world zip backup banayein aur <strong>Firewall &amp; Security</strong> tab se DDoS rate limits activate karein.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS & SUB-PERMISSIONS */}
          {activeCategory === 'users' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Sub-Users, Members & Role Permissions Guide
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  NightHost Panel supports multi-user sub-account permissions. Aap apne friends ya staff members ke liye lag-alag panel login generate kar sakte hain:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-3.5 space-y-1.5">
                    <span className="font-bold text-purple-300 font-mono text-[11px] uppercase block">
                      Owner & Admin Role
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      Full access across all server nodes, system settings, user creation, RAM allocation, and server creation.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-3.5 space-y-1.5">
                    <span className="font-bold text-blue-300 font-mono text-[11px] uppercase block">
                      Member Role (Server Specific)
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      Members purely own their specific assigned server instance. Unhe unke assigned server ka console, file manager &amp; config GUI hi milta hai.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-xs">New Sub-User kaise add karein?</h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Sidebar se <strong>Users &amp; Roles</strong> tab kholien.</li>
                    <li><strong>Add New User Account</strong> button par click karke Name, Username, Email aur Role set karein.</li>
                    <li><strong>Server Instances Hub</strong> mein us member ka Username assign kar dein.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: POWER SHORTCUTS */}
          {activeCategory === 'shortcuts' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Command className="w-4 h-4 text-emerald-400" />
                Global Keyboard Shortcuts &amp; Power Navigation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Open Global Command Palette</span>
                  <kbd className="px-2 py-1 bg-slate-950 text-emerald-300 font-mono font-bold rounded border border-slate-700">
                    Ctrl + K
                  </kbd>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Quick Open Terminal Console</span>
                  <kbd className="px-2 py-1 bg-slate-950 text-emerald-300 font-mono font-bold rounded border border-slate-700">
                    Nav &gt; Console
                  </kbd>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Clear Console Output</span>
                  <kbd className="px-2 py-1 bg-slate-950 text-emerald-300 font-mono font-bold rounded border border-slate-700">
                    Console Trash Icon
                  </kbd>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <span className="text-slate-300 font-medium">Switch Active Server Instance</span>
                  <kbd className="px-2 py-1 bg-slate-950 text-emerald-300 font-mono font-bold rounded border border-slate-700">
                    Top Navbar Dropdown
                  </kbd>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & TROUBLESHOOTING */}
          {activeCategory === 'faq' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Frequently Asked Questions &amp; Troubleshooting
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
                  <h4 className="font-bold text-purple-300">Q: Main apne Minecraft server ka RAM allocation kaise badhaun?</h4>
                  <p className="text-slate-300">
                    <strong>Admin Panel</strong> ya <strong>Server Config</strong> tab mein jayein. Wahan JVM Min RAM aur Max RAM sliders se 2GB to 16GB RAM assign karke Save karein aur server Restart karein.
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
                  <h4 className="font-bold text-purple-300">Q: Server connect nahi ho raha (Connection Refused)?</h4>
                  <p className="text-slate-300">
                    Pehle dekhein ki Top Bar mein Server Status <strong>RUNNING</strong> hai ya nahi. Phir confirm karein ki port number correctly typed hai (e.g. <code className="text-cyan-300">:25565</code>).
                  </p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
                  <h4 className="font-bold text-purple-300">Q: Bedrock Edition (PE / Mobile) players join kaise kar sakte hain?</h4>
                  <p className="text-slate-300">
                    <strong>Plugin Manager</strong> mein jayein, search <strong>GeyserMC</strong> aur <strong>1-Click Install</strong> par click karein. Install hone ke baad server restart karein, Minecraft PE/Bedrock players port 19132 par connect kar payenge.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Quick Jump & Dismiss Controls */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
            />
            <span>Don't show this popup automatically next time</span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onNavigate('console');
                handleClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-400" />
              Open Terminal Console
            </button>

            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-purple-950/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Got it! Start Using Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
