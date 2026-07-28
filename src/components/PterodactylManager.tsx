import React, { useState, useEffect } from 'react';
import { PterodactylKey } from '../types';
import { Server, Key, Terminal, Copy, Check, Plus, Trash2, Cpu, HardDrive, Wifi, Sparkles, ExternalLink, Code2, ShieldCheck, RefreshCw } from 'lucide-react';

export const PterodactylManager: React.FC = () => {
  const [keys, setKeys] = useState<PterodactylKey[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyDesc, setNewKeyDesc] = useState('');
  const [message, setMessage] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/client/servers');
  const [testResponse, setTestResponse] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/pterodactyl/keys');
      const data = await res.json();
      if (data.keys) setKeys(data.keys);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async () => {
    try {
      const res = await fetch('/api/pterodactyl/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newKeyDesc.trim() || 'Pterodactyl API Key' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`🎉 Generated Pterodactyl Client API Key: ${data.key.token}`);
        setNewKeyDesc('');
        fetchKeys();
      }
    } catch {
      setMessage('Failed to generate API Key');
    } finally {
      setTimeout(() => setMessage(''), 6000);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      const res = await fetch(`/api/pterodactyl/keys/delete?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Deleted API Key');
        fetchKeys();
      }
    } catch {
      setMessage('Failed to delete API key');
    }
  };

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestEndpoint = async () => {
    setIsTesting(true);
    try {
      const res = await fetch(selectedEndpoint);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestResponse(`Error fetching endpoint: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const domainHost = typeof window !== 'undefined' ? window.location.origin : 'https://nth-panel.com';

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

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 text-[11px] font-mono border border-blue-800/60 font-semibold flex items-center gap-1">
                <Server className="w-3.5 h-3.5" /> Pterodactyl API v1 Engine
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 text-[10px] font-mono rounded border border-emerald-800/60 font-bold">
                PROD READY
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>Pterodactyl (Petroldectal) API & External Integration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Connect external tools like Discord Bots, Pterodactyl Mobile Apps (PteroController), WHMCS billing, and Python/Node JS automation scripts directly to <strong className="text-slate-200">NightHost (NTH)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <span className="text-slate-400 block text-[10px]">API GATEWAY</span>
              <span className="text-emerald-400 font-bold">ACTIVE (Port 3000)</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Generator & List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Create Key Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" /> Generate Client API Key
          </h3>
          <p className="text-xs text-slate-400">
            Keys grant access to server power state, metrics, console commands, and files using standard <code className="text-emerald-400">Authorization: Bearer ptlc_...</code> headers.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Key Description</label>
              <input
                type="text"
                placeholder="e.g. Discord Bot / Mobile App / WHMCS"
                value={newKeyDesc}
                onChange={(e) => setNewKeyDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleGenerateKey}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Key</span>
            </button>
          </div>
        </div>

        {/* Existing Keys Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Active API Keys ({keys.length})
            </h3>
            <button onClick={fetchKeys} className="p-1 text-slate-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {keys.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-6">No API keys generated yet.</p>
            ) : (
              keys.map((k) => (
                <div key={k.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs font-mono gap-3">
                  <div className="overflow-hidden">
                    <span className="text-slate-200 font-bold block text-xs truncate">{k.description}</span>
                    <span className="text-emerald-400 text-[11px] block truncate">{k.token}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(k.token, k.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === k.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === k.id ? 'Copied' : 'Copy Token'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Endpoint Live Test Bench & CURL Code Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" /> Interactive Pterodactyl Endpoint Test Bench
          </h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 flex-1"
            >
              <option value="/api/client">GET /api/client (Account Info)</option>
              <option value="/api/client/servers">GET /api/client/servers (Servers List)</option>
              <option value="/api/client/servers/nth-01">GET /api/client/servers/nth-01 (Server Details)</option>
              <option value="/api/client/servers/nth-01/resources">GET /api/client/servers/nth-01/resources (RAM/CPU/TPS Stats)</option>
              <option value="/api/application/users">GET /api/application/users (Application API)</option>
              <option value="/api/application/servers">GET /api/application/servers (Application API)</option>
            </select>

            <button
              onClick={handleTestEndpoint}
              disabled={isTesting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
              <span>Execute Request</span>
            </button>
          </div>
        </div>

        {/* cURL snippet display */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 flex items-center justify-between overflow-x-auto">
          <code>curl -X GET "{domainHost}{selectedEndpoint}" -H "Authorization: Bearer {keys[0]?.token || 'ptlc_nth_demo'}" -H "Accept: application/json"</code>
          <button
            onClick={() => handleCopy(`curl -X GET "${domainHost}${selectedEndpoint}" -H "Authorization: Bearer ${keys[0]?.token || 'ptlc_nth_demo'}"`, 'curl')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer shrink-0 ml-2"
          >
            {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* JSON Response */}
        {testResponse && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-72 overflow-y-auto">
            <span className="text-[10px] text-slate-500 font-mono block mb-2 uppercase tracking-wider">JSON Response Payload:</span>
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">{testResponse}</pre>
          </div>
        )}
      </div>

    </div>
  );
};
