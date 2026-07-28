import React, { useState, useEffect } from 'react';
import { BackupInfo } from '../types';
import { Archive, Download, RotateCcw, Trash2, Plus, ShieldCheck, RefreshCw, Sparkles, Clock, CheckCircle2, HardDrive } from 'lucide-react';

export const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [backupDescription, setBackupDescription] = useState('');
  const [autoBackupInterval, setAutoBackupInterval] = useState('disabled');
  const [message, setMessage] = useState('');

  const fetchBackups = async () => {
    try {
      const res = await fetch('/api/backups');
      const data = await res.json();
      if (data.backups) setBackups(data.backups);
      if (data.autoBackupInterval) setAutoBackupInterval(data.autoBackupInterval);
    } catch {
      setMessage('Failed to load backups list');
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    setMessage('Generating zip archive of server files & worlds...');

    try {
      const res = await fetch('/api/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: backupDescription.trim() || 'Manual Backup' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🎉 Created backup archive "${data.filename}" (${(data.sizeBytes / (1024 * 1024)).toFixed(1)} MB)!`);
        setBackupDescription('');
        fetchBackups();
      } else {
        setMessage(`Backup failed: ${data.error}`);
      }
    } catch {
      setMessage('Error creating backup');
    } finally {
      setIsCreating(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`⚠️ RESTORE WARNING:\nRestoring "${filename}" will overwrite existing server files and worlds with this snapshot.\n\nAre you sure you want to proceed?`)) return;

    setIsRestoring(filename);
    setMessage(`Restoring snapshot ${filename}...`);

    try {
      const res = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🎉 Successfully restored server state from backup! Restart server to complete.`);
        fetchBackups();
      } else {
        setMessage(`Restore failed: ${data.error}`);
      }
    } catch {
      setMessage('Error restoring backup');
    } finally {
      setIsRestoring(null);
      setTimeout(() => setMessage(''), 6000);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Delete backup "${filename}"?`)) return;

    try {
      const res = await fetch(`/api/backups/delete?filename=${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Deleted backup ${filename}`);
        fetchBackups();
      }
    } catch {
      setMessage('Failed to delete backup');
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSetAutoBackup = async (interval: string) => {
    setAutoBackupInterval(interval);
    try {
      await fetch('/api/backups/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval }),
      });
      setMessage(`Updated automatic backup schedule to: ${interval}`);
    } catch {
      setMessage('Failed to update schedule');
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

      {/* Header & Create Backup Panel */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-mono border border-emerald-800/60 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> NightHost Snapshots
              </span>
              <span className="text-xs text-slate-400 font-mono">{backups.length} Snapshots Saved</span>
            </div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>Backups & Disaster Recovery</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Create compressed zip snapshots of worlds, configs, and plugins for instant 1-click restore.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={autoBackupInterval}
              onChange={(e) => handleSetAutoBackup(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
            >
              <option value="disabled">Auto-Backup: Disabled</option>
              <option value="6h">Auto-Backup: Every 6 Hours</option>
              <option value="12h">Auto-Backup: Every 12 Hours</option>
              <option value="24h">Auto-Backup: Daily (24h)</option>
            </select>
          </div>
        </div>

        {/* Quick Create Backup Form */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            placeholder="Backup description (e.g., Before installing Essentials plugin / Before World Reset)..."
            value={backupDescription}
            onChange={(e) => setBackupDescription(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full"
          />

          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
          >
            {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
            <span>{isCreating ? 'Creating Backup...' : 'Create Backup Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Backups Table / Cards */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" /> Saved Backup Archives ({backups.length})
          </h3>

          <button onClick={fetchBackups} className="p-1.5 bg-slate-800 text-slate-300 rounded-lg hover:text-white cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {backups.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Archive className="w-12 h-12 stroke-1 mx-auto text-slate-600" />
            <p className="text-sm font-medium text-slate-400">No backup snapshots created yet</p>
            <p className="text-xs text-slate-500">Click "Create Backup Snapshot" above to take your first server snapshot.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Backup File</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-400 flex items-center gap-2">
                      <Archive className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{b.filename}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {b.description || 'Manual Backup'}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {formatSize(b.sizeBytes)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/backups/download/${encodeURIComponent(b.filename)}`}
                          download
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>Download</span>
                        </a>

                        <button
                          onClick={() => handleRestoreBackup(b.filename)}
                          disabled={isRestoring === b.filename}
                          className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/60 text-amber-300 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          {isRestoring === b.filename ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => handleDeleteBackup(b.filename)}
                          className="p-1 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                          title="Delete Backup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
