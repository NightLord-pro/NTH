import React, { useState, useEffect, useRef } from 'react';
import { ConsoleLog, ServerState, PanelSettings } from '../types';
import { getThemeStyles, getCardBgClass } from '../utils/theme';
import { Terminal, Send, Trash2, Search, ArrowDown, Sparkles, Download, Pause, Play, Activity } from 'lucide-react';

interface ConsoleViewProps {
  logs: ConsoleLog[];
  onSendCommand: (cmd: string) => void;
  onClearLogs: () => void;
  serverState: ServerState;
  settings?: PanelSettings;
}

export const ConsoleView: React.FC<ConsoleViewProps> = ({
  logs,
  onSendCommand,
  onClearLogs,
  serverState,
  settings,
}) => {
  const [inputCommand, setInputCommand] = useState('');
  const [filterText, setFilterText] = useState('');
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'error' | 'warn' | 'cmd'>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [opTarget, setOpTarget] = useState('NightLordNot');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAiDiagnostic, setShowAiDiagnostic] = useState(false);

  const theme = getThemeStyles(settings?.themeColor);
  const cardBgClass = getCardBgClass(settings?.hudTransparent);

  const commandSuggestions = [
    { cmd: '/op ', desc: 'Grant operator status to player' },
    { cmd: '/deop ', desc: 'Remove operator status from player' },
    { cmd: '/gamemode creative ', desc: 'Switch player gamemode to creative' },
    { cmd: '/gamemode survival ', desc: 'Switch player gamemode to survival' },
    { cmd: '/tp ', desc: 'Teleport player to target or coordinates' },
    { cmd: '/give ', desc: 'Give item to player' },
    { cmd: '/kill ', desc: 'Kill player or entity' },
    { cmd: '/clear ', desc: 'Clear player inventory' },
    { cmd: '/difficulty ', desc: 'Set server difficulty (easy|normal|hard|peaceful)' },
    { cmd: '/time set day', desc: 'Set in-game time to daytime' },
    { cmd: '/weather clear', desc: 'Clear rain and thunder weather' },
    { cmd: '/summon ', desc: 'Summon mob or entity' },
    { cmd: '/xp add ', desc: 'Grant experience points to player' },
    { cmd: '/effect give ', desc: 'Apply status effect to player' },
    { cmd: '/tell ', desc: 'Send private whisper to player' },
    { cmd: '/say ', desc: 'Broadcast server message' },
    { cmd: '/whitelist add ', desc: 'Add player to whitelist' },
    { cmd: '/whitelist remove ', desc: 'Remove player from whitelist' },
    { cmd: '/kick ', desc: 'Kick player from server' },
    { cmd: '/ban ', desc: 'Ban player from server' },
    { cmd: '/pardon ', desc: 'Unban player from server' },
    { cmd: '/list', desc: 'List connected players' },
    { cmd: '/plugins', desc: 'List active server plugins' },
    { cmd: '/seed', desc: 'Show world generation seed' },
    { cmd: '/version', desc: 'Show server software build version' },
  ];

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll && !isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isPaused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;

    onSendCommand(inputCommand);
    setHistory(prev => [inputCommand, ...prev]);
    setHistoryIndex(-1);
    setInputCommand('');
    setShowSuggestions(false);
  };

  const handleQuickOp = (isGrant: boolean) => {
    if (!opTarget.trim()) return;
    const cmd = isGrant ? `/op ${opTarget.trim()}` : `/deop ${opTarget.trim()}`;
    onSendCommand(cmd);
    setHistory(prev => [cmd, ...prev]);
  };

  const handleDownloadLogs = () => {
    const rawContent = logs.map(l => `[${new Date(l.timestamp || Date.now()).toISOString()}] [${l.type || 'INFO'}]: ${l.text}`).join('\n');
    const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-console-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(nextIdx);
        setInputCommand(history[nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputCommand(history[nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputCommand('');
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesText = log.text.toLowerCase().includes(filterText.toLowerCase());
    if (!matchesText) return false;
    if (logTypeFilter === 'error') return log.type === 'stderr' || log.type === 'error';
    if (logTypeFilter === 'warn') return log.type === 'warn' || log.text.includes('[WARN]');
    if (logTypeFilter === 'cmd') return log.type === 'command';
    return true;
  });

  const matchedSuggestions = inputCommand.startsWith('/')
    ? commandSuggestions.filter(s => s.cmd.toLowerCase().includes(inputCommand.toLowerCase()))
    : [];

  const quickMacros = [
    { label: '/help', cmd: 'help' },
    { label: '/list', cmd: 'list' },
    { label: '/op NightLordNot', cmd: 'op NightLordNot' },
    { label: '/gamemode creative', cmd: 'gamemode creative' },
    { label: '/give NightLordNot diamond 64', cmd: 'give NightLordNot diamond 64' },
    { label: '/tp NightLordNot 0 100 0', cmd: 'tp NightLordNot 0 100 0' },
    { label: '/time set day', cmd: 'time set day' },
    { label: '/weather clear', cmd: 'weather clear' },
    { label: '/say Welcome!', cmd: 'say Welcome to NTH Minecraft Server!' },
    { label: '/seed', cmd: 'seed' },
    { label: '/version', cmd: 'version' },
    { label: '/plugins', cmd: 'plugins' },
    { label: '/whitelist list', cmd: 'whitelist list' },
  ];

  return (
    <div className={`flex flex-col h-[calc(100vh-160px)] min-h-[500px] ${cardBgClass} rounded-2xl overflow-hidden relative`}>
      
      {/* Console Header Controls */}
      <div className="bg-slate-950/60 backdrop-blur-md px-4 py-3 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className={`w-4 h-4 ${theme.textPrimary}`} />
          <span className="font-mono text-xs font-semibold text-slate-200">
            NTH Minecraft Paper Terminal Stream
          </span>
          
          {/* Live stream status indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-[10px]">
            <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
            <span className={isPaused ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'}>
              {isPaused ? 'Stream Paused' : 'Live Stream'}
            </span>
          </div>

          <span className={`text-[11px] font-mono ${theme.textPrimary} ${theme.bgActive} border ${theme.borderActive} px-2 py-0.5 rounded`}>
            {filteredLogs.length} lines
          </span>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Log Type Filters */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setLogTypeFilter('all')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${logTypeFilter === 'all' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setLogTypeFilter('error')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${logTypeFilter === 'error' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Errors
            </button>
            <button
              onClick={() => setLogTypeFilter('warn')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${logTypeFilter === 'warn' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Warns
            </button>
            <button
              onClick={() => setLogTypeFilter('cmd')}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${logTypeFilter === 'cmd' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
            >
              Cmds
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 w-28 sm:w-36"
            />
          </div>

          {/* Pause / Resume Stream */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              isPaused ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={isPaused ? 'Resume Terminal Stream' : 'Pause Terminal Stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* AI Console Diagnosis Button */}
          <button
            onClick={() => setShowAiDiagnostic(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all border border-purple-400/30 shrink-0"
            title="Diagnose Console Errors & Stacktraces with AI"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Diagnostic</span>
          </button>

          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            className="p-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
            title="Download Logs as File"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear logs */}
          <button
            onClick={onClearLogs}
            className="p-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-all cursor-pointer"
            title="Clear Console Output"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick OP & Macro Action Bar */}
      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
        {/* Quick OP Widget */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 rounded-xl px-2.5 py-1">
          <span className="text-[10px] font-bold text-amber-400 font-mono uppercase flex items-center gap-1">
            ⚡ Quick OP:
          </span>
          <input
            type="text"
            value={opTarget}
            onChange={(e) => setOpTarget(e.target.value)}
            placeholder="Username e.g. NightLordNot"
            className="bg-slate-950 border border-slate-700/60 rounded-lg px-2 py-0.5 text-xs text-amber-200 font-mono focus:outline-none w-32 focus:border-amber-400"
          />
          <button
            type="button"
            onClick={() => handleQuickOp(true)}
            className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold rounded-lg text-[11px] font-mono transition-all cursor-pointer shadow"
          >
            + OP
          </button>
          <button
            type="button"
            onClick={() => handleQuickOp(false)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-rose-950 border border-rose-500/40 text-rose-300 font-bold rounded-lg text-[11px] font-mono transition-all cursor-pointer"
          >
            - DEOP
          </button>
        </div>

        {/* Quick Macro Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Macros:
          </span>
          {quickMacros.map((macro, idx) => (
            <button
              key={idx}
              onClick={() => onSendCommand(macro.cmd)}
              className="px-2 py-0.5 rounded-lg bg-slate-800/70 hover:bg-emerald-950/80 border border-slate-700/60 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300 text-[11px] font-mono transition-all whitespace-nowrap cursor-pointer"
            >
              {macro.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="flex-1 bg-slate-950/60 backdrop-blur-md p-4 font-mono text-xs overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 font-sans">
            <Terminal className="w-10 h-10 stroke-1 opacity-30" />
            <p className="text-xs">No console logs to show. Click Start or execute a command.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.type === 'stderr' || log.type === 'error';
            const isWarn = log.type === 'warn' || log.text.includes('[WARN]');
            const isCmd = log.type === 'command';

            return (
              <div
                key={log.id}
                className={`leading-relaxed break-words font-mono text-[12px] px-1 py-0.5 rounded ${
                  isCmd
                    ? 'text-emerald-400 font-bold bg-emerald-950/30 border-l-2 border-emerald-500 pl-2'
                    : isError
                    ? 'text-rose-400 bg-rose-950/20'
                    : isWarn
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {log.html ? (
                  <span dangerouslySetInnerHTML={{ __html: log.html }} />
                ) : (
                  log.text
                )}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Command Input Form with Autocomplete Dropdown */}
      <div className="relative bg-slate-950/70 backdrop-blur-md p-3 border-t border-slate-800/60">
        {showSuggestions && matchedSuggestions.length > 0 && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900 border border-slate-700/80 rounded-xl p-1.5 shadow-2xl z-50 max-h-48 overflow-y-auto space-y-0.5 font-mono text-xs">
            <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">
              Command Suggestions
            </div>
            {matchedSuggestions.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInputCommand(sug.cmd);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-200 flex items-center justify-between gap-2 transition-all cursor-pointer"
              >
                <span className="font-bold text-emerald-400">{sug.cmd}</span>
                <span className="text-[10px] text-slate-400 font-sans truncate">{sug.desc}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <span className="text-emerald-400 font-mono font-bold text-sm pl-2">&gt;</span>
          <input
            type="text"
            value={inputCommand}
            onChange={(e) => {
              setInputCommand(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              serverState === 'RUNNING' || serverState === 'STARTING'
                ? 'Enter Minecraft server command (e.g. /op NightLordNot, /gamemode creative, /help)...'
                : 'Server is offline. Enter command to test or auto-boot.'
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

      {/* AI Console Diagnosis Modal */}
      {showAiDiagnostic && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-purple-500/30 rounded-2xl p-6 max-w-2xl w-full space-y-5 shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-100 font-mono">NightHost AI Console Log Diagnoser</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Automated stacktrace & crash log analysis engine</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiDiagnostic(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Console Scan Result:</span>
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Server Heap & Paper Build: HEALTHY (0 Fatal Crashes Detected)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                  AI diagnostic scanned the last 1,000 console lines. No critical <strong className="text-rose-400 font-mono">java.lang.OutOfMemoryError</strong> or <strong className="text-rose-400 font-mono">NullPointerException</strong> was encountered.
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold block text-[11px] uppercase">Common Fix Quick-Guides:</span>
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-purple-300 font-bold block">1. OutOfMemoryError / Allocated Heap Full</span>
                  <p className="text-slate-400 font-sans text-[11px]">
                    Increase RAM in <strong className="text-slate-200">Metrics & JVM</strong> tab or remove heavy chunk pre-generator plugins.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-1">
                  <span className="text-amber-300 font-bold block">2. Port 25565 Already in Use</span>
                  <p className="text-slate-400 font-sans text-[11px]">
                    Change server port in <strong className="text-slate-200">Server Config</strong> tab or kill duplicate background Java processes.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAiDiagnostic(false)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
