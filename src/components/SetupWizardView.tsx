import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Key,
  Terminal,
  Server,
} from 'lucide-react';

interface SetupWizardViewProps {
  onSetupComplete: (user: any) => void;
}

export const SetupWizardView: React.FC<SetupWizardViewProps> = ({ onSetupComplete }) => {
  const [step, setStep] = useState<'welcome' | 'form' | 'success'>('welcome');
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Options
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  // Status & Validation
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);

  const validateForm = (): boolean => {
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return false;
    }

    if (!username.trim()) {
      setErrorMsg('Username is required.');
      return false;
    }

    if (username.includes(' ')) {
      setErrorMsg('Username cannot contain spaces.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password must match.');
      return false;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms before proceeding.');
      return false;
    }

    return true;
  };

  const handleSubmitSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedUser(data.user);
        setStep('success');
      } else {
        setErrorMsg(data.error || 'Failed to complete first-time setup.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error during setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07070a] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider mb-2 rgb-glow">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Minecraft Hosting Panel Setup</span>
          </div>
          <h1 className="text-3xl font-black text-white font-mono tracking-tight uppercase">
            NightHost Core v2.5
          </h1>
        </div>

        {/* STEP 1: WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 shadow-2xl backdrop-blur-2xl space-y-6 text-center animate-fade-in rgb-glow">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-blue-600 p-0.5 shadow-xl">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Server className="w-10 h-10 text-purple-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-white">
                Welcome to Your Minecraft Hosting Panel
              </h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
                This appears to be your first time installing the panel. Let's create your administrator account to secure your servers.
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="w-8 h-2 rounded-full bg-purple-500" />
              <span className="w-2 h-2 rounded-full bg-slate-800" />
              <span className="w-2 h-2 rounded-full bg-slate-800" />
            </div>

            <button
              onClick={() => setStep('form')}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold text-sm rounded-2xl shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/40 group active:scale-[0.99]"
            >
              <span>Start Setup</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* STEP 2: ADMINISTRATOR ACCOUNT CREATION */}
        {step === 'form' && (
          <div className="glass-panel p-8 rounded-3xl border border-purple-500/30 shadow-2xl backdrop-blur-2xl space-y-6 animate-fade-in rgb-glow">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white font-mono uppercase">
                  Administrator Account Creation
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Configure root superuser credentials for createuser.json
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Step 2 of 3
              </span>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl text-red-200 text-xs font-mono flex items-center gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSetup} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Night Lord"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Username & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" /> Username (No Spaces)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nightlord"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" /> Password (Min 8 chars)
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

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" /> Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Options Checkboxes */}
              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Show Password</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-purple-500"
                  />
                  <span>I agree to the Terms of Service & Host Access Rules</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer border border-purple-400/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Administrator...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>Create Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS SCREEN */}
        {step === 'success' && (
          <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 shadow-2xl backdrop-blur-2xl space-y-6 text-center animate-fade-in rgb-glow">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-xl">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono text-xs font-bold">
                Setup Complete!
              </span>
              <h2 className="text-2xl font-black text-white font-mono uppercase mt-2">
                Administrator Account Saved
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
                Saved to <code className="text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">createuser.json</code> with Administrator privileges.
              </p>
            </div>

            {createdUser && (
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left font-mono text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="flex justify-between text-slate-400">
                  <span>Username:</span>
                  <span className="text-purple-300 font-bold">{createdUser.username}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Role:</span>
                  <span className="text-emerald-400 font-bold">{createdUser.role}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-blue-400 font-bold">{createdUser.status}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => onSetupComplete(createdUser)}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-sm rounded-2xl shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40 active:scale-[0.99]"
            >
              <span>Proceed to Login Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
