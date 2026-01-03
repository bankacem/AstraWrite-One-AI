
import React, { useState, useRef, useEffect } from 'react';
import { GeneratedContent, ArticleConfig, WordPressConfig } from '../types';
import { generateTitle, generateArticleStream, generateBlogImages } from '../services/geminiService';
import { publishToWordPress } from '../services/wordpressService';
import { LANGUAGES, ARTICLE_SIZES } from '../constants';
import {
  Layers, Play, StopCircle, CheckCircle2, Loader2, AlertCircle,
  FilePlus2, FileSpreadsheet, Download, UploadCloud, Clock,
  Globe, FileText, Layout, Calendar, Fingerprint, Sparkles, Rocket
} from 'lucide-react';

// Added missing icon definition
const ExternalLink = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);

interface BulkGeneratorProps {
  onSave: (content: GeneratedContent) => void;
  onUpdate: (id: string, content: Partial<GeneratedContent>) => void;
  wpConfig?: WordPressConfig;
}

const BulkGenerator: React.FC<BulkGeneratorProps> = ({ onSave, onUpdate, wpConfig }) => {
  const [inputData, setInputData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<{keyword: string, status: string, id?: string, wpUrl?: string}[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lastUpdateRef = useRef(0);

  const [bulkConfig, setBulkConfig] = useState({
    language: 'English (US)',
    articleSize: 'Medium',
    includeImages: true,
    humanize: true,
    connectToWeb: true,
    autoPublish: !!wpConfig?.url,
    postType: wpConfig?.defaultPostType || 'posts',
    status: wpConfig?.defaultStatus || 'draft',
    intervalMinutes: 0,
  });

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
    } else if (countdown === 0) {
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
          const lines = content.split('\n');
          setInputData(lines.slice(lines[0].toLowerCase().includes('keyword') ? 1 : 0).join('\n'));
      }
    };
    reader.readAsText(file);
  };

  const handleStartBulk = async () => {
    const rows = inputData.split('\n').filter(r => r.trim().length > 0);
    if (rows.length === 0) return;

    const parsedData = rows.map(row => {
        const cols = row.split(/[,\t]/);
        return { mainKeyword: cols[0]?.trim(), title: cols[1]?.trim() };
    }).filter(d => d.mainKeyword);

    setIsProcessing(true);
    setLogs(parsedData.map(d => ({ keyword: d.mainKeyword, status: 'Queued' })));

    for (let i = 0; i < parsedData.length; i++) {
      const data = parsedData[i];

      if (i > 0 && bulkConfig.intervalMinutes > 0) {
        setLogs(prev => {
            const copy = [...prev];
            copy[i].status = `Scheduled (Waiting ${bulkConfig.intervalMinutes}m)`;
            return copy;
        });
        setCountdown(bulkConfig.intervalMinutes * 60);
        await new Promise(resolve => setTimeout(resolve, bulkConfig.intervalMinutes * 60000));
      }

      setLogs(prev => {
        const copy = [...prev];
        copy[i].status = 'Processing...';
        return copy;
      });

      try {
        const finalTitle = data.title || await generateTitle(data.mainKeyword);
        const newId = `bulk-${Date.now()}-${i}`;

        onSave({
          id: newId,
          title: finalTitle,
          content: '',
          type: 'article',
          createdAt: Date.now(),
          status: 'generating',
          progress: 0,
        });

        let currentText = '';
        let imageUrl = "";

        if (bulkConfig.includeImages) {
            const urls = await generateBlogImages(finalTitle, 'Photo-realistic');
            if (urls?.[0]) {
                imageUrl = urls[0];
                currentText = `<img src="${imageUrl}" alt="${finalTitle}" style="width:100%; border-radius:20px; margin-bottom:1.5rem;" />\n\n`;
                onUpdate(newId, { imageUrl, content: currentText });
            }
        }

        const fullConfig: ArticleConfig = {
            mainKeyword: data.mainKeyword,
            title: finalTitle,
            language: bulkConfig.language,
            articleSize: bulkConfig.articleSize as any,
            tone: 'Professional',
            pointOfView: 'Third Person',
            targetCountry: 'United States',
            articleType: 'Blog Post',
            aiModel: 'Gemini 3 Pro',
            readability: 'University',
            aiContentCleaning: 'Standard',
            humanize: bulkConfig.humanize,
            detailsToInclude: '',
            includeImages: bulkConfig.includeImages,
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
            connectToWeb: bulkConfig.connectToWeb,
            useResearchAgent: true,
            outlineEditorEnabled: false,
        };

        await generateArticleStream(fullConfig, (chunk) => {
            currentText += chunk;
            const now = Date.now();
            if (now - lastUpdateRef.current > 400) {
              onUpdate(newId, { content: currentText, progress: Math.min(95, Math.floor((currentText.length / 4000) * 100)) });
              lastUpdateRef.current = now;
            }
        });

        const cleanText = currentText.replace(/```html|```/gi, '').trim();
        onUpdate(newId, { content: cleanText, status: 'completed', progress: 100 });

        let wpUrl = "";
        if (bulkConfig.autoPublish && wpConfig?.url) {
            setLogs(prev => { const c = [...prev]; c[i].status = 'Publishing to WP...'; return c; });
            wpUrl = await publishToWordPress(wpConfig, finalTitle, cleanText, imageUrl, bulkConfig.postType as any, bulkConfig.status as any);
            onUpdate(newId, { wpUrl });
        }

        setLogs(prev => {
            const copy = [...prev];
            copy[i].status = 'Completed';
            copy[i].wpUrl = wpUrl;
            return copy;
        });

      } catch (error) {
        setLogs(prev => { const c = [...prev]; c[i].status = 'Failed'; return c; });
      }
    }
    setIsProcessing(false);
    setCountdown(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
                    <Layers className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Bulk Scheduler</h1>
                    <p className="text-slate-500 font-medium">Auto-pilot your content strategy with scheduled WordPress publishing.</p>
                </div>
            </div>
            {countdown !== null && (
                <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 animate-pulse shadow-xl shadow-indigo-600/20">
                    <Clock className="w-5 h-5" />
                    <span className="font-black text-sm uppercase tracking-widest">Next Post in: {Math.floor(countdown/60)}m {countdown%60}s</span>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Article List</label>
                    <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1.5 hover:underline">
                        <UploadCloud className="w-3.5 h-3.5" /> Import CSV
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                </div>
                <textarea
                    className="w-full h-64 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs font-mono outline-none focus:ring-2 focus:ring-yellow-500 transition resize-none"
                    placeholder={`Keyword, Title (Optional)\nAI in 2025, The Future of AI\nSEO Tips, Top 10 SEO Tips`}
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    disabled={isProcessing}
                />
             </div>

             <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-50 dark:border-slate-700 pb-3 flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Scheduler & AI Settings</h3>

                <div
                  onClick={() => setBulkConfig({...bulkConfig, connectToWeb: !bulkConfig.connectToWeb})}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${bulkConfig.connectToWeb ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                >
                    <div className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 ${bulkConfig.connectToWeb ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                           <p className={`text-[10px] font-black uppercase tracking-widest ${bulkConfig.connectToWeb ? 'text-blue-600' : 'text-slate-500'}`}>Google Search Tool</p>
                           <p className="text-[9px] text-slate-400 font-bold">Live Web Access</p>
                        </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${bulkConfig.connectToWeb ? 'bg-blue-500' : 'bg-slate-300'}`}>
                        {bulkConfig.connectToWeb && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                </div>

                <div
                  onClick={() => setBulkConfig({...bulkConfig, humanize: !bulkConfig.humanize})}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${bulkConfig.humanize ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                >
                    <div className="flex items-center gap-3">
                        <Fingerprint className={`w-5 h-5 ${bulkConfig.humanize ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                           <p className={`text-[10px] font-black uppercase tracking-widest ${bulkConfig.humanize ? 'text-emerald-600' : 'text-slate-500'}`}>Stealth Humanizer</p>
                           <p className="text-[9px] text-slate-400 font-bold">Bypass AI Detectors</p>
                        </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${bulkConfig.humanize ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        {bulkConfig.humanize && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                </div>

                <div
                  onClick={() => setBulkConfig({...bulkConfig, autoPublish: !bulkConfig.autoPublish})}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${bulkConfig.autoPublish ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}
                >
                    <div className="flex items-center gap-3">
                        <Rocket className={`w-5 h-5 ${bulkConfig.autoPublish ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div>
                           <p className={`text-[10px] font-black uppercase tracking-widest ${bulkConfig.autoPublish ? 'text-indigo-600' : 'text-slate-500'}`}>Auto-Publish</p>
                           <p className="text-[9px] text-slate-400 font-bold">Post to WordPress</p>
                        </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${bulkConfig.autoPublish ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                        {bulkConfig.autoPublish && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Publishing Interval (Minutes)</label>
                    <input
                        type="number"
                        min="0"
                        value={bulkConfig.intervalMinutes}
                        onChange={(e) => setBulkConfig({...bulkConfig, intervalMinutes: parseInt(e.target.value) || 0})}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none"
                    />
                </div>

                <button
                  onClick={handleStartBulk}
                  disabled={isProcessing || !inputData}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-white shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95
                    ${isProcessing || !inputData
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:shadow-orange-500/30'
                    }`}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  {isProcessing ? 'PROCESSING...' : 'START BULK RUN'}
                </button>
             </div>
        </div>

        <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Process Monitoring</h3>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{logs.filter(l => l.status === 'Completed').length} Success</span>
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-widest">{logs.filter(l => l.status === 'Failed').length} Failed</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Keyword</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {logs.map((log, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{log.keyword}</div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className={`text-[10px] font-black uppercase inline-flex items-center gap-2 px-3 py-1 rounded-full
                                            ${log.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                                              log.status === 'Failed' ? 'bg-red-100 text-red-700' :
                                              log.status === 'Queued' ? 'bg-slate-100 text-slate-500' :
                                              'bg-blue-100 text-blue-700 animate-pulse'}`}>
                                            {log.status}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {log.wpUrl && (
                                            <a href={log.wpUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-[10px] font-black uppercase flex items-center justify-end gap-1">
                                                View <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-32 text-center text-slate-400 italic text-sm font-medium">
                                        No active bulk processes. Upload keywords to begin.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BulkGenerator;
