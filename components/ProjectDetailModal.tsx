
import React from 'react';
import { SavedProject, Language, ViewMode } from '../types';
import { getTexts } from '../locales';
import BeadGrid from './BeadGrid';

interface ProjectDetailModalProps {
  project: SavedProject;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onAddToCart: () => void;
  lang: Language;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, isOpen, onClose, onEdit, onAddToCart, lang }) => {
  if (!isOpen) return null;
  const t = getTexts(lang);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-white border-4 border-black shadow-pixel-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            
            {/* Left: Preview */}
            <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col items-center justify-center border-b-4 md:border-b-0 md:border-r-4 border-black min-h-[400px]">
                <div className="w-full aspect-square max-w-[400px] shadow-pixel-sm border-2 border-black bg-white overflow-hidden">
                     <BeadGrid 
                        grid={project.grid} 
                        viewMode={ViewMode.GRID} 
                        zoomLevel={1} 
                        showRulers={false} 
                        interactive={false} 
                        forceFit={true}
                    />
                </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="w-full md:w-1/2 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className="text-xs font-bold bg-yellow-300 px-2 py-0.5 border border-black mb-2 inline-block">
                            {project.category ? t[`cat_${project.category}` as keyof typeof t] || project.category : 'Pixel Art'}
                        </span>
                        <h2 className="text-3xl font-black text-black leading-tight">{project.title}</h2>
                        <p className="text-slate-500 text-sm mt-1">{t.author}: <span className="font-bold text-black">{project.author || t.unknownUser}</span></p>
                    </div>
                    <button onClick={onClose} className="text-4xl leading-none font-bold hover:text-red-500">&times;</button>
                </div>

                <div className="flex gap-4 mb-8">
                     <button 
                        onClick={onAddToCart}
                        className="flex-1 bg-black text-white py-3 px-4 font-bold border-2 border-transparent hover:bg-slate-800 transition-all shadow-pixel-sm active:translate-y-1 active:shadow-none"
                    >
                        {t.addToCart}
                     </button>
                     <button 
                        onClick={onEdit}
                        className="flex-1 bg-white text-black py-3 px-4 font-bold border-2 border-black hover:bg-slate-100 transition-all shadow-pixel-sm active:translate-y-1 active:shadow-none"
                    >
                        {t.editProject}
                     </button>
                </div>

                {/* Community Shares (Simulation) */}
                <div className="flex-grow border-t-2 border-dashed border-slate-300 pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg">{t.userShares}</h3>
                        <button className="text-xs font-bold text-indigo-600 hover:underline">{t.shareWork}</button>
                    </div>

                    <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                        {!project.userShares || project.userShares.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm italic">
                                {t.noShares}
                            </div>
                        ) : (
                            project.userShares.map((share, i) => (
                                <div key={i} className="flex gap-3 bg-slate-50 p-2 border border-slate-200">
                                    <div className="w-12 h-12 bg-slate-200 shrink-0 border border-black overflow-hidden">
                                        <img src={share.imageUrl} alt="User Work" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs">{share.userName}</p>
                                        <p className="text-sm text-slate-700 leading-snug">{share.comment}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default ProjectDetailModal;
