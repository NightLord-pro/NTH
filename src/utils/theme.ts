import { PanelSettings } from '../types';

export interface ThemeStyles {
  textPrimary: string;
  textHover: string;
  textMuted: string;
  textGradient: string;
  bgActive: string;
  bgHover: string;
  bgSolid: string;
  bgSolidHover: string;
  bgBadge: string;
  borderActive: string;
  borderFocus: string;
  borderGlow: string;
  glowShadow: string;
  badgeText: string;
  accentHex: string;
}

export function getThemeStyles(color: PanelSettings['themeColor'] = 'emerald'): ThemeStyles {
  switch (color) {
    case 'cyan':
      return {
        textPrimary: 'text-cyan-400',
        textHover: 'hover:text-cyan-300',
        textMuted: 'text-cyan-500',
        textGradient: 'from-cyan-400 via-teal-200 to-blue-300',
        bgActive: 'bg-cyan-500/15',
        bgHover: 'hover:bg-cyan-500/20',
        bgSolid: 'bg-cyan-600',
        bgSolidHover: 'hover:bg-cyan-500',
        bgBadge: 'bg-cyan-950/60',
        borderActive: 'border-cyan-500/40',
        borderFocus: 'focus:border-cyan-500',
        borderGlow: 'ring-cyan-500/20',
        glowShadow: 'shadow-cyan-500/20',
        badgeText: 'text-cyan-300',
        accentHex: '#06b6d4',
      };
    case 'violet':
      return {
        textPrimary: 'text-violet-400',
        textHover: 'hover:text-violet-300',
        textMuted: 'text-violet-500',
        textGradient: 'from-violet-400 via-purple-200 to-indigo-300',
        bgActive: 'bg-violet-500/15',
        bgHover: 'hover:bg-violet-500/20',
        bgSolid: 'bg-violet-600',
        bgSolidHover: 'hover:bg-violet-500',
        bgBadge: 'bg-violet-950/60',
        borderActive: 'border-violet-500/40',
        borderFocus: 'focus:border-violet-500',
        borderGlow: 'ring-violet-500/20',
        glowShadow: 'shadow-violet-500/20',
        badgeText: 'text-violet-300',
        accentHex: '#8b5cf6',
      };
    case 'amber':
      return {
        textPrimary: 'text-amber-400',
        textHover: 'hover:text-amber-300',
        textMuted: 'text-amber-500',
        textGradient: 'from-amber-400 via-yellow-200 to-orange-300',
        bgActive: 'bg-amber-500/15',
        bgHover: 'hover:bg-amber-500/20',
        bgSolid: 'bg-amber-600',
        bgSolidHover: 'hover:bg-amber-500',
        bgBadge: 'bg-amber-950/60',
        borderActive: 'border-amber-500/40',
        borderFocus: 'focus:border-amber-500',
        borderGlow: 'ring-amber-500/20',
        glowShadow: 'shadow-amber-500/20',
        badgeText: 'text-amber-300',
        accentHex: '#f59e0b',
      };
    case 'rose':
      return {
        textPrimary: 'text-rose-400',
        textHover: 'hover:text-rose-300',
        textMuted: 'text-rose-500',
        textGradient: 'from-rose-400 via-pink-200 to-red-300',
        bgActive: 'bg-rose-500/15',
        bgHover: 'hover:bg-rose-500/20',
        bgSolid: 'bg-rose-600',
        bgSolidHover: 'hover:bg-rose-500',
        bgBadge: 'bg-rose-950/60',
        borderActive: 'border-rose-500/40',
        borderFocus: 'focus:border-rose-500',
        borderGlow: 'ring-rose-500/20',
        glowShadow: 'shadow-rose-500/20',
        badgeText: 'text-rose-300',
        accentHex: '#f43f5e',
      };
    case 'indigo':
      return {
        textPrimary: 'text-indigo-400',
        textHover: 'hover:text-indigo-300',
        textMuted: 'text-indigo-500',
        textGradient: 'from-indigo-400 via-blue-200 to-purple-300',
        bgActive: 'bg-indigo-500/15',
        bgHover: 'hover:bg-indigo-500/20',
        bgSolid: 'bg-indigo-600',
        bgSolidHover: 'hover:bg-indigo-500',
        bgBadge: 'bg-indigo-950/60',
        borderActive: 'border-indigo-500/40',
        borderFocus: 'focus:border-indigo-500',
        borderGlow: 'ring-indigo-500/20',
        glowShadow: 'shadow-indigo-500/20',
        badgeText: 'text-indigo-300',
        accentHex: '#6366f1',
      };
    case 'emerald':
    default:
      return {
        textPrimary: 'text-emerald-400',
        textHover: 'hover:text-emerald-300',
        textMuted: 'text-emerald-500',
        textGradient: 'from-emerald-400 via-teal-200 to-indigo-300',
        bgActive: 'bg-emerald-500/15',
        bgHover: 'hover:bg-emerald-500/20',
        bgSolid: 'bg-emerald-600',
        bgSolidHover: 'hover:bg-emerald-500',
        bgBadge: 'bg-emerald-950/60',
        borderActive: 'border-emerald-500/40',
        borderFocus: 'focus:border-emerald-500',
        borderGlow: 'ring-emerald-500/20',
        glowShadow: 'shadow-emerald-500/20',
        badgeText: 'text-emerald-300',
        accentHex: '#10b981',
      };
  }
}

export function getCardBgClass(hudTransparent: boolean = true): string {
  return hudTransparent
    ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800/60 shadow-2xl'
    : 'bg-slate-900 border-slate-800 shadow-2xl';
}

export function getSidebarBgClass(hudTransparent: boolean = true): string {
  return hudTransparent
    ? 'bg-slate-900/80 backdrop-blur-2xl border-slate-800/70 shadow-2xl'
    : 'bg-slate-950 border-slate-800 shadow-2xl';
}
