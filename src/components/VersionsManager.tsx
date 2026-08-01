import React, { useState } from 'react';
import { PanelSettings } from '../types';
import { getThemeStyles, getCardBgClass } from '../utils/theme';
import { Layers, Download, CheckCircle2, RefreshCw, Upload, Sparkles, Shield, Cpu, Zap, Box, Terminal, ChevronRight } from 'lucide-react';

interface VersionsManagerProps {
  settings: PanelSettings;
  onSettingsUpdate: (updated: Partial<PanelSettings>) => void;
}

interface SoftwareEngine {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: string;
  recommendedVersion: string;
  supportedVersions: string[];
  features: string[];
  gradient: string;
}

const SOFTWARE_OPTIONS: SoftwareEngine[] = [
  {
    id: 'Paper',
    name: 'PaperMC',
    description: 'High-performance Spigot fork focused on speed, anti-cheat & plugin compatibility.',
    badge: 'Recommended',
    icon: '⚡',
    recommendedVersion: '1.21.11',
    supportedVersions: ['1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.21.7', '1.21.6', '1.21.5', '1.21.4', '1.21.3', '1.21.2', '1.21.1', '1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9', '1.7.10'],
    features: ['Async Chunk Loading', 'Plugins Support', 'Anti-Xray Built-in', 'Low Latency TPS'],
    gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40',
  },
  {
    id: 'Fabric',
    name: 'Fabric Loader',
    description: 'Lightweight, modular modding toolchain for modern Minecraft versions.',
    badge: 'Popular for Mods',
    icon: '🧵',
    recommendedVersion: '1.21.11',
    supportedVersions: ['1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.21.7', '1.21.6', '1.21.5', '1.21.4', '1.21.3', '1.21.1', '1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5'],
    features: ['Fast Boot Times', 'Fabric Mods (.jar)', 'Custom Dimensions', 'Minimal RAM Overhead'],
    gradient: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40',
  },
  {
    id: 'Purpur',
    name: 'Purpur',
    description: 'Drop-in Paper replacement with hundreds of extra configuration options.',
    badge: 'Customizable',
    icon: '💜',
    recommendedVersion: '1.21.11',
    supportedVersions: ['1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.21.7', '1.21.6', '1.21.5', '1.21.4', '1.21.3', '1.21.1', '1.21', '1.20.6', '1.20.4', '1.20.1'],
    features: ['Rideable Mobs', 'AFK Auto-kick', 'Extra TPS Optimizations', '100% Paper Compatible'],
    gradient: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40',
  },
  {
    id: 'Spigot',
    name: 'Spigot',
    description: 'The standard server modification for Bukkit plugins.',
    badge: 'Classic',
    icon: '🪵',
    recommendedVersion: '1.21.11',
    supportedVersions: ['1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.21.7', '1.21.4', '1.21.3', '1.21.1', '1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9'],
    features: ['Bukkit/Spigot Plugins', 'Legacy Modding Support', 'Stable CraftBukkit API'],
    gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/40',
  },
  {
    id: 'Vanilla',
    name: 'Mojang Vanilla',
    description: 'Pure unmodified official Minecraft server jar directly from Mojang.',
    badge: 'Pure Vanilla',
    icon: '🧱',
    recommendedVersion: '1.21.11',
    supportedVersions: ['1.21.11', '1.21.10', '1.21.9', '1.21.8', '1.21.7', '1.21.6', '1.21.5', '1.21.4', '1.21.3', '1.21.1', '1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9', '1.7.10'],
    features: ['Exact Mojang Physics', 'Redstone Exact Logic', 'Zero Modifications'],
    gradient: 'from-slate-500/20 to-slate-600/10 border-slate-500/40',
  },
  {
    id: 'Forge',
    name: 'Minecraft Forge',
    description: 'Heavy modding framework for large content modpacks.',
    badge: 'Heavy Modpacks',
    icon: '🔨',
    recommendedVersion: '1.20.1',
    supportedVersions: ['1.21.11', '1.21.4', '1.21.1', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.7.10'],
    features: ['Forge Mods Support', 'Complex Block Entities', 'Large Modpack Ready'],
    gradient: 'from-rose-500/20 to-red-500/10 border-rose-500/40',
  },
];

export const VersionsManager: React.FC<VersionsManagerProps> = ({
  settings,
  onSettingsUpdate,
}) => {
  const [selectedSoftware, setSelectedSoftware] = useState<string>(settings.activeSoftware || 'Paper');
  const [selectedVersion, setSelectedVersion] = useState<string>(settings.activeVersion || '1.21.4');
  const [isInstalling, setIsInstalling] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const theme = getThemeStyles(settings.themeColor);
  const cardBgClass = getCardBgClass(settings.hudTransparent);

  const activeSoftwareObj = SOFTWARE_OPTIONS.find(s => s.id === selectedSoftware) || SOFTWARE_OPTIONS[0];

  const handleInstallVersion = async (sw: string, ver: string) => {
    setIsInstalling(true);
    setToastMessage(`Downloading & configuring ${sw} ${ver}...`);

    try {
      const res = await fetch('/api/server/version/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ software: sw, version: ver }),
      });
      const data = await res.json();

      if (data.success) {
        onSettingsUpdate({ activeSoftware: sw, activeVersion: ver });
        setToastMessage(`🎉 Switched server to ${sw} v${ver}!`);
      } else {
        setToastMessage(`Error: ${data.error || 'Failed to switch version'}`);
      }
    } catch {
      setToastMessage('Failed to connect to panel backend');
    } finally {
      setIsInstalling(false);
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  const handleUploadCustomJar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInstalling(true);
    setToastMessage(`Uploading custom jar (${file.name})...`);

    const formData = new FormData();
    formData.append('files', file);

    try {
      const res = await fetch('/api/files/upload?folder=', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onSettingsUpdate({ activeSoftware: 'Custom JAR', activeVersion: file.name });
        setToastMessage(`Uploaded and set ${file.name} as active server executable!`);
      } else {
        setToastMessage('Upload failed');
      }
    } catch {
      setToastMessage('Error during custom jar upload');
    } finally {
      setIsInstalling(false);
      setTimeout(() => setToastMessage(''), 5000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Current Active Version Banner */}
      <div className={`${cardBgClass} rounded-2xl p-6 relative overflow-hidden`}>
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none text-9xl">
          ⚙️
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full ${theme.bgBadge} ${theme.textPrimary} text-[11px] font-mono border ${theme.borderActive} font-semibold flex items-center gap-1`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Server Jar
              </span>
              <span className="text-xs text-slate-400 font-mono">paper.jar</span>
            </div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>{settings.activeSoftware || 'PaperMC'}</span>
              <span className={`${theme.textPrimary} font-mono`}>v{settings.activeVersion || '1.21.4'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Switching version updates the server executable instantly. Supported versions include <strong className="text-slate-200">1.21.11, 1.21.10, 1.21.9, 1.21.8, 1.21.7, 1.21.4, 1.21.1, 1.20.6, 1.20.1</strong> and more.
            </p>
          </div>

          <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg">
            <Upload className={`w-4 h-4 ${theme.textPrimary}`} />
            <span>Upload Custom .jar</span>
            <input type="file" accept=".jar" onChange={handleUploadCustomJar} className="hidden" />
          </label>
        </div>
      </div>

      {/* Software Engine Selection Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>1. Select Server Engine / Software</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOFTWARE_OPTIONS.map((sw) => {
            const isSelected = selectedSoftware === sw.id;
            const isCurrentActive = settings.activeSoftware === sw.id;

            return (
              <div
                key={sw.id}
                onClick={() => {
                  setSelectedSoftware(sw.id);
                  if (!sw.supportedVersions.includes(selectedVersion)) {
                    setSelectedVersion(sw.recommendedVersion);
                  }
                }}
                className={`bg-slate-900/60 backdrop-blur-md border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? `border-emerald-500 shadow-xl bg-gradient-to-br ${sw.gradient}`
                    : 'border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{sw.icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                          <span>{sw.name}</span>
                          {isCurrentActive && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-mono border border-emerald-500/30">
                              ACTIVE
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">{sw.badge}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'border-emerald-400 bg-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-950'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {sw.description}
                  </p>

                  <div className="space-y-1 mb-4">
                    {sw.features.map((feat) => (
                      <div key={feat} className="text-[11px] text-slate-300 flex items-center gap-1.5 font-sans">
                        <span className="text-emerald-400 text-[10px]">✓</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Rec: v{sw.recommendedVersion}</span>
                  <span className="text-slate-500">{sw.supportedVersions.length} Versions</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minecraft Version Selection */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>2. Select Minecraft Version for {activeSoftwareObj.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your target Minecraft release (e.g., 1.21.11, 1.21.10, 1.21.4, 1.20.1)
            </p>
          </div>

          <button
            onClick={() => handleInstallVersion(selectedSoftware, selectedVersion)}
            disabled={isInstalling}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            {isInstalling ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Install {selectedSoftware} v{selectedVersion}</span>
          </button>
        </div>

        {/* Version Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2.5 pt-2">
          {activeSoftwareObj.supportedVersions.map((ver) => {
            const isSelectedVer = selectedVersion === ver;
            const isInstalledActive = settings.activeSoftware === selectedSoftware && settings.activeVersion === ver;

            return (
              <button
                key={ver}
                onClick={() => setSelectedVersion(ver)}
                className={`px-3 py-2.5 rounded-xl border font-mono text-xs text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelectedVer
                    ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-md shadow-emerald-950/40 scale-[1.02]'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <span className="text-xs font-bold">1.{ver.split('.')[1]}.{ver.split('.')[2] || '0'}</span>
                <span className={`text-[10px] ${isSelectedVer ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {isInstalledActive ? 'Active' : `v${ver}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
