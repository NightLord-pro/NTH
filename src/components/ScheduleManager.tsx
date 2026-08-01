import React, { useState } from 'react';
import { PanelSettings } from '../types';
import {
  Clock,
  Plus,
  Play,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  RotateCw,
  Archive,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface ScheduleManagerProps {
  settings: PanelSettings;
}

interface ScheduledTask {
  id: string;
  name: string;
  interval: string;
  command: string;
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  type: 'COMMAND' | 'RESTART' | 'BACKUP' | 'ANNOUNCEMENT';
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([
    {
      id: 't1',
      name: 'Daily Automated Server Reboot',
      interval: 'Daily at 04:00 AM',
      command: '/restart',
      enabled: true,
      lastRun: '2026-07-29 04:00 AM',
      nextRun: '2026-07-30 04:00 AM',
      type: 'RESTART',
    },
    {
      id: 't2',
      name: 'Automated World Backup & Save-All',
      interval: 'Every 6 Hours',
      command: '/save-all',
      enabled: true,
      lastRun: '2026-07-30 00:00 AM',
      nextRun: '2026-07-30 06:00 AM',
      type: 'BACKUP',
    },
    {
      id: 't3',
      name: 'ClearLag Ground Item Purge',
      interval: 'Every 2 Hours',
      command: '/lagg clear',
      enabled: true,
      lastRun: '2026-07-30 02:00 AM',
      nextRun: '2026-07-30 04:00 AM',
      type: 'COMMAND',
    },
    {
      id: 't4',
      name: 'Official Discord Join Announcement',
      interval: 'Every 30 Minutes',
      command: '/say Join our official Discord community at https://discord.gg/udUdNKzz7P !',
      enabled: false,
      lastRun: '2026-07-29 18:30 PM',
      nextRun: 'Paused',
      type: 'ANNOUNCEMENT',
    },
  ]);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [interval, setInterval] = useState('Every 1 Hour');
  const [command, setCommand] = useState('/save-all');
  const [type, setType] = useState<'COMMAND' | 'RESTART' | 'BACKUP' | 'ANNOUNCEMENT'>('COMMAND');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTask: ScheduledTask = {
      id: Date.now().toString(),
      name: name.trim(),
      interval,
      command: command.trim(),
      enabled: true,
      lastRun: 'Never',
      nextRun: 'Scheduled Next Cycle',
      type,
    };

    setTasks(prev => [...prev, newTask]);
    setName('');
    setShowModal(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const runTaskNow = (task: ScheduledTask) => {
    alert(`[Task Scheduler] Executed task: "${task.name}" (${task.command}) immediately!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                <span>Task Scheduler & Automated Cron Jobs</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Schedule recurring server reboots, world backups, broadcast messages, and console commands.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl px-4 py-2.5 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-950/50 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Scheduled Task</span>
        </button>
      </div>

      {/* Task List Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" /> Active Cron Schedule Jobs
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{tasks.filter(t => t.enabled).length} active / {tasks.length} total</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded uppercase ${
                    task.type === 'RESTART' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    task.type === 'BACKUP' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    task.type === 'ANNOUNCEMENT' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {task.type}
                  </span>
                  <span className="font-extrabold text-sm text-slate-100">{task.name}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-purple-400" /> {task.interval}
                  </span>
                  <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-emerald-400">
                    {task.command}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto shrink-0 font-mono text-xs">
                <div className="text-right hidden sm:block text-[11px]">
                  <span className="text-slate-500 block">Next Run:</span>
                  <span className={task.enabled ? "text-purple-300 font-bold" : "text-slate-500 font-bold"}>
                    {task.nextRun}
                  </span>
                </div>

                <button
                  onClick={() => runTaskNow(task)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  title="Run Task Immediately"
                >
                  <Play className="w-3 h-3" /> Run
                </button>

                <button
                  onClick={() => toggleTask(task.id)}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    task.enabled ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 hover:text-slate-400'
                  }`}
                  title={task.enabled ? 'Disable Task' : 'Enable Task'}
                >
                  {task.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12121a] border border-purple-500/30 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-purple-400" /> Create Scheduled Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Daily World Save & ClearLag"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Interval / Schedule</label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Every 30 Minutes">Every 30 Minutes</option>
                    <option value="Every 1 Hour">Every 1 Hour</option>
                    <option value="Every 6 Hours">Every 6 Hours</option>
                    <option value="Daily at 04:00 AM">Daily at 04:00 AM</option>
                    <option value="Every Sunday at 00:00 AM">Every Sunday at 00:00 AM</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Task Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="COMMAND">Custom Console Command</option>
                    <option value="RESTART">Server Reboot</option>
                    <option value="BACKUP">World Save & Backup</option>
                    <option value="ANNOUNCEMENT">In-Game Broadcast</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Command / Action String</label>
                <input
                  type="text"
                  placeholder="e.g. /save-all or /restart"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer shadow-lg"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
