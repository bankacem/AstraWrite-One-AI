
import * as React from 'react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { ArticleConfig, GeneratedContent, BrandVoice, WordPressConfig } from '../types';
import { generateArticleStream, generateTitle, generateBlogImages } from '../services/geminiService';
import { publishToWordPress } from '../services/wordpressService';
import { TONES, LANGUAGES, IMAGE_STYLES, READABILITY_LEVELS, AI_CONTENT_CLEANING } from '../constants';
import {
  Loader2, ArrowLeft, Plus, Check, ChevronRight, Sparkles,
  Image as ImageIcon, Fingerprint, Copy, Globe, Rocket, BrainCircuit, Cloud,
  ChevronDown, Settings2, Search, Target, Quote, List, HelpCircle,
  Table as TableIcon, Sliders, Globe2, Youtube
} from 'lucide-react';

interface BuilderProps {
  history: GeneratedContent[];
  onSave: (content: GeneratedContent) => void;
  onUpdate: (id: string, content: Partial<GeneratedContent>) => void;
  brandVoices: BrandVoice[];
  wpConfig?: WordPressConfig;
}

const Builder: React.FC<BuilderProps> = ({ history, onSave, onUpdate, brandVoices = [], wpConfig }) => {
  const [viewMode, setViewMode] = useState<'LIST' | 'FORM' | 'RESULT'>('LIST');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use refs to track the latest data without triggering re-renders for every single chunk
  const contentBuffer = useRef('');
  const lastUpdateRef = useRef(0);
  const isGeneratingRef = useRef(false);

  const [config, setConfig] = useState<ArticleConfig>({
    mainKeyword: '',
    title: '',
    language: 'English (US)',
    articleSize: 'Large',
    tone: 'Professional',
    pointOfView: 'Third Person',
    targetCountry: 'United States',
    articleType: 'Blog Post',
    aiModel: 'Gemini 3 Pro',
    readability: 'University',
    aiContentCleaning: 'Standard Removal',
    humanize: true,
    detailsToInclude: '',
    includeImages: true,
    imageStyle: 'Photo-realistic',
    imagesCount: 1,
    imageSize: '16:9',
    includeYouTube: false,
    youtubeCount: 0,
    youtubeLayout: '',
    keywordsToInclude: '',
    introHook: 'Statistical',
    includeTableOfContents: true,
    includeH3: true,
    includeH4: true,
    includeH5: false,
    includeLists: true,
    includeTables: true,
    includeItalics: true,
    includeQuotes: true,
    includeKeyTakeaways: true,
    includeConclusion: true,
    includeFAQ: true,
    includeBold: true,
    connectToWeb: true,
    useResearchAgent: true,
    outlineEditorEnabled: false,
  });

  const handleRun = async () => {
    if (!config.title || !config.mainKeyword || isGeneratingRef.current) return;

    isGeneratingRef.current = true;
    setIsProcessing(true);
    const newId = Date.now().toString();
    const newArticle: GeneratedContent = {
      id: newId,
      title: config.title,
      content: '',
      type: 'article',
      createdAt: Date.now(),
      status: 'generating',
      progress: 0,
    };

    onSave(newArticle);
    setSelectedArticleId(newId);
    setViewMode('RESULT');

    try {
      contentBuffer.current = '';

      if (config.includeImages) {
        try {
          const urls = await generateBlogImages(config.title, config.imageStyle);
          if (urls && urls.length > 0) {
            contentBuffer.current = `<img src="${urls[0]}" alt="${config.title}" style="width:100%; border-radius:32px; margin-bottom:3rem; border: 1px solid rgba(0,0,0,0.05);" />\n\n`;
            onUpdate(newId, { imageUrl: urls[0], content: contentBuffer.current });
          }
        } catch (e) {
          console.error("Image generation failed", e);
        }
      }

      await generateArticleStream(config, (chunk) => {
        contentBuffer.current += chunk;
        const now = Date.now();
        // Limit UI updates to once every 500ms to prevent browser thread locking
        if (now - lastUpdateRef.current > 500) {
          onUpdate(newId, {
            content: contentBuffer.current,
            progress: Math.min(99, Math.floor((contentBuffer.current.length / 6000) * 100))
          });
          lastUpdateRef.current = now;
        }
      });

      // Final update to ensure everything is captured
      onUpdate(newId, {
        content: contentBuffer.current,
        status: 'completed',
        progress: 100
      });
    } catch (err) {
      console.error("Generation failed", err);
      onUpdate(newId, { status: 'error' });
    } finally {
      setIsProcessing(false);
      isGeneratingRef.current = false;
    }
  };

  const activeArticle = useMemo(() => history.find(h => h.id === selectedArticleId), [selectedArticleId, history]);

  if (viewMode === 'LIST') {
    return (
      <div className="max-w-7xl mx-auto space-y-12 py-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-sm border border-slate-100 dark:border-slate-700 gap-6">
          <div className="text-left">
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">Articulator</h1>
            <p className="text-slate-500 text-xl font-medium mt-2">Generate ranking-ready content in seconds.</p>
          </div>
          <button onClick={() => setViewMode('FORM')} className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl shadow-indigo-500/30 flex items-center gap-3 active:scale-95 transition-all hover:bg-indigo-700 whitespace-nowrap">
            <Plus className="w-6 h-6" /> NEW ARTICLE
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                 <tr>
                    <th className="px-12 py-8">Masterpiece Title</th>
                    <th className="px-12 py-8 text-center">Status</th>
                    <th className="px-12 py-8"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                 {history.filter(h => h.type === 'article').map(art => (
                    <tr key={art.id} onClick={() => { setSelectedArticleId(art.id); setViewMode('RESULT'); }} className="hover:bg-indigo-50/20 cursor-pointer group transition-all">
                       <td className="px-12 py-10">
                          <div className="font-black text-2xl text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{art.title}</div>
                          <div className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-4 tracking-widest">
                             <span className="flex items-center gap-2">{art.imageUrl ? 'Cloud Hosted' : 'Text Only'} <Cloud className="w-4 h-4 text-indigo-500" /></span>
                             <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                             <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                          </div>
                       </td>
                       <td className="px-12 py-10 text-center">
                          {art.status === 'completed' ? <Check className="w-8 h-8 text-emerald-500 mx-auto" /> : <Loader2 className="w-7 h-7 animate-spin mx-auto text-indigo-600" />}
                       </td>
                       <td className="px-12 py-10 text-right"><ChevronRight className="w-6 h-6 text-slate-300" /></td>
                    </tr>
                 ))}
                 {history.filter(h => h.type === 'article').length === 0 && (
                   <tr>
                     <td colSpan={3} className="px-12 py-32 text-center text-slate-400 font-bold text-xl italic">No articles yet. Start your ranking journey.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    );
  }

  if (viewMode === 'RESULT' && activeArticle) {
    return (
      <div className="max-w-5xl mx-auto py-12 animate-in slide-in-from-bottom-12 duration-700">
        <header className="flex items-center justify-between mb-10 bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-200 dark:border-slate-700 shadow-2xl">
           <div className="flex items-center gap-6">
              <button onClick={() => setViewMode('LIST')} className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl hover:text-indigo-600 transition-all"><ArrowLeft /></button>
              <div className="text-left">
                <h2 className="font-black text-3xl tracking-tight truncate max-w-lg">{activeArticle.title}</h2>
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em] mt-1">{activeArticle.status === 'completed' ? 'SEO Masterpiece Ready' : 'Generating Content...'}</p>
              </div>
           </div>
           <div className="flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(activeArticle.content); alert("Copied!"); }} className="p-5 bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-white transition-all"><Copy className="w-6 h-6" /></button>
              {wpConfig?.url && activeArticle.status === 'completed' && (
                <button onClick={async () => { const url = await publishToWordPress(wpConfig, activeArticle.title, activeArticle.content, activeArticle.imageUrl); window.open(url, '_blank'); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3">PUBLISH TO WORDPRESS</button>
              )}
           </div>
        </header>

        <div className="bg-white dark:bg-slate-800 p-16 md:p-32 rounded-[64px] shadow-2xl border border-slate-100 dark:border-slate-800">
           <article
             className="prose prose-2xl dark:prose-invert max-w-none text-left"
             dangerouslySetInnerHTML={{ __html: activeArticle.content || '<div class="flex flex-col items-center gap-10 py-32"><Loader2 class="w-16 h-16 animate-spin text-indigo-600" /><p class="font-black text-3xl animate-pulse text-slate-400">Engineering article structure...</p></div>' }}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white dark:bg-slate-800 p-8 md:p-16 rounded-[40px] md:rounded-[64px] shadow-2xl border border-slate-200 dark:border-slate-700 space-y-12 md:space-y-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-start">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-indigo-600 rounded-[30px] md:rounded-[40px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 shrink-0"><Rocket className="w-10 h-10 md:w-14 md:h-14" /></div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Content Builder</h1>
            <p className="text-slate-500 text-lg md:text-2xl font-medium">Configure SEO parameters for maximum ranking impact.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
           <div className="space-y-10 text-left">
              <div className="space-y-4">
                <label className="text-[12px] font-black uppercase text-indigo-500 tracking-[0.3em] flex items-center gap-2">
                   <Target className="w-4 h-4" /> Primary Keyword
                </label>
                <input
                  value={config.mainKeyword}
                  onChange={(e) => setConfig({...config, mainKeyword: e.target.value})}
                  className="w-full px-8 md:px-10 py-6 md:py-8 bg-slate-50 dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-700 text-xl md:text-3xl font-black outline-none focus:border-indigo-500 transition-all shadow-inner"
                  placeholder="e.g. Future of AI"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[12px] font-black uppercase text-indigo-500 tracking-[0.3em] flex items-center gap-2">
                   <BrainCircuit className="w-4 h-4" /> Final Article Title
                </label>
                <div className="relative">
                  <input
                    value={config.title}
                    onChange={(e) => setConfig({...config, title: e.target.value})}
                    className="w-full pl-8 pr-20 py-6 md:py-8 bg-slate-50 dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-700 text-lg md:text-2xl font-black outline-none focus:border-indigo-500 transition-all shadow-inner"
                    placeholder="Auto-generate or type title..."
                  />
                  <button
                    onClick={async () => {
                      if(!config.mainKeyword) return;
                      setIsGeneratingTitle(true);
                      const t = await generateTitle(config.mainKeyword);
                      setConfig({...config, title: t});
                      setIsGeneratingTitle(false);
                    }}
                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center text-indigo-600 hover:scale-110 active:scale-95 transition-all"
                  >
                    {isGeneratingTitle ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Language</label>
                  <select value={config.language} onChange={(e) => setConfig({...config, language: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm outline-none">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Tone</label>
                  <select value={config.tone} onChange={(e) => setConfig({...config, tone: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none font-bold text-sm outline-none">
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
           </div>

           <div className="space-y-10 text-left">
              <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 space-y-8">
                 <h3 className="font-black text-lg uppercase tracking-widest flex items-center gap-3">
                    <Sliders className="w-5 h-5 text-indigo-500" /> Structure
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'includeTableOfContents', label: 'Table of Contents', icon: List },
                      { id: 'includeKeyTakeaways', label: 'Key Takeaways', icon: Quote },
                      { id: 'includeFAQ', label: 'FAQ Section', icon: HelpCircle },
                      { id: 'includeTables', label: 'Comparison Tables', icon: TableIcon },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setConfig({...config, [item.id]: !config[item.id as keyof ArticleConfig]})}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-start gap-3 font-bold text-xs transition-all
                          ${config[item.id as keyof ArticleConfig]
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
                          }`}
                      >
                         <item.icon className="w-4 h-4" /> {item.label}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-8 flex flex-col items-center gap-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:text-indigo-600 transition-colors"
            >
              Advanced Settings <Settings2 className="w-4 h-4" />
            </button>

            {showAdvanced && (
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image Style</label>
                    <select value={config.imageStyle} onChange={e => setConfig({...config, imageStyle: e.target.value})} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold">
                       {IMAGE_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Sliders className="w-4 h-4" /> Readability</label>
                    <select value={config.readability} onChange={e => setConfig({...config, readability: e.target.value})} className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-bold">
                       {READABILITY_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2"><Search className="w-4 h-4" /> Extra Keywords</label>
                    <textarea
                       value={config.keywordsToInclude}
                       onChange={e => setConfig({...config, keywordsToInclude: e.target.value})}
                       className="w-full p-4 h-28 rounded-xl bg-white dark:bg-slate-800 border-none text-xs font-medium resize-none outline-none"
                       placeholder="Enter comma separated LSI keywords..."
                    />
                 </div>
              </div>
            )}

            <button
              onClick={handleRun}
              disabled={isProcessing || !config.title || !config.mainKeyword}
              className={`mt-10 w-full md:w-auto px-20 py-8 rounded-[40px] font-black text-2xl uppercase tracking-widest text-white shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all
                ${isProcessing || !config.title || !config.mainKeyword
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-800 hover:shadow-indigo-500/40 hover:-translate-y-1'
                }`}
            >
              {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Rocket className="w-8 h-8" />}
              {isProcessing ? 'LAUNCHING...' : 'LAUNCH MASTERPIECE'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Builder;
