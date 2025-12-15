
import { BeadColor, SavedProject } from '../types';
import { PALETTES } from '../constants';

const PERLER_PALETTE = PALETTES.find(p => p.id === 'perler')?.colors || [];

const SAFE_WHITE: BeadColor = PERLER_PALETTE.find(c => c.name === 'White') || {
  id: 'P02', name: 'White', hex: '#FFFFFF', r: 255, g: 255, b: 255, brand: 'Perler'
};

const getColor = (code: string): BeadColor => {
    const map: Record<string, string> = {
        'k': 'Black', 'w': 'White', 'r': 'Red', 'g': 'Green', 'b': 'Dark Blue', 
        'y': 'Yellow', 'o': 'Orange', 'p': 'Pink', 'l': 'Light Blue', 
        'n': 'Brown', 's': 'Grey', 't': 'Tan', 'm': 'Magenta', 'c': 'Cream',
        'v': 'Purple', 'd': 'Dark Grey', 'f': 'Flesh', 'a': 'Pastel Green',
        '-': 'Clear' 
    };
    
    const name = map[code.toLowerCase()] || 'White';
    if (name === 'Clear') return SAFE_WHITE;
    const found = PERLER_PALETTE.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
    return found || SAFE_WHITE;
};

const decodeRow = (rleString: string): BeadColor[] => {
    const regex = /([a-zA-Z-])(\d*)/g;
    let match;
    const row: BeadColor[] = [];
    while ((match = regex.exec(rleString)) !== null) {
        if (match.index === regex.lastIndex) regex.lastIndex++;
        const char = match[1];
        const count = match[2] ? parseInt(match[2]) : 1;
        const color = getColor(char);
        for (let i = 0; i < count; i++) {
            row.push(color);
        }
    }
    return row;
};

const createGrid = (rows: string[]): BeadColor[][] => {
    return rows.map(decodeRow);
};

// --- DATA ---

const CORGI_GRID = createGrid([
    "w10 k3 w16", "w9 k1 o2 k1 w16", "w8 k1 o4 k1 w15", "w8 k1 o4 k1 w7 k3 w5",
    "w4 k3 w1 k1 w1 k2 w1 k1 w6 k1 o2 k1 w4", "w3 k1 o2 k1 w1 k1 w2 k1 w1 k1 w5 k1 o3 k1 w4",
    "w3 k1 o3 k14 o4 k1 w3", "w3 k1 o4 k1 w1 k2 w7 k1 o4 k1 w3",
    "w2 k1 o5 k1 w1 k1 w1 k1 w1 k1 w1 k1 w1 k1 o4 k1 w3", "w2 k1 o14 k1 o3 k1 w4",
    "w2 k1 o5 k2 o11 k1 w3", "w2 k1 o5 k2 o11 k1 w3", "w3 k1 o18 k1 w3",
    "w3 k1 w2 o16 k1 w3", "w3 k1 w2 o15 k1 w4", "w3 k1 w2 o14 k1 w5",
    "w4 k1 w1 o13 k1 w6", "w4 k1 w1 o13 k1 w6", "w5 k1 o12 k1 w7",
    "w5 k1 o3 w6 o3 k1 w7", "w5 k1 o3 w1 k2 w2 k1 w1 o2 k1 w7", "w6 k3 w1 k2 w2 k3 w8"
]);

const SUNSET_GRID = createGrid([
    "b29", "b29", "b29", "b29", "b10 v9 b10", "b8 v13 b8", "b6 v17 b6", "b5 v19 b5",
    "b4 v21 b4", "b3 v23 b3", "b2 v25 b2", "b2 v25 b2", "b1 v27 b1", "b1 v27 b1",
    "k29", "k1 b2 k2 b2 k2 v2 k2 v2 k2 v2 k2 b2 k2 b2 k1",
    "k1 b3 k1 b3 k1 v3 k1 v3 k1 v3 k1 b3 k1 b3 k1", "k29", "k29", "b29"
]);

const POTION_GRID = createGrid([
    "w12 k5 w12", "w12 k1 w3 k1 w12", "w12 k1 w3 k1 w12", "w11 k1 w5 k1 w11",
    "w10 k1 w7 k1 w10", "w9 k1 w2 l1 w2 l1 w1 k1 w9", "w8 k1 w2 l7 w2 k1 w8",
    "w8 k1 w1 l9 w1 k1 w8", "w8 k1 l11 k1 w8", "w8 k1 l2 w2 l7 k1 w8",
    "w8 k1 l11 k1 w8", "w9 k1 l9 k1 w9", "w10 k1 l7 k1 w10", "w11 k7 w11"
]);

const MUSHROOM_GRID = createGrid([
    "w7 k10 w7", "w5 k2 g8 k2 w7", "w3 k2 g12 k2 w5", "w2 k1 g4 w3 g7 k1 w6",
    "w1 k1 g3 w5 g6 k1 w7", "w1 k1 g3 w5 g6 k1 w7", "k1 g3 w5 g6 k1 w8",
    "k1 g14 k1 w8", "k1 g14 k1 w8", "w1 k1 g12 k1 w9", "w1 k1 f12 k1 w9",
    "w1 k1 f2 k2 f4 k2 f2 k1 w9", "w2 k1 f2 k2 f4 k2 f2 k1 w8", "w2 k1 f10 k1 w9", "w3 k10 w11"
]);

export const FEATURED_PROJECTS: SavedProject[] = [
    {
        id: 'feat_corgi',
        title: 'Pixel Corgi',
        timestamp: Date.now() - 100000,
        imageSrc: '', 
        grid: CORGI_GRID,
        options: { width: 29, brightness: 0, contrast: 0, paletteId: 'perler' },
        author: 'PixelPaws',
        likes: 2450,
        category: 'animal', // mapped to beginner or others in UI logic if not strict
        userShares: [
            {
                id: 'share1',
                userName: 'DogLover99',
                imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
                comment: 'So cute! Made it for my fridge.',
                timestamp: Date.now() - 50000
            }
        ]
    },
    {
        id: 'feat_sunset',
        title: 'Synthwave',
        timestamp: Date.now() - 200000,
        imageSrc: '',
        grid: SUNSET_GRID,
        options: { width: 29, brightness: 0, contrast: 0, paletteId: 'perler' },
        author: 'NeonDreams',
        likes: 1890,
        category: 'scenery'
    },
    {
        id: 'feat_potion',
        title: 'Mana Potion',
        timestamp: Date.now() - 300000,
        imageSrc: '',
        grid: POTION_GRID,
        options: { width: 29, brightness: 0, contrast: 0, paletteId: 'perler' },
        author: 'Alchemist_X',
        likes: 920,
        category: 'game',
        userShares: []
    },
    {
        id: 'feat_1up',
        title: '1-Up Mushroom',
        timestamp: Date.now() - 400000,
        imageSrc: '',
        grid: MUSHROOM_GRID,
        options: { width: 24, brightness: 0, contrast: 0, paletteId: 'perler' },
        author: 'RetroGamer',
        likes: 3340,
        category: 'beginner'
    }
] as SavedProject[];
