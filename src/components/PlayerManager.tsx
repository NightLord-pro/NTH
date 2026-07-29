import React, { useState, useEffect } from 'react';
import { PlayerInfo } from '../types';
import { Users, Shield, ShieldOff, UserX, UserCheck, Wifi, UserPlus, RefreshCw } from 'lucide-react';

export const PlayerManager: React.FC = () => {
  const [onlinePlayers, setOnlinePlayers] = useState<PlayerInfo[]>([]);
  const [bannedPlayers, setBannedPlayers] = useState<string[]>([]);
  const [whitelistedPlayers, setWhitelistedPlayers] = useState<string[]>([]);
  const [newPlayerInput, setNewPlayerInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const [addOnlineName, setAddOnlineName] = useState('');

  const fetchPlayerData = async () => {
    try {
      const res = await fetch('/api/players');
      const data = await res.json();
      if (data.online) setOnlinePlayers(data.online);
      if (data.banned) setBannedPlayers(data.banned);
      if (data.whitelisted) setWhitelistedPlayers(data.whitelisted);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPlayerData();
    const interval = setInterval(fetchPlayerData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayerAction = async (action: string, username: string, reason?: string) => {
    try {
      const res = await fetch('/api/players/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, username, reason }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Executed ${action} on ${username}`);
        fetchPlayerData();
      }
    } catch {
      setStatusMsg('Player action failed');
    } finally {
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleAddLivePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addOnlineName.trim()) return;
    handlePlayerAction('add-online', addOnlineName.trim());
    setAddOnlineName('');
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {statusMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg animate-fade-in flex items-center justify-between">
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Online Players Banner & Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">Online Players ({onlinePlayers.length})</h2>
              <p className="text-xs text-slate-400">Live active connected Minecraft players</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <form onSubmit={handleAddLivePlayer} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Connect player name..."
                value={addOnlineName}
                onChange={(e) => setAddOnlineName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-36 sm:w-48 font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connect</span>
              </button>
            </form>

            <button
              onClick={fetchPlayerData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Refresh player list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Players Table */}
        <div className="overflow-x-auto">
          {onlinePlayers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No players currently connected to the server.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Ping</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {onlinePlayers.map((player) => (
                  <tr key={player.uuid} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Player avatar & name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://mc-heads.net/avatar/${player.username}/32`}
                          alt={player.username}
                          className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700"
                          onError={(e) => {
                            // Fallback Steve head if image offline
                            (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/MHF_Steve/32';
                          }}
                        />
                        <div>
                          <span className="font-bold text-slate-200 block text-xs">{player.username}</span>
                          <span className="text-[10px] text-slate-500">{player.uuid.substring(0, 18)}...</span>
                        </div>
                      </div>
                    </td>

                    {/* Ping */}
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Wifi className="w-3 h-3" /> {player.ping} ms
                      </span>
                    </td>

                    {/* IP */}
                    <td className="py-3 px-4 text-slate-400">
                      {player.ip}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      {player.isOp ? (
                        <span className="px-2 py-0.5 bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                          <Shield className="w-3 h-3 text-amber-400" /> OP
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Player</span>
                      )}
                    </td>

                    {/* Player Control Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {player.isOp ? (
                          <button
                            onClick={() => handlePlayerAction('deop', player.username)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                            title="DeOP Player"
                          >
                            DeOP
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePlayerAction('op', player.username)}
                            className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-800/60 text-amber-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                            title="Make Operator"
                          >
                            OP
                          </button>
                        )}

                        <button
                          onClick={() => handlePlayerAction('kick', player.username, 'Kicked via panel')}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          Kick
                        </button>

                        <button
                          onClick={() => handlePlayerAction('ban', player.username, 'Banned via panel')}
                          className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          Ban
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Whitelist & Banlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Whitelist Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Whitelisted Players ({whitelistedPlayers.length})
            </h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Minecraft Username..."
              value={newPlayerInput}
              onChange={(e) => setNewPlayerInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                if (newPlayerInput.trim()) {
                  handlePlayerAction('whitelist-add', newPlayerInput.trim());
                  setNewPlayerInput('');
                }
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {whitelistedPlayers.map((name) => (
              <div key={name} className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <span className="text-slate-200">{name}</span>
                <button
                  onClick={() => handlePlayerAction('whitelist-remove', name)}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Banlist Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-400" /> Banned Players ({bannedPlayers.length})
            </h3>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {bannedPlayers.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-4">No banned players.</p>
            ) : (
              bannedPlayers.map((name) => (
                <div key={name} className="flex items-center justify-between p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                  <span className="text-rose-400 font-bold">{name}</span>
                  <button
                    onClick={() => handlePlayerAction('pardon', name)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Pardon
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
