export const THEMES = {
  default: {
    id: 'default',
    name: 'Midnight Dark',
    description: 'Classic Lctron dark theme',
    colors: {
      bg: '#090910',
      bgCard: 'rgba(255,255,255,0.028)',
      border: 'rgba(255,255,255,0.07)',
      accent: '#e03030',
      accentGlow: 'rgba(224,48,48,0.22)',
      secondary: '#a78bfa',
      text: '#ffffff',
      textMuted: 'rgba(255,255,255,0.42)',
    },
    wallpaper: 'none',
  },
  
  deepPurple: {
    id: 'deepPurple',
    name: 'Deep Purple',
    description: 'Rich purple gradients',
    colors: {
      bg: '#0a0812',
      bgCard: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
      accent: '#8b5cf6',
      accentGlow: 'rgba(139,92,246,0.3)',
      secondary: '#c4b5fd',
      text: '#ffffff',
      textMuted: 'rgba(196,181,253,0.6)',
    },
    wallpaper: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(124,58,237,0.1) 0%, transparent 40%)',
  },
  
  neonCyan: {
    id: 'neonCyan',
    name: 'Neon Cyan',
    description: 'Cyberpunk cyan aesthetics',
    colors: {
      bg: '#081418',
      bgCard: 'rgba(6,182,212,0.08)',
      border: 'rgba(6,182,212,0.2)',
      accent: '#06b6d4',
      accentGlow: 'rgba(6,182,212,0.3)',
      secondary: '#67e8f9',
      text: '#ecfeff',
      textMuted: 'rgba(103,232,249,0.6)',
    },
    wallpaper: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(8,145,178,0.1) 0%, transparent 40%)',
  },
  
  orangeSunset: {
    id: 'orangeSunset',
    name: 'Orange Sunset',
    description: 'Warm orange and amber tones',
    colors: {
      bg: '#140a08',
      bgCard: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.2)',
      accent: '#f97316',
      accentGlow: 'rgba(249,115,22,0.3)',
      secondary: '#fdba74',
      text: '#ffedd5',
      textMuted: 'rgba(253,186,116,0.6)',
    },
    wallpaper: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(234,88,12,0.1) 0%, transparent 40%)',
  },
  
  emeraldForest: {
    id: 'emeraldForest',
    name: 'Emerald Forest',
    description: 'Green gaming aesthetic',
    colors: {
      bg: '#08140c',
      bgCard: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
      accent: '#10b981',
      accentGlow: 'rgba(16,185,129,0.3)',
      secondary: '#6ee7b7',
      text: '#ecfdf5',
      textMuted: 'rgba(110,231,183,0.6)',
    },
    wallpaper: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(5,150,105,0.1) 0%, transparent 40%)',
  },
  
  roseGold: {
    id: 'roseGold',
    name: 'Rose Gold',
    description: 'Premium pink gold aesthetic',
    colors: {
      bg: '#140a0c',
      bgCard: 'rgba(244,63,94,0.08)',
      border: 'rgba(244,63,94,0.2)',
      accent: '#f43f5e',
      accentGlow: 'rgba(244,63,94,0.3)',
      secondary: '#fda4af',
      text: '#fff1f2',
      textMuted: 'rgba(253,164,175,0.6)',
    },
    wallpaper: 'radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.1) 0%, transparent 50%), radial-gradient(ellipse at 100% 0%, rgba(225,29,72,0.08) 0%, transparent 40%)',
  },
};

export function getTheme(themeId) {
  return THEMES[themeId] || THEMES.default;
}

export function getThemeCSS(theme) {
  return `
    :root {
      --theme-bg: ${theme.colors.bg};
      --theme-bg-card: ${theme.colors.bgCard};
      --theme-border: ${theme.colors.border};
      --theme-accent: ${theme.colors.accent};
      --theme-accent-glow: ${theme.colors.accentGlow};
      --theme-secondary: ${theme.colors.secondary};
      --theme-text: ${theme.colors.text};
      --theme-text-muted: ${theme.colors.textMuted};
      --theme-wallpaper: ${theme.wallpaper};
    }
  `;
}
