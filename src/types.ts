export type ServerState = 'STOPPED' | 'STARTING' | 'RUNNING' | 'STOPPING' | 'CRASHED';

export interface ServerMetrics {
  cpuPercent: number;
  memoryUsageMB: number;
  memoryMaxMB: number;
  tps: number;
  onlinePlayers: number;
  maxPlayers: number;
  uptimeSeconds: number;
}

export interface ConsoleLog {
  id: string;
  timestamp: string;
  text: string;
  html?: string;
  type: 'stdout' | 'stderr' | 'info' | 'warn' | 'error' | 'command';
}

export interface PluginItem {
  name: string;
  filename: string;
  sizeBytes: number;
  enabled: boolean;
  version?: string;
  description?: string;
  author?: string;
}

export interface CatalogPlugin {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  downloadUrl: string;
  author: string;
  icon: string;
}

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  sizeBytes: number;
  updatedAt: string;
  extension?: string;
}

export interface PlayerInfo {
  username: string;
  uuid: string;
  ping: number;
  ip: string;
  joinedAt: string;
  isOp: boolean;
  isWhitelisted: boolean;
}

export interface PanelSettings {
  serverName: string;
  serverAddress?: string;
  logoUrl?: string;
  bgImageUrl: string;
  bgOpacity: number;
  bgBlur: number;
  themeColor: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'indigo';
  hudTransparent?: boolean;
  customJavaPath?: string;
  activeSoftware: string;
  activeVersion: string;
  loginLogoUrl?: string;
  loginBgUrl?: string;
  loginBgPreset?: 'cyber' | 'space' | 'emerald' | 'sunset' | 'custom';
}

export interface ServerConfig {
  motd: string;
  maxPlayers: number;
  serverPort: number;
  serverAddress?: string;
  gamemode: 'survival' | 'creative' | 'adventure' | 'spectator';
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard';
  onlineMode: boolean;
  pvp: boolean;
  allowFlight: boolean;
  enableCommandBlock: boolean;
  viewDistance: number;
  spawnProtection: number;
  levelName: string;
  levelSeed: string;
  eulaAccepted: boolean;
  minRamGb: number;
  maxRamGb: number;
  customJvmArgs: string;
  autoRestart: boolean;
}

export interface WorldInfo {
  folderName: string;
  displayName: string;
  isActive: boolean;
  sizeBytes: number;
  dimensionType: 'normal' | 'nether' | 'the_end' | 'custom';
  updatedAt: string;
  seed?: string;
  gameMode?: string;
}

export interface BackupInfo {
  id: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  description: string;
  isAutomatic: boolean;
  checksum?: string;
}

export interface PterodactylKey {
  id: string;
  identifier: string;
  description: string;
  createdAt: string;
  lastUsedAt?: string;
  token: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  cronExpr: string;
  action: 'command' | 'restart' | 'backup';
  payload: string;
  enabled: boolean;
  lastRun?: string;
}

export interface ServerInstance {
  id: string;
  name: string;
  description: string;
  software: string;
  version: string;
  port: number;
  minRamGb: number;
  maxRamGb: number;
  maxPlayers: number;
  motd: string;
  createdAt: string;
  nodeName: string;
  status: ServerState;
  colorTag: 'emerald' | 'cyan' | 'purple' | 'amber' | 'rose' | 'indigo';
  assignedUser?: string;
  isDefault?: boolean;
  dirName?: string;
  gamemode?: 'survival' | 'creative' | 'adventure' | 'spectator';
  difficulty?: 'peaceful' | 'easy' | 'normal' | 'hard';
  onlineMode?: boolean;
  pvp?: boolean;
  commandBlocks?: boolean;
  serverAddress?: string;
}

