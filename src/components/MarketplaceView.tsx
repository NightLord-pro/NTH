import React, { useState, useEffect } from 'react';
import {
  Package,
  Sparkles,
  Download,
  Star,
  Search,
  Check,
  Globe,
  ExternalLink,
  Layers,
  Box,
  FileCode,
  Loader2,
  RefreshCw,
  Info,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { PanelSettings } from '../types';

interface ModrinthProject {
  project_id: string;
  project_type: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  categories: string[];
  downloads: number;
  icon_url?: string;
  latest_version?: string;
}

interface SpigotResource {
  id: number;
  name: string;
  tag: string;
  downloads: number;
  rating?: { count: number; average: number };
  icon?: { url?: string; data?: string };
  author?: { id: number; name?: string };
  testedVersions?: string[];
  premium?: boolean;
}

interface CuratedItem {
  id: string;
  name: string;
  category: 'Plugins' | 'Mods' | 'Datapacks' | 'Themes' | 'Eggs';
  description: string;
  author: string;
  rating: number;
  downloads: string;
  version: string;
  icon: string;
  price: string;
  isInstalled?: boolean;
}

interface MarketplaceViewProps {
  settings: PanelSettings;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ settings }) => {
  const [provider, setProvider] = useState<'modrinth' | 'spigot' | 'curated'>('modrinth');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modrinth State
  const [modrinthItems, setModrinthItems] = useState<ModrinthProject[]>([]);
  const [isModrinthLoading, setIsModrinthLoading] = useState(false);
  const [installingModrinthId, setInstallingModrinthId] = useState<string | null>(null);

  // SpigotMC State
  const [spigotItems, setSpigotItems] = useState<SpigotResource[]>([]);
  const [isSpigotLoading, setIsSpigotLoading] = useState(false);
  const [installingSpigotId, setInstallingSpigotId] = useState<number | null>(null);

  // Installed tracking
  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Curated Fallback Items
  const [curatedItems, setCuratedItems] = useState<CuratedItem[]>([
    {
      id: 'item-1',
      name: 'WorldEdit Pro',
      category: 'Plugins',
      description: 'In-game Minecraft map editor with millions of block operations.',
      author: 'sk89q',
      rating: 4.9,
      downloads: '14.2M',
      version: 'v7.3.0',
      icon: '🪄',
      price: 'Free',
      isInstalled: true,
    },
    {
      id: 'item-2',
      name: 'EssentialsX Core',
      category: 'Plugins',
      description: 'The essential suite for Minecraft servers providing over 100 commands.',
      author: 'EssentialsX Team',
      rating: 4.8,
      downloads: '28.9M',
      version: 'v2.20.1',
      icon: '⭐',
      price: 'Free',
      isInstalled: true,
    },
    {
      id: 'item-3',
      name: 'ViaVersion Protocol',
      category: 'Plugins',
      description: 'Allows newer client versions to connect to older server builds seamlessly.',
      author: 'ViaVersion',
      rating: 5.0,
      downloads: '9.4M',
      version: 'v5.0.1',
      icon: '🌐',
      price: 'Free',
      isInstalled: true,
    },
    {
      id: 'item-4',
      name: 'Vault Economy API',
      category: 'Plugins',
      description: 'Permissions, Economy, and Chat API abstraction layer.',
      author: 'SainttX',
      rating: 4.9,
      downloads: '32.1M',
      version: 'v1.7.3',
      icon: '💎',
      price: 'Free',
      isInstalled: false,
    },
    {
      id: 'item-5',
      name: 'Sodium Performance Mod',
      category: 'Mods',
      description: 'Free and open-source rendering engine replacement for Fabric.',
      author: 'jellysquid',
      rating: 5.0,
      downloads: '18.5M',
      version: 'v0.5.8',
      icon: '⚡',
      price: 'Free',
      isInstalled: false,
    },
    {
      id: 'item-6',
      name: 'Custom BungeeCord Egg',
      category: 'Eggs',
      description: 'Preconfigured Docker Egg template for high-speed proxy networks.',
      author: 'Pterodactyl Community',
      rating: 4.7,
      downloads: '850K',
      version: 'v1.2',
      icon: '🥚',
      price: 'Free',
      isInstalled: false,
    },
  ]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Modrinth
  const fetchModrinth = async (query = searchQuery, category = activeCategory) => {
    setIsModrinthLoading(true);
    try {
      let typeParam = 'all';
      if (category === 'Plugins') typeParam = 'plugin';
      else if (category === 'Mods') typeParam = 'mod';
      else if (category === 'Datapacks') typeParam = 'datapack';
      else if (category === 'ResourcePacks') typeParam = 'resourcepack';

      const res = await fetch(`/api/modrinth/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(typeParam)}`);
      const data = await res.json();
      if (data.hits) {
        setModrinthItems(data.hits);
      }
    } catch {
      showToast('Failed to load Modrinth catalog', 'error');
    } finally {
      setIsModrinthLoading(false);
    }
  };

  // Fetch SpigotMC
  const fetchSpigot = async (query = searchQuery) => {
    setIsSpigotLoading(true);
    try {
      const res = await fetch(`/api/spigot/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSpigotItems(data);
      }
    } catch {
      showToast('Failed to load SpigotMC catalog', 'error');
    } finally {
      setIsSpigotLoading(false);
    }
  };

  // Initial load & search handler
  useEffect(() => {
    if (provider === 'modrinth') {
      fetchModrinth();
    } else if (provider === 'spigot') {
      fetchSpigot();
    }
  }, [provider, activeCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider === 'modrinth') fetchModrinth();
    else if (provider === 'spigot') fetchSpigot();
  };

  // 1-Click Modrinth Install
  const handleInstallModrinth = async (project: ModrinthProject) => {
    setInstallingModrinthId(project.project_id);
    try {
      let targetType: 'plugin' | 'mod' | 'datapack' | 'resourcepack' = 'plugin';
      if (project.project_type === 'mod') targetType = 'mod';
      else if (project.project_type === 'datapack') targetType = 'datapack';
      else if (project.project_type === 'resourcepack') targetType = 'resourcepack';

      const res = await fetch('/api/modrinth/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.project_id,
          targetType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInstalledMap((prev) => ({ ...prev, [project.project_id]: true }));
        showToast(`Successfully installed ${project.title} into ${data.folder || 'server'}!`, 'success');
      } else {
        showToast(data.error || 'Failed to install from Modrinth', 'error');
      }
    } catch (e: any) {
      showToast(`Error installing: ${e.message}`, 'error');
    } finally {
      setInstallingModrinthId(null);
    }
  };

  // 1-Click SpigotMC Install
  const handleInstallSpigot = async (resource: SpigotResource) => {
    setInstallingSpigotId(resource.id);
    try {
      const res = await fetch('/api/spigot/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: resource.id,
          name: resource.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInstalledMap((prev) => ({ ...prev, [`spigot-${resource.id}`]: true }));
        showToast(`Successfully installed ${resource.name} into plugins folder!`, 'success');
      } else {
        showToast(data.error || 'Failed to install from SpigotMC', 'error');
      }
    } catch (e: any) {
      showToast(`Error installing: ${e.message}`, 'error');
    } finally {
      setInstallingSpigotId(null);
    }
  };

  const categories = ['All', 'Plugins', 'Mods', 'Datapacks', 'ResourcePacks', 'Eggs', 'Themes'];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Alert Popup */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-fade-in font-mono text-xs ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200'
              : 'bg-purple-950/90 border-purple-500 text-purple-200'
          }`}
        >
          {toastMessage.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-purple-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-purple-500/30 rgb-glow">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase">
              Live Repository Marketplace
            </span>
            <span className="text-xs text-slate-400 font-mono">SpigotMC & Modrinth API v2</span>
          </div>
          <h1 className="text-xl font-black text-white font-mono uppercase tracking-wider mt-1 flex items-center gap-2">
            <span>Plugins, Mods & DataPacks Hub</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Search 100,000+ verified Paper/Spigot plugins, Fabric/Forge mods, custom Data Packs & Docker Eggs directly with 1-click server directory deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Auto Dependency Resolver</span>
          </div>
        </div>
      </div>

      {/* Provider Selector & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          {/* Repository Providers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProvider('modrinth')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                provider === 'modrinth'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Modrinth Repository</span>
            </button>

            <button
              onClick={() => setProvider('spigot')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                provider === 'spigot'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-950/50 border border-amber-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>SpigotMC Resources</span>
            </button>

            <button
              onClick={() => setProvider('curated')}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                provider === 'curated'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Featured Specials</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={provider === 'modrinth' ? 'Search Modrinth (e.g. Sodium, Essentials, WorldEdit)...' : provider === 'spigot' ? 'Search SpigotMC plugins...' : 'Filter featured catalog...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Filter Pills (For Modrinth/Curated) */}
        {provider !== 'spigot' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- PROVIDER VIEW 1: MODRINTH --- */}
      {provider === 'modrinth' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Showing Modrinth API projects ({modrinthItems.length})</span>
            {isModrinthLoading && (
              <span className="flex items-center gap-2 text-purple-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying Modrinth...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modrinthItems.map((item) => {
              const isInstalling = installingModrinthId === item.project_id;
              const isInstalled = installedMap[item.project_id];

              return (
                <div
                  key={item.project_id}
                  className="glass-card p-5 rounded-2xl border border-white/10 hover:border-emerald-500/60 hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.icon_url ? (
                          <img
                            src={item.icon_url}
                            alt={item.title}
                            className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-400">
                            📦
                          </div>
                        )}
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            by {item.author || 'Modrinth Creator'}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                        {item.project_type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.categories && item.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.categories.slice(0, 3).map((c) => (
                          <span key={c} className="px-1.5 py-0.5 text-[9px] bg-slate-900 text-slate-400 rounded border border-slate-800 font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Download className="w-3.5 h-3.5" /> {(item.downloads / 1000).toFixed(1)}k
                      </span>
                      <a
                        href={`https://modrinth.com/${item.project_type}/${item.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-purple-400 flex items-center gap-1"
                        title="View on Modrinth"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <button
                      onClick={() => handleInstallModrinth(item)}
                      disabled={isInstalling || isInstalled}
                      className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                        isInstalled
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isInstalling ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Installing...
                        </>
                      ) : isInstalled ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Installed
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" /> Install
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- PROVIDER VIEW 2: SPIGOT MC --- */}
      {provider === 'spigot' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>Showing SpigotMC Resources ({spigotItems.length})</span>
            {isSpigotLoading && (
              <span className="flex items-center gap-2 text-amber-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying Spiget API...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {spigotItems.map((item) => {
              const isInstalling = installingSpigotId === item.id;
              const isInstalled = installedMap[`spigot-${item.id}`];

              return (
                <div
                  key={item.id}
                  className="glass-card p-5 rounded-2xl border border-white/10 hover:border-amber-500/60 hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.icon?.url ? (
                          <img
                            src={`https://www.spigotmc.org/${item.icon.url}`}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400">
                            🔌
                          </div>
                        )}
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono">
                            SpigotMC ID #{item.id}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        Plugin
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.tag || 'Popular SpigotMC Minecraft Server Plugin resource.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Download className="w-3.5 h-3.5" /> {(item.downloads / 1000).toFixed(1)}k
                      </span>
                      {item.rating && (
                        <span className="flex items-center gap-1 text-yellow-400 font-bold">
                          <Star className="w-3 h-3 fill-current" /> {item.rating.average.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleInstallSpigot(item)}
                      disabled={isInstalling || isInstalled}
                      className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                        isInstalled
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {isInstalling ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Installing...
                        </>
                      ) : isInstalled ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Installed
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" /> Install
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- PROVIDER VIEW 3: FEATURED CURATED --- */}
      {provider === 'curated' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {curatedItems.map((item) => (
            <div
              key={item.id}
              className="glass-card p-5 rounded-2xl border border-white/10 hover:border-purple-500/60 hover:shadow-2xl transition-all space-y-3 group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center justify-center text-xl shadow group-hover:border-purple-500">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-purple-300 transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">
                        by {item.author} • {item.version}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {item.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-purple-400" /> {item.downloads}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setCuratedItems((prev) =>
                      prev.map((i) => (i.id === item.id ? { ...i, isInstalled: !i.isInstalled } : i))
                    );
                    showToast(`${item.isInstalled ? 'Uninstalled' : 'Installed'} ${item.name}!`, 'success');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                    item.isInstalled
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 text-white'
                  }`}
                >
                  {item.isInstalled ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Installed
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" /> Install
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
