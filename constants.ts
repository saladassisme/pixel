import { BeadColor, BeadPalette } from './types';

// Helper to convert Hex to BeadColor object
const c = (id: string, name: string, hex: string, brand: string): BeadColor => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { id, name, hex, r, g, b, brand };
};

// --- PALETTES ---

const PALETTE_PERLER: BeadColor[] = [
  c('P01', 'Black', '#1B1B1B', 'Perler'),
  c('P02', 'White', '#FFFFFF', 'Perler'),
  c('P03', 'Cream', '#EFECCA', 'Perler'),
  c('P04', 'Yellow', '#FFD700', 'Perler'),
  c('P05', 'Orange', '#FF8C00', 'Perler'),
  c('P06', 'Red', '#DC143C', 'Perler'),
  c('P07', 'Purple', '#800080', 'Perler'),
  c('P08', 'Dark Blue', '#00008B', 'Perler'),
  c('P09', 'Light Blue', '#ADD8E6', 'Perler'),
  c('P10', 'Green', '#008000', 'Perler'),
  c('P11', 'Light Green', '#90EE90', 'Perler'),
  c('P12', 'Brown', '#8B4513', 'Perler'),
  c('P17', 'Grey', '#808080', 'Perler'),
  c('P19', 'Clear', '#E0E0E0', 'Perler'),
  c('P20', 'Rust', '#A0522D', 'Perler'),
  c('P21', 'Light Brown', '#D2B48C', 'Perler'),
  c('P33', 'Peach', '#FFDAB9', 'Perler'),
  c('P49', 'Plum', '#DDA0DD', 'Perler'),
  c('P61', 'Kiwi Lime', '#9ACD32', 'Perler'),
  c('P80', 'Toothpaste', '#98FF98', 'Perler'),
  c('P88', 'Raspberry', '#E30B5C', 'Perler'),
  c('P91', 'Butterscotch', '#FDB147', 'Perler'),
  // Add more as needed
];

const PALETTE_HAMA: BeadColor[] = [
  c('H01', 'White', '#FFFFFF', 'Hama'),
  c('H02', 'Cream', '#F5F5DC', 'Hama'),
  c('H03', 'Yellow', '#FFFF00', 'Hama'),
  c('H04', 'Orange', '#FFA500', 'Hama'),
  c('H05', 'Red', '#FF0000', 'Hama'),
  c('H06', 'Pink', '#FFC0CB', 'Hama'),
  c('H07', 'Purple', '#800080', 'Hama'),
  c('H08', 'Blue', '#0000FF', 'Hama'),
  c('H09', 'Light Blue', '#ADD8E6', 'Hama'),
  c('H10', 'Green', '#008000', 'Hama'),
  c('H11', 'Light Green', '#90EE90', 'Hama'),
  c('H12', 'Brown', '#A52A2A', 'Hama'),
  c('H18', 'Black', '#000000', 'Hama'),
  c('H20', 'Reddish Brown', '#8B4513', 'Hama'),
  c('H21', 'Light Brown', '#D2B48C', 'Hama'),
  c('H22', 'Dark Red', '#8B0000', 'Hama'),
  c('H26', 'Flesh', '#FFDAB9', 'Hama'),
  c('H27', 'Beige', '#F5F5DC', 'Hama'),
  c('H28', 'Army Green', '#4B5320', 'Hama'),
  c('H29', 'Claret', '#7F1734', 'Hama'),
  c('H30', 'Burgundy', '#800020', 'Hama'),
  c('H31', 'Turquoise', '#40E0D0', 'Hama'),
];

// Combine a large set for "Generic/All"
const PALETTE_GENERIC: BeadColor[] = [
    ...PALETTE_PERLER.map(c => ({...c, id: `P-${c.id}`, name: `Perler ${c.name}`})),
    ...PALETTE_HAMA.map(c => ({...c, id: `H-${c.id}`, name: `Hama ${c.name}`}))
];

export const PALETTES: BeadPalette[] = [
  { id: 'perler', name: 'Perler Beads (US Standard)', colors: PALETTE_PERLER },
  { id: 'hama', name: 'Hama Beads (EU Standard)', colors: PALETTE_HAMA },
  { id: 'generic', name: 'All Brands (Max Colors)', colors: PALETTE_GENERIC },
];

export const MAX_WIDTH = 120; // Increased max width
export const MIN_WIDTH = 10;
export const DEFAULT_WIDTH = 29;
export const PEGBOARD_SIZE = 29;