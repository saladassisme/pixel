
import React, { useState, useEffect, useCallback } from 'react';
import { BeadColor, ProcessingOptions, ViewMode, Language, ProjectSize, HoverInfo, SavedProject, ProjectCategory } from './types';
import { processImageToGrid } from './services/imageProcessing';
import { DEFAULT_WIDTH, PALETTES } from './constants';
import { FEATURED_PROJECTS } from './data/featured';
import { getTexts } from './locales';
import Controls from './components/Controls';
import BeadGrid from './components/BeadGrid';
import StatsPanel from './components/StatsPanel';
import AIGenerator from './components/AIGenerator';
import Toast from './components/Toast';
import ShoppingCart from './components/ShoppingCart';
import ProjectDetailModal from './components/ProjectDetailModal';
import CommunityModal from './components/CommunityModal';

// Define App View States
type AppView = 'GALLERY' | 'EDITOR' | 'CART' | 'PROFILE';

const App: React.FC = () => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<AppView>('GALLERY');
  const [lang, setLang] = useState<Language>('zh');
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | 'all'>('all');
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  // Editor State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [grid, setGrid] = useState<BeadColor[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [options, setOptions] = useState<ProcessingOptions>({
    width: DEFAULT_WIDTH,
    brightness: 0,
    contrast: 0,
    paletteId: PALETTES[0].id
  });
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [targetSize, setTargetSize] = useState<ProjectSize>('small');
  
  // Project State Management
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Collection & Community State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [communityProjects, setCommunityProjects] = useState<SavedProject[]>([]);
  
  // Ecommerce State
  const [cart, setCart] = useState<SavedProject[]>([]);
  const [detailProject, setDetailProject] = useState<SavedProject | null>(null);

  // Feedback State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const t = getTexts(lang);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('beadart_collection');
    if (saved) {
      try { setSavedProjects(JSON.parse(saved)); } catch (e) { console.error(e); }
    }

    const uploads = localStorage.getItem('beadart_community_uploads');
    let userUploads: SavedProject[] = [];
    if (uploads) {
        try { userUploads = JSON.parse(uploads); } catch (e) { console.error(e); }
    }
    setCommunityProjects([...userUploads.reverse(), ...FEATURED_PROJECTS]);

    const savedCart = localStorage.getItem('beadart_cart');
    if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
    }
  }, []);

  // Persist Cart
  useEffect(() => {
      localStorage.setItem('beadart_cart', JSON.stringify(cart));
  }, [cart]);

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // --- CART LOGIC ---
  const addToCart = (project: SavedProject) => {
      if (!cart.find(p => p.id === project.id)) {
          setCart([...cart, project]);
          showToast(t.addedToCart);
      } else {
          showToast(t.addedToCart);
      }
      setDetailProject(null);
  };

  const removeFromCart = (id: string) => {
      setCart(cart.filter(p => p.id !== id));
  };

  // --- EDITOR LOGIC ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImageSrc(event.target.result);
          setOptions(prev => ({ ...prev, brightness: 0, contrast: 0 }));
          setCurrentProjectId(null);
          setIsSaved(false);
          setIsPublished(false);
          setCurrentView('EDITOR'); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateGrid = useCallback(async () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 50));
      const newGrid = await processImageToGrid(imageSrc, options);
      setGrid(newGrid);
      
      if (!currentProjectId) {
        setIsSaved(false);
        setIsPublished(false);
      } else {
        setIsSaved(false); 
      }
      
    } catch (error) {
      showToast(t.errorProcess, 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, options, t, currentProjectId]);

  useEffect(() => {
    if (imageSrc && currentView === 'EDITOR') {
       generateGrid();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, options.paletteId]);

  const createProjectObject = (idOverride?: string): SavedProject => {
      return {
        id: idOverride || Date.now().toString(),
        title: `Project ${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        imageSrc: imageSrc || '',
        grid: grid,
        options: options,
        author: 'Me',
        likes: 0
      };
  };

  const handleSaveProject = () => {
    if (!imageSrc && grid.length === 0) return;
    
    let updatedProject: SavedProject;
    let newCollection: SavedProject[];

    if (currentProjectId) {
        updatedProject = createProjectObject(currentProjectId);
        const existing = savedProjects.find(p => p.id === currentProjectId);
        if (existing) {
            updatedProject.isPublished = existing.isPublished;
            updatedProject.category = existing.category;
            updatedProject.timestamp = existing.timestamp;
        }
        newCollection = savedProjects.map(p => p.id === currentProjectId ? updatedProject : p);
    } else {
        updatedProject = createProjectObject();
        newCollection = [updatedProject, ...savedProjects];
        setCurrentProjectId(updatedProject.id);
    }

    setSavedProjects(newCollection);
    localStorage.setItem('beadart_collection', JSON.stringify(newCollection));
    setIsSaved(true);
    showToast(t.saved);
  };

  const handlePublishProject = () => {
      if (grid.length === 0) return;
      
      let finalProject: SavedProject;
      let newCollection: SavedProject[];

      if (currentProjectId) {
          finalProject = createProjectObject(currentProjectId);
          finalProject.isPublished = true;
          finalProject.category = 'beginner'; 
          newCollection = savedProjects.map(p => p.id === currentProjectId ? finalProject : p);
          if (!savedProjects.find(p => p.id === currentProjectId)) {
              newCollection = [finalProject, ...savedProjects];
          }
      } else {
          finalProject = createProjectObject();
          finalProject.isPublished = true;
          finalProject.category = 'beginner';
          newCollection = [finalProject, ...savedProjects];
          setCurrentProjectId(finalProject.id);
      }

      setSavedProjects(newCollection);
      localStorage.setItem('beadart_collection', JSON.stringify(newCollection));
      setIsSaved(true);
      setIsPublished(true);

      const existingUploads = localStorage.getItem('beadart_community_uploads');
      let uploads: SavedProject[] = [];
      if (existingUploads) {
          uploads = JSON.parse(existingUploads);
      }
      
      const isAlreadyUploaded = uploads.some(p => p.id === finalProject.id);
      let updatedUploads = uploads;
      if (!isAlreadyUploaded) {
          updatedUploads = [...uploads, finalProject];
      } else {
          updatedUploads = uploads.map(p => p.id === finalProject.id ? finalProject : p);
      }
      
      localStorage.setItem('beadart_community_uploads', JSON.stringify(updatedUploads));

      const newCommunityState = [...updatedUploads.reverse(), ...FEATURED_PROJECTS]; 
      setCommunityProjects(newCommunityState);

      showToast(t.publishSuccess);
  };

  const loadProject = (project: SavedProject) => {
    setImageSrc(project.imageSrc); 
    setOptions(project.options);
    setGrid(project.grid);
    setCurrentProjectId(project.id);
    setIsSaved(true);
    setIsPublished(!!project.isPublished);
    setCurrentView('EDITOR');
    setDetailProject(null);
  };

  // --- RENDER HELPERS ---

  const ProjectCard = ({ project }: { project: SavedProject }) => {
    return (
    <div onClick={() => setDetailProject(project)} className="bg-white border-4 border-black cursor-pointer group hover:-translate-y-2 hover:shadow-pixel-lg active:translate-y-0 active:shadow-none transition-all relative flex flex-col h-full">
        <div className="aspect-square bg-zinc-50 p-4 overflow-hidden relative border-b-4 border-black">
            <div className="w-full h-full transform scale-95 group-hover:scale-100 transition-transform duration-300 flex items-center justify-center">
                    <BeadGrid 
                        grid={project.grid} 
                        viewMode={ViewMode.GRID} 
                        zoomLevel={1} 
                        showRulers={false}
                        interactive={false}
                        forceFit={true}
                    />
            </div>
            {/* Premium Category Tag */}
            <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {project.category || 'ART'}
            </div>
        </div>
        <div className="p-4 bg-white flex flex-col flex-grow">
            <h4 className="font-bold text-lg truncate w-full tracking-tight" title={project.title}>{project.title}</h4>
            <div className="flex items-center justify-between text-xs text-zinc-500 font-mono-pixel mt-2 border-t border-zinc-100 pt-2">
                 <span>{project.options.width}x{project.grid.length}</span>
                 <span className="font-bold text-black truncate max-w-[80px]">
                    {project.author || t.unknownUser}
                 </span>
            </div>
        </div>
    </div>
    );
  };

  const renderProfile = () => (
      <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b-4 border-black bg-white p-8 shadow-pixel">
              <div className="w-24 h-24 bg-brand-gold border-4 border-black flex items-center justify-center text-4xl font-black shadow-pixel-sm">
                  ME
              </div>
              <div>
                  <h2 className="text-3xl font-black mb-1">{t.myProfile}</h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Level 1 Artist</p>
                  <button onClick={() => setIsCommunityOpen(true)} className="mt-3 text-sm underline font-bold text-brand-goldDark hover:text-black transition-colors">
                      {t.joinCommunity} &rarr;
                  </button>
              </div>
          </div>

          <div className="space-y-12">
              <section>
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                      <span className="bg-black text-white px-3 py-1 text-lg">01</span> {t.myWorks}
                  </h3>
                  {savedProjects.filter(p => p.isPublished).length === 0 ? (
                       <div className="text-zinc-400 italic py-8 text-center border-2 border-dashed border-zinc-200">{t.noCollection}</div>
                  ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {savedProjects.filter(p => p.isPublished).map(p => <ProjectCard key={p.id} project={p}/>)}
                      </div>
                  )}
              </section>

              <section>
                  <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                      <span className="bg-black text-white px-3 py-1 text-lg">02</span> {t.myCollection}
                  </h3>
                   {savedProjects.length === 0 ? (
                       <div className="text-zinc-400 italic py-8 text-center border-2 border-dashed border-zinc-200">{t.noCollection}</div>
                  ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {savedProjects.map(p => <ProjectCard key={p.id} project={p}/>)}
                      </div>
                  )}
              </section>
          </div>
      </div>
  );

  const renderGallery = () => {
    const displayProjects = selectedCategory === 'all' 
        ? communityProjects 
        : communityProjects.filter(p => {
            if (!p.category) return false;
            return p.category === selectedCategory || (selectedCategory === 'beginner' && !p.category);
        });

    const categories: {id: ProjectCategory | 'all', label: string}[] = [
        { id: 'all', label: t.cat_all },
        { id: 'anime', label: t.cat_anime },
        { id: 'game', label: t.cat_game },
        { id: 'beginner', label: t.cat_beginner },
        { id: 'scenery', label: t.cat_scenery },
    ];

    return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section - Premium Style */}
        <div className="relative mb-16 bg-black text-white border-4 border-black shadow-pixel-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
            <div className="relative z-10 px-6 py-16 md:py-24 text-center space-y-6">
                <div className="inline-block border border-zinc-700 bg-zinc-900 px-4 py-1 text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-2">
                    {t.appTitle}
                </div>
                <h2 className="text-5xl md:text-7xl font-black leading-none tracking-tighter">
                    {t.heroTitle} <span className="text-brand-gold">{t.heroTitleHighlight}</span>
                </h2>
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                    {t.heroDesc}
                </p>
                
                <div className="flex justify-center pt-6">
                    <button 
                        onClick={() => setIsCommunityOpen(true)}
                        className="group relative px-8 py-4 bg-brand-gold text-black font-bold text-xl uppercase tracking-widest border-2 border-transparent hover:bg-white transition-all shadow-[0_0_20px_rgba(251,191,36,0.5)] hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] active:scale-95"
                    >
                        <span className="flex items-center gap-3">
                            {t.joinCommunity}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
            
            {/* Decorative Grid Background */}
            <div className="absolute inset-0 z-0 opacity-10" style={{backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
        </div>

        {/* AI & Upload Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
             <div className="lg:col-span-2">
                 <AIGenerator 
                    onImageGenerated={(src) => { 
                        setImageSrc(src); 
                        setOptions(prev => ({...prev, brightness: 0, contrast: 0})); 
                        setCurrentProjectId(null); 
                        setCurrentView('EDITOR'); 
                    }} 
                    lang={lang} 
                    selectedSize={targetSize}
                />
             </div>
             <div className="lg:col-span-1 bg-white border-4 border-black shadow-pixel p-8 flex flex-col items-center text-center justify-center">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center mb-6 shadow-pixel-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{t.uploadSectionTitle}</h3>
                <p className="text-sm text-zinc-500 mb-8 max-w-[200px]">{t.uploadSectionDesc}</p>
                <label className="cursor-pointer bg-zinc-100 border-4 border-black px-8 py-4 font-bold text-lg shadow-pixel hover:-translate-y-1 hover:shadow-pixel-lg active:translate-y-0 active:shadow-none transition-all flex items-center gap-3 w-full justify-center hover:bg-brand-gold hover:text-black group">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <span className="group-hover:scale-105 transition-transform">{t.dropZoneSubtitle}</span>
                </label>
            </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 mb-10 justify-center pb-6 border-b border-zinc-200">
            {categories.map(cat => (
                <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-6 py-2 font-bold text-sm tracking-wider uppercase transition-all ${selectedCategory === cat.id ? 'bg-black text-white shadow-pixel-sm' : 'bg-transparent text-zinc-400 hover:text-black'}`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayProjects.map((project, idx) => (
                <ProjectCard key={project.id || idx} project={project} />
            ))}
        </div>
    </div>
  )};

  const renderEditor = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[calc(100vh-8rem)]">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-white p-4 border-4 border-black shadow-pixel">
                <button 
                onClick={() => { setImageSrc(null); setCurrentView('GALLERY'); }}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors mb-4 group"
                >
                <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> {t.backToGallery}
                </button>
                {imageSrc ? (
                    <div className="aspect-square bg-zinc-100 border-2 border-black relative flex items-center justify-center p-2">
                        <img src={imageSrc} alt="Source" className="max-w-full max-h-full object-contain" />
                    </div>
                ) : (
                    <div className="aspect-square bg-zinc-50 border-2 border-black border-dashed relative flex flex-col items-center justify-center p-2 text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-center font-bold">No Source Image</span>
                    </div>
                )}
            </div>

            <Controls 
            options={options} 
            setOptions={setOptions} 
            onGenerate={generateGrid}
            isProcessing={isProcessing}
            lang={lang}
            hasSourceImage={!!imageSrc}
            />
            
            <div className="flex-grow">
                <StatsPanel grid={grid} lang={lang} />
            </div>
        </div>

        {/* Main Area */}
        <div className="lg:col-span-9 flex flex-col gap-4 h-full">
            
            <div className="bg-white p-4 border-4 border-black shadow-pixel flex flex-wrap justify-between items-center gap-4 z-30 relative">
                <div className="flex gap-2">
                    <button 
                        onClick={() => setViewMode(ViewMode.GRID)}
                        className={`px-5 py-2 border-2 border-black text-sm font-bold transition-all active:scale-95 uppercase tracking-wide
                            ${viewMode === ViewMode.GRID ? 'bg-black text-white shadow-pixel-sm' : 'bg-white text-black hover:bg-zinc-100'}`}
                    >
                        {t.viewBeads}
                    </button>
                    <button 
                        onClick={() => setViewMode(ViewMode.PREVIEW)}
                        className={`px-5 py-2 border-2 border-black text-sm font-bold transition-all active:scale-95 uppercase tracking-wide
                            ${viewMode === ViewMode.PREVIEW ? 'bg-black text-white shadow-pixel-sm' : 'bg-white text-black hover:bg-zinc-100'}`}
                    >
                        {t.viewPixels}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                     <button 
                        onClick={handlePublishProject}
                        disabled={isPublished}
                        className={`flex items-center gap-2 px-5 py-2 border-2 border-black shadow-pixel-sm transition-all text-sm font-bold uppercase tracking-wide
                            ${isPublished ? 'bg-zinc-100 text-zinc-400 cursor-default shadow-none' : 'bg-brand-gold text-black hover:bg-white hover:shadow-pixel'}`}
                    >
                         {isPublished ? t.published : t.publish}
                    </button>

                     <button 
                        onClick={handleSaveProject}
                        disabled={isSaved}
                        className={`flex items-center gap-2 px-5 py-2 border-2 border-black shadow-pixel-sm transition-all text-sm font-bold uppercase tracking-wide mr-2
                            ${isSaved ? 'bg-zinc-100 text-zinc-400 cursor-default shadow-none' : 'bg-white text-black hover:bg-zinc-50 hover:shadow-pixel'}`}
                    >
                        {isSaved ? t.saved : t.saveCollection}
                    </button>
                </div>
            </div>

            <div className="flex-grow relative flex flex-col h-full overflow-hidden border-4 border-black shadow-pixel bg-zinc-100">
                <BeadGrid 
                    grid={grid} 
                    viewMode={viewMode} 
                    zoomLevel={zoomLevel}
                    onHover={setHoverInfo}
                />
            </div>
        </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen font-pixel text-zinc-900 pb-20 bg-stone-50 selection:bg-brand-gold selection:text-black">
      <header className="bg-white border-b-4 border-black sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentView('GALLERY')}>
             <div className="w-10 h-10 bg-black text-white border-2 border-transparent group-hover:bg-brand-gold group-hover:text-black transition-colors flex items-center justify-center font-bold text-2xl">B</div>
             <h1 className="text-2xl font-bold tracking-tighter uppercase">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-6">
             {/* Cart Button */}
             <button onClick={() => setCurrentView('CART')} className="relative p-2 hover:bg-zinc-100 rounded transition-colors group">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">{cart.length}</span>}
             </button>

             {/* Profile Button */}
             <button onClick={() => setCurrentView('PROFILE')} className="flex items-center gap-2 font-bold hover:text-brand-gold transition-colors">
                 <div className="w-8 h-8 bg-zinc-200 border-2 border-black flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-bold">ME</span>
                 </div>
             </button>

             <div className="h-6 w-px bg-zinc-200"></div>

             <button 
              onClick={toggleLang}
              className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
            >
              {t.switchTo}
            </button>
          </div>
        </div>
      </header>

      <main>
          {currentView === 'GALLERY' && renderGallery()}
          {currentView === 'EDITOR' && renderEditor()}
          {currentView === 'CART' && (
              <ShoppingCart 
                cart={cart} 
                removeFromCart={removeFromCart} 
                lang={lang} 
                onClose={() => setCurrentView('GALLERY')}
              />
          )}
          {currentView === 'PROFILE' && renderProfile()}
      </main>

      {/* Details Modal */}
      {detailProject && (
          <ProjectDetailModal 
            project={detailProject}
            isOpen={!!detailProject}
            onClose={() => setDetailProject(null)}
            onEdit={() => loadProject(detailProject)}
            onAddToCart={() => addToCart(detailProject)}
            lang={lang}
          />
      )}

      {/* Community Modal */}
      <CommunityModal 
         isOpen={isCommunityOpen} 
         onClose={() => setIsCommunityOpen(false)} 
         lang={lang} 
      />
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
