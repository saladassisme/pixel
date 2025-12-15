import React, { useMemo, useState } from 'react';
import { BeadColor, Language } from '../types';
import { getTexts } from '../locales';

interface StatsPanelProps {
  grid: BeadColor[][];
  lang: Language;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ grid, lang }) => {
  const t = getTexts(lang);
  const [excludeWhite, setExcludeWhite] = useState(true);
  
  const stats = useMemo(() => {
    const counts: Record<string, { color: BeadColor; count: number }> = {};
    let total = 0;

    grid.forEach(row => {
      row.forEach(bead => {
        if (!bead) return; // Safety check

        // Check if we should exclude white
        // We check for "White" in name or specific IDs usually associated with white
        const isWhite = bead.name.toLowerCase().includes('white') || bead.id === 'P02' || bead.id === 'H01';

        if (excludeWhite && isWhite) {
            return;
        }

        if (!counts[bead.id]) {
          counts[bead.id] = { color: bead, count: 0 };
        }
        counts[bead.id].count++;
        total++;
      });
    });

    return { 
        items: Object.values(counts).sort((a, b) => b.count - a.count),
        total
    };
  }, [grid, excludeWhite]);

  if (stats.items.length === 0 && !excludeWhite) return null;

  return (
    <div className="bg-white border-4 border-black shadow-pixel p-6 h-full flex flex-col">
      <h3 className="font-bold text-lg text-black mb-2 flex justify-between items-center border-b-2 border-black pb-2">
        <span>{t.materialsList}</span>
        <span className="text-xs bg-black text-white px-2 py-1 font-mono-pixel">{t.totalBeads}: {stats.total}</span>
      </h3>

      {/* Filter Toggle */}
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-700">
          <input 
            type="checkbox" 
            id="excludeWhite" 
            checked={excludeWhite} 
            onChange={(e) => setExcludeWhite(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          <label htmlFor="excludeWhite" className="cursor-pointer select-none font-bold">
            {t.excludeWhite}
          </label>
      </div>
      
      <div className="overflow-y-auto max-h-[300px] pr-2 space-y-2 custom-scrollbar">
        {stats.items.length === 0 ? (
            <p className="text-slate-400 text-center py-4 text-sm italic">{t.noBeads}</p>
        ) : (
            stats.items.map(({ color, count }) => (
            <div key={color.id} className="flex items-center justify-between text-sm p-2 hover:bg-yellow-50 border-b border-dashed border-slate-300 last:border-0 transition-colors group">
                <div className="flex items-center gap-3">
                <div 
                    className="w-8 h-8 border-2 border-black relative shadow-sm"
                    style={{ backgroundColor: color.hex }}
                >
                    <div className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-white/40"></div>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-black">{color.name}</span>
                    <span className="text-xs text-slate-500 font-mono-pixel">{color.id}</span>
                </div>
                </div>
                <span className="font-mono-pixel text-lg font-bold text-black min-w-[3rem] text-right">
                {count}
                </span>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default StatsPanel;