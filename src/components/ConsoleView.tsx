import React, { useState, useEffect, useRef } from 'react';
import { ConsoleLog, ServerState, PanelSettings } from '../types';
import { getThemeStyles, getCardBgClass } from '../utils/theme';
import { Terminal, Send, Trash2, Search, ArrowDown, Sparkles } from 'lucide-react';

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
  const [autoScroll, setAutoScroll] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const theme = getThemeStyles(settings?.themeColor);
  const cardBgClass = getCardBgClass(settings?.hudTransparent);

  // Auto-scroll logic
  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;

    onSendCommand(inputCommand);
    setHistory(prev => [inputCommand, ...prev]);
    setHistoryIndex(-1);
    setInputCommand('');
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
    }
  };

  const filteredLogs = logs.filter(log =>
    log.text.toLowerCase().includes(filterText.toLowerCase())
  );

  const quickMacros = [
    { label: '/help', cmd: 'help' },
    { label: '/list players', cmd: 'list' },
    { label: '/say Hello Minecraft!', cmd: 'say Hello Everyone!' },
    { label: '/plugins', cmd: 'plugins' },
    { label: '/op Alex', cmd: 'op Alex' },
    { label: '/time set day', cmd: 'time set day' },
    { label: '/weather clear', cmd: 'weather clear' },
    { label: '/whitelist list', cmd: 'whitelist list' },
  ];

  return (
    <div className={`flex flex-col h-[calc(100vh-160px)] min-h-[500px] ${cardBgClass} rounded-2xl overflow-hidden`}>
      
      {/* Console Header Controls */}
      <div className="bg-slate-950/60 backdrop-blur-md px-4 py-3 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className={`w-4 h-4 ${theme.textPrimary}`} />
          <span className="font-mono text-xs font-semibold text-slate-200">
            Minecraft Paper Server Terminal
          </span>
          <span className={`text-[11px] font-mono ${theme.textPrimary} ${theme.bgActive} border ${theme.borderActive} px-2 py-0.5 rounded`}>
            {filteredLogs.length} lines
          </span>
        </div>

        {/* Filter & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 w-36 sm:w-48"
            />
          </div>

          {/* Auto scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
              autoScroll
                ? `${theme.bgActive} ${theme.borderActive} ${theme.badgeText}`
                : 'bg-slate-800/50 border-slate-700 text-slate-400'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>Auto-Scroll</span>
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

      {/* Quick Macro Pills */}
      <div className="bg-slate-950/40 px-4 py-2 border-b border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-amber-400" /> Quick Macros:
        </span>
        {quickMacros.map((macro, idx) => (
          <button
            key={idx}
            onClick={() => onSendCommand(macro.cmd)}
            className="px-2.5 py-0.5 rounded bg-slate-800/70 hover:bg-emerald-950/80 border border-slate-700/60 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300 text-[11px] font-mono transition-all whitespace-nowrap cursor-pointer"
          >
            {macro.label}
          </button>
        ))}
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

      {/* Command Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-950/70 backdrop-blur-md p-3 border-t border-slate-800/60 flex items-center gap-2">
        <span className="text-emerald-400 font-mono font-bold text-sm pl-2">&gt;</span>
        <input
          type="text"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            serverState === 'RUNNING' || serverState === 'STARTING'
              ? 'Enter Minecraft server command (e.g. /say, /op, /whitelist, /help)...'
              : 'Server is stopped. Commands will queue or test simulator.'
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
  );
};
