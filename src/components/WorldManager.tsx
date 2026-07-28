import React, { useState, useEffect, useRef } from 'react';
import { WorldInfo } from '../types';
import { Globe, Plus, Download, Upload, Trash2, CheckCircle2, RefreshCw, Sparkles, Sun, CloudRain, ShieldAlert, Compass, Box, HardDrive, Layers } from 'lucide-react';

export const WorldManager: React.FC = () => {
  const [worlds, setWorlds] = useState<WorldInfo[]>([]);
  const [activeLevelName, setActiveLevelName] = useState('world');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Create World Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorldName, setNewWorldName] = useState('');
  const [newWorldSeed, setNewWorldSeed] = useState('');
  const [newWorldDimension, setNewWorldDimension] = useState<'normal' | 'nether' | 'the_end' | 'custom'>('normal');

  // File Upload Ref
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const fetchWorlds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/worlds');
      const data = await res.json();
      if (data.worlds) setWorlds(data.worlds);
      if (data.activeLevelName) setActiveLevelName(data.activeLevelName);
    } catch {
      setMessage('Failed to load worlds list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorlds();
  }, []);

  const handleSetActiveWorld = async (folderName: string) => {
    try {
      const res = await fetch('/api/worlds/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✨ Set "${folderName}" as the active primary world! Restart server to apply.`);
        fetchWorlds();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Failed to set active world');
    } finally {
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleCreateWorld = async () => {
    if (!newWorldName.trim()) return;

    try {
      const res = await fetch('/api/worlds/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorldName.trim(),
          seed: newWorldSeed.trim(),
          dimension: newWorldDimension,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🎉 Created world folder "${data.folderName}"!`);
        setShowCreateModal(false);
        setNewWorldName('');
        setNewWorldSeed('');
        fetchWorlds();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Failed to create world');
    } finally {
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleUploadWorldZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(`Uploading & extracting world zip (${file.name})...`);

    const formData = new FormData();
    formData.append('worldZip', file);

    try {
      const res = await fetch('/api/worlds/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🎉 Successfully imported world "${data.folderName}"!`);
        fetchWorlds();
      } else {
        setMessage(`Import failed: ${data.error}`);
      }
    } catch {
      setMessage('Error uploading world zip');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDeleteWorld = async (folderName: string) => {
    if (folderName === activeLevelName) {
      alert('Cannot delete the currently active server world! Switch active world first.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete world "${folderName}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/worlds/delete?folder=${encodeURIComponent(folderName)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Deleted world folder "${folderName}"`);
        fetchWorlds();
      }
    } catch {
      setMessage('Failed to delete world');
    } finally {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleWorldCommand = async (command: string) => {
    try {
      await fetch('/api/server/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'command', command }),
      });
      setMessage(`Executed: /${command}`);
    } catch {
      setMessage('Command failed');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Toast Notification */}
      {message && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-mono border border-emerald-800/60 font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> NightHost World Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">level-name={activeLevelName}</span>
          </div>
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <span>Minecraft Worlds & Map Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Switch active dimension maps, upload custom world `.zip` saves, or generate new Nether/End seeds for <strong className="text-slate-200">NightHost (NTH)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create World</span>
          </button>

          <button
            onClick={() => uploadInputRef.current?.click()}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Upload World .zip</span>
            <input
              ref={uploadInputRef}
              type="file"
              accept=".zip"
              onChange={handleUploadWorldZip}
              className="hidden"
            />
          </button>

          <button
            onClick={fetchWorlds}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
            title="Refresh Worlds"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick World Tools Bar */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" /> Quick World Controls:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleWorldCommand('time set day')}
            className="px-3 py-1.5 bg-slate-950/70 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono border border-slate-800/60 cursor-pointer backdrop-blur-sm"
          >
            ☀️ Set Day
          </button>
          <button
            onClick={() => handleWorldCommand('weather clear')}
            className="px-3 py-1.5 bg-slate-950/70 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono border border-slate-800/60 cursor-pointer backdrop-blur-sm"
          >
            🌤️ Clear Weather
          </button>
          <button
            onClick={() => handleWorldCommand('gamerule doDaylightCycle false')}
            className="px-3 py-1.5 bg-slate-950/70 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono border border-slate-800/60 cursor-pointer backdrop-blur-sm"
          >
            ⏸️ Lock Daylight
          </button>
          <button
            onClick={() => handleWorldCommand('gamerule doMobSpawning false')}
            className="px-3 py-1.5 bg-slate-950/70 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-mono border border-slate-800/60 cursor-pointer backdrop-blur-sm"
          >
            🚫 Disable Mob Spawn
          </button>
        </div>
      </div>

      {/* Worlds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {worlds.map((w) => {
          const isActive = w.folderName === activeLevelName;

          return (
            <div
              key={w.folderName}
              className={`bg-slate-900/60 backdrop-blur-md border rounded-2xl p-5 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between ${
                isActive ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-950/20' : 'border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {w.dimensionType === 'nether' ? '🔥' : w.dimensionType === 'the_end' ? '🌌' : '🌍'}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <span>{w.folderName}</span>
                        {isActive && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.2 rounded font-mono font-bold border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono capitalize">
                        {w.dimensionType} Dimension
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    {formatSize(w.sizeBytes)}
                  </span>
                </div>

                <div className="space-y-1 my-3 text-xs text-slate-400 font-mono">
                  <p className="flex justify-between">
                    <span>Path:</span>
                    <span className="text-slate-300">server-files/{w.folderName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Updated:</span>
                    <span className="text-slate-300">{new Date(w.updatedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {isActive ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Current Active
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetActiveWorld(w.folderName)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Set Active
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <a
                    href={`/api/worlds/download?folder=${encodeURIComponent(w.folderName)}`}
                    download
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors"
                    title="Download World (.zip)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  {!isActive && (
                    <button
                      onClick={() => handleDeleteWorld(w.folderName)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg cursor-pointer transition-colors"
                      title="Delete World Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create World Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Create New World Map
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">World Folder Name</label>
                <input
                  type="text"
                  placeholder="e.g. survival_world_v2"
                  value={newWorldName}
                  onChange={(e) => setNewWorldName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">World Seed (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. -8493021948 or leave blank for random"
                  value={newWorldSeed}
                  onChange={(e) => setNewWorldSeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Dimension Type</label>
                <select
                  value={newWorldDimension}
                  onChange={(e: any) => setNewWorldDimension(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="normal">Overworld (Normal)</option>
                  <option value="nether">Nether Dimension</option>
                  <option value="the_end">The End Dimension</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorld}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
              >
                Create World
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
