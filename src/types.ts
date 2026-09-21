export type ThemeId =
  | 'samsung'
  | 'huawei'
  | 'mi'
  | 'oneplus'
  | 'oppo'
  | 'vivo'
  | 'realme'
  | 'sony'
  | 'lenovo'
  | 'jolt';

export type CallState = 'idle' | 'incoming' | 'outgoing' | 'active' | 'ended';

export type AnswerGestureType =
  | 'swipe-horizontal' // Samsung (green right, red left)
  | 'swipe-vertical'   // Xiaomi MI (swipe up to answer, down to decline)
  | 'circular-slider'  // Huawei (center circular drag)
  | 'modern-buttons'   // OnePlus (Never Settle dual circular buttons with drag/tap)
  | 'pill-slider'      // Oppo ColorOS (fluid capsule slider)
  | 'wave-droplet'     // Vivo (OriginOS fluid droplet)
  | 'neon-hud'         // Jolt (cyber neon pulsing rings & wave visualizer)
  | 'xperia-bar'       // Sony (minimalist horizontal track)
  | 'bubble-arc'       // Lenovo (dual rounded bubble arc)
  | 'realme-slider';   // Realme (bold dynamic high-contrast slider)

export interface CallTheme {
  id: ThemeId;
  name: string;
  brand: string;
  subtitle: string;
  tagline: string;
  badgeColor: string;
  accentColor: string;
  gradientBg: string;
  gestureType: AnswerGestureType;
  fontStyle: string;
  defaultRingtone: string;
  edgeGlowColor: string;
  description: string;
  signatureFeature: string;
  statusBarStyle: 'clean' | 'oneui' | 'hyperos' | 'xperia' | 'cyber';
}

export interface CallerProfile {
  name: string;
  number: string;
  label?: string; // Mobile, Work, VIP, Home
  avatarUrl: string;
  location?: string;
}

export interface CallThemeSettings {
  activeThemeId: ThemeId;
  caller: CallerProfile;
  customWallpaperUrl?: string;
  selectedRingtone: string;
  soundEnabled: boolean;
  edgeLightingEnabled: boolean;
  flashOnCallEnabled: boolean;
  vibrateFeedback: boolean;
  simCarrier: string;
}

export interface RecentCallLog {
  id: string;
  caller: CallerProfile;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'missed';
  durationSeconds?: number;
  themeId: ThemeId;
}
