import React, { useState } from 'react';
import { generatePixelArtVariations } from '../services/geminiService';
import { Language, ProjectSize } from '../types';
import { getTexts } from '../locales';

interface AIGeneratorProps {
  onImageGenerated: (imgSrc: string) => void;
  lang: Language;
  selectedSize: ProjectSize;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({ onImageGenerated, lang, selectedSize }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const t = getTexts(lang);

  const styles = [
    { label: t.style8bit, value: '8-bit retro NES style, limited palette' },
    { label: t.style16bit, value: '16-bit SNES style, vibrant colors' },
    { label: t.styleGameBoy, value: 'Game Boy style, 4 shades of green' },
    { label: t.styleKawaii, value: 'Cute kawaii chibi style, big eyes' },
    { label: t.styleIso, value: 'Isometric view, 3d pixel art' },
  ];

  const trendingMap = {
    zh: [
        { label: '皮卡丘', value: 'Pixel art Pikachu, 8-bit style, cute' },
        { label: '马里奥蘑菇', value: 'Super Mario Red Mushroom, pixel art' },
        { label: '我的世界钻石剑', value: 'Minecraft Diamond Sword item, pixel art' },
        { label: '星露谷蓝鸡', value: 'Stardew Valley Blue Chicken, pixel art' },
        { label: '卡比', value: 'Kirby pink round cute pixel art' },
        { label: '精灵球', value: 'Pokeball pixel art' },
    ],
    en: [
        { label: 'Pikachu', value: 'Pixel art Pikachu, 8-bit style, cute' },
        { label: 'Mario Mushroom', value: 'Super Mario Red Mushroom, pixel art' },
        { label: 'Minecraft Sword', value: 'Minecraft Diamond Sword item, pixel art' },
        { label: 'Stardew Chicken', value: 'Stardew Valley Blue Chicken, pixel art' },
        { label: 'Kirby', value: 'Kirby pink round cute pixel art' },
        { label: 'Pokeball', value: 'Pokeball pixel art' },
    ]
  };

  const trending = lang === 'zh' ? trendingMap.zh : trendingMap.en;

  const appendStyle = (styleValue: string) => {
    setPrompt(prev => {
        const trimmed = prev.trim();
        if (!trimmed) return styleValue;
        if (trimmed.toLowerCase().includes(styleValue.toLowerCase().split(',')[0])) return trimmed; // Simple duplicate check
        return trimmed.endsWith(',') ? `${trimmed} ${styleValue}` : `${trimmed}, ${styleValue}`;
    });
  };

  const setTrending = (val: string) => {
      setPrompt(val);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]); // Clear previous
    try {
      const images = await generatePixelArtVariations(prompt, selectedSize);
      setGeneratedImages(images);
    } catch (err) {
      setError(t.errorGen);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (img: string) => {
    onImageGenerated(img);
  };

  return (
    <div className="bg-[#fff0f5] p-6 lg:p-8 border-4 border-black shadow-pixel mb-8 relative">
        {/* Visual Tag for selected size */}
        <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-sm font-mono-pixel transform translate-x-1 -translate-y-3 z-10">
            Target: {selectedSize.toUpperCase()}
        </div>

        <div className="flex flex-col gap-4">
            <div className="w-full">
                <label className="block text-2xl font-black text-black mb-4 flex items-center gap-2">
                    <span className="text-3xl">✨</span> {t.aiGeneratorTitle}
                </label>

                {/* Trending Topics */}
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                    <span className="text-sm font-bold text-pink-600 select-none">{t.trendingTopics}</span>
                    {trending.map((item, i) => (
                        <button 
                            key={i}
                            onClick={() => setTrending(item.value)}
                            className="px-2 py-0.5 text-xs font-bold bg-white border border-pink-300 rounded-full text-pink-600 hover:bg-pink-100 hover:border-pink-500 transition-colors"
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-grow">
                      <textarea 
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={t.aiPlaceholder}
                          className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:bg-white bg-white text-black placeholder-slate-400 font-pixel resize-none h-24 text-lg"
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleGenerate();
                              }
                          }}
                      />
                  </div>
                  <button
                      onClick={handleGenerate}
                      disabled={isLoading || !prompt.trim()}
                      className={`px-6 py-3 border-2 border-black font-bold text-black shadow-pixel transition-all whitespace-nowrap flex items-center justify-center min-w-[140px]
                          ${isLoading 
                              ? 'bg-slate-300 cursor-not-allowed shadow-none translate-x-[2px] translate-y-[2px]' 
                              : 'bg-pink-400 hover:bg-pink-300 hover:-translate-y-1 hover:shadow-pixel-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                          }`}
                  >
                      {isLoading ? (
                          <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {t.dreaming}
                          </span>
                      ) : (
                          <span className="flex flex-col items-center leading-tight">
                              <span>{generatedImages.length > 0 ? t.regenerate : t.generateBtn}</span>
                              <span className="text-[10px] font-normal opacity-80">(Enter)</span>
                          </span>
                      )}
                  </button>
                </div>
                
                {/* Style Presets */}
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs font-bold text-slate-500 flex items-center select-none">{t.addStyle}</span>
                    {styles.map((s, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => appendStyle(s.value)}
                            className="px-2 py-1 bg-white border-2 border-black text-xs font-bold hover:bg-yellow-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selection Grid */}
            {generatedImages.length > 0 && (
              <div className="mt-4 animate-slide-in">
                <p className="text-sm font-bold mb-2">{t.selectBest}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSelect(img)}
                      className="aspect-square border-4 border-black cursor-pointer hover:scale-105 transition-transform bg-white hover:shadow-pixel relative group"
                    >
                      <img src={img} alt={`Variant ${idx + 1}`} className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
        {error && <p className="text-red-600 text-sm mt-2 font-bold bg-red-100 p-1 inline-block border border-red-400">{error}</p>}
        <p className="text-xs text-slate-500 mt-3 font-mono-pixel border-t border-dashed border-slate-300 pt-2">
            {t.aiFooter}
        </p>
    </div>
  );
};

export default AIGenerator;