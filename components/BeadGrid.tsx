import React, { useRef, useEffect, useState } from 'react';
import { BeadColor, ViewMode, HoverInfo } from '../types';

interface BeadGridProps {
  grid: BeadColor[][];
  viewMode: ViewMode;
  zoomLevel?: number;
  onHover?: (info: HoverInfo | null) => void;
  showRulers?: boolean; // Toggle rulers/grid lines
  interactive?: boolean; // Toggle hover effects
  forceFit?: boolean; // Force grid to fit container
}

const BeadGrid: React.FC<BeadGridProps> = ({ 
    grid, 
    viewMode, 
    zoomLevel = 1, 
    onHover, 
    showRulers = true,
    interactive = true,
    forceFit = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);

  // Constants
  const BASE_BEAD_SIZE = 16;
  const BEAD_SIZE = BASE_BEAD_SIZE * zoomLevel;
  const GAP = 0.5 * zoomLevel; // Tighter gap for better look
  const HOLE_SIZE = (BEAD_SIZE / 3);
  const RULER_SIZE = 30;
  const BOARD_SIZE = 29; 

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current || !grid.length) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const offset = showRulers ? RULER_SIZE : 0;

    if (x < offset || y < offset) {
        setHoverPos(null);
        if (onHover) onHover(null);
        return;
    }

    const gridX = Math.floor((x - offset) / (BEAD_SIZE + GAP));
    const gridY = Math.floor((y - offset) / (BEAD_SIZE + GAP));

    if (gridY >= 0 && gridY < grid.length && gridX >= 0 && gridX < grid[0].length) {
        const bead = grid[gridY][gridX];
        if (bead) {
            setHoverPos({ x: gridX, y: gridY });
            if (onHover) onHover({ x: gridX + 1, y: gridY + 1, color: bead });
        } else {
            setHoverPos(null);
            if (onHover) onHover(null);
        }
    } else {
        setHoverPos(null);
        if (onHover) onHover(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
    if (onHover) onHover(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use safe width calculation
    const height = grid.length;
    const width = grid[0]?.length || 0;
    const pixelRatio = window.devicePixelRatio || 1;
    
    const offset = showRulers ? RULER_SIZE : 0;

    const displayWidth = width * (BEAD_SIZE + GAP) + offset;
    const displayHeight = height * (BEAD_SIZE + GAP) + offset;

    // Internal resolution (high quality)
    canvas.width = displayWidth * pixelRatio;
    canvas.height = displayHeight * pixelRatio;

    // Apply layout styles
    if (forceFit) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'contain';
    } else {
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        canvas.style.objectFit = 'unset';
    }

    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // -- 1. Background --
    if (showRulers) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, displayWidth, offset);
        ctx.fillRect(0, 0, offset, displayHeight);
    }

    // -- 2. Draw Beads --
    grid.forEach((row, y) => {
      row.forEach((bead, x) => {
        if (!bead) return; // Skip invalid beads

        const posX = offset + x * (BEAD_SIZE + GAP);
        const posY = offset + y * (BEAD_SIZE + GAP);

        if (viewMode === ViewMode.GRID || viewMode === ViewMode.PRINT) {
            const centerX = posX + BEAD_SIZE / 2;
            const centerY = posY + BEAD_SIZE / 2;
            const radius = BEAD_SIZE / 2;

            // Base Color
            ctx.fillStyle = bead.hex;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fill();

            // Realistic Plastic Bevel Effect
            if (BEAD_SIZE > 5) {
                // Bottom-Right Shadow (Outer bevel)
                const grad = ctx.createLinearGradient(posX, posY, posX + BEAD_SIZE, posY + BEAD_SIZE);
                grad.addColorStop(0, 'rgba(255,255,255,0.4)');
                grad.addColorStop(0.5, 'rgba(0,0,0,0)');
                grad.addColorStop(1, 'rgba(0,0,0,0.2)');
                
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();

                // Inner Hole Shadow/Highlight
                ctx.fillStyle = 'rgba(0,0,0,0.2)'; // Shadow inside hole
                ctx.beginPath();
                ctx.arc(centerX, centerY, HOLE_SIZE / 2 + 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Hole (White/Background)
            ctx.fillStyle = '#f8fafc'; // Slightly off-white to look like board peg or background
            ctx.beginPath();
            ctx.arc(centerX, centerY, HOLE_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
            
        } else {
            // Pixel Preview
            ctx.fillStyle = bead.hex;
            ctx.fillRect(posX, posY, BEAD_SIZE, BEAD_SIZE);
        }
      });
    });

    // -- 3. Draw Grid Lines & Rulers --
    if (showRulers) {
        ctx.font = '10px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#64748b';

        // Vertical Lines
        for (let x = 0; x <= width; x++) {
            const xPos = offset + x * (BEAD_SIZE + GAP) - GAP/2;
            
            if (x > 0 && x <= width && x % 5 === 0) {
                 const labelX = offset + (x - 1) * (BEAD_SIZE + GAP) + BEAD_SIZE/2;
                 ctx.fillText(`${x}`, labelX, offset/2);
            }

            if (x > 0 && x < width) {
                const isBoardEdge = x % BOARD_SIZE === 0;
                const isTen = x % 10 === 0;
                const isCenter = Math.abs(x - width/2) < 0.1;

                ctx.beginPath();
                ctx.moveTo(xPos, offset);
                ctx.lineTo(xPos, displayHeight);

                if (isCenter) {
                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
                    ctx.lineWidth = 2;
                } else if (isBoardEdge) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1.5;
                } else if (isTen) {
                    ctx.strokeStyle = '#94a3b8';
                    ctx.lineWidth = 1;
                } else {
                    ctx.strokeStyle = '#e2e8f0';
                    ctx.lineWidth = 0.5;
                }
                ctx.stroke();
            }
        }

        // Horizontal Lines
        for (let y = 0; y <= height; y++) {
            const yPos = offset + y * (BEAD_SIZE + GAP) - GAP/2;

            if (y > 0 && y <= height && y % 5 === 0) {
                const labelY = offset + (y - 1) * (BEAD_SIZE + GAP) + BEAD_SIZE/2;
                ctx.fillText(`${y}`, offset/2, labelY);
            }

            if (y > 0 && y < height) {
                const isBoardEdge = y % BOARD_SIZE === 0;
                const isTen = y % 10 === 0;
                const isCenter = Math.abs(y - height/2) < 0.1;

                ctx.beginPath();
                ctx.moveTo(offset, yPos);
                ctx.lineTo(displayWidth, yPos);

                if (isCenter) {
                    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
                    ctx.lineWidth = 2;
                } else if (isBoardEdge) {
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1.5;
                } else if (isTen) {
                    ctx.strokeStyle = '#94a3b8';
                    ctx.lineWidth = 1;
                } else {
                    ctx.strokeStyle = '#e2e8f0';
                    ctx.lineWidth = 0.5;
                }
                ctx.stroke();
            }
        }

        // Frame
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(offset, offset, width * (BEAD_SIZE + GAP), height * (BEAD_SIZE + GAP));
    }

    // -- 4. Draw Hover Highlight --
    if (hoverPos && showRulers && interactive) {
        const bead = grid[hoverPos.y]?.[hoverPos.x];
        if (bead) {
            const hX = offset + hoverPos.x * (BEAD_SIZE + GAP);
            const hY = offset + hoverPos.y * (BEAD_SIZE + GAP);
            
            ctx.strokeStyle = '#FFFF00'; 
            ctx.lineWidth = 2;
            ctx.strokeRect(hX - 1, hY - 1, BEAD_SIZE + 2, BEAD_SIZE + 2);
        }
    }

  }, [grid, viewMode, BEAD_SIZE, HOLE_SIZE, RULER_SIZE, zoomLevel, hoverPos, showRulers, interactive, forceFit]);

  if (!grid || grid.length === 0) return null;

  return (
    <div 
        ref={containerRef} 
        className={`w-full h-full flex justify-center items-center ${interactive && !forceFit ? 'overflow-auto' : 'overflow-hidden'}`}
    >
      <canvas 
        ref={canvasRef} 
        className={`bg-white transition-shadow ${interactive ? 'cursor-crosshair shadow-lg' : 'cursor-default drop-shadow-xl'}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};

export default BeadGrid;