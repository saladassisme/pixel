import React from 'react';
import { Language } from '../types';
import { getTexts } from '../locales';

interface CommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const CommunityModal: React.FC<CommunityModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = getTexts(lang);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
        <div 
            className="bg-zinc-900 border-4 border-brand-gold relative max-w-2xl w-full shadow-[0_0_40px_rgba(251,191,36,0.2)]"
            onClick={e => e.stopPropagation()}
        >
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Header */}
            <div className="p-8 text-center border-b-2 border-zinc-800 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
                <div className="inline-block bg-brand-gold text-black px-3 py-1 text-sm font-bold mb-4 tracking-widest uppercase">
                    {t.appTitle} VIP
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">{t.communityTitle}</h2>
                <p className="text-brand-gold text-lg font-pixel tracking-wide opacity-90">{t.communitySubtitle}</p>
            </div>

            {/* Benefits Grid */}
            <div className="p-8 grid md:grid-cols-3 gap-6 text-center text-zinc-300">
                <div className="space-y-3 p-4 border border-zinc-700 bg-zinc-800 hover:border-brand-gold transition-colors group">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">💎</div>
                    <h3 className="text-xl font-bold text-white">{t.benefit1Title}</h3>
                    <p className="text-sm leading-relaxed">{t.benefit1Desc}</p>
                </div>
                <div className="space-y-3 p-4 border border-zinc-700 bg-zinc-800 hover:border-brand-gold transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 font-bold">HOT</div>
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">💰</div>
                    <h3 className="text-xl font-bold text-white">{t.benefit2Title}</h3>
                    <p className="text-sm leading-relaxed">{t.benefit2Desc}</p>
                </div>
                <div className="space-y-3 p-4 border border-zinc-700 bg-zinc-800 hover:border-brand-gold transition-colors group">
                    <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🎓</div>
                    <h3 className="text-xl font-bold text-white">{t.benefit3Title}</h3>
                    <p className="text-sm leading-relaxed">{t.benefit3Desc}</p>
                </div>
            </div>

            {/* Pricing CTA */}
            <div className="p-8 bg-zinc-950 border-t-2 border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <span className="text-zinc-500 line-through text-lg mr-3">{t.originalPrice}</span>
                    <span className="text-brand-gold text-5xl font-bold">{t.currentPrice}</span>
                    <span className="block text-red-500 text-xs font-bold mt-1 uppercase tracking-wider">{t.limitedOffer}</span>
                </div>
                <button className="relative overflow-hidden w-full md:w-auto px-10 py-4 bg-brand-gold text-black font-bold text-xl hover:bg-white transition-colors shadow-[4px_4px_0px_0px_#ffffff] active:translate-y-1 active:shadow-none">
                    <span className="relative z-10">{t.joinNow}</span>
                    <div className="absolute inset-0 premium-shimmer opacity-30"></div>
                </button>
            </div>
        </div>
    </div>
  );
};

export default CommunityModal;