import { BeadColor, ProcessingOptions } from '../types';
import { PALETTES } from '../constants';

// Calculate Euclidean distance
const getColorDistance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
  const rmean = (c1.r + c2.r) / 2;
  const r = c1.r - c2.r;
  const g = c1.g - c2.g;
  const b = c1.b - c2.b;
  return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
};

const findClosestColor = (r: number, g: number, b: number, paletteColors: BeadColor[]): BeadColor => {
  if (!paletteColors || paletteColors.length === 0) {
      // Emergency fallback if palette is empty
      return { id: 'ERR', name: 'Error', hex: '#FF0000', r: 255, g: 0, b: 0 };
  }
  let minDist = Infinity;
  let closest = paletteColors[0];

  for (const color of paletteColors) {
    const dist = getColorDistance({ r, g, b }, color);
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }
  return closest;
};

export const processImageToGrid = (
  imageSrc: string,
  options: ProcessingOptions
): Promise<BeadColor[][]> => {
  return new Promise((resolve, reject) => {
    // Determine which palette to use
    const selectedPalette = PALETTES.find(p => p.id === options.paletteId) || PALETTES[0];
    const paletteColors = selectedPalette.colors;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      // 1. Setup Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      // Calculate aspect ratio
      const aspectRatio = img.height / img.width;
      const gridWidth = options.width;
      const gridHeight = Math.round(gridWidth * aspectRatio);

      canvas.width = gridWidth;
      canvas.height = gridHeight;

      // 2. Draw resized image
      ctx.imageSmoothingEnabled = false; 
      
      const brightness = 100 + options.brightness;
      const contrast = 100 + options.contrast;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      ctx.drawImage(img, 0, 0, gridWidth, gridHeight);

      // 3. Get pixel data
      const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
      const data = imageData.data;
      const grid: BeadColor[][] = [];

      // Fallback for white/transparent
      const whiteColor = paletteColors.find(c => c.name.toLowerCase().includes('white')) || paletteColors[0] || { id: 'P02', name: 'White', hex: '#FFFFFF', r: 255, g: 255, b: 255 };

      for (let y = 0; y < gridHeight; y++) {
        const row: BeadColor[] = [];
        for (let x = 0; x < gridWidth; x++) {
          const i = (y * gridWidth + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          
          if (a < 128) {
             row.push(whiteColor);
          } else {
             row.push(findClosestColor(r, g, b, paletteColors));
          }
        }
        grid.push(row);
      }

      resolve(grid);
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
};