import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerState, ServerMetrics, ConsoleLog, PanelSettings } from './types';
import { Navbar } from './components/Navbar';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('console');
  const [serverState, setServerState] = useState<ServerState>('STOPPED');
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Panel settings state
  const [panelSettings, setPanelSettings] = useState<PanelSettings>({
    serverName: 'NightHost (NTH)',
    serverAddress: 'ais-dev-hn2vj3nq7uz2vl26t7ambp-1058215627785.asia-southeast1.run.app:25565',
    bgImageUrl: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=2000&auto=format&fit=crop',
    bgOpacity: 70,
    bgBlur: 4,
    themeColor: 'emerald',
    activeSoftware: 'Paper',
    activeVersion: '1.21.4',
  });

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
    fetchStatus();
    fetchSettings();

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

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 overflow-x-hidden">
      
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
            className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
            style={{ opacity: (panelSettings.bgOpacity ?? 70) / 100 }}
          />
        </div>
      )}

      {/* Foreground Container */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        {/* Left Sidebar Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          serverState={serverState}
          metrics={metrics}
          onServerAction={handleServerAction}
          settings={panelSettings}
        />

        {/* Main Content View Container */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'console' && (
            <ConsoleView
              logs={logs}
              onSendCommand={handleSendCommand}
              onClearLogs={handleClearLogs}
              serverState={serverState}
              settings={panelSettings}
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
        </main>
      </div>
    </div>
  );
}
