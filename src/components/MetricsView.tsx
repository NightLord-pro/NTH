import React, { useState } from 'react';
import { ServerMetrics, ServerState } from '../types';
import { Activity, Cpu, HardDrive, Zap, Clock, Download, AlertTriangle, ShieldCheck, Save, RefreshCw } from 'lucide-react';

interface MetricsViewProps {
  metrics: ServerMetrics | null;
  serverState: ServerState;
  javaAvailable: boolean;
  paperJarPresent: boolean;
  isSimulatorMode: boolean;
  onDownloadPaperJar: () => Promise<void>;
  onSaveJvmConfig: (config: { minRamGb: number; maxRamGb: number; customJvmArgs: string; autoRestartOnCrash: boolean }) => Promise<void>;
  initialMinRam: number;
  initialMaxRam: number;
  initialJvmArgs: string;
  initialAutoRestart: boolean;
}

export const MetricsView: React.FC<MetricsViewProps> = ({
  metrics,
  serverState,
  javaAvailable,
  paperJarPresent,
  isSimulatorMode,
  onDownloadPaperJar,
  onSaveJvmConfig,
  initialMinRam,
  initialMaxRam,
  initialJvmArgs,
  initialAutoRestart,
}) => {
  const [minRam, setMinRam] = useState(initialMinRam);
  const [maxRam, setMaxRam] = useState(initialMaxRam);
  const [jvmArgs, setJvmArgs] = useState(initialJvmArgs);
  const [autoRestart, setAutoRestart] = useState(initialAutoRestart);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const formatUptime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs}h ${mins}m ${s}s`;
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadPaperJar();
      setToastMsg('Paper 1.21.4 server jar downloaded successfully!');
    } catch {
      setToastMsg('Error downloading paper.jar');
    } finally {
      setIsDownloading(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveJvmConfig({
        minRamGb: minRam,
        maxRamGb: maxRam,
        customJvmArgs: jvmArgs,
        autoRestartOnCrash: autoRestart,
      });
      setToastMsg('JVM memory & process configuration updated!');
    } catch {
      setToastMsg('Failed to update config');
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const memPercent = metrics ? Math.round((metrics.memoryUsageMB / metrics.memoryMaxMB) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg animate-fade-in flex items-center justify-between">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* System Runtime Warning / Status banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        javaAvailable && paperJarPresent
          ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
          : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
      }`}>
        <div className="flex items-start gap-3">
          {javaAvailable && paperJarPresent ? (
            <ShieldCheck className="w-6 h-6 text-emerald-400 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" />
          )}
          <div>
            <h3 className="font-semibold text-sm">
              {javaAvailable && paperJarPresent
                ? 'Java Runtime & Paper 1.21.4 Jar Ready'
                : !javaAvailable
                ? 'Java OpenJDK 21 Not Installed on VPS (Running Paper Engine Simulator)'
                : 'paper.jar File Missing from server-files/'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {!javaAvailable
                ? 'The panel is running in high-fidelity Minecraft Paper Engine Simulator mode with live interactive commands. To execute real Java binaries, install OpenJDK 21 on your Linux server (`apt install openjdk-21-jre-headless`).'
                : !paperJarPresent
                ? 'Download the official PaperMC 1.21.4 server executable below with 1-click.'
                : 'Process will spawn as: java -Xms' + minRam + 'G -Xmx' + maxRam + 'G -jar paper.jar nogui'}
            </p>
          </div>
        </div>

        {!paperJarPresent && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download Paper 1.21.4 Jar</span>
          </button>
        )}
      </div>

      {/* Real-time Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CPU Usage Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-sans tracking-wider">CPU Usage</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black font-mono text-slate-100">
              {metrics ? metrics.cpuPercent : 0}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics?.cpuPercent || 0, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Process CPU Load</span>
        </div>

        {/* RAM Usage Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-sans tracking-wider">RAM Usage</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black font-mono text-slate-100">
              {metrics ? (metrics.memoryUsageMB / 1024).toFixed(2) : 0} <span className="text-sm font-normal text-slate-400">/ {(metrics?.memoryMaxMB || 0) / 1024} GB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(memPercent, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{memPercent}% Allocated</span>
        </div>

        {/* TPS Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-sans tracking-wider">Server TPS</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3">
            <div className={`text-2xl font-black font-mono ${metrics && metrics.tps >= 19.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metrics ? metrics.tps : '0.0'} <span className="text-xs text-slate-400 font-normal">/ 20.0</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${metrics && metrics.tps >= 19 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(((metrics?.tps || 0) / 20) * 100, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Target: 20 Ticks/sec</span>
        </div>

        {/* Uptime Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase font-sans tracking-wider">Server Uptime</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-3">
            <div className="text-xl font-bold font-mono text-slate-100">
              {metrics ? formatUptime(metrics.uptimeSeconds) : '0h 0m 0s'}
            </div>
            <p className="text-xs text-slate-400 mt-1">Status: <span className="text-emerald-400 font-semibold">{serverState}</span></p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Continuous runtime</span>
        </div>
      </div>

      {/* JVM & Memory Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
          <Activity className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="font-bold text-slate-100 text-base">JVM Memory & Execution Parameters</h2>
            <p className="text-xs text-slate-400">Configure Java Xms, Xmx heap allocation and process behavior</p>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Min RAM */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Initial Heap Allocation (-Xms): <span className="text-emerald-400 font-mono">{minRam} GB</span>
              </label>
              <input
                type="range"
                min={1}
                max={16}
                value={minRam}
                onChange={(e) => setMinRam(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">Minimum RAM allocated on startup</span>
            </div>

            {/* Max RAM */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maximum Heap Allocation (-Xmx): <span className="text-emerald-400 font-mono">{maxRam} GB</span>
              </label>
              <input
                type="range"
                min={1}
                max={32}
                value={maxRam}
                onChange={(e) => setMaxRam(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">Maximum heap limit before garbage collection</span>
            </div>
          </div>

          {/* Custom JVM Args */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom JVM Arguments & Flags
            </label>
            <input
              type="text"
              value={jvmArgs}
              onChange={(e) => setJvmArgs(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              placeholder="-XX:+UseG1GC -XX:+ParallelRefProcEnabled"
            />
            <span className="text-[11px] text-slate-500">Recommended flags for Aikar's Paper optimization</span>
          </div>

          {/* Auto Restart Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Automatic Crash Restart</span>
              <span className="text-[11px] text-slate-400">Automatically restart the Java process if it exits unexpectedly</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoRestart(!autoRestart)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                autoRestart ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  autoRestart ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Process Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
