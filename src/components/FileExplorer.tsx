import React, { useState, useEffect } from 'react';
import { FileItem } from '../types';
import { Folder, FileText, ChevronRight, Save, Trash2, FilePlus, FolderPlus, Download, ArrowLeft, RefreshCw, X, Edit3 } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchFiles = async (path: string = currentPath) => {
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        setCurrentPath(data.currentPath);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const handleOpenFile = async (file: FileItem) => {
    if (file.isDirectory) {
      setCurrentPath(file.path);
      return;
    }

    // Read file content
    try {
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(file.path)}`);
      const data = await res.json();
      if (data.content !== undefined) {
        setSelectedFile(file.path);
        setFileContent(data.content);
        setIsEditing(true);
      }
    } catch {
      setStatusMsg('Error opening file');
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relPath: selectedFile,
          content: fileContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Saved ${selectedFile}`);
        fetchFiles();
      }
    } catch {
      setStatusMsg('Failed to save file');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  const handleDeleteItem = async (relPath: string) => {
    if (!confirm(`Are you sure you want to delete ${relPath}?`)) return;

    try {
      const res = await fetch(`/api/files/delete?path=${encodeURIComponent(relPath)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Deleted ${relPath}`);
        if (selectedFile === relPath) {
          setIsEditing(false);
          setSelectedFile(null);
        }
        fetchFiles();
      }
    } catch {
      setStatusMsg('Delete failed');
    }
  };

  const handleCreateNewFile = async () => {
    if (!newFileName.trim()) return;
    const targetPath = currentPath ? `${currentPath}/${newFileName.trim()}` : newFileName.trim();

    try {
      const res = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relPath: targetPath, content: '' }),
      });
      const data = await res.json();
      if (data.success) {
        setShowNewFileModal(false);
        setNewFileName('');
        fetchFiles();
        setSelectedFile(targetPath);
        setFileContent('');
        setIsEditing(true);
      }
    } catch {
      setStatusMsg('Failed to create file');
    }
  };

  const handleCreateNewFolder = async () => {
    if (!newFolderName.trim()) return;
    const targetPath = currentPath ? `${currentPath}/${newFolderName.trim()}/.gitkeep` : `${newFolderName.trim()}/.gitkeep`;

    try {
      await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relPath: targetPath, content: '' }),
      });
      setShowNewFolderModal(false);
      setNewFolderName('');
      fetchFiles();
    } catch {
      setStatusMsg('Failed to create folder');
    }
  };

  const breadcrumbs = currentPath ? currentPath.split('/') : [];

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      
      {/* Notification Toast */}
      {statusMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-xl text-xs font-medium shadow-lg animate-fade-in flex items-center justify-between">
          <span>{statusMsg}</span>
        </div>
      )}

      {/* File Navigation & Breadcrumbs Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-xs">
          <button
            onClick={() => setCurrentPath('')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <Folder className="w-3.5 h-3.5 text-emerald-400" />
            <span>server-files</span>
          </button>

          {breadcrumbs.map((crumb, idx) => {
            const fullPath = breadcrumbs.slice(0, idx + 1).join('/');
            return (
              <React.Fragment key={fullPath}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <button
                  onClick={() => setCurrentPath(fullPath)}
                  className="px-2 py-1 bg-slate-800/60 hover:bg-slate-800 text-slate-300 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  {crumb}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {currentPath && (
            <button
              onClick={() => {
                const parts = currentPath.split('/');
                parts.pop();
                setCurrentPath(parts.join('/'));
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            onClick={() => setShowNewFileModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New File</span>
          </button>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Main File Explorer Grid / Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* File Tree List */}
        <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl ${isEditing ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-mono">
              Files in /server-files/{currentPath}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{files.length} items</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
            {files.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                Folder is empty.
              </div>
            ) : (
              files.map((item) => (
                <div
                  key={item.path}
                  className={`p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer ${
                    selectedFile === item.path ? 'bg-slate-800/80 border-l-2 border-emerald-500' : ''
                  }`}
                  onClick={() => handleOpenFile(item)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.isDirectory ? (
                      <Folder className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <span className="text-xs font-mono text-slate-200 truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {!item.isDirectory && (
                      <span className="text-[11px] font-mono text-slate-500">{formatSize(item.sizeBytes)}</span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.path);
                      }}
                      className="p-1 hover:bg-rose-950 text-slate-500 hover:text-rose-300 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Code / Text Configuration Editor View */}
        {isEditing && selectedFile && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[600px]">
            
            {/* Editor Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-200">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold truncate max-w-xs">{selectedFile}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveFile}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-950/50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 bg-slate-950 p-4 font-mono text-xs">
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full h-full bg-transparent text-slate-100 focus:outline-none resize-none leading-relaxed font-mono"
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FilePlus className="w-5 h-5 text-emerald-400" /> Create New File
            </h3>
            <input
              type="text"
              placeholder="filename.txt, spigot.yml, etc."
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-blue-400" /> Create New Folder
            </h3>
            <input
              type="text"
              placeholder="folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFolder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
