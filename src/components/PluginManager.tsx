import React, { useState, useEffect, useRef } from 'react';
import { PluginItem, CatalogPlugin } from '../types';
import { Package, Upload, Trash2, CheckCircle2, XCircle, Search, Download, Sparkles, RefreshCw, FileCode, ExternalLink, Layers, Globe, Shield, Star } from 'lucide-react';

interface ModrinthProject {
  project_id: string;
  project_type: string;
  slug: string;
  author: string;
  title: string;
  description: string;
  categories: string[];
  downloads: number;
  icon_url: string;
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

export const PluginManager: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginItem[]>([]);
  const [catalog, setCatalog] = useState<CatalogPlugin[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'modrinth' | 'spigot' | 'installed' | 'catalog'>('modrinth');
  const [isUploading, setIsUploading] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modrinth State
  const [modrinthQuery, setModrinthQuery] = useState('');
  const [modrinthType, setModrinthType] = useState<'plugin' | 'mod' | 'datapack'>('plugin');
  const [modrinthProjects, setModrinthProjects] = useState<ModrinthProject[]>([]);
  const [isSearchingModrinth, setIsSearchingModrinth] = useState(false);
  const [installingModrinthId, setInstallingModrinthId] = useState<string | null>(null);

  // SpigotMC State
  const [spigotQuery, setSpigotQuery] = useState('');
  const [spigotResources, setSpigotResources] = useState<SpigotResource[]>([]);
  const [isSearchingSpigot, setIsSearchingSpigot] = useState(false);
  const [installingSpigotId, setInstallingSpigotId] = useState<number | null>(null);

  const fetchPlugins = async () => {
    try {
      const res = await fetch('/api/files?path=plugins');
      const data = await res.json();
      if (data.files) {
        const items: PluginItem[] = data.files
          .filter((f: any) => f.name.endsWith('.jar') || f.name.endsWith('.jar.disabled'))
          .map((f: any) => {
            const isEnabled = !f.name.endsWith('.disabled');
            const cleanName = f.name.replace('.disabled', '').replace('.jar', '');
            return {
              name: cleanName,
              filename: f.name,
              sizeBytes: f.sizeBytes,
              enabled: isEnabled,
            };
          });
        setPlugins(items);
      }
    } catch {
      // ignore
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/plugins/catalog');
      const data = await res.json();
      if (data.catalog) setCatalog(data.catalog);
    } catch {
      // ignore
    }
  };

  const searchModrinth = async (query = modrinthQuery, type = modrinthType) => {
    setIsSearchingModrinth(true);
    try {
      const res = await fetch(`/api/modrinth/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`);
      const data = await res.json();
      if (data.hits) {
        setModrinthProjects(data.hits);
      }
    } catch {
      setMessage('Failed to load Modrinth search results');
    } finally {
      setIsSearchingModrinth(false);
    }
  };

  const searchSpigot = async (query = spigotQuery) => {
    setIsSearchingSpigot(true);
    try {
      const res = await fetch(`/api/spigot/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSpigotResources(data);
      }
    } catch {
      setMessage('Failed to load SpigotMC search results');
    } finally {
      setIsSearchingSpigot(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
    fetchCatalog();
    searchModrinth('', 'plugin');
    searchSpigot('');
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await fetch('/api/files/upload?folder=plugins', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully uploaded ${files.length} plugin file(s)`);
        fetchPlugins();
      } else {
        setMessage('Upload failed');
      }
    } catch {
      setMessage('Error during file upload');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleTogglePlugin = async (plugin: PluginItem) => {
    try {
      const res = await fetch('/api/plugins/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: plugin.filename,
          enable: !plugin.enabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPlugins();
      }
    } catch {
      // ignore
    }
  };

  const handleDeletePlugin = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      const res = await fetch(`/api/files/delete?path=plugins/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPlugins();
      }
    } catch {
      // ignore
    }
  };

  const handleInstallCatalog = async (plugin: CatalogPlugin) => {
    setInstallingId(plugin.id);
    try {
      const res = await fetch('/api/plugins/install-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plugin.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Installed ${plugin.name} v${plugin.version}`);
        fetchPlugins();
      }
    } catch {
      setMessage('Failed to install plugin');
    } finally {
      setInstallingId(null);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleInstallModrinth = async (project: ModrinthProject) => {
    setInstallingModrinthId(project.project_id);
    try {
      const res = await fetch('/api/modrinth/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.project_id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🎉 Installed ${data.filename || project.title} from Modrinth!`);
        fetchPlugins();
      } else {
        setMessage(`Error: ${data.error || 'Failed to install from Modrinth'}`);
      }
    } catch {
      setMessage('Failed to connect to server for Modrinth download');
    } finally {
      setInstallingModrinthId(null);
      setTimeout(() => setMessage(''), 5000);
    }
  };

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
        setMessage(`🎉 Installed ${data.filename || resource.name} from SpigotMC!`);
        fetchPlugins();
      } else {
        setMessage(`SpigotMC Notice: ${data.error || 'Failed to download from SpigotMC'}`);
      }
    } catch {
      setMessage('Failed to connect to server for SpigotMC download');
    } finally {
      setInstallingSpigotId(null);
      setTimeout(() => setMessage(''), 6000);
    }
  };

  const filteredInstalled = plugins.filter(p =>
    p.filename.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredCatalog = catalog.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDownloads = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getSpigotIconUrl = (resource: SpigotResource) => {
    if (resource.icon?.url) {
      if (resource.icon.url.startsWith('http')) return resource.icon.url;
      return `https://www.spigotmc.org/${resource.icon.url}`;
    }
    return `https://api.spiget.org/v2/resources/${resource.id}/icon`;
  };

  return (
    <div className="space-y-6">
      
      {/* Toast message */}
      {message && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl animate-fade-in flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-400 hover:text-white ml-3">✕</button>
        </div>
      )}

      {/* Top Banner & Drag-Drop Upload Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <span>Plugin, SpigotMC & Modrinth Store</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct 1-click install from <strong className="text-emerald-400">Modrinth</strong> & <strong className="text-orange-400">SpigotMC</strong> or upload custom <code className="text-emerald-400 font-mono">.jar</code> files.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Upload .jar File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jar,.disabled"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-950/50 hover:bg-slate-950"
        >
          <Upload className="w-7 h-7 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-300">
            Drag & Drop <span className="text-emerald-400 font-mono">.jar</span> plugin files here, or click to browse
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Supports Paper, Spigot, Bukkit, Forge, Fabric & Velocity jars
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-1 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => setActiveSubTab('modrinth')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === 'modrinth'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-300" />
            <span>Modrinth Store</span>
          </button>

          <button
            onClick={() => setActiveSubTab('spigot')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeSubTab === 'spigot'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-sm">🪵</span>
            <span>SpigotMC Store</span>
          </button>

          <button
            onClick={() => setActiveSubTab('installed')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'installed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Installed ({plugins.length})
          </button>

          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'catalog'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Curated Catalog</span>
          </button>
        </div>

        {/* Filter input for installed/catalog */}
        {(activeSubTab === 'installed' || activeSubTab === 'catalog') && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={activeSubTab === 'installed' ? 'Filter installed...' : 'Search catalog...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Modrinth Live Search & Marketplace View */}
      {activeSubTab === 'modrinth' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search Modrinth (e.g. EssentialsX, Geyser, WorldEdit, LuckPerms, ViaVersion)..."
                value={modrinthQuery}
                onChange={(e) => {
                  setModrinthQuery(e.target.value);
                  searchModrinth(e.target.value, modrinthType);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-between">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setModrinthType('plugin');
                    searchModrinth(modrinthQuery, 'plugin');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    modrinthType === 'plugin' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Plugins
                </button>
                <button
                  onClick={() => {
                    setModrinthType('mod');
                    searchModrinth(modrinthQuery, 'mod');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    modrinthType === 'mod' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mods
                </button>
                <button
                  onClick={() => {
                    setModrinthType('datapack');
                    searchModrinth(modrinthQuery, 'datapack');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    modrinthType === 'datapack' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Datapacks
                </button>
              </div>

              <button
                onClick={() => searchModrinth(modrinthQuery, modrinthType)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearchingModrinth ? 'animate-spin' : ''}`} />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {isSearchingModrinth ? (
            <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold">Searching Modrinth API...</p>
            </div>
          ) : modrinthProjects.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2 bg-slate-900 border border-slate-800 rounded-2xl">
              <Globe className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No results found on Modrinth for "{modrinthQuery}"</p>
              <p className="text-xs text-slate-500">Try searching for popular terms like "Essentials", "Vault", "WorldEdit", or "LuckPerms".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modrinthProjects.map((project) => {
                const isInstalling = installingModrinthId === project.project_id;
                const isAlreadyInstalled = plugins.some(p => 
                  p.filename.toLowerCase().includes(project.slug.toLowerCase()) || 
                  p.name.toLowerCase().includes(project.title.toLowerCase())
                );

                return (
                  <div
                    key={project.project_id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          {project.icon_url ? (
                            <img src={project.icon_url} alt={project.title} className="w-10 h-10 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 font-bold text-sm">
                              {project.title.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-slate-100 text-sm leading-tight flex items-center gap-1.5">
                              <span>{project.title}</span>
                            </h3>
                            <p className="text-[10px] font-mono text-slate-400">by {project.author || 'Modrinth Author'}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 text-[10px] font-mono rounded-md border border-emerald-800/60 flex items-center gap-1">
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>{formatDownloads(project.downloads)}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed my-3 line-clamp-2">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.categories?.slice(0, 4).map((cat) => (
                          <span key={cat} className="px-1.5 py-0.5 bg-slate-950 text-slate-400 text-[10px] font-mono rounded border border-slate-800">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <a
                        href={`https://modrinth.com/${project.project_type}/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        <span>Modrinth Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleInstallModrinth(project)}
                        disabled={isInstalling}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAlreadyInstalled
                            ? 'bg-slate-800 text-emerald-300 hover:bg-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        }`}
                      >
                        {isInstalling ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isAlreadyInstalled ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isInstalling ? 'Downloading...' : isAlreadyInstalled ? 'Re-download' : 'Install Jar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SpigotMC Live Search & Marketplace View */}
      {activeSubTab === 'spigot' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-orange-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search SpigotMC Resources (e.g. Vault, EssentialsX, HolographicDisplays, Multiverse)..."
                value={spigotQuery}
                onChange={(e) => {
                  setSpigotQuery(e.target.value);
                  searchSpigot(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              onClick={() => searchSpigot(spigotQuery)}
              className="w-full md:w-auto px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-orange-950/40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearchingSpigot ? 'animate-spin' : ''}`} />
              <span>Search SpigotMC</span>
            </button>
          </div>

          {/* Results Grid */}
          {isSearchingSpigot ? (
            <div className="p-16 text-center text-slate-400 space-y-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto" />
              <p className="text-xs font-semibold">Searching SpigotMC / Spiget API...</p>
            </div>
          ) : spigotResources.length === 0 ? (
            <div className="p-16 text-center text-slate-500 space-y-2 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-4xl block mb-2">🪵</span>
              <p className="text-sm font-medium text-slate-300">No resources found on SpigotMC for "{spigotQuery}"</p>
              <p className="text-xs text-slate-500">Try searching for "Vault", "Multiverse", "Citizens", "LuckPerms", or "Essentials".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {spigotResources.map((res) => {
                const isInstalling = installingSpigotId === res.id;
                const isAlreadyInstalled = plugins.some(p => 
                  p.filename.toLowerCase().includes(res.name.toLowerCase().replace(/[^a-z0-9]/g, '')) || 
                  p.name.toLowerCase().includes(res.name.toLowerCase())
                );

                return (
                  <div
                    key={res.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={getSpigotIconUrl(res)}
                            alt={res.name}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-10 h-10 rounded-xl object-contain bg-slate-950 p-1 border border-slate-800"
                          />
                          <div>
                            <h3 className="font-bold text-slate-100 text-sm leading-tight flex items-center gap-1.5">
                              <span>{res.name}</span>
                            </h3>
                            <p className="text-[10px] font-mono text-slate-400">Resource ID #{res.id}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 bg-orange-950/80 text-orange-300 text-[10px] font-mono rounded-md border border-orange-800/60 flex items-center gap-1">
                          <Download className="w-3 h-3 text-orange-400" />
                          <span>{formatDownloads(res.downloads)}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed my-3 line-clamp-2">
                        {res.tag || 'SpigotMC plugin resource for Bukkit and Spigot servers.'}
                      </p>

                      {res.rating && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono mb-3">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{res.rating.average ? res.rating.average.toFixed(1) : '5.0'}</span>
                          <span className="text-slate-500">({res.rating.count || 0} reviews)</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <a
                        href={`https://www.spigotmc.org/resources/${res.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
                      >
                        <span>Spigot Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleInstallSpigot(res)}
                        disabled={isInstalling}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAlreadyInstalled
                            ? 'bg-slate-800 text-orange-300 hover:bg-slate-700'
                            : 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950/50'
                        }`}
                      >
                        {isInstalling ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : isAlreadyInstalled ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isInstalling ? 'Downloading...' : isAlreadyInstalled ? 'Re-download' : 'Install Jar'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Installed Plugins View */}
      {activeSubTab === 'installed' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {filteredInstalled.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileCode className="w-10 h-10 stroke-1 mx-auto text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No plugins found in server-files/plugins/</p>
              <p className="text-xs text-slate-500">Search Modrinth Store or SpigotMC Store above or upload custom .jar files to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-[11px] font-mono uppercase tracking-wider border-b border-slate-800">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Plugin File</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredInstalled.map((p) => (
                    <tr key={p.filename} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePlugin(p)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-all ${
                            p.enabled
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {p.enabled ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-slate-500" />}
                          <span>{p.enabled ? 'Enabled' : 'Disabled'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-200">
                        {p.filename}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {formatSize(p.sizeBytes)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeletePlugin(p.filename)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-800/60"
                          title="Delete Plugin File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Catalog Marketplace View */}
      {activeSubTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((plugin) => {
            const isInstalled = plugins.some(p => p.name.toLowerCase().includes(plugin.name.toLowerCase()));
            const isInstalling = installingId === plugin.id;

            return (
              <div
                key={plugin.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plugin.icon}</span>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm leading-tight">{plugin.name}</h3>
                        <span className="text-[10px] font-mono text-slate-400">v{plugin.version} • {plugin.author}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 text-[10px] font-mono rounded border border-slate-700">
                      {plugin.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed my-3">
                    {plugin.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  {isInstalled ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Installed
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Paper 1.21 Ready</span>
                  )}

                  <button
                    onClick={() => handleInstallCatalog(plugin)}
                    disabled={isInstalling}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isInstalled
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
                    }`}
                  >
                    {isInstalling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{isInstalled ? 'Re-install' : '1-Click Install'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
