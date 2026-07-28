import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, RefreshCw, FileText, Globe, Shield, Sparkles } from 'lucide-react';

export const ConfigEditor: React.FC = () => {
  const [props, setProps] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/server/config');
      const data = await res.json();
      if (data.properties) setProps(data.properties);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (key: string, val: string) => {
    setProps(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/server/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: props }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('server.properties successfully saved!');
      }
    } catch {
      setStatusMsg('Failed to save configuration');
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
        <span>Loading server.properties...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {statusMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg animate-fade-in flex items-center justify-between">
          <span>{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Header Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Visual server.properties GUI Editor</h2>
              <p className="text-xs text-slate-400">Configure Minecraft gameplay, difficulty, network ports, and world behavior</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>

        {/* Gameplay & World Settings Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> General Gameplay & World
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* MOTD */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Server MOTD (Message of the Day)
              </label>
              <input
                type="text"
                value={props['motd'] || ''}
                onChange={(e) => handleChange('motd', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="\u00A7bA Minecraft Paper 1.21 Server"
              />
              <span className="text-[11px] text-slate-500">Supports color codes like \u00A7a (Green), \u00A7b (Aqua), \u00A7e (Yellow)</span>
            </div>

            {/* Max Players */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Players: <span className="text-emerald-400 font-mono">{props['max-players'] || '20'}</span>
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={props['max-players'] || '20'}
                onChange={(e) => handleChange('max-players', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Gamemode */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Gamemode
              </label>
              <select
                value={props['gamemode'] || 'survival'}
                onChange={(e) => handleChange('gamemode', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="survival">Survival</option>
                <option value="creative">Creative</option>
                <option value="adventure">Adventure</option>
                <option value="spectator">Spectator</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={props['difficulty'] || 'easy'}
                onChange={(e) => handleChange('difficulty', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="peaceful">Peaceful</option>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Level Seed */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                World Seed
              </label>
              <input
                type="text"
                value={props['level-seed'] || ''}
                onChange={(e) => handleChange('level-seed', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Random seed if empty"
              />
            </div>

            {/* View Distance */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                View Distance (Chunks): <span className="text-emerald-400 font-mono">{props['view-distance'] || '10'}</span>
              </label>
              <input
                type="number"
                min={3}
                max={32}
                value={props['view-distance'] || '10'}
                onChange={(e) => handleChange('view-distance', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Spawn Protection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Spawn Protection Radius
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={props['spawn-protection'] || '16'}
                onChange={(e) => handleChange('spawn-protection', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Network & Rules Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" /> Network, PVP & Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* PVP */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Allow Player vs Player (PVP)</span>
                <span className="text-[11px] text-slate-400">Players can damage and attack each other</span>
              </div>
              <input
                type="checkbox"
                checked={props['pvp'] === 'true'}
                onChange={(e) => handleChange('pvp', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Online Mode */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Online Mode (Mojang Auth)</span>
                <span className="text-[11px] text-slate-400">Enforces official Minecraft accounts login</span>
              </div>
              <input
                type="checkbox"
                checked={props['online-mode'] === 'true'}
                onChange={(e) => handleChange('online-mode', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Allow Flight */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Allow Flight</span>
                <span className="text-[11px] text-slate-400">Prevents kicking players who use flight abilities</span>
              </div>
              <input
                type="checkbox"
                checked={props['allow-flight'] === 'true'}
                onChange={(e) => handleChange('allow-flight', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Enable Command Blocks */}
            <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Enable Command Blocks</span>
                <span className="text-[11px] text-slate-400">Allows execution of command blocks in-game</span>
              </div>
              <input
                type="checkbox"
                checked={props['enable-command-block'] === 'true'}
                onChange={(e) => handleChange('enable-command-block', e.target.checked ? 'true' : 'false')}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
