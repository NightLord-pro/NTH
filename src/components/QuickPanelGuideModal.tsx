import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Server,
  Terminal,
  FolderTree,
  Settings,
  Shield,
  Layers,
  Zap,
  Globe,
  Users,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Command,
  HelpCircle,
  ExternalLink,
  Cpu,
  HardDrive,
  Download,
  Key,
} from 'lucide-react';

interface QuickPanelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  serverAddress?: string;
}

export const QuickPanelGuideModal: React.FC<QuickPanelGuideModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  serverAddress = 'play.nighthost.in:25565',
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  if (!isOpen) return null;

  const handleFinish = () => {
    localStorage.setItem('hostpanel_guide_seen', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl bg-[#0f0f17] border border-purple-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Glow & Header */}
        <div className="relative bg-gradient-to-r from-purple-900/60 via-slate-900 to-blue-900/60 p-6 border-b border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Close Guide"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-2xl text-purple-300 shadow-lg shadow-purple-900/40">
              <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md uppercase">
                  Onboarding & Instructions
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                NightHost Panel Quick Guide & Tour
              </h2>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-5 gap-2 mt-5">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <button
                key={stepNum}
                onClick={() => setCurrentStep(stepNum)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  stepNum === currentStep
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-400 shadow-lg shadow-purple-500/50'
                    : stepNum < currentStep
                    ? 'bg-purple-600/80'
                    : 'bg-slate-800'
                }`}
                title={`Jump to Step ${stepNum}`}
              />
            ))}
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-200">
          
          {/* STEP 1: WELCOME & OVERVIEW */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                    Welcome Aboard!
                  </div>
                  <h3 className="text-lg font-extrabold text-white">
                    Hello, @{currentUser?.username || 'Member'} 👋
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Your account is registered as <strong className="text-amber-400 font-mono">{currentUser?.role || 'Registered Member'}</strong>.
                  </p>
                </div>
                <div className="px-3.5 py-2 bg-slate-950/80 border border-purple-500/40 rounded-xl text-xs font-mono text-cyan-300 shrink-0">
                  <span className="text-slate-400 block text-[10px]">Server IP Address:</span>
                  <strong className="text-sm font-bold">{serverAddress}</strong>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" /> What is NightHost Panel?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  NightHost Panel is an enterprise-grade Minecraft server management system designed for speed, security, and full control over server instances. You can manage server files, execute live console commands, install plugins, switch versions, take backups, and monitor real-time node performance directly from your browser.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                    <Shield className="w-4 h-4" /> Role Permissions
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>Administrators / Owners</strong> can create servers, manage nodes, adjust global RAM, and assign servers to members.
                  </p>
                </div>

                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                    <Globe className="w-4 h-4" /> Dedicated IP & Ports
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Each server node runs on its assigned Minecraft port (default 25565) and custom domain. You can copy it anytime from the top bar!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SERVER INSTANCES & ALLOCATION */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" /> Server Node Allocation & Switching
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  How server instances work and how to access your designated Minecraft server:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Owner Server Assignment</h4>
                      <p className="text-[11px] text-slate-400">
                        The Panel Owner or Administrator allocates specific Minecraft server instances to registered members.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                    <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Server Selector Sidebar</h4>
                      <p className="text-[11px] text-slate-400">
                        Use the left navigation sidebar dropdown or the <strong>Server Manager</strong> tab to select active nodes and view assigned resources.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Instant Power Controls</h4>
                      <p className="text-[11px] text-slate-400">
                        Start, Stop, Restart, or Force Kill servers safely with single-click power buttons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 font-mono space-y-1">
                <strong>💡 Member Tip:</strong> If your account currently shows <em>0 assigned servers</em>, contact your Administrator (<strong className="text-white">@admin</strong>) to assign a server node to your username <strong className="text-white">@{currentUser?.username}</strong>.
              </div>
            </div>
          )}

          {/* STEP 3: MANAGEMENT TOOLS TOUR */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" /> Full Panel Feature Suite
                </h3>
                <p className="text-xs text-slate-300">
                  Explore all the powerful built-in tools at your disposal:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-purple-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" /> Live Interactive Console
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Full Minecraft terminal with real-time logs, ANSI color output, and direct command execution.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-cyan-300 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-cyan-400" /> File Manager & Web Editor
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Upload plugins, edit <code>server.properties</code>, create folders, and manage worlds directly.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-300 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" /> Config & Memory GUI
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Adjust JVM RAM Heap allocation, custom flags, difficulty, game modes, and custom domain IPs.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-400" /> Plugins & Modpack Marketplace
                  </div>
                  <p className="text-[11px] text-slate-400">
                    1-Click Spigot/Bukkit plugins and CurseForge/Modrinth modpack installer.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-rose-300 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-rose-400" /> Backups & Version Switcher
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Switch PaperMC versions from 1.21.1 to legacy 1.8.8 and create instant world restore points.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="font-bold text-blue-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" /> Real-time Node Analytics
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Monitor live CPU %, RAM usage, network bandwidth, and online player lists.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SHORTCUTS & POWER TIPS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Command Palette & Keyboard Shortcuts
                </h3>
                <p className="text-xs text-slate-300">
                  Boost your workflow efficiency with built-in shortcuts and quick commands:
                </p>
              </div>

              <div className="p-5 bg-slate-900/90 border border-purple-500/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600/20 text-purple-300 rounded-lg">
                      <Command className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Global Command Palette</h4>
                      <p className="text-[11px] text-slate-400">Search pages, run power commands, or switch nodes</p>
                    </div>
                  </div>
                  <kbd className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-800 text-purple-300 rounded-lg border border-purple-500/30">
                    Ctrl + K
                  </kbd>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-purple-300 block">Copy Connection IP</strong>
                    <p className="text-[11px] text-slate-400">Click the server address badge in the top bar to instantly copy <code>play.nighthost.in:25565</code> to clipboard.</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <strong className="text-cyan-300 block">Auto EULA Acceptance</strong>
                    <p className="text-[11px] text-slate-400">NightHost automatically handles <code>eula.txt=true</code> when launching Paper servers for zero setup friction.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: COMMUNITY & GETTING STARTED */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in text-center sm:text-left">
              <div className="p-6 bg-gradient-to-br from-purple-950/60 via-slate-900 to-blue-950/60 border border-purple-500/40 rounded-3xl space-y-4">
                <div className="w-12 h-12 bg-purple-600/30 border border-purple-400/40 rounded-2xl flex items-center justify-center text-purple-300 mx-auto sm:mx-0 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    You're All Set to Manage Your Minecraft Server!
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                    You can reopen this Quick Guide anytime from the top navigation bar or help menu. Enjoy hosting with NightHost!
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href="https://discord.gg/udUdNKzz7P"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold font-mono rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>Join Discord Support Community</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={handleFinish}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    🚀 Start Exploring Panel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-xs font-mono font-bold rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Step {currentStep} / {totalSteps}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-purple-400/30"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all cursor-pointer border border-emerald-400/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish Tour</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
