export type LayerType = 'image' | 'text' | 'decoration';

export type StickerFinish = 'none' | 'gloss' | 'holographic' | 'matte' | 'glitter' | 'retro-dots';

export interface BorderSettings {
  enabled: boolean;
  width: number; // 0 to 60
  color: string;
  smoothing: number; // 0 to 20
  secondaryEnabled: boolean;
  secondaryWidth: number;
  secondaryColor: string;
  dashed: boolean;
  glow: boolean;
  glowColor: string;
  glowBlur: number;
}

export interface ShadowSettings {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
  opacity: number;
}

export interface FilterSettings {
  brightness: number; // 50 to 150 (default 100)
  contrast: number; // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  vibrance: number; // -50 to 50 (default 0)
  hueRotate: number; // 0 to 360 (default 0)
  sepia: number; // 0 to 100 (default 0)
}

export interface CanvasLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  
  // Image layer specific
  imageSrc?: string;
  originalImageSrc?: string;
  cutoutImageSrc?: string;
  isCutoutActive?: boolean;
  
  // Text layer specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  textBorderColor?: string;
  textBorderWidth?: number;
  textBackground?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string;
  curve?: number; // -100 to 100 (arch)
  
  // Decoration specific
  decorationSvg?: string;
  decorationColor?: string;
  emoji?: string;
}

export interface StickerState {
  layers: CanvasLayer[];
  selectedLayerId: string | null;
  border: BorderSettings;
  shadow: ShadowSettings;
  finish: StickerFinish;
  finishIntensity: number; // 0 to 100
  filters: FilterSettings;
  canvasBackground: 'transparent' | 'checker' | 'white' | 'dark' | 'gradient';
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export interface SampleImage {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  category: string;
}

export interface DecorationItem {
  id: string;
  name: string;
  category: 'sparkles' | 'faces' | 'badges' | 'bubbles' | 'cute' | 'retro';
  svg?: string;
  emoji?: string;
  preview: string;
}
