export type TimeOfDay =
  | 'pre-dawn'
  | 'dawn'
  | 'golden-morning'
  | 'day'
  | 'golden-evening'
  | 'dusk'
  | 'night'
  | 'deep-night';

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 0 && hour < 4) return 'deep-night';
  if (hour >= 4 && hour < 6) return 'pre-dawn';
  if (hour >= 6 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 9) return 'golden-morning';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'golden-evening';
  if (hour >= 19 && hour < 21) return 'dusk';
  return 'night';
}

export interface SkyTheme {
  background: string;
  accent: string;
  overlayGradient: string;
  starOpacity: number;
  label: string;
}

export const SKY_THEMES: Record<TimeOfDay, SkyTheme> = {
  'deep-night': {
    background: '#020408',
    accent: '#7c9cbf',
    overlayGradient: 'radial-gradient(ellipse at top, #0a1628 0%, #020408 60%)',
    starOpacity: 1,
    label: 'Deep Night'
  },
  'pre-dawn': {
    background: '#050510',
    accent: '#9b8fd4',
    overlayGradient: 'radial-gradient(ellipse at top, #12103a 0%, #050510 60%)',
    starOpacity: 0.8,
    label: 'Pre-Dawn'
  },
  dawn: {
    background: '#0d0810',
    accent: '#e8a87c',
    overlayGradient: 'radial-gradient(ellipse at bottom, #3d1a0f 0%, #0d0810 50%)',
    starOpacity: 0.3,
    label: 'Dawn'
  },
  'golden-morning': {
    background: '#080605',
    accent: '#f0c060',
    overlayGradient: 'radial-gradient(ellipse at bottom left, #2a1a05 0%, #080605 60%)',
    starOpacity: 0,
    label: 'Golden Hour'
  },
  day: {
    background: '#050505',
    accent: '#d4af37',
    overlayGradient: 'none',
    starOpacity: 0,
    label: 'Day'
  },
  'golden-evening': {
    background: '#080504',
    accent: '#e8934a',
    overlayGradient: 'radial-gradient(ellipse at bottom right, #2a1005 0%, #080504 60%)',
    starOpacity: 0,
    label: 'Golden Hour'
  },
  dusk: {
    background: '#060508',
    accent: '#b07cc6',
    overlayGradient: 'radial-gradient(ellipse at top right, #1a0a2a 0%, #060508 60%)',
    starOpacity: 0.2,
    label: 'Dusk'
  },
  night: {
    background: '#030408',
    accent: '#6a9fd4',
    overlayGradient: 'radial-gradient(ellipse at top, #080f20 0%, #030408 60%)',
    starOpacity: 0.7,
    label: 'Night'
  }
};

export function getCurrentSkyTheme(): SkyTheme {
  const hour = new Date().getHours();
  return SKY_THEMES[getTimeOfDay(hour)];
}
