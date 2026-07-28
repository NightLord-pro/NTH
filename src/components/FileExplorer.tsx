import React, { useState, useEffect, useRef } from 'react';
import { FileItem } from '../types';
import { Folder, FileText, ChevronRight, Save, Trash2, FilePlus, FolderPlus, Download, ArrowLeft, RefreshCw, X, Edit3, Upload, Edit } from 'lucide-react';

export const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // New File Modal
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);

  // New Folder Modal
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);

  // Rename Modal
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [itemToRename, setItemToRename] = useState<FileItem | null>(null);
  const [renameNewName, setRenameNewName] = useState('');

  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenRenameModal = (item: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToRename(item);
    setRenameNewName(item.name);
    setShowRenameModal(true);
  };

  const handleRenameItem = async () => {
    if (!itemToRename || !renameNewName.trim()) return;

    try {
      const res = await fetch('/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: itemToRename.path,
          newName: renameNewName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Renamed to ${renameNewName.trim()}`);
        setShowRenameModal(false);
        setItemToRename(null);
        setRenameNewName('');
        fetchFiles();
      } else {
        setStatusMsg(`Rename failed: ${data.error || 'Error'}`);
      }
    } catch {
      setStatusMsg('Failed to rename item');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setStatusMsg(`Uploading ${uploadedFiles.length} file(s) (Unlimited Size)...`);

    const formData = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append('files', uploadedFiles[i]);
    }

    try {
      const res = await fetch(`/api/files/upload?folder=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || 'Files uploaded successfully!');
        fetchFiles();
      } else {
        setStatusMsg(`Upload error: ${data.error || 'Failed'}`);
      }
    } catch {
      setStatusMsg('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    setIsUploading(true);
    setStatusMsg(`Uploading ${droppedFiles.length} dropped file(s)...`);

    const formData = new FormData();
    for (let i = 0; i < droppedFiles.length; i++) {
      formData.append('files', droppedFiles[i]);
    }

    try {
      const res = await fetch(`/api/files/upload?folder=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg(data.message || 'Files uploaded successfully!');
        fetchFiles();
      } else {
        setStatusMsg(`Upload error: ${data.error || 'Failed'}`);
      }
    } catch {
      setStatusMsg('Upload failed');
    } finally {
      setIsUploading(false);
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
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input for Unlimited Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />
      
      {/* Notification Toast */}
      {statusMsg && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg animate-fade-in flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isUploading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            {statusMsg}
          </span>
          <button onClick={() => setStatusMsg('')} className="p-0.5 text-emerald-400 hover:text-emerald-100">
            <X className="w-3.5 h-3.5" />
          </button>
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

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Direct File Upload Button - No File Size Limit */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>Upload Files</span>
          </button>

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
        
        {/* File Tree List with Drag and Drop */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl ${isEditing ? 'lg:col-span-5' : 'lg:col-span-12'}`}
        >
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
              <span>Files in /server-files/{currentPath}</span>
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-sans">No Size Limits</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{files.length} items</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
            {files.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-12 text-center text-slate-500 text-xs font-mono cursor-pointer hover:bg-slate-800/30 transition-colors border-2 border-dashed border-slate-800/80 m-4 rounded-xl flex flex-col items-center justify-center gap-2"
              >
                <Upload className="w-6 h-6 text-emerald-400/80 mb-1" />
                <p className="text-slate-300 font-semibold">Folder is empty</p>
                <p className="text-slate-500 text-[11px]">Click or drag & drop files here to upload (Any size supported)</p>
              </div>
            ) : (
              files.map((item) => (
                <div
                  key={item.path}
                  className={`p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors cursor-pointer group ${
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

                  <div className="flex items-center gap-2 shrink-0">
                    {!item.isDirectory && (
                      <span className="text-[11px] font-mono text-slate-500 mr-1">{formatSize(item.sizeBytes)}</span>
                    )}

                    {/* Rename Button */}
                    <button
                      onClick={(e) => handleOpenRenameModal(item, e)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded-lg transition-colors"
                      title="Rename"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item.path);
                      }}
                      className="p-1.5 hover:bg-rose-950 text-slate-400 hover:text-rose-300 rounded-lg transition-colors"
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

      {/* Rename File/Folder Modal */}
      {showRenameModal && itemToRename && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-400" /> Rename {itemToRename.isDirectory ? 'Folder' : 'File'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">Current: {itemToRename.name}</p>
            <input
              type="text"
              placeholder="New name..."
              value={renameNewName}
              onChange={(e) => setRenameNewName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameItem();
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setItemToRename(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameItem}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

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
