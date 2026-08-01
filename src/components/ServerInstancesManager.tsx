import React, { useState, useEffect } from 'react';
import { ServerInstance, PanelSettings } from '../types';
import { getThemeStyles } from '../utils/theme';
import {
  Server,
  Plus,
  Play,
  Square,
  RotateCw,
  Trash2,
  CheckCircle2,
  Cpu,
  HardDrive,
  Users,
  Settings,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Check,
  X,
  RefreshCw,
  Edit3,
  Sliders,
  Radio,
  Gamepad2,
  Key,
} from 'lucide-react';

interface ServerInstancesManagerProps {
  settings: PanelSettings;
  activeServerId: string;
  onSelectServer: (serverId: string) => void;
  onOpenConsole: () => void;
  currentUser?: any;
}

export const ServerInstancesManager: React.FC<ServerInstancesManagerProps> = ({
  settings,
  activeServerId,
  onSelectServer,
  onOpenConsole,
  currentUser,
}) => {
  const isOwnerOrAdmin = !currentUser || currentUser.role === 'Administrator' || currentUser.role === 'Owner';
  const canCreateServer = isOwnerOrAdmin || currentUser?.permissions?.canCreateServers === true;
  const [servers, setServers] = useState<ServerInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSoftware, setFilterSoftware] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  // Comprehensive Form State for Server Creation / Editing
  const [formName, setFormName] = useState('');
  const [formMotd, setFormMotd] = useState('§aWelcome to §bMinecraft Server! §e[1.21.4]');
  const [formDesc, setFormDesc] = useState('');
  const [formSoftware, setFormSoftware] = useState('Paper');
  const [formVersion, setFormVersion] = useState('1.21.4');
  const [formPort, setFormPort] = useState(25565);
  const [formServerAddress, setFormServerAddress] = useState('play.nighthost.in:25565');
  const [formMinRamGb, setFormMinRamGb] = useState(2);
  const [formMaxRamGb, setFormMaxRamGb] = useState(4);
  const [formMaxPlayers, setFormMaxPlayers] = useState(20);
  const [formGamemode, setFormGamemode] = useState<'survival' | 'creative' | 'adventure' | 'spectator'>('survival');
  const [formDifficulty, setFormDifficulty] = useState<'peaceful' | 'easy' | 'normal' | 'hard'>('easy');
  const [formOnlineMode, setFormOnlineMode] = useState(false); // false = cracked support, true = premium
  const [formPvp, setFormPvp] = useState(true);
  const [formCommandBlocks, setFormCommandBlocks] = useState(true);
  const [formColorTag, setFormColorTag] = useState<'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' | 'indigo'>('emerald');
  const [formAssignedUser, setFormAssignedUser] = useState('admin');
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const theme = getThemeStyles(settings.themeColor);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setSystemUsers(data);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    }
  };

  const fetchServers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/servers');
      if (res.ok) {
        const data = await res.json();
        if (data.instances) {
          setServers(data.instances);
        }
      }
    } catch (err) {
      console.error('Failed to fetch servers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    fetchUsers();
    const interval = setInterval(fetchServers, 4000);
    return () => clearInterval(interval);
  }, []);

  const openCreateModal = () => {
    if (!canCreateServer) {
      setActionMsg('🚫 Server Creation Restricted: Only Panel Owner / Administrator can create new server instances.');
      setTimeout(() => setActionMsg(''), 5000);
      return;
    }
    setEditingServerId(null);
    setFormName('');
    setFormMotd('§aWelcome to §bNightHost SMP! §e[1.21.4]');
    setFormDesc('Custom survival server instance node');
    setFormSoftware('Paper');
    setFormVersion('1.21.4');
    const defaultPort = 25565 + servers.length;
    setFormPort(defaultPort);
    setFormServerAddress(`play${servers.length > 0 ? (servers.length + 1) : ''}.nighthost.in:${defaultPort}`);
    setFormMinRamGb(2);
    setFormMaxRamGb(4);
    setFormMaxPlayers(20);
    setFormGamemode('survival');
    setFormDifficulty('easy');
    setFormOnlineMode(false);
    setFormPvp(true);
    setFormCommandBlocks(true);
    setFormColorTag('emerald');
    setFormAssignedUser('admin');
    setShowModal(true);
  };

  const openEditModal = (srv: ServerInstance) => {
    setEditingServerId(srv.id);
    setFormName(srv.name);
    setFormMotd(srv.motd || `${srv.name} Server`);
    setFormDesc(srv.description || '');
    setFormSoftware(srv.software || 'Paper');
    setFormVersion(srv.version || '1.21.4');
    setFormPort(srv.port || 25565);
    const fallbackSubdomain = srv.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'play';
    setFormServerAddress(srv.serverAddress || `${fallbackSubdomain}.nighthost.in:${srv.port || 25565}`);
    setFormMinRamGb(srv.minRamGb || 2);
    setFormMaxRamGb(srv.maxRamGb || 4);
    setFormMaxPlayers(srv.maxPlayers || 20);
    setFormGamemode(srv.gamemode || 'survival');
    setFormDifficulty(srv.difficulty || 'easy');
    setFormOnlineMode(srv.onlineMode ?? false);
    setFormPvp(srv.pvp ?? true);
    setFormCommandBlocks(srv.commandBlocks ?? true);
    setFormColorTag(srv.colorTag || 'emerald');
    setFormAssignedUser(srv.assignedUser || 'admin');
    setShowModal(true);
  };

  const handleSelectServer = async (id: string) => {
    try {
      const res = await fetch('/api/servers/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: id }),
      });
      if (res.ok) {
        onSelectServer(id);
        setActionMsg(`Switched active server instance!`);
        setTimeout(() => setActionMsg(''), 3000);
        fetchServers();
      }
    } catch (err) {
      console.error('Failed to select server:', err);
    }
  };

  const handleServerPowerAction = async (serverId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const res = await fetch(`/api/servers/${serverId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setActionMsg(`Command ${action.toUpperCase()} sent to server node`);
        setTimeout(() => setActionMsg(''), 3000);
        fetchServers();
      }
    } catch (err) {
      console.error('Failed power action:', err);
    }
  };

  const handleDeleteServer = async (serverId: string, serverName: string) => {
    if (!confirm(`Are you sure you want to delete server instance "${serverName}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/servers/${serverId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActionMsg(`Deleted server "${serverName}"`);
        setTimeout(() => setActionMsg(''), 3000);
        fetchServers();
      }
    } catch (err) {
      console.error('Failed to delete server:', err);
    }
  };

  const handleAssignServerToUser = async (serverId: string, targetUsername: string) => {
    try {
      const res = await fetch(`/api/servers/${serverId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUsername }),
      });
      if (res.ok) {
        setActionMsg(`Allocated server to @${targetUsername}!`);
        setTimeout(() => setActionMsg(''), 3000);
        fetchServers();
      }
    } catch (err) {
      console.error('Failed to assign server:', err);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      software: formSoftware,
      version: formVersion,
      port: Number(formPort) || 25565,
      minRamGb: Number(formMinRamGb) || 2,
      maxRamGb: Number(formMaxRamGb) || 4,
      maxPlayers: Number(formMaxPlayers) || 20,
      motd: formMotd.trim(),
      colorTag: formColorTag,
      gamemode: formGamemode,
      difficulty: formDifficulty,
      onlineMode: formOnlineMode,
      pvp: formPvp,
      commandBlocks: formCommandBlocks,
      assignedUser: formAssignedUser,
      serverAddress: formServerAddress.trim(),
    };

    try {
      if (editingServerId) {
        // PUT update existing server
        const res = await fetch(`/api/servers/${editingServerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setActionMsg(`Updated server instance "${formName}" settings!`);
          setShowModal(false);
          setTimeout(() => setActionMsg(''), 3000);
          fetchServers();
        }
      } else {
        // POST create new server
        const res = await fetch('/api/servers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const created = await res.json();
          setActionMsg(`Successfully created server instance "${formName}"!`);
          setShowModal(false);
          setTimeout(() => setActionMsg(''), 3000);
          fetchServers();
          if (created.instance?.id) {
            handleSelectServer(created.instance.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to save server:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (preset: 'survival' | 'bedwars' | 'proxy' | 'skyblock' | 'anarchy') => {
    if (preset === 'survival') {
      setFormName('Survival SMP Realm');
      setFormMotd('§a§lNightHost SMP §r§7| §eSurvival World [1.21.4]');
      setFormDesc('Standard Survival Multiplayer world with plugins, claims & economy');
      setFormSoftware('Paper');
      setFormVersion('1.21.4');
      setFormPort(25565);
      setFormMaxRamGb(4);
      setFormMinRamGb(2);
      setFormMaxPlayers(20);
      setFormGamemode('survival');
      setFormDifficulty('easy');
      setFormOnlineMode(false);
      setFormPvp(true);
      setFormCommandBlocks(true);
      setFormColorTag('emerald');
    } else if (preset === 'bedwars') {
      setFormName('Bedwars & Minigames Node');
      setFormMotd('§c§lBedwars Arena Network §r§7| §aCustom Minigames');
      setFormDesc('High performance minigame engine with arena maps & fast respawn');
      setFormSoftware('Purpur');
      setFormVersion('1.20.4');
      setFormPort(25566);
      setFormMaxRamGb(6);
      setFormMinRamGb(3);
      setFormMaxPlayers(50);
      setFormGamemode('survival');
      setFormDifficulty('peaceful');
      setFormOnlineMode(false);
      setFormPvp(true);
      setFormCommandBlocks(true);
      setFormColorTag('purple');
    } else if (preset === 'proxy') {
      setFormName('Velocity Proxy Network');
      setFormMotd('§b§lVelocity Proxy Hub §r§7| §fNetwork Routing');
      setFormDesc('BungeeCord/Velocity reverse proxy routing hub for sub-servers');
      setFormSoftware('Velocity');
      setFormVersion('3.3.0');
      setFormPort(25577);
      setFormMaxRamGb(2);
      setFormMinRamGb(1);
      setFormMaxPlayers(100);
      setFormOnlineMode(false);
      setFormColorTag('indigo');
    } else if (preset === 'skyblock') {
      setFormName('Skyblock Economy Realm');
      setFormMotd('§e§lSkyblock Economy §r§7| §aCustom Island Generators');
      setFormDesc('Custom island generator with economy shop, auctions & minions');
      setFormSoftware('Spigot');
      setFormVersion('1.20.2');
      setFormPort(25567);
      setFormMaxRamGb(4);
      setFormMinRamGb(2);
      setFormMaxPlayers(30);
      setFormGamemode('survival');
      setFormDifficulty('easy');
      setFormOnlineMode(false);
      setFormPvp(false);
      setFormCommandBlocks(true);
      setFormColorTag('amber');
    } else if (preset === 'anarchy') {
      setFormName('Anarchy Vanilla Server');
      setFormMotd('§4§lANARCHY 2B2T STYLE §r§7| §cNo Rules Hardcore');
      setFormDesc('No rules, duplicate glitch allowed, 100% anarchy experience');
      setFormSoftware('Vanilla');
      setFormVersion('1.21.4');
      setFormPort(25568);
      setFormMaxRamGb(8);
      setFormMinRamGb(4);
      setFormMaxPlayers(40);
      setFormGamemode('survival');
      setFormDifficulty('hard');
      setFormOnlineMode(false);
      setFormPvp(true);
      setFormCommandBlocks(true);
      setFormColorTag('rose');
    }
  };

  const filteredServers = servers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.software.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSoftware = filterSoftware === 'all' || s.software.toLowerCase() === filterSoftware.toLowerCase();
    return matchesSearch && matchesSoftware;
  });

  const totalRamAllocated = servers.reduce((acc, curr) => acc + (curr.maxRamGb || 4), 0);
  const runningServersCount = servers.filter((s) => s.status === 'RUNNING').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <Layers className={`w-6 h-6 ${theme.textPrimary}`} />
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              NTH Server Setup & Hub
            </h1>
            <span className={`px-2 py-0.5 text-[10px] font-bold ${theme.bgActive} ${theme.textPrimary} border ${theme.borderActive} rounded-full uppercase tracking-wider`}>
              Multi-Instance Node Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Create, configure RAM, versions, MOTD, ports & manage distinct Minecraft server instances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className={`px-4 py-2.5 ${canCreateServer ? `${theme.bgSolid} ${theme.bgSolidHover} text-white` : 'bg-slate-800 text-slate-400 opacity-80 cursor-not-allowed'} font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 border ${canCreateServer ? theme.borderActive : 'border-slate-700'}`}
            title={canCreateServer ? 'Create new Minecraft server instance' : 'Only Panel Owner / Administrator can create new server instances'}
          >
            {canCreateServer ? <Plus className="w-4 h-4" /> : <Shield className="w-4 h-4 text-amber-400" />}
            <span>{canCreateServer ? 'Create New Server' : 'Owner Only: Create Server'}</span>
          </button>

          <button
            onClick={fetchServers}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-all cursor-pointer"
            title="Refresh Server List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Instances</span>
            <span className="text-lg font-black text-slate-100">{servers.length} Servers</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Process</span>
            <span className="text-lg font-black text-emerald-400">{runningServersCount} Running</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Allocated RAM</span>
            <span className="text-lg font-black text-slate-100">{totalRamAllocated} GB Total</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Node</span>
            <span className="text-xs font-bold text-slate-200 truncate font-mono">Node 01 - Primary</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search server instances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'Paper', 'Purpur', 'Velocity', 'Spigot', 'Vanilla'].map((sw) => (
            <button
              key={sw}
              onClick={() => setFilterSoftware(sw)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer whitespace-nowrap ${
                filterSoftware === sw
                  ? `${theme.bgActive} ${theme.textPrimary} border ${theme.borderActive}`
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {sw === 'all' ? 'All Software' : sw}
            </button>
          ))}
        </div>
      </div>

      {/* Servers Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading server instances from PufferPanel storage...</span>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="py-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
          <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">No Server Instances Found</h3>
          <p className="text-xs text-slate-500 font-mono mt-1 mb-4">
            Create your first server instance or adjust your search filter
          </p>
          <button
            onClick={openCreateModal}
            className={`px-4 py-2 ${theme.bgSolid} text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Server Instance</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServers.map((srv) => {
            const isSelected = activeServerId === srv.id;
            const isRunning = srv.status === 'RUNNING';

            return (
              <div
                key={srv.id}
                className={`relative bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group hover:border-slate-700 shadow-lg ${
                  isSelected
                    ? `${theme.borderActive} ring-1 ring-${settings.themeColor}-500/20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950`
                    : 'border-slate-800'
                }`}
              >
                {/* Active Selection Badge */}
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Active Managed Server</span>
                  </div>
                )}

                <div>
                  {/* Top Card Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-sm text-slate-200 shadow-inner group-hover:scale-105 transition-transform`}>
                        <Server className={`w-5 h-5 ${isSelected ? theme.textPrimary : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-100 text-sm tracking-tight line-clamp-1">
                          {srv.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-400">
                          <span className="text-indigo-400 font-semibold">{srv.software}</span>
                          <span>•</span>
                          <span>v{srv.version}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      <span className="text-[10px] font-bold font-mono text-slate-300 uppercase">
                        {srv.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 font-sans mb-3 min-h-[32px]">
                    {srv.description || 'Minecraft server instance node'}
                  </p>

                  {/* Server Address Badge */}
                  <div className="bg-slate-950/80 border border-cyan-500/30 p-2 rounded-xl font-mono text-[11px] mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="text-slate-400 text-[10px]">Server IP:</span>
                      <span className="text-cyan-300 font-bold truncate">
                        {srv.serverAddress || `play.nighthost.in:${srv.port || 25565}`}
                      </span>
                    </div>
                  </div>

                  {/* MOTD Preview */}
                  <div className="bg-slate-950/80 border border-slate-800/90 p-2 rounded-lg font-mono text-[11px] text-emerald-400 truncate mb-3">
                    <span className="text-slate-500 text-[9px] block uppercase">MOTD</span>
                    {srv.motd || `${srv.name} Server`}
                  </div>

                  {/* Assigned User & Allocation Control */}
                  <div className="bg-slate-950/80 border border-purple-500/30 p-2 rounded-xl font-mono text-[11px] mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-slate-400 text-[10px]">Owner:</span>
                      <span className="text-purple-300 font-bold">@{srv.assignedUser || 'admin'}</span>
                    </div>

                    {canCreateServer && (
                      <select
                        value={srv.assignedUser || 'admin'}
                        onChange={(e) => handleAssignServerToUser(srv.id, e.target.value)}
                        className="bg-slate-900 text-slate-200 border border-slate-700 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:border-purple-400 cursor-pointer"
                        title="Re-assign server instance to a member"
                      >
                        <option value="admin">Assign: @admin</option>
                        {systemUsers.map((u: any) => (
                          <option key={u.id} value={u.username}>
                            Assign: @{u.username}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Server Stats Grid */}
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 border border-slate-800/80 p-2 rounded-xl text-xs font-mono mb-4">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Port</span>
                      <span className="text-slate-200 font-bold">:{srv.port}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">RAM</span>
                      <span className="text-slate-200 font-bold">{srv.maxRamGb} GB</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Slots</span>
                      <span className="text-slate-200 font-bold">{srv.maxPlayers}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Auth</span>
                      <span className={`font-bold ${srv.onlineMode ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {srv.onlineMode ? 'Premium' : 'Cracked'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    {/* Power Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleServerPowerAction(srv.id, 'start')}
                        className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs cursor-pointer transition-all"
                        title="Start Server Instance"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => handleServerPowerAction(srv.id, 'stop')}
                        className="p-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg text-xs cursor-pointer transition-all"
                        title="Stop Server Instance"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => handleServerPowerAction(srv.id, 'restart')}
                        className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs cursor-pointer transition-all"
                        title="Restart Server Instance"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(srv)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1"
                        title="Configure RAM, Version, MOTD & Settings"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {!srv.isDefault && (
                        <button
                          onClick={() => handleDeleteServer(srv.id, srv.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                          title="Delete Server Instance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Select & Open Console Button */}
                  <button
                    onClick={() => {
                      handleSelectServer(srv.id);
                      onOpenConsole();
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${theme.bgSolid} ${theme.bgSolidHover} text-white shadow-md`
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{isSelected ? 'Open Console & Controls' : 'Select & Manage Server'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Server Instance */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-6 animate-scale-up my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className={`w-5 h-5 ${theme.textPrimary}`} />
                <h2 className="text-base font-extrabold text-slate-100">
                  {editingServerId ? `Configure Server: ${formName}` : 'Create New Minecraft Server Instance'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Selection (Only when creating new) */}
            {!editingServerId && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 font-mono uppercase block">
                  Quick Preset Configurations
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'survival', label: 'Survival SMP', desc: 'Paper 1.21.4' },
                    { id: 'bedwars', label: 'Minigames', desc: 'Purpur 1.20.4' },
                    { id: 'proxy', label: 'Velocity Proxy', desc: 'Velocity 3.3.0' },
                    { id: 'skyblock', label: 'Skyblock', desc: 'Spigot 1.20.2' },
                    { id: 'anarchy', label: 'Anarchy 2B2T', desc: 'Vanilla 1.21.4' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id as any)}
                      className="p-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-left cursor-pointer transition-all hover:bg-slate-800/60 group"
                    >
                      <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400">
                        {p.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-5">
              {/* Basic Info Section */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-indigo-400 font-mono uppercase flex items-center gap-1.5">
                  <Server className="w-4 h-4" />
                  <span>Server Identity & MOTD</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                      Server Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Lifesteal SMP Realm"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                      MOTD (Message of the Day)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., §aWelcome to §bNightHost SMP!"
                      value={formMotd}
                      onChange={(e) => setFormMotd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                    Description / Admin Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Main survival world with land claim and economy"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Assigned Owner / Member Selection */}
                <div className="pt-2 border-t border-slate-800/80">
                  <label className="text-xs font-bold text-purple-400 font-mono uppercase block mb-1">
                    Allocate Server To Member / User Account
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={formAssignedUser}
                      onChange={(e) => setFormAssignedUser(e.target.value)}
                      className="w-full bg-slate-900 border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-purple-200 focus:outline-none focus:border-purple-400 font-mono"
                    >
                      <option value="admin">@admin (Owner / Administrator Default)</option>
                      {systemUsers.map((u: any) => (
                        <option key={u.id} value={u.username}>
                          @{u.username} ({u.name} - {u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    Assigning a server to a user gives them full access to Console, Files, Plugins, Worlds, and Backups for this server.
                  </span>
                </div>
              </div>

              {/* Software & Version Selection */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Software & Version Selection</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                      Minecraft Software / Jar
                    </label>
                    <select
                      value={formSoftware}
                      onChange={(e) => setFormSoftware(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="Paper">PaperMC (Fast & Recommended)</option>
                      <option value="Purpur">Purpur (High Performance)</option>
                      <option value="Velocity">Velocity (Network Reverse Proxy)</option>
                      <option value="Spigot">Spigot (Classic Plugins)</option>
                      <option value="Vanilla">Vanilla (Official Mojang Build)</option>
                      <option value="Fabric">Fabric (Modded Server)</option>
                      <option value="Forge">Forge (Modpack Engine)</option>
                      <option value="BungeeCord">BungeeCord (Legacy Proxy)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300 font-mono uppercase block">
                        Minecraft Target Version
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono">1.7.10 ➔ 1.21.11+</span>
                    </div>
                    <div className="space-y-2">
                      <select
                        value={formVersion}
                        onChange={(e) => setFormVersion(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                      >
                        <optgroup label="Latest Minecraft 1.21 Series">
                          <option value="1.21.11">1.21.11 (Latest Release)</option>
                          <option value="1.21.10">1.21.10</option>
                          <option value="1.21.9">1.21.9</option>
                          <option value="1.21.8">1.21.8</option>
                          <option value="1.21.7">1.21.7</option>
                          <option value="1.21.6">1.21.6</option>
                          <option value="1.21.5">1.21.5</option>
                          <option value="1.21.4">1.21.4 (Stable Paper)</option>
                          <option value="1.21.3">1.21.3</option>
                          <option value="1.21.2">1.21.2</option>
                          <option value="1.21.1">1.21.1</option>
                          <option value="1.21">1.21 (Tricky Trials)</option>
                        </optgroup>
                        <optgroup label="Minecraft 1.20 Series">
                          <option value="1.20.6">1.20.6</option>
                          <option value="1.20.5">1.20.5</option>
                          <option value="1.20.4">1.20.4 (Recommended Minigames)</option>
                          <option value="1.20.3">1.20.3</option>
                          <option value="1.20.2">1.20.2</option>
                          <option value="1.20.1">1.20.1 (Popular Modpacks)</option>
                          <option value="1.20">1.20 (Trails & Tales)</option>
                        </optgroup>
                        <optgroup label="Minecraft 1.19 Series">
                          <option value="1.19.4">1.19.4</option>
                          <option value="1.19.3">1.19.3</option>
                          <option value="1.19.2">1.19.2</option>
                          <option value="1.19.1">1.19.1</option>
                          <option value="1.19">1.19 (Wild Update)</option>
                        </optgroup>
                        <optgroup label="Minecraft 1.18 & 1.17 Series">
                          <option value="1.18.2">1.18.2 (Caves & Cliffs II)</option>
                          <option value="1.18.1">1.18.1</option>
                          <option value="1.17.1">1.17.1</option>
                        </optgroup>
                        <optgroup label="Legacy & Classic PvP Versions">
                          <option value="1.16.5">1.16.5 (Legacy Nether / SMP)</option>
                          <option value="1.15.2">1.15.2 (Buzzy Bees)</option>
                          <option value="1.14.4">1.14.4 (Village & Pillage)</option>
                          <option value="1.13.2">1.13.2 (Update Aquatic)</option>
                          <option value="1.12.2">1.12.2 (Classic Modded Tech)</option>
                          <option value="1.11.2">1.11.2</option>
                          <option value="1.10.2">1.10.2</option>
                          <option value="1.9.4">1.9.4</option>
                          <option value="1.8.9">1.8.9 (Competitive PvP / Bedwars)</option>
                          <option value="1.7.10">1.7.10 (Forge Classic Modpacks)</option>
                        </optgroup>
                        <optgroup label="Proxy Engine Builds">
                          <option value="3.3.0">3.3.0 (Velocity Proxy)</option>
                          <option value="1.20.0">BungeeCord Universal</option>
                        </optgroup>
                        <optgroup label="Custom / Snapshot">
                          <option value="custom">Enter Custom Version / Snapshot...</option>
                        </optgroup>
                      </select>

                      {(formVersion === 'custom' || (!['1.21.4','1.21.3','1.21.2','1.21.1','1.21','1.20.6','1.20.5','1.20.4','1.20.3','1.20.2','1.20.1','1.20','1.19.4','1.19.3','1.19.2','1.19.1','1.19','1.18.2','1.18.1','1.17.1','1.16.5','1.15.2','1.14.4','1.13.2','1.12.2','1.11.2','1.10.2','1.9.4','1.8.9','1.7.10','3.3.0','1.20.0'].includes(formVersion))) && (
                        <input
                          type="text"
                          placeholder="Enter version tag e.g. 1.21.5-rc1 or 24w45a"
                          value={formVersion === 'custom' ? '' : formVersion}
                          onChange={(e) => setFormVersion(e.target.value)}
                          className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-emerald-300 focus:outline-none font-mono"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Allocation: RAM & CPU */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-purple-400 font-mono uppercase flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>Memory RAM Allocation & Port</span>
                  </h3>
                  <span className="text-xs font-bold text-purple-300 font-mono bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20">
                    Selected RAM: {formMaxRamGb} GB
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400 font-mono">1 GB</span>
                    <input
                      type="range"
                      min="1"
                      max="32"
                      step="1"
                      value={formMaxRamGb}
                      onChange={(e) => setFormMaxRamGb(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                    <span className="text-xs text-slate-400 font-mono">32 GB</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">
                        Max RAM (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="32"
                        value={formMaxRamGb}
                        onChange={(e) => setFormMaxRamGb(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">
                        Min RAM (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={formMaxRamGb}
                        value={formMinRamGb}
                        onChange={(e) => setFormMinRamGb(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">
                        Port Number
                      </label>
                      <input
                        type="number"
                        value={formPort}
                        onChange={(e) => setFormPort(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Per-Server Domain / IP Address Input */}
                  <div>
                    <label className="text-[10px] font-bold text-cyan-400 font-mono uppercase block mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>Server IP / Connection Address (Default: NIGHTHOST.IN)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. play.nighthost.in:25565 or mycustom.nighthost.in"
                      value={formServerAddress}
                      onChange={(e) => setFormServerAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-cyan-200 font-mono focus:border-cyan-400 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 font-mono mt-1">
                      Each server has its own dedicated connection address. Defaults to NIGHTHOST.IN.
                    </p>
                  </div>
                </div>
              </div>

              {/* Gameplay & World Rules */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-amber-400 font-mono uppercase flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Gameplay Rules & World Settings</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                      Default Gamemode
                    </label>
                    <select
                      value={formGamemode}
                      onChange={(e) => setFormGamemode(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      <option value="survival">Survival</option>
                      <option value="creative">Creative</option>
                      <option value="adventure">Adventure</option>
                      <option value="spectator">Spectator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                      World Difficulty
                    </label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                    >
                      <option value="peaceful">Peaceful</option>
                      <option value="easy">Easy</option>
                      <option value="normal">Normal</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                      Max Players
                    </label>
                    <input
                      type="number"
                      value={formMaxPlayers}
                      onChange={(e) => setFormMaxPlayers(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 font-mono uppercase block mb-1">
                      Online Auth Mode
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormOnlineMode(!formOnlineMode)}
                      className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs font-mono transition-all border ${
                        formOnlineMode
                          ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                          : 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300'
                      }`}
                    >
                      {formOnlineMode ? 'Premium Only' : 'Cracked / Offline'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/80">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPvp}
                      onChange={(e) => setFormPvp(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">Enable Player PvP Combat</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCommandBlocks}
                      onChange={(e) => setFormCommandBlocks(e.target.checked)}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-300">Enable Command Blocks</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 ${theme.bgSolid} ${theme.bgSolidHover} text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all border ${theme.borderActive}`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Instance Config...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{editingServerId ? 'Save Server Settings' : 'Deploy Server Instance'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
