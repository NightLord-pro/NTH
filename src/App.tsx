import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerState, ServerMetrics, ConsoleLog, PanelSettings, ServerInstance } from './types';
import { Navbar } from './components/Navbar';
import { TopNavbar } from './components/TopNavbar';
import { CommandPalette } from './components/CommandPalette';
import { MainDashboard } from './components/MainDashboard';
import { NodeManagerView } from './components/NodeManagerView';
import { UserManagerView } from './components/UserManagerView';
import { AdminPanel } from './components/AdminPanel';
import { MarketplaceView } from './components/MarketplaceView';
import { AnalyticsView } from './components/AnalyticsView';
import { ConsoleView } from './components/ConsoleView';
import { MetricsView } from './components/MetricsView';
import { PluginManager } from './components/PluginManager';
import { FileExplorer } from './components/FileExplorer';
import { PlayerManager } from './components/PlayerManager';
import { ConfigEditor } from './components/ConfigEditor';
import { VersionsManager } from './components/VersionsManager';
import { PanelSettingsView } from './components/PanelSettingsView';
import { WorldManager } from './components/WorldManager';
import { BackupManager } from './components/BackupManager';
import { ServerInstancesManager } from './components/ServerInstancesManager';
import { SetupWizardView } from './components/SetupWizardView';
import { LoginView } from './components/LoginView';
import { MemberNoServerGUI } from './components/MemberNoServerGUI';
import { FirewallView } from './components/FirewallView';
import { ScheduleManager } from './components/ScheduleManager';
import { QuickGuideModal } from './components/QuickGuideModal';
import { WatermarkBadge } from './components/WatermarkBadge';
import { Command, Sparkles, Terminal, Play, RotateCw, Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverState, setServerState] = useState<ServerState>('STOPPED');
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Authentication & First-time setup state
  const [authState, setAuthState] = useState<'checking' | 'setup' | 'login' | 'authenticated'>('checking');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await res.json();
        if (data.needsSetup && !localStorage.getItem('nth_wizard_completed')) {
          setAuthState('setup');
        } else {
          const savedUser = sessionStorage.getItem('hostpanel_user');
          if (savedUser) {
            try {
              setCurrentUser(JSON.parse(savedUser));
              setAuthState('authenticated');
            } catch {
              setAuthState('login');
            }
          } else {
            setAuthState('login');
          }
        }
      } else {
        setAuthState('login');
      }
    } catch {
      setAuthState('login');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Multi-server instances state
  const [serverInstances, setServerInstances] = useState<ServerInstance[]>([]);
  const [activeServerId, setActiveServerId] = useState('srv-default');

  // Panel settings state
  const [panelSettings, setPanelSettings] = useState<PanelSettings>({
    serverName: 'NTH',
    serverAddress: 'play.nighthost.in:25565',
    bgImageUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 70,
    bgBlur: 4,
    themeColor: 'emerald',
    activeSoftware: 'Paper',
    activeVersion: '1.21.4',
    watermarkImage: 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L',
    watermarkText: 'Made by NightLord',
  });

  const fetchServerInstances = async () => {
    try {
      const res = await fetch('/api/servers');
      if (res.ok) {
        const data = await res.json();
        if (data.instances) setServerInstances(data.instances);
        if (data.activeServerId) setActiveServerId(data.activeServerId);
      }
    } catch {
      // ignore
    }
  };

  const handleSelectServer = async (id: string) => {
    setActiveServerId(id);
    try {
      const res = await fetch('/api/servers/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: id }),
      });
      if (res.ok) {
        await fetchServerInstances();
        await fetchSettings();
      }
    } catch (e) {
      console.error('Failed to select server instance:', e);
    }
  };


  // Status flags from backend
  const [javaAvailable, setJavaAvailable] = useState(false);
  const [paperJarPresent, setPaperJarPresent] = useState(false);
  const [isSimulatorMode, setIsSimulatorMode] = useState(false);
  const [initialMinRam, setInitialMinRam] = useState(2);
  const [initialMaxRam, setInitialMaxRam] = useState(4);
  const [initialJvmArgs, setInitialJvmArgs] = useState('-XX:+UseG1GC -XX:+ParallelRefProcEnabled');
  const [initialAutoRestart, setInitialAutoRestart] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setServerState(data.state);
      setJavaAvailable(data.javaAvailable);
      setPaperJarPresent(data.paperJarPresent);
      setIsSimulatorMode(data.isSimulatorMode);
      if (data.minRamGb) setInitialMinRam(data.minRamGb);
      if (data.maxRamGb) setInitialMaxRam(data.maxRamGb);
      if (data.customJvmArgs) setInitialJvmArgs(data.customJvmArgs);
      if (data.autoRestartOnCrash !== undefined) setInitialAutoRestart(data.autoRestartOnCrash);
    } catch {
      // ignore
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/panel/settings');
      const data = await res.json();
      if (data && typeof data === 'object') {
        setPanelSettings(prev => ({ ...prev, ...data }));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (panelSettings.serverName) {
      document.title = panelSettings.serverName;
    }
  }, [panelSettings.serverName]);

  useEffect(() => {
    fetchStatus();
    fetchSettings();
    fetchServerInstances();

    // Socket.io initialization
    const s = io('/', {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      console.log('[HostPanel] WebSocket connected');
    });

    s.on('server:state', (state: ServerState) => {
      setServerState(state);
    });

    s.on('server:metrics', (data: ServerMetrics) => {
      setMetrics(data);
    });

    s.on('panel:settings', (settings: PanelSettings) => {
      setPanelSettings(settings);
    });

    s.on('console:history', (historyLogs: ConsoleLog[]) => {
      setLogs(historyLogs);
    });

    s.on('console:line', (line: ConsoleLog) => {
      setLogs(prev => {
        const next = [...prev, line];
        if (next.length > 1000) return next.slice(next.length - 1000);
        return next;
      });
    });

    s.on('console-log', (rawText: string) => {
      if (!rawText) return;
      const dateStr = new Date().toLocaleTimeString('en-US', { hour12: false });
      const entry: ConsoleLog = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: dateStr,
        text: rawText.trim(),
        html: rawText.replace(/\n/g, '<br/>'),
        type: rawText.includes('ERROR') || rawText.includes('❌') ? 'error' : rawText.includes('⚠️') ? 'warn' : 'stdout',
      };
      setLogs(prev => {
        const next = [...prev, entry];
        if (next.length > 1000) return next.slice(next.length - 1000);
        return next;
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const handleServerAction = async (action: 'start' | 'stop' | 'restart' | 'kill') => {
    if (socket) {
      if (action === 'start') {
        socket.emit('start-server');
      } else if (action === 'stop') {
        socket.emit('stop-server');
      }
    }
    try {
      await fetch('/api/server/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      fetchStatus();
    } catch (err) {
      console.error('Server action error:', err);
    }
  };

  const handleSendCommand = (cmd: string) => {
    if (socket) {
      socket.emit('send-command', cmd);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleDownloadPaper = async () => {
    const res = await fetch('/api/server/download-paper', { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    fetchStatus();
  };

  const handleSaveJvmConfig = async (config: {
    minRamGb: number;
    maxRamGb: number;
    customJvmArgs: string;
    autoRestartOnCrash: boolean;
  }) => {
    const res = await fetch('/api/server/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jvm: config }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    fetchStatus();
  };

  const handleSettingsUpdate = (updated: Partial<PanelSettings>) => {
    setPanelSettings(prev => ({ ...prev, ...updated }));
  };

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center font-mono text-xs text-purple-400 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Verifying Panel Credentials & createuser.json...</span>
      </div>
    );
  }

  if (authState === 'setup') {
    return (
      <SetupWizardView
        onSetupComplete={(user) => {
          localStorage.setItem('nth_wizard_completed', 'true');
          setCurrentUser(user);
          sessionStorage.setItem('hostpanel_user', JSON.stringify(user));
          setAuthState('login');
        }}
      />
    );
  }

  if (authState === 'login') {
    return (
      <LoginView
        settings={panelSettings}
        onLoginSuccess={(user, isNewRegistration) => {
          setCurrentUser(user);
          sessionStorage.setItem('hostpanel_user', JSON.stringify(user));
          setAuthState('authenticated');
          if (isNewRegistration || !localStorage.getItem('hostpanel_guide_dismissed')) {
            setIsGuideOpen(true);
          }
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0b0b0f] text-slate-100 font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      
      {/* Background Wallpaper Image Layer */}
      {panelSettings.bgImageUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={panelSettings.bgImageUrl}
            alt="Panel Background"
            className="w-full h-full object-cover transition-all duration-700"
            style={{
              filter: `blur(${panelSettings.bgBlur ?? 4}px)`,
              scale: '1.05',
            }}
          />
          <div
            className="absolute inset-0 bg-[#0b0b0f] transition-opacity duration-300"
            style={{ opacity: (panelSettings.bgOpacity ?? 70) / 100 }}
          />
        </div>
      )}

      {/* Global Command Palette (Ctrl + K) Modal */}
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
        onServerAction={handleServerAction}
        onOpenQuickGuide={() => setIsGuideOpen(true)}
        settings={panelSettings}
      />

      {/* Quick Guide & Instructions Modal */}
      {(() => {
        const isOwnerOrAdmin = !currentUser || currentUser.role === 'Administrator' || currentUser.role === 'Owner';
        const userAssignedServers = isOwnerOrAdmin
          ? serverInstances
          : serverInstances.filter(s => s.assignedUser && s.assignedUser.toLowerCase() === currentUser?.username?.toLowerCase());
        const hasServerAllocated = isOwnerOrAdmin || userAssignedServers.length > 0;

        return (
          <QuickGuideModal
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
            onNavigate={(tab) => setActiveTab(tab)}
            settings={panelSettings}
            currentUser={currentUser}
            hasServerAllocated={hasServerAllocated}
          />
        );
      })()}

      {/* Top Navbar */}
      {(() => {
        const isOwnerOrAdmin = !currentUser || currentUser.role === 'Administrator' || currentUser.role === 'Owner';
        const userAssignedServers = isOwnerOrAdmin
          ? serverInstances
          : serverInstances.filter(s => s.assignedUser && s.assignedUser.toLowerCase() === currentUser?.username?.toLowerCase());
        const hasServerAllocated = isOwnerOrAdmin || userAssignedServers.length > 0;

        return (
          <TopNavbar
            serverState={serverState}
            settings={panelSettings}
            currentUser={currentUser}
            hasServerAllocated={hasServerAllocated}
            onLogout={() => {
              sessionStorage.removeItem('hostpanel_user');
              setCurrentUser(null);
              setAuthState('login');
            }}
            onOpenCommandPalette={() => setCmdPaletteOpen(true)}
            onOpenQuickGuide={() => setIsGuideOpen(true)}
            onNavigate={(tab) => setActiveTab(tab)}
            onSettingsUpdate={handleSettingsUpdate}
          />
        );
      })()}

      {/* Foreground Container */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-[calc(100vh-60px)]">
        {/* Left Sidebar Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          serverState={serverState}
          metrics={metrics}
          onServerAction={handleServerAction}
          settings={panelSettings}
          serverInstances={serverInstances}
          activeServerId={activeServerId}
          onSelectServer={handleSelectServer}
          currentUser={currentUser}
          onOpenQuickGuide={() => setIsGuideOpen(true)}
        />

        {/* Main Content View Container */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 min-w-0">
          {(() => {
            const isOwnerOrAdmin = !currentUser || currentUser.role === 'Administrator' || currentUser.role === 'Owner';
            const canAccessAdminSection = isOwnerOrAdmin || currentUser?.permissions?.canAccessAdmin;

            // Member server allocation check
            const userAssignedServers = isOwnerOrAdmin
              ? serverInstances
              : serverInstances.filter(s => s.assignedUser && s.assignedUser.toLowerCase() === currentUser?.username?.toLowerCase());
            
            const hasServerAllocated = isOwnerOrAdmin || userAssignedServers.length > 0;

            // Restrict admin/owner exclusive tabs (users, nodes, admin, settings - ONLY for Owner)
            const adminOnlyTabs = ['users', 'nodes', 'admin', 'settings'];
            if (adminOnlyTabs.includes(activeTab) && !canAccessAdminSection) {
              return (
                <div className="py-16 text-center bg-slate-900/60 border border-amber-500/30 rounded-2xl p-8 max-w-2xl mx-auto my-12 space-y-4">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-100">Restricted Section (Owner / Admin Only)</h2>
                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    Account <span className="text-purple-300 font-bold">@{currentUser?.username || 'Member'}</span> is registered as a <span className="text-amber-400 font-bold">{currentUser?.role || 'User'}</span>.
                    Panel settings, node configuration, user management, and administrative settings are restricted exclusively to the Panel Owner / Administrator.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                    >
                      Return to Hosting Overview
                    </button>
                  </div>
                </div>
              );
            }

            // Lock server-specific tools (console, files, plugins, marketplace, analytics, etc.) if member has no server assigned
            const serverSpecificTabs = ['servers', 'console', 'files', 'config', 'plugins', 'worlds', 'backups', 'metrics', 'players', 'versions', 'marketplace', 'analytics', 'firewall', 'schedules'];
            if (serverSpecificTabs.includes(activeTab) && !hasServerAllocated) {
              return (
                <div className="py-16 text-center bg-slate-900/80 border border-purple-500/30 rounded-2xl p-8 max-w-2xl mx-auto my-12 space-y-4 shadow-2xl">
                  <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-100 font-mono">Server Instance Allocation Required</h2>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Your member account <strong className="text-purple-300">@{currentUser?.username}</strong> currently has <strong>0 assigned server instances</strong>.
                    All server management tools (Console, File Manager, Config, Plugins, Worlds, Backups, Versions) unlock automatically once the Panel Owner / Administrator (<strong className="text-amber-400">@admin</strong>) allocates a Minecraft server instance to your username.
                  </p>
                  <div className="pt-3">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                    >
                      Go to Hosting Overview
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <>
                {activeTab === 'dashboard' && (
                  !hasServerAllocated ? (
                    <MemberNoServerGUI
                      currentUser={currentUser}
                      settings={panelSettings}
                      onNavigate={(tab) => setActiveTab(tab)}
                    />
                  ) : (
                    <MainDashboard
                      serverState={serverState}
                      metrics={metrics}
                      settings={panelSettings}
                      serverInstances={serverInstances}
                      logs={logs}
                      onServerAction={handleServerAction}
                      onNavigate={(tab) => setActiveTab(tab)}
                      onSelectServer={handleSelectServer}
                      currentUser={currentUser}
                    />
                  )
                )}

                {activeTab === 'nodes' && (
                  <NodeManagerView settings={panelSettings} />
                )}

                {activeTab === 'users' && (
                  <UserManagerView settings={panelSettings} />
                )}

                {activeTab === 'admin' && (
                  <AdminPanel
                    settings={panelSettings}
                    onSettingsUpdate={handleSettingsUpdate}
                  />
                )}

                {activeTab === 'marketplace' && (
                  <MarketplaceView settings={panelSettings} />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsView settings={panelSettings} />
                )}

                {activeTab === 'firewall' && (
                  <FirewallView settings={panelSettings} />
                )}

                {activeTab === 'schedules' && (
                  <ScheduleManager settings={panelSettings} />
                )}

                {activeTab === 'console' && (
                  <ConsoleView
                    logs={logs}
                    onSendCommand={handleSendCommand}
                    onClearLogs={handleClearLogs}
                    serverState={serverState}
                    settings={panelSettings}
                  />
                )}

                {activeTab === 'servers' && (
                  <ServerInstancesManager
                    settings={panelSettings}
                    activeServerId={activeServerId}
                    onSelectServer={handleSelectServer}
                    onOpenConsole={() => setActiveTab('console')}
                    currentUser={currentUser}
                  />
                )}

                {activeTab === 'versions' && (
                  <VersionsManager
                    settings={panelSettings}
                    onSettingsUpdate={handleSettingsUpdate}
                  />
                )}

                {activeTab === 'worlds' && <WorldManager />}

                {activeTab === 'players' && <PlayerManager />}

                {activeTab === 'backups' && <BackupManager />}

                {activeTab === 'metrics' && (
                  <MetricsView
                    metrics={metrics}
                    serverState={serverState}
                    javaAvailable={javaAvailable}
                    paperJarPresent={paperJarPresent}
                    isSimulatorMode={isSimulatorMode}
                    onDownloadPaperJar={handleDownloadPaper}
                    onSaveJvmConfig={handleSaveJvmConfig}
                    initialMinRam={initialMinRam}
                    initialMaxRam={initialMaxRam}
                    initialJvmArgs={initialJvmArgs}
                    initialAutoRestart={initialAutoRestart}
                  />
                )}

                {activeTab === 'plugins' && <PluginManager />}

                {activeTab === 'files' && <FileExplorer />}

                {activeTab === 'config' && <ConfigEditor />}

                {activeTab === 'settings' && (
                  <PanelSettingsView
                    settings={panelSettings}
                    onSettingsUpdate={handleSettingsUpdate}
                  />
                )}
              </>
            );
          })()}
        </main>
      </div>

      {/* Floating Action Button (FAB) for Quick Command Palette */}
      <button
        onClick={() => setCmdPaletteOpen(true)}
        className="fixed bottom-20 right-5 z-40 p-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-purple-950/80 cursor-pointer transition-all active:scale-90 border border-purple-400/40 rgb-glow group"
        title="Quick Command Palette (Ctrl + K)"
      >
        <Command className="w-5 h-5 transition-transform group-hover:rotate-12" />
      </button>

      {/* Fixed Watermark Badge (Bottom-Right) */}
      <WatermarkBadge
        image={panelSettings.watermarkImage}
        text={panelSettings.watermarkText}
      />
    </div>
  );
}
