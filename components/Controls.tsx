
import React from 'react';
import { ProcessingOptions, Language } from '../types';
import { MAX_WIDTH, MIN_WIDTH, PALETTES } from '../constants';
import { getTexts } from '../locales';

interface ControlsProps {
  options: ProcessingOptions;
  setOptions: React.Dispatch<React.SetStateAction<ProcessingOptions>>;
  onGenerate: () => void;
  isProcessing: boolean;
  lang: Language;
  hasSourceImage?: boolean; // New prop to check availability
}

const Controls: React.FC<ControlsProps> = ({ options, setOptions, onGenerate, isProcessing, lang, hasSourceImage = true }) => {
  const t = getTexts(lang);

  const handleChange = (key: keyof ProcessingOptions, value: number | string) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handlePreset = (width: number) => {
    if (!hasSourceImage) return;
    setOptions(prev => ({ ...prev, width }));
    setTimeout(onGenerate, 0);
  };

  return (
    <div className="bg-white border-4 border-black shadow-pixel p-6 flex flex-col gap-6 relative overflow-hidden">
      
      {/* Header */}
      <h3 className="font-bold text-xl text-black flex items-center gap-2 border-b-2 border-dashed border-black pb-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        {t.adjustPattern}
      </h3>

      {/* Content */}
      <div className={`flex flex-col gap-6 transition-opacity duration-300 ${!hasSourceImage ? 'opacity-40 pointer-events-none filter blur-[1px]' : ''}`}>
          
          {/* Palette Selector */}
          <div className="space-y-2">
            <label className="block text-base font-bold text-slate-700">{t.paletteLabel || "Bead Brand / Palette"}</label>
            <div className="relative">
                <select 
                    value={options.paletteId}
                    onChange={(e) => handleChange('paletteId', e.target.value)}
                    className="w-full bg-slate-100 border-2 border-black px-3 py-2 font-mono-pixel text-lg focus:outline-none focus:ring-2 focus:ring-brand-gold appearance-none"
                    disabled={!hasSourceImage}
                >
                    {PALETTES.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-black">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
          </div>

          {/* Width Control */}
          <div className="space-y-3">
            <div className="flex justify-between text-base font-bold text-slate-700">
              <label>{t.width}</label>
              <span className="font-mono-pixel text-xl bg-brand-gold/20 px-2 border-2 border-black">{options.width}</span>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => handlePreset(29)} className={`flex-1 py-1 text-xs font-bold border-2 border-black transition-all ${options.width === 29 ? 'bg-black text-white shadow-none' : 'bg-white hover:bg-slate-100'}`}>
                    {t.sizeSmall.split(' ')[0]}
                </button>
                <button onClick={() => handlePreset(58)} className={`flex-1 py-1 text-xs font-bold border-2 border-black transition-all ${options.width === 58 ? 'bg-black text-white shadow-none' : 'bg-white hover:bg-slate-100'}`}>
                    {t.sizeMedium.split(' ')[0]}
                </button>
                <button onClick={() => handlePreset(87)} className={`flex-1 py-1 text-xs font-bold border-2 border-black transition-all ${options.width === 87 ? 'bg-black text-white shadow-none' : 'bg-white hover:bg-slate-100'}`}>
                    {t.sizeLarge.split(' ')[0]}
                </button>
            </div>

            <input
              type="range"
              min={MIN_WIDTH}
              max={MAX_WIDTH}
              value={options.width}
              onChange={(e) => handleChange('width', parseInt(e.target.value))}
              className="w-full h-4 bg-slate-200 border-2 border-black appearance-none cursor-pointer accent-black hover:bg-slate-300 transition-colors"
              disabled={!hasSourceImage}
            />
            <p className="text-xs text-slate-500">{t.widthDesc}</p>
          </div>

          {/* Brightness Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-base font-bold text-slate-700">
              <label>{t.brightness}</label>
              <span className="font-mono-pixel text-xl">{options.brightness > 0 ? `+${options.brightness}` : options.brightness}</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={options.brightness}
              onChange={(e) => handleChange('brightness', parseInt(e.target.value))}
              className="w-full h-4 bg-slate-200 border-2 border-black appearance-none cursor-pointer accent-black hover:bg-slate-300 transition-colors"
              disabled={!hasSourceImage}
            />
          </div>

          {/* Contrast Control */}
          <div className="space-y-2">
            <div className="flex justify-between text-base font-bold text-slate-700">
              <label>{t.contrast}</label>
              <span className="font-mono-pixel text-xl">{options.contrast > 0 ? `+${options.contrast}` : options.contrast}</span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={options.contrast}
              onChange={(e) => handleChange('contrast', parseInt(e.target.value))}
              className="w-full h-4 bg-slate-200 border-2 border-black appearance-none cursor-pointer accent-black hover:bg-slate-300 transition-colors"
              disabled={!hasSourceImage}
            />
          </div>

          <button
            onClick={onGenerate}
            disabled={isProcessing || !hasSourceImage}
            className={`w-full py-3 px-4 font-bold text-lg border-2 border-black shadow-pixel transition-all
              ${isProcessing || !hasSourceImage
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none translate-x-[2px] translate-y-[2px]' 
                : 'bg-brand-gold text-black hover:-translate-y-1 hover:shadow-pixel-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
              }`}
          >
            {isProcessing ? t.processing : t.updatePattern}
          </button>
      </div>

      {/* Lock Overlay for Static Patterns */}
      {!hasSourceImage && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-white border-4 border-black p-4 shadow-pixel-lg transform -rotate-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-zinc-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="font-bold text-sm text-black uppercase tracking-wide">Static Pattern</p>
                  <p className="text-xs text-zinc-500 mt-1">Source image unavailable for adjustments.</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default Controls;
