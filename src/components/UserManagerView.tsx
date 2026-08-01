import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Search,
  Plus,
  Key,
  Mail,
  Lock,
  UserCheck,
  ShieldAlert,
  Edit,
  Trash2,
  UserPlus,
  X,
  CheckCircle2,
  XCircle,
  Terminal,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { PanelSettings } from '../types';

interface UserPermissions {
  canCreateServers?: boolean;
  canAccessConsole?: boolean;
  canManageFiles?: boolean;
  canManageBackups?: boolean;
  canAccessAdmin?: boolean;
}

interface ApiUserRecord {
  id: number;
  name?: string;
  username: string;
  email: string;
  role: 'Administrator' | 'Staff' | 'Moderator' | 'User';
  status: 'active' | 'suspended';
  createdAt?: string;
  permissions?: UserPermissions;
}

interface UserManagerViewProps {
  settings: PanelSettings;
}

export const UserManagerView: React.FC<UserManagerViewProps> = ({ settings }) => {
  const [users, setUsers] = useState<ApiUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUserRecord | null>(null);
  const [passwordResetUser, setPasswordResetUser] = useState<ApiUserRecord | null>(null);

  // Form Fields for Add User
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ApiUserRecord['role']>('User');
  const [status, setStatus] = useState<ApiUserRecord['status']>('active');

  // Password reset state
  const [newResetPassword, setNewResetPassword] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      }
    } catch {
      setErrorMsg('Failed to load users from createuser.json');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // ➕ Create User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password) {
      showNotification('Please fill in all required fields.', true);
      return;
    }

    if (username.includes(' ')) {
      showNotification('Username cannot contain spaces.', true);
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          role,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`User @${username} created and saved to createuser.json!`);
        setShowAddModal(false);
        setFullName('');
        setUsername('');
        setEmail('');
        setPassword('');
        fetchUsers();
      } else {
        showNotification(data.error || 'Failed to create user.', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error connecting to server.', true);
    }
  };

  // ✏ Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
          permissions: editingUser.permissions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`User @${editingUser.username} updated!`);
        setEditingUser(null);
        fetchUsers();
      } else {
        showNotification(data.error || 'Failed to update user.', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error updating user.', true);
    }
  };

  // 🔑 Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser) return;
    if (newResetPassword.length < 8) {
      showNotification('Password must be at least 8 characters long.', true);
      return;
    }

    try {
      const res = await fetch(`/api/users/${passwordResetUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newResetPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`Password reset for @${passwordResetUser.username}!`);
        setPasswordResetUser(null);
        setNewResetPassword('');
      } else {
        showNotification(data.error || 'Failed to reset password.', true);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error resetting password.', true);
    }
  };

  // 🚫 Suspend / Activate Toggle
  const handleToggleStatus = async (user: ApiUserRecord) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`Account @${user.username} is now ${newStatus.toUpperCase()}`);
        fetchUsers();
      } else {
        showNotification(data.error || 'Failed to update status.', true);
      }
    } catch {
      showNotification('Failed to update user status.', true);
    }
  };

  // 🗑 Delete User
  const handleDeleteUser = async (user: ApiUserRecord) => {
    if (!window.confirm(`Are you sure you want to delete user @${user.username}? This will modify createuser.json.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`Deleted user @${user.username}`);
        fetchUsers();
      } else {
        showNotification(data.error || 'Failed to delete user.', true);
      }
    } catch {
      showNotification('Error deleting user.', true);
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notifications */}
      {errorMsg && (
        <div className="p-4 bg-red-950/90 border border-red-500 rounded-xl text-red-200 text-xs font-mono flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-emerald-200 text-xs font-mono flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-purple-500/30 rgb-glow">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded uppercase">
              createuser.json Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">{users.length} Total Registered Users</span>
          </div>
          <h1 className="text-xl font-black text-white font-mono uppercase tracking-wider mt-1">
            User Accounts & Roles Manager
          </h1>
          <p className="text-xs text-slate-400">
            Create, edit, suspend, activate, or assign Administrator, Staff, Moderator & User roles directly synced with createuser.json.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 cursor-pointer transition-colors"
            title="Refresh Users List"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center gap-2 cursor-pointer active:scale-95 border border-purple-400/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>➕ Create User</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search users by name, username, email or role..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Showing <span className="text-purple-400 font-bold">{filteredUsers.length}</span> user accounts
        </div>
      </div>

      {/* User Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Full Name & Username</th>
                <th className="px-4 py-3">Email Address</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-purple-950/20 transition-all">
                  <td className="px-4 py-3 text-slate-500 font-bold">#{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-sans font-bold text-slate-100">{u.name || u.username}</div>
                        <div className="text-[10px] text-purple-400 font-mono">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
                        u.role === 'Administrator'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : u.role === 'Staff'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : u.role === 'Moderator'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                        <XCircle className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">{u.createdAt || 'N/A'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit */}
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1.5 bg-slate-900 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 rounded-lg border border-slate-800 cursor-pointer transition-all"
                        title="✏ Edit User"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Password Reset */}
                      <button
                        onClick={() => setPasswordResetUser(u)}
                        className="p-1.5 bg-slate-900 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 rounded-lg border border-slate-800 cursor-pointer transition-all"
                        title="🔑 Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      {/* Toggle Status (Suspend / Activate) */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                          u.status === 'active'
                            ? 'bg-slate-900 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 border-slate-800'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                        }`}
                        title={u.status === 'active' ? '🚫 Suspend User' : '✅ Activate User'}
                      >
                        {u.status === 'active' ? <ShieldAlert className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 bg-slate-900 hover:bg-red-600/30 text-slate-300 hover:text-red-400 rounded-lg border border-slate-800 cursor-pointer transition-all"
                        title="🗑 Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 w-full max-w-md space-y-4 animate-fade-in rgb-glow">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-mono font-bold text-sm text-white uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" /> Create New User Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Night Lord"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Username (No Spaces)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nightlord"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Role 🎭</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Staff">Staff</option>
                    <option value="Moderator">Moderator</option>
                    <option value="User">User</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Save to createuser.json
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/40 w-full max-w-md space-y-4 animate-fade-in rgb-glow">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-mono font-bold text-sm text-white uppercase flex items-center gap-2">
                <Edit className="w-4 h-4 text-purple-400" /> Edit User @{editingUser.username}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Role 🎭</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => {
                      const newRole = e.target.value as any;
                      const isAdm = newRole === 'Administrator';
                      const isStf = newRole === 'Staff';
                      setEditingUser({
                        ...editingUser,
                        role: newRole,
                        permissions: {
                          canCreateServers: isAdm,
                          canAccessConsole: isAdm || isStf,
                          canManageFiles: isAdm || isStf,
                          canManageBackups: isAdm,
                          canAccessAdmin: isAdm,
                        }
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Administrator">Administrator (Owner)</option>
                    <option value="Staff">Staff Member</option>
                    <option value="Moderator">Moderator</option>
                    <option value="User">User (Regular Member)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Controls */}
              <div className="p-3 bg-slate-950/80 border border-purple-500/20 rounded-xl space-y-2">
                <span className="text-[10px] font-bold font-mono text-purple-300 uppercase block">
                  Permissions Customization (Owner Control)
                </span>

                <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingUser.permissions?.canCreateServers ?? (editingUser.role === 'Administrator')}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        permissions: {
                          ...editingUser.permissions,
                          canCreateServers: e.target.checked,
                        },
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Allow Creating Server Instances</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingUser.permissions?.canAccessConsole ?? (editingUser.role === 'Administrator' || editingUser.role === 'Staff')}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        permissions: {
                          ...editingUser.permissions,
                          canAccessConsole: e.target.checked,
                        },
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Allow Console Commands Access</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingUser.permissions?.canManageFiles ?? (editingUser.role === 'Administrator' || editingUser.role === 'Staff')}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        permissions: {
                          ...editingUser.permissions,
                          canManageFiles: e.target.checked,
                        },
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Allow File Explorer & File Edits</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-white text-slate-300">
                  <input
                    type="checkbox"
                    checked={editingUser.permissions?.canAccessAdmin ?? (editingUser.role === 'Administrator')}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        permissions: {
                          ...editingUser.permissions,
                          canAccessAdmin: e.target.checked,
                        },
                      })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Allow Panel Settings & Admin Panel</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-blue-500/40 w-full max-w-sm space-y-4 animate-fade-in rgb-glow">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-mono font-bold text-sm text-white uppercase flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" /> Reset Password
              </h3>
              <button onClick={() => setPasswordResetUser(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3 font-mono text-xs">
              <p className="text-slate-400">
                Enter a new password for <span className="text-purple-300 font-bold">@{passwordResetUser.username}</span>:
              </p>

              <div>
                <input
                  type="password"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  placeholder="New password (min 8 chars)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer shadow"
                >
                  Set New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
