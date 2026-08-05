import React, { useState } from 'react';
import {
  Shield,
  Server,
  Users,
  HardDrive,
  Cpu,
  DollarSign,
  Ticket,
  Key,
  Bell,
  Wrench,
  Activity,
  Layers,
  Percent,
  Lock,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Sparkles,
  Upload,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { PanelSettings } from '../types';

interface AdminPanelProps {
  settings: PanelSettings;
  onSettingsUpdate?: (updated: Partial<PanelSettings>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'branding' | 'billing' | 'security' | 'notifications'>('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Header Title & Logo state
  const [serverName, setServerName] = useState(settings.serverName || 'NTH');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [brandingMessage, setBrandingMessage] = useState('');

  // Watermark state
  const [watermarkImage, setWatermarkImage] = useState(
    settings.watermarkImage || localStorage.getItem('customWatermark') || 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L'
  );
  const [watermarkText, setWatermarkText] = useState(settings.watermarkText || 'Made by NightLord');
  const [isUploadingWatermark, setIsUploadingWatermark] = useState(false);

  const stats = [
    { title: 'Total Users', value: '1,428', icon: Users, color: 'text-purple-400' },
    { title: 'Total Servers', value: '3,890', icon: Server, color: 'text-blue-400' },
    { title: 'Online Servers', value: '3,412', icon: CheckCircle2, color: 'text-emerald-400' },
    { title: 'Offline Servers', value: '478', icon: AlertTriangle, color: 'text-amber-400' },
    { title: 'Total Nodes', value: '12', icon: Globe, color: 'text-cyan-400' },
    { title: 'Active Backups', value: '14.2 TB', icon: HardDrive, color: 'text-teal-400' },
    { title: 'Monthly Revenue', value: '$18,450', icon: DollarSign, color: 'text-emerald-400' },
    { title: 'Open Tickets', value: '4', icon: Ticket, color: 'text-rose-400' },
  ];

  const handleSaveBranding = async () => {
    const updated = { serverName, logoUrl, watermarkImage, watermarkText };
    localStorage.setItem('customWatermark', watermarkImage);
    try {
      const res = await fetch('/api/panel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success && onSettingsUpdate) {
        onSettingsUpdate(updated);
        setBrandingMessage('✨ Header Title, Logo & Watermark settings updated successfully!');
      }
    } catch {
      setBrandingMessage('Failed to save settings');
    } finally {
      setTimeout(() => setBrandingMessage(''), 4000);
    }
  };

  const handleWatermarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingWatermark(true);
    const formData = new FormData();
    formData.append('logoImage', file);

    try {
      const res = await fetch('/api/panel/upload-logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.logoUrl) {
        setWatermarkImage(data.logoUrl);
        localStorage.setItem('customWatermark', data.logoUrl);
        if (onSettingsUpdate) onSettingsUpdate({ watermarkImage: data.logoUrl });
        setBrandingMessage('✨ Watermark image uploaded and updated successfully!');
      } else {
        // Fallback to Data URL if endpoint isn't available
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const url = reader.result.toString();
            setWatermarkImage(url);
            localStorage.setItem('customWatermark', url);
            if (onSettingsUpdate) onSettingsUpdate({ watermarkImage: url });
            setBrandingMessage('✨ Watermark image applied successfully!');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const url = reader.result.toString();
          setWatermarkImage(url);
          localStorage.setItem('customWatermark', url);
          if (onSettingsUpdate) onSettingsUpdate({ watermarkImage: url });
          setBrandingMessage('✨ Watermark image applied successfully!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingWatermark(false);
      setTimeout(() => setBrandingMessage(''), 4000);
    }
  };

  const handleResetWatermark = () => {
    const defaultImg = 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L';
    const defaultTxt = 'Made by NightLord';
    setWatermarkImage(defaultImg);
    setWatermarkText(defaultTxt);
    localStorage.removeItem('customWatermark');
    if (onSettingsUpdate) onSettingsUpdate({ watermarkImage: defaultImg, watermarkText: defaultTxt });
    setBrandingMessage('Watermark reset to default!');
    setTimeout(() => setBrandingMessage(''), 3000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('logoImage', file);

    try {
      const res = await fetch('/api/panel/upload-logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.logoUrl) {
        setLogoUrl(data.logoUrl);
        if (onSettingsUpdate) onSettingsUpdate({ logoUrl: data.logoUrl });
        setBrandingMessage('✨ Logo uploaded and applied successfully!');
      }
    } catch {
      setBrandingMessage('Logo upload failed');
    } finally {
      setIsUploadingLogo(false);
      setTimeout(() => setBrandingMessage(''), 4000);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setBroadcastMsg('');
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-purple-500/30 rgb-glow">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase">
              Root Administration
            </span>
            <span className="text-xs text-slate-400 font-mono">Panel Version 4.2.0</span>
          </div>
          <h1 className="text-xl font-black text-white font-mono uppercase tracking-wider mt-1">
            Enterprise Admin Control Center
          </h1>
          <p className="text-xs text-slate-400">
            Global system governance, resource quotas, API authorization tokens, cluster billing analytics & infrastructure controls.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              maintenanceMode
                ? 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>{maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-card p-3 rounded-2xl border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[9px] font-mono font-bold uppercase truncate">{s.title}</span>
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Resource Allocation & Governance
        </button>
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'branding'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Header Title & Application Logo</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'billing'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Plans, Coupons & Revenue
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          API Keys & Security Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Notifications & Broadcast
        </button>
      </div>

      {brandingMessage && (
        <div className="p-3 bg-purple-950/80 border border-purple-500/50 text-purple-300 rounded-xl font-mono text-xs font-bold flex items-center justify-between shadow-lg">
          <span>{brandingMessage}</span>
          <button onClick={() => setBrandingMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Title & Application Logo Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-white font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Application Header Title & Logo Customization
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Change the main application header title and application CSS logo displayed in the top bar, left navbar, and browser tab.
                </p>
              </div>

              <button
                onClick={handleSaveBranding}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save Header & Logo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              {/* Application Header Title */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="text-slate-200 font-bold block uppercase tracking-wider text-[11px]">
                  Header Application Title
                </label>
                <input
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="e.g. NightHost Enterprise"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-sans text-sm focus:outline-none focus:border-purple-500"
                />
                <p className="text-[11px] text-slate-400">
                  This title is displayed across the main header bar, sidebar header, and browser window title.
                </p>
              </div>

              {/* Application CSS / Image Logo */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold block uppercase tracking-wider text-[11px]">
                    Application Logo (URL or Upload)
                  </label>
                  {logoUrl && (
                    <button
                      onClick={() => setLogoUrl('')}
                      className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer font-normal"
                    >
                      Reset Logo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Logo Preview */}
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-purple-500/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-black text-purple-400">N</span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="pt-1">
                  <label className="w-full px-4 py-2 bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
                    {isUploadingLogo ? <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
                    <span>{isUploadingLogo ? 'Uploading Logo...' : 'Upload Logo File from Device'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Live Header Branding Preview */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                Header Live Preview
              </span>
              <div className="p-4 bg-[#0b0b0f] border border-slate-800 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-purple-500/40 text-white font-extrabold text-lg shadow-lg overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Header Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="bg-gradient-to-tr from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      N
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-100 tracking-tight">
                    {serverName || 'NTH'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    US-East-Primary • Enterprise Cluster
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Right Watermark Settings */}
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" /> Bottom-Right Fixed Watermark Badge
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure the floating watermark badge anchored at the bottom-right corner of the application.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetWatermark}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Watermark Image Source / File Upload */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="text-slate-200 font-bold block uppercase tracking-wider text-[11px]">
                    Watermark Logo (URL or Upload)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-black border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      <img
                        src={watermarkImage || 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L'}
                        alt="Watermark Preview"
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L';
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={watermarkImage}
                      onChange={(e) => {
                        setWatermarkImage(e.target.value);
                        localStorage.setItem('customWatermark', e.target.value);
                      }}
                      placeholder="https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <label className="w-full px-4 py-2 bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
                    {isUploadingWatermark ? <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
                    <span>{isUploadingWatermark ? 'Uploading Watermark...' : 'Upload Custom Watermark File'}</span>
                    <input type="file" accept="image/*" onChange={handleWatermarkUpload} className="hidden" />
                  </label>
                </div>

                {/* Watermark Label Text */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <label className="text-slate-200 font-bold block uppercase tracking-wider text-[11px]">
                    Watermark Text Label
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Made by NightLord"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:border-purple-500 font-sans font-semibold"
                  />

                  {/* Watermark Preview Badge */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5 font-bold">
                      Watermark Corner Preview
                    </span>
                    <div className="p-3 bg-black/80 rounded-xl border border-white/20 inline-flex items-center gap-2 shadow-lg">
                      <img
                        src={watermarkImage || 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L'}
                        alt="Watermark"
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-xs font-bold text-white font-sans">
                        {watermarkText || 'Made by NightLord'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4 text-purple-400" /> Default Server Quotas
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Max RAM per instance (GB)
                </label>
                <input
                  type="number"
                  defaultValue={16}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Max CPU Allocation (% threads)
                </label>
                <input
                  type="number"
                  defaultValue={400}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Max NVMe Storage per server (GB)
                </label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-blue-400" /> Anti-DDoS & Security Mode
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">TCP BungeeGuard Enforcement</div>
                  <div className="text-[10px] text-slate-500">Prevent spoofed proxy handshake packets</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle cursor-pointer accent-purple-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <div className="font-bold text-slate-200">Strict Rate Limiting</div>
                  <div className="text-[10px] text-slate-500">Max 5 connections per IP per second</div>
                </div>
                <input type="checkbox" defaultChecked className="toggle cursor-pointer accent-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 max-w-2xl font-mono text-xs">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Megaphone className="w-4 h-4 text-purple-400" /> Broadcast Global Alert to All Server Consoles
          </h3>
          <form onSubmit={handleSendBroadcast} className="space-y-3">
            <div>
              <label className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                In-Game & Panel Notification Message
              </label>
              <textarea
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="[GLOBAL NOTICE] Maintenance scheduled tonight at 02:00 UTC..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 text-white font-bold rounded-xl cursor-pointer"
            >
              Dispatch Broadcast
            </button>

            {broadcastSent && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Message broadcasted to all connected server nodes!
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
