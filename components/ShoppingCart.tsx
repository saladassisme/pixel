
import React, { useMemo } from 'react';
import { SavedProject, Language } from '../types';
import { getTexts } from '../locales';
import { calculateTotalMaterials } from '../services/cartService';

interface ShoppingCartProps {
  cart: SavedProject[];
  removeFromCart: (id: string) => void;
  lang: Language;
  onClose: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ cart, removeFromCart, lang, onClose }) => {
  const t = getTexts(lang);
  
  const materials = useMemo(() => calculateTotalMaterials(cart), [cart]);
  const totalBeads = materials.reduce((acc, curr) => acc + curr.count, 0);
  
  // Mock price: 5 RMB per 500 beads
  const estimatedPrice = ((totalBeads / 500) * 5).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
            <button onClick={onClose} className="text-slate-500 hover:text-black font-bold">
                &larr; {t.backToGallery}
            </button>
            <h2 className="text-3xl font-black text-black ml-4">{t.cartTitle}</h2>
        </div>

        {cart.length === 0 ? (
            <div className="text-center py-20 border-4 border-dashed border-slate-300 bg-slate-50">
                <p className="text-xl font-bold text-slate-500">{t.cartEmpty}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Project List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-xl mb-4">{t.projectDetails} ({cart.length})</h3>
                    {cart.map((p, idx) => (
                        <div key={`${p.id}-${idx}`} className="flex items-center justify-between bg-white p-4 border-4 border-black shadow-pixel-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-100 border-2 border-black flex items-center justify-center font-bold text-xs overflow-hidden">
                                     {/* Simple preview or placeholder */}
                                     {p.category || 'Pixel'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg">{p.title}</h4>
                                    <p className="text-xs text-slate-500">{p.options.width}x{p.grid.length} • {t.author}: {p.author || t.unknownUser}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => removeFromCart(p.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-sm underline"
                            >
                                {t.remove}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Right: Summary & Checkout */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-4 border-black shadow-pixel p-6 sticky top-24">
                        <h3 className="font-bold text-xl border-b-2 border-black pb-2 mb-4">{t.summary}</h3>
                        
                        <p className="text-sm text-slate-600 mb-4 italic">{t.cartDesc}</p>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar mb-6 border-2 border-slate-200">
                             <table className="w-full text-sm text-left">
                                 <thead className="bg-slate-100 font-bold">
                                     <tr>
                                         <th className="p-2">{t.colorCode}</th>
                                         <th className="p-2">{t.quantity}</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {materials.map((m, i) => (
                                         <tr key={i} className="border-b border-slate-100">
                                             <td className="p-2 flex items-center gap-2">
                                                 <span className="w-3 h-3 border border-black inline-block" style={{background: m.color.hex}}></span>
                                                 {m.color.id}
                                             </td>
                                             <td className="p-2 font-mono-pixel font-bold">{m.count}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>

                        <div className="flex justify-between items-center mb-2 font-bold text-lg">
                            <span>{t.totalBeads}:</span>
                            <span>{totalBeads} {t.beadCount}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6 font-black text-2xl text-indigo-600">
                            <span>{t.totalCost}:</span>
                            <span>¥{estimatedPrice}</span>
                        </div>
                        
                        <button className="w-full py-4 bg-black text-white font-bold text-xl hover:bg-slate-800 transition-colors shadow-pixel-sm active:translate-y-1 active:shadow-none">
                            {t.checkout}
                        </button>
                        <p className="text-center text-xs text-slate-400 mt-2">{t.checkoutDesc}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default ShoppingCart;
