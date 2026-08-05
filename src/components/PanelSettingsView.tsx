import React, { useState } from 'react';
import { PanelSettings } from '../types';
import { getThemeStyles, getCardBgClass } from '../utils/theme';
import { Settings, Image as ImageIcon, Palette, Copy, Check, Upload, Sparkles, RefreshCw, Globe, Server, Sliders, Eye, Sun, Moon, Terminal } from 'lucide-react';

interface PanelSettingsViewProps {
  settings: PanelSettings;
  onSettingsUpdate: (updated: Partial<PanelSettings>) => void;
}

const PRESET_WALLPAPERS = [
  {
    name: 'Lush Caves',
    url: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Cyberpunk Night',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Epic Castle',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Ender Portal',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=2000&auto=format&fit=crop',
  },
  {
    name: 'Clean Dark',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop',
  },
];

const PRESET_LOGOS = [
  {
    name: 'NightHost Shield',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Emerald Core',
    url: 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Dragon Crest',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=200&auto=format&fit=crop',
  },
  {
    name: 'Neon Portal',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=200&auto=format&fit=crop',
  },
];

const THEME_COLORS: { id: PanelSettings['themeColor']; name: string; bg: string; border: string; text: string }[] = [
  { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400' },
  { id: 'cyan', name: 'Neon Cyan', bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-400' },
  { id: 'violet', name: 'Deep Violet', bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-400' },
  { id: 'amber', name: 'Amber Gold', bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400' },
  { id: 'rose', name: 'Rose Crimson', bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-400' },
  { id: 'indigo', name: 'Royal Indigo', bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-400' },
];

export const PanelSettingsView: React.FC<PanelSettingsViewProps> = ({
  settings,
  onSettingsUpdate,
}) => {
  const [serverName, setServerName] = useState(settings.serverName || 'NTH');
  const [serverAddress, setServerAddress] = useState(settings.serverAddress && !settings.serverAddress.includes('run.app') ? settings.serverAddress : 'play.nighthost.in:25565');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [bgImageUrl, setBgImageUrl] = useState(settings.bgImageUrl || '');
  const [bgOpacity, setBgOpacity] = useState(settings.bgOpacity ?? 70);
  const [bgBlur, setBgBlur] = useState(settings.bgBlur ?? 4);
  const [themeColor, setThemeColor] = useState<PanelSettings['themeColor']>(settings.themeColor || 'emerald');
  const [hudTransparent, setHudTransparent] = useState<boolean>(settings.hudTransparent ?? true);
  const [customJavaPath, setCustomJavaPath] = useState<string>(settings.customJavaPath || '');

  const [loginLogoUrl, setLoginLogoUrl] = useState(settings.loginLogoUrl || '');
  const [loginBgUrl, setLoginBgUrl] = useState(settings.loginBgUrl || '');
  const [loginBgPreset, setLoginBgPreset] = useState<'cyber' | 'space' | 'emerald' | 'sunset' | 'custom'>(settings.loginBgPreset || 'cyber');
  const [isUploadingLoginLogo, setIsUploadingLoginLogo] = useState(false);
  const [isUploadingLoginBg, setIsUploadingLoginBg] = useState(false);

  // Watermark state
  const [watermarkImage, setWatermarkImage] = useState(
    settings.watermarkImage || localStorage.getItem('customWatermark') || 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L'
  );
  const [watermarkText, setWatermarkText] = useState(settings.watermarkText || 'Made by NightLord');
  const [isUploadingWatermark, setIsUploadingWatermark] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  const theme = getThemeStyles(themeColor);
  const cardBgClass = getCardBgClass(hudTransparent);

  const handleSaveSettings = async () => {
    const updated = {
      serverName,
      serverAddress,
      logoUrl,
      bgImageUrl,
      bgOpacity,
      bgBlur,
      themeColor,
      hudTransparent,
      customJavaPath,
      loginLogoUrl,
      loginBgUrl,
      loginBgPreset,
      watermarkImage,
      watermarkText,
    };

    localStorage.setItem('customWatermark', watermarkImage);

    try {
      const res = await fetch('/api/panel/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        onSettingsUpdate(updated);
        setMessage('✨ Panel settings & login branding updated successfully!');
      }
    } catch {
      setMessage('Failed to save settings');
    } finally {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleLoginLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLoginLogo(true);
    const formData = new FormData();
    formData.append('loginLogoImage', file);

    try {
      const res = await fetch('/api/panel/upload-login-logo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.loginLogoUrl) {
        setLoginLogoUrl(data.loginLogoUrl);
        onSettingsUpdate({ loginLogoUrl: data.loginLogoUrl });
        setMessage('✨ Login center logo uploaded successfully!');
      }
    } catch {
      setMessage('Login logo upload failed');
    } finally {
      setIsUploadingLoginLogo(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleLoginBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLoginBg(true);
    const formData = new FormData();
    formData.append('loginBgImage', file);

    try {
      const res = await fetch('/api/panel/upload-login-bg', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.loginBgUrl) {
        setLoginBgUrl(data.loginBgUrl);
        setLoginBgPreset('custom');
        onSettingsUpdate({ loginBgUrl: data.loginBgUrl, loginBgPreset: 'custom' });
        setMessage('✨ Login background image uploaded successfully!');
      }
    } catch {
      setMessage('Login background upload failed');
    } finally {
      setIsUploadingLoginBg(false);
      setTimeout(() => setMessage(''), 4000);
    }
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
        onSettingsUpdate({ logoUrl: data.logoUrl });
        setMessage('✨ Logo image uploaded successfully!');
      }
    } catch {
      setMessage('Logo upload failed');
    } finally {
      setIsUploadingLogo(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('bgImage', file);

    try {
      const res = await fetch('/api/panel/upload-bg', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.bgImageUrl) {
        setBgImageUrl(data.bgImageUrl);
        onSettingsUpdate({ bgImageUrl: data.bgImageUrl });
        setMessage('Background image uploaded successfully!');
      }
    } catch {
      setMessage('Upload failed');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(serverAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">

      {/* Header Toast Notification */}
      {message && (
        <div className="bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Panel Customization & Branding</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize panel name, custom address, background image wallpaper, and UI theme.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Section 1: Server Name & Custom Java Path */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-5">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Panel & Server Display Configuration</span>
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span>Server Display Name</span>
          </label>
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="e.g. My Paper Survival Server"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[11px] text-slate-500">
            Appears in header, navbar title, and browser tab. Note: Per-server domain addresses (e.g. NIGHTHOST.IN) are managed inside each server's configuration and Instance Manager.
          </p>
        </div>

        {/* Custom VPS Java Path Input */}
        <div className="pt-3 border-t border-slate-800/60 space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Terminal className={`w-3.5 h-3.5 ${theme.textPrimary}`} />
              <span>VPS Custom Java Executable Path (Optional)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Default: Auto-Detect (java / OpenJDK 21)</span>
          </label>
          <input
            type="text"
            value={customJavaPath}
            onChange={(e) => setCustomJavaPath(e.target.value)}
            placeholder="e.g. /usr/bin/java or /usr/lib/jvm/java-21-openjdk-amd64/bin/java"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-700"
          />
          <p className="text-[11px] text-slate-400">
            Leave blank to let NightHost automatically locate <code className="text-emerald-400">java</code> or <code className="text-emerald-400">JAVA_HOME</code> installed on your VPS or Docker container.
          </p>
        </div>
      </div>

      {/* Login & Register Screen Branding (Center Logo & Background) */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Login & Register Screen Customization</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Change center logo and background for the user login/register portal (URL or File Upload).
            </p>
          </div>
          <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold rounded-lg uppercase">
            Admin Controlled
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Center Logo Configuration */}
          <div className="space-y-4 bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center justify-between">
              <span>Center Logo Avatar</span>
              {loginLogoUrl && (
                <button
                  type="button"
                  onClick={() => setLoginLogoUrl('')}
                  className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-normal"
                >
                  Reset Logo
                </button>
              )}
            </h4>

            <div className="flex items-center gap-4">
              {/* Preview Avatar Box */}
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-tr from-purple-600 via-purple-500 to-cyan-400 p-0.5 shadow-xl">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  {loginLogoUrl || logoUrl ? (
                    <img src={loginLogoUrl || logoUrl} alt="Login Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Server className="w-8 h-8 text-purple-400" />
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <label className="text-[11px] font-semibold text-slate-300">Logo Image URL</label>
                <input
                  type="text"
                  value={loginLogoUrl}
                  onChange={(e) => setLoginLogoUrl(e.target.value)}
                  placeholder="Paste direct logo URL (https://...)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Direct Upload Button for Login Logo */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-300">Upload Custom Center Logo File</label>
              <label className="w-full px-4 py-2 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
                {isUploadingLoginLogo ? <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
                <span>{isUploadingLoginLogo ? 'Uploading Logo...' : 'Choose Logo Image File'}</span>
                <input type="file" accept="image/*" onChange={handleLoginLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Right Column: Background Configuration */}
          <div className="space-y-4 bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Login Screen Background Wallpaper
            </h4>

            {/* Theme Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Background Preset Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setLoginBgPreset('cyber')}
                  className={`p-2 rounded-lg font-bold text-left transition-all ${loginBgPreset === 'cyber' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  ⚡ Cyber RGB
                </button>
                <button
                  type="button"
                  onClick={() => setLoginBgPreset('space')}
                  className={`p-2 rounded-lg font-bold text-left transition-all ${loginBgPreset === 'space' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  🌌 Deep Space
                </button>
                <button
                  type="button"
                  onClick={() => setLoginBgPreset('emerald')}
                  className={`p-2 rounded-lg font-bold text-left transition-all ${loginBgPreset === 'emerald' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  🌲 Emerald
                </button>
                <button
                  type="button"
                  onClick={() => setLoginBgPreset('sunset')}
                  className={`p-2 rounded-lg font-bold text-left transition-all ${loginBgPreset === 'sunset' ? 'bg-rose-600 text-white shadow' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
                >
                  🌅 Sunset
                </button>
              </div>
            </div>

            {/* Custom Background URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Custom Background Image URL</label>
              <input
                type="text"
                value={loginBgUrl}
                onChange={(e) => {
                  setLoginBgUrl(e.target.value);
                  setLoginBgPreset('custom');
                }}
                placeholder="Paste background image URL (https://...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Direct Upload Button for Background Image */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-300">Upload Custom Wallpaper Image File</label>
              <label className="w-full px-4 py-2 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
                {isUploadingLoginBg ? <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" /> : <Upload className="w-4 h-4 text-cyan-400" />}
                <span>{isUploadingLoginBg ? 'Uploading Wallpaper...' : 'Choose Background Image File'}</span>
                <input type="file" accept="image/*" onChange={handleLoginBgUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Live Mini Preview Box */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
            Live Login Screen Mini Preview
          </span>
          <div
            className="w-full h-36 rounded-2xl border border-slate-700/80 relative overflow-hidden flex flex-col items-center justify-center p-4 text-center transition-all shadow-inner"
            style={
              loginBgUrl
                ? { backgroundImage: `url(${loginBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : {}
            }
          >
            {/* Background Tint */}
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 space-y-1.5 flex flex-col items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                  {loginLogoUrl || logoUrl ? (
                    <img src={loginLogoUrl || logoUrl} alt="Mini Preview Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Server className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              </div>
              <h5 className="text-xs font-black text-white font-mono uppercase tracking-wider">
                {serverName || 'NTH'}
              </h5>
              <div className="px-3 py-1 bg-purple-600/80 text-white rounded-lg text-[10px] font-mono font-bold">
                Sign In / Register Portal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Server Logo Upload Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-5">
        <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Custom Server Logo / Icon</span>
          </div>
          {logoUrl && (
            <button
              onClick={() => setLogoUrl('')}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-medium"
            >
              Reset to Default Badge
            </button>
          )}
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Logo Preview Box */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner relative group">
              {logoUrl ? (
                <img src={logoUrl} alt="Server Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-950 flex items-center justify-center text-emerald-400 font-extrabold text-2xl">
                  N
                </div>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Current Preview</span>
          </div>

          {/* Upload Inputs & Presets */}
          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Logo Image URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Paste direct image URL (https://...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Upload Image File</label>
                <label className="w-full px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-sm">
                  {isUploadingLogo ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <Upload className="w-4 h-4 text-emerald-400" />}
                  <span>{isUploadingLogo ? 'Uploading...' : 'Choose File'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">Preset Logo Badges</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_LOGOS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setLogoUrl(p.url)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      logoUrl === p.url
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-4 h-4 rounded-md object-cover" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark Badge Configuration Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
        <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Fixed Watermark Badge (Bottom-Right)</span>
          </div>
          <button
            onClick={() => {
              const defaultImg = 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L';
              const defaultTxt = 'Made by NightLord';
              setWatermarkImage(defaultImg);
              setWatermarkText(defaultTxt);
              localStorage.removeItem('customWatermark');
              if (onSettingsUpdate) onSettingsUpdate({ watermarkImage: defaultImg, watermarkText: defaultTxt });
            }}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer font-medium flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Watermark</span>
          </button>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Watermark Image Upload */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Watermark Image URL or Device File
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                <img
                  src={watermarkImage || 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L'}
                  alt="Watermark"
                  className="w-8 h-8 object-contain"
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
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <label className="w-full px-4 py-2.5 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg">
              {isUploadingWatermark ? <RefreshCw className="w-4 h-4 animate-spin text-purple-400" /> : <Upload className="w-4 h-4 text-purple-400" />}
              <span>{isUploadingWatermark ? 'Uploading Watermark...' : 'Upload Custom Watermark Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsUploadingWatermark(true);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (reader.result) {
                        const url = reader.result.toString();
                        setWatermarkImage(url);
                        localStorage.setItem('customWatermark', url);
                        if (onSettingsUpdate) onSettingsUpdate({ watermarkImage: url });
                      }
                      setIsUploadingWatermark(false);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Custom Watermark Text Label & Preview */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Watermark Display Text
            </label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Made by NightLord"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
            />

            <div className="pt-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-2">
                Live Badge Corner Preview
              </span>
              <div className="p-3 bg-black/85 rounded-xl border border-white/20 inline-flex items-center gap-2.5 shadow-xl backdrop-blur-md">
                <img
                  src={watermarkImage || 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L'}
                  alt="Watermark"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://kommodo.ai/i/dFiPHhi36O8VYtrYln6L';
                  }}
                />
                <span className="text-xs font-bold text-white font-sans tracking-wide">
                  {watermarkText || 'Made by NightLord'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Background Image Upload & Presets */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl space-y-5">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>Background Image Wallpaper</span>
        </h3>

        {/* Upload or Image URL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Image URL</label>
            <input
              type="text"
              value={bgImageUrl}
              onChange={(e) => setBgImageUrl(e.target.value)}
              placeholder="Paste direct image URL (https://...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Upload Image File</label>
            <label className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
              {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-emerald-400" />}
              <span>{isUploading ? 'Uploading...' : 'Choose File'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400">Preset Minecraft Wallpapers</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PRESET_WALLPAPERS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setBgImageUrl(preset.url)}
                className={`group relative h-20 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                  bgImageUrl === preset.url ? 'border-emerald-400 ring-2 ring-emerald-500/50' : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center p-1 text-center">
                  <span className="text-[11px] font-bold text-slate-100">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Overlay Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Dark Overlay Opacity</span>
              <span className="text-emerald-400 font-mono">{bgOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              value={bgOpacity}
              onChange={(e) => setBgOpacity(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Higher values improve text readability over bright images.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Background Blur</span>
              <span className="text-emerald-400 font-mono">{bgBlur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={bgBlur}
              onChange={(e) => setBgBlur(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500">Adds subtle depth blur to background wallpaper.</p>
          </div>
        </div>
      </div>

      {/* Section 3: Theme Color */}
      <div className={`${cardBgClass} rounded-2xl p-6 space-y-4`}>
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Palette className={`w-4 h-4 ${theme.textPrimary}`} />
          <span>UI Accent Theme Color</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {THEME_COLORS.map((tc) => {
            const isSelected = themeColor === tc.id;
            return (
              <button
                key={tc.id}
                onClick={() => setThemeColor(tc.id)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected ? `${tc.border} bg-slate-800/90 shadow-lg ring-2 ring-slate-700/50` : 'border-slate-800/80 bg-slate-950/70 hover:bg-slate-800/50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full ${tc.bg} shadow-md`} />
                <span className={`text-xs font-semibold ${isSelected ? tc.text : 'text-slate-300'}`}>{tc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4: HUD Glass Transparency Toggle */}
      <div className={`${cardBgClass} rounded-2xl p-6 space-y-4`}>
        <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Eye className={`w-4 h-4 ${theme.textPrimary}`} />
            <span>HUD & Sidebar Glass Transparency</span>
          </div>
          <span className={`text-xs font-mono font-bold ${hudTransparent ? theme.textPrimary : 'text-slate-400'}`}>
            {hudTransparent ? 'Translucent Glass (Active)' : 'Opaque Solid Dark'}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setHudTransparent(true)}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              hudTransparent
                ? `${theme.borderActive} ${theme.bgActive} shadow-lg ring-1 ${theme.borderActive}`
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${hudTransparent ? theme.bgSolid : 'bg-slate-800'} text-white shrink-0`}>
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">Translucent Glass HUD</span>
                {hudTransparent && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.bgActive} ${theme.textPrimary} border ${theme.borderActive}`}>Selected</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Modern backdrop-blur frosted glass overlay showing subtle wallpaper depth behind sidebar and cards.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setHudTransparent(false)}
            className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              !hudTransparent
                ? `${theme.borderActive} ${theme.bgActive} shadow-lg ring-1 ${theme.borderActive}`
                : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${!hudTransparent ? theme.bgSolid : 'bg-slate-800'} text-white shrink-0`}>
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">Solid Dark Opaque HUD</span>
                {!hudTransparent && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme.bgActive} ${theme.textPrimary} border ${theme.borderActive}`}>Selected</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Non-transparent deep slate solid dark panel backgrounds for maximum text contrast and zero distraction.
              </p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
