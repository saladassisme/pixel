
export interface BeadColor {
  id: string;
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
  brand?: string;
}

export interface GridCell {
  x: number;
  y: number;
  color: BeadColor;
}

export interface ProcessingOptions {
  width: number;
  brightness: number;
  contrast: number;
  paletteId: string;
}

export enum ViewMode {
  GRID = 'GRID',
  PREVIEW = 'PREVIEW',
  PRINT = 'PRINT'
}

export type Language = 'zh' | 'en';

export type ProjectSize = 'small' | 'medium' | 'large';

// New: Project Categories
export type ProjectCategory = 'anime' | 'game' | 'beginner' | 'scenery' | 'others';

export interface UserShare {
  id: string;
  userName: string;
  imageUrl: string; // URL of the finished product photo
  comment: string;
  timestamp: number;
}

export interface HoverInfo {
  x: number;
  y: number;
  color: BeadColor;
}

export interface SavedProject {
  id: string;
  originalId?: string;
  title: string;
  timestamp: number;
  imageSrc: string;
  grid: BeadColor[][];
  options: ProcessingOptions;
  author?: string;
  likes?: number;
  isPublished?: boolean;
  category?: ProjectCategory; // New category field
  userShares?: UserShare[]; // New: photos shared by users under this pattern
}

export interface BeadPalette {
  id: string;
  name: string;
  colors: BeadColor[];
}

export interface MaterialItem {
  color: BeadColor;
  count: number;
}
