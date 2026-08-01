import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  AlertCircle,
  Server,
  RefreshCw,
} from 'lucide-react';
import { PanelSettings } from '../types';

interface LoginViewProps {
  settings: PanelSettings;
  onLoginSuccess: (user: any, isNewRegistration?: boolean) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  settings,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  // Initialize background and custom URLs from PanelSettings if available
  const [bgStyle, setBgStyle] = useState<'cyber' | 'space' | 'emerald' | 'sunset' | 'custom'>(
    settings?.loginBgPreset || (settings?.loginBgUrl ? 'custom' : 'cyber')
  );
  const [customBgUrl, setCustomBgUrl] = useState(settings?.loginBgUrl || '');

  // Sync state if settings update
  useEffect(() => {
    if (settings?.loginBgPreset) setBgStyle(settings.loginBgPreset);
    if (settings?.loginBgUrl) setCustomBgUrl(settings.loginBgUrl);
  }, [settings?.loginBgPreset, settings?.loginBgUrl]);

  const activeCenterLogo = settings?.loginLogoUrl || settings?.logoUrl || '';
  const effectiveBgUrl = (bgStyle === 'custom' && customBgUrl) ? customBgUrl : settings?.loginBgUrl;
  
  // Login Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username/email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Invalid username or password.');
      }
    } catch (err: any) {
      setErrorMsg('Server error. Failed to reach authentication API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('All fields are required for account registration.');
      return;
    }

    if (regUsername.includes(' ')) {
      setErrorMsg('Username cannot contain spaces.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Member account registered successfully! Logging you in...');
        setTimeout(() => {
          onLoginSuccess(data.user, true);
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to register account.');
      }
    } catch (err: any) {
      setErrorMsg('Server connection error during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compute background class or inline style
  const getBgStyleClass = () => {
    if (bgStyle === 'space') return 'bg-[#030712] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]';
    if (bgStyle === 'emerald') return 'bg-[#021008] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.25),rgba(255,255,255,0))]';
    if (bgStyle === 'sunset') return 'bg-[#18080c] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,63,94,0.25),rgba(255,255,255,0))]';
    return 'bg-[#07070a]';
  };

  return (
    <div
      className={`min-h-screen w-full ${getBgStyleClass()} text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans transition-all duration-500`}
      style={
        effectiveBgUrl
          ? { backgroundImage: `url(${effectiveBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : bgStyle === 'custom' && customBgUrl
          ? { backgroundImage: `url(${customBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {}
      }
    >
      {/* Background Overlay for readability if background image is active */}
      {(effectiveBgUrl || (bgStyle === 'custom' && customBgUrl)) && (
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none z-0" />
      )}

      {/* Background Glow Blobs */}
      {bgStyle === 'cyber' && !effectiveBgUrl && (
        <>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        </>
      )}

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* CENTERED LOGO AVATAR & BRAND TITLE */}
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 via-purple-500 to-cyan-400 p-1 shadow-2xl shadow-purple-950/80 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center relative overflow-hidden">
                {activeCenterLogo ? (
                  <img src={activeCenterLogo} alt="Server Logo" className="w-full h-full object-cover rounded-[20px]" />
                ) : (
                  <Server className="w-10 h-10 text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                )}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 border-2 border-slate-950 w-5 h-5 rounded-full flex items-center justify-center shadow" title="System Online">
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider uppercase drop-shadow">
              {settings?.serverName || 'Minecraft Hosting Panel'}
            </h1>
            <p className="text-xs text-purple-300/80 font-mono tracking-widest uppercase mt-1">
              Enterprise Minecraft Host Portal
            </p>
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl backdrop-blur-2xl space-y-5 animate-fade-in rgb-glow">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono font-bold">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${mode === 'login' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${mode === 'register' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Register Member
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs font-mono flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-mono flex items-center gap-3 animate-fade-in">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username or Email */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Username or Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or member@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/30 disabled:opacity-50 active:scale-[0.99] mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Panel</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER MEMBER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] font-mono text-amber-300 leading-relaxed">
                ℹ️ <strong>Member Role Policy:</strong> Registered accounts automatically receive standard Member status. Only the Panel Administrator (Owner) can grant server creation rights.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Username</label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="john123"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300">Confirm Password</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/30 disabled:opacity-50 active:scale-[0.99] mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Member Account...</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Register as Member</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Discord Support Server */}
        <div className="p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-xl flex items-center justify-center text-xs font-mono">
          <a
            href="https://discord.gg/udUdNKzz7P"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#5865F2]/20 transition-all cursor-pointer border border-indigo-400/30"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Discord Support Community</span>
          </a>
        </div>
      </div>
    </div>
  );
};

