
import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { GeneratedContent, WordPressConfig } from '../types';
import { continueWriting, generateSeoGuidelines, humanizeContent } from '../services/geminiService';
import { publishToWordPress } from '../services/wordpressService';
import {
  FileText, Save, ArrowLeft, ArrowRight, Wand2, Loader2, Calendar,
  Trash2, Edit3, Type, Download, Code, FileJson,
  Check, Target, Zap, Sparkles, Search, Grid,
  List, Filter, MoreVertical, ExternalLink, Clock,
  Eye, Hash, ChevronRight, Fingerprint, ShieldCheck, Copy, Globe
} from 'lucide-react';

interface DocumentEditorProps {
    history: GeneratedContent[];
    onUpdate: (id: string, content: Partial<GeneratedContent>) => void;
    onDelete: (id: string) => void;
    wpConfig?: WordPressConfig;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ history, onUpdate, onDelete, wpConfig }) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
    const [searchQuery, setSearchQuery] = useState('');
    const [readingProgress, setReadingProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Editor State
    const [editorContent, setEditorContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isHumanizing, setIsHumanizing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    // Live SEO State
    const [seoTerms, setSeoTerms] = useState<{term: string, count: number}[]>([]);
    const [seoScore, setSeoScore] = useState(0);
    const [sidebarTab, setSidebarTab] = useState<'SEO' | 'AI'>('SEO');

    // Filter Documents
    const documents = useMemo(() => {
        return history.filter(h => h.type === 'article' && h.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [history, searchQuery]);

    const currentDoc = useMemo(() => history.find(h => h.id === selectedDocId), [selectedDocId, history]);

    useEffect(() => {
        if (currentDoc) {
            setEditorContent(currentDoc.content);
        }
    }, [currentDoc]);

    // Live Scoring & Reading Progress
    useEffect(() => {
        if (seoTerms.length > 0 && editorContent) {
            const lowerContent = editorContent.toLowerCase();
            const matches = seoTerms.filter(t => lowerContent.includes(t.term.toLowerCase()));
            const score = Math.round((matches.length / seoTerms.length) * 100);
            setSeoScore(score);
        }
    }, [editorContent, seoTerms]);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
                const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
                setReadingProgress(progress);
            }
        };
        const el = scrollContainerRef.current;
        if (el) el.addEventListener('scroll', handleScroll);
        return () => el?.removeEventListener('scroll', handleScroll);
    }, [selectedDocId]);

    const handleSave = () => {
        if (!selectedDocId) return;
        setIsSaving(true);
        setTimeout(() => {
            onUpdate(selectedDocId, { content: editorContent });
            setIsSaving(false);
        }, 800);
    };

    const handleHumanize = async () => {
        if (!selectedDocId || isHumanizing) return;
        setIsHumanizing(true);
        try {
            const humanText = await humanizeContent(editorContent);
            setEditorContent(humanText);
            onUpdate(selectedDocId, { content: humanText });
        } catch (e) {
            console.error(e);
        } finally {
            setIsHumanizing(false);
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Move this masterpiece to trash?")) {
            onDelete(id);
            if (selectedDocId === id) setSelectedDocId(null);
        }
    };

    const wordCount = (text: string) => {
        const plainText = text.replace(/<[^>]*>?/gm, '');
        return plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    const getCleanFormattedHTML = (html: string) => {
        if (!html) return "";
        let cleaned = html.replace(/```html|```markdown|```/gi, '').trim();
        return cleaned
          .replace(/>\s*</g, '>\n<')
          .replace(/(<h[1-6]>)/g, '\n$1')
          .replace(/(<p>)/g, '\n$1')
          .replace(/(<ul|<ol|<table|<blockquote)/g, '\n$1')
          .trim();
    };

    const handleCopyHtml = () => {
        const clean = getCleanFormattedHTML(editorContent);
        navigator.clipboard.writeText(clean);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setShowExportMenu(false);
        }, 1500);
    };

    const handlePublishToWP = async () => {
        if (!currentDoc || !wpConfig) return;
        setIsPublishing(true);
        try {
            const cleanHtml = getCleanFormattedHTML(editorContent);
            const link = await publishToWordPress(wpConfig, currentDoc.title, cleanHtml, currentDoc.imageUrl);
            window.open(link, '_blank');
            setShowExportMenu(false);
        } catch (e: any) {
            alert(e.message || "WordPress publishing failed.");
        } finally {
            setIsPublishing(false);
        }
    };

    const downloadFile = (type: 'html' | 'md' | 'txt') => {
        if (!currentDoc) return;
        let content = getCleanFormattedHTML(editorContent);
        let mimeType = 'text/html';
        let extension = 'html';
        if (type === 'md') {
            content = editorContent.replace(/<[^>]*>?/gm, '');
            mimeType = 'text/markdown';
            extension = 'md';
        } else if (type === 'txt') {
            content = editorContent.replace(/<[^>]*>?/gm, '');
            mimeType = 'text/plain';
            extension = 'txt';
        }
        const blob = new Blob([content], {type: mimeType});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentDoc.title}.${extension}`;
        a.click();
        setShowExportMenu(false);
    };

    // --- LIST VIEW ---
    if (!selectedDocId) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Content Hub</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage, edit and export your AI-generated masterpieces.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-1 flex border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-xl transition ${viewMode === 'GRID' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><Grid className="w-5 h-5" /></button>
                            <button onClick={() => setViewMode('TABLE')} className={`p-2 rounded-xl transition ${viewMode === 'TABLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><List className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600"><FileText className="w-7 h-7" /></div>
                        <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Articles</p><p className="text-2xl font-black text-slate-800 dark:text-white">{documents.length}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600"><Type className="w-7 h-7" /></div>
                        <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Words</p><p className="text-2xl font-black text-slate-800 dark:text-white">{(documents.reduce((acc, doc) => acc + wordCount(doc.content), 0)).toLocaleString()}</p></div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600"><Clock className="w-7 h-7" /></div>
                        <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reading Time</p><p className="text-2xl font-black text-slate-800 dark:text-white">~{Math.ceil(documents.reduce((acc, doc) => acc + wordCount(doc.content), 0) / 200)}m</p></div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium" placeholder="Search masterpieces..." />
                    </div>
                </div>

                {viewMode === 'GRID' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {documents.map(doc => (
                            <div key={doc.id} onClick={() => setSelectedDocId(doc.id)} className="group bg-white dark:bg-slate-800 rounded-[40px] border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl transition-all cursor-pointer flex flex-col h-full border-b-[6px] border-b-slate-100 dark:border-b-slate-700 hover:border-b-indigo-500 transform hover:-translate-y-1">
                                {doc.imageUrl ? (
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={doc.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                        <div className="absolute bottom-4 left-6 flex gap-2">
                                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{wordCount(doc.content)} Words</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                        <FileText className="w-12 h-12 text-slate-300" />
                                    </div>
                                )}
                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Calendar className="w-3 h-3" /> {new Date(doc.createdAt).toLocaleDateString()}
                                        </div>
                                        <button onClick={(e) => handleDelete(doc.id, e)} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2">{doc.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed flex-1">
                                        {doc.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
                                    </p>
                                    <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-700">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">SEO Ready</span>
                                        </div>
                                        <div className="text-indigo-600 font-black text-xs flex items-center gap-1 uppercase tracking-widest">Open Editor <ArrowRight className="w-3 h-3" /></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Masterpiece</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Words</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Reading Time</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {documents.map(doc => (
                                    <tr key={doc.id} onClick={() => setSelectedDocId(doc.id)} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer group transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600"><FileText className="w-6 h-6" /></div>
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{doc.title}</div>
                                                    <div className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">{new Date(doc.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center font-black text-slate-500 dark:text-slate-400">{wordCount(doc.content)}</td>
                                        <td className="px-8 py-6 text-center font-black text-slate-500 dark:text-slate-400">{Math.ceil(wordCount(doc.content)/200)}m</td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={(e) => handleDelete(doc.id, e)} className="p-2 text-slate-300 hover:text-red-500 transition"><Trash2 className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // --- EDITOR VIEW (FOCUS MODE) ---
    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1.5 z-[110] bg-slate-100 dark:bg-slate-800">
                <div className="h-full bg-indigo-600 shadow-[0_0_10px_#6366f1] transition-all duration-150" style={{ width: `${readingProgress}%` }} />
            </div>

            <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    <button onClick={() => setSelectedDocId(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-all"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800"></div>
                    <div>
                        <input value={currentDoc?.title} onChange={(e) => onUpdate(currentDoc!.id, { title: e.target.value })} className="bg-transparent border-none outline-none font-black text-xl text-slate-800 dark:text-white w-96 truncate" />
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-500" /> {Math.ceil(wordCount(editorContent)/200)}m Read</span>
                            <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-emerald-500" /> {wordCount(editorContent)} Words</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-slate-100 dark:bg-slate-800 px-6 py-2.5 rounded-xl font-black text-xs text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2 transition hover:bg-slate-200">
                            <Download className="w-4 h-4" /> Export Masterpiece
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[120] animate-in fade-in zoom-in-95">
                                {wpConfig?.url && (
                                    <button onClick={handlePublishToWP} disabled={isPublishing} className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 text-xs font-black uppercase text-slate-600 dark:text-slate-300 transition-colors">
                                        {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-blue-500" />}
                                        {isPublishing ? 'Publishing...' : 'Publish to WordPress'}
                                    </button>
                                )}
                                <button onClick={handleCopyHtml} className={`w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 text-xs font-black uppercase text-slate-600 dark:text-slate-300 transition-colors ${copied ? 'text-emerald-500' : ''}`}>
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 text-indigo-500" />}
                                    {copied ? 'Copied Clean HTML!' : 'Copy Clean HTML'}
                                </button>
                                <button onClick={() => downloadFile('html')} className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 text-xs font-black uppercase text-slate-600 dark:text-slate-300 transition-colors"><Code className="w-4 h-4 text-indigo-500" /> Professional HTML File</button>
                                <button onClick={() => downloadFile('md')} className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 text-xs font-black uppercase text-slate-600 dark:text-slate-300 transition-colors"><Zap className="w-4 h-4 text-emerald-500" /> Markdown (.md)</button>
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                   <p className="text-[9px] font-black text-slate-400 uppercase leading-relaxed text-center">Format ready for WordPress, Webflow, and Medium.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Syncing...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <main ref={scrollContainerRef} className="flex-1 overflow-y-auto p-12 lg:p-20 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[60px] p-16 md:p-24 shadow-2xl border border-slate-100 dark:border-slate-800">
                        <style>{`
                            .master-canvas { font-family: 'Inter', sans-serif; }
                            .master-canvas h1 { font-size: 3.5rem; font-weight: 900; line-height: 1.1; margin-bottom: 2rem; color: #0f172a; }
                            .master-canvas h2 { font-size: 2.25rem; font-weight: 800; line-height: 1.2; margin-top: 4rem; margin-bottom: 1.5rem; color: #1e293b; border-bottom: 4px solid #f1f5f9; padding-bottom: 0.5rem; }
                            .master-canvas h3 { font-size: 1.75rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; color: #334155; }
                            .master-canvas p { font-size: 1.25rem; line-height: 2.1; margin-bottom: 2rem; color: #475569; }
                            .master-canvas table { width: 100%; border-collapse: collapse; margin: 3rem 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
                            .master-canvas th { background: #f8fafc; padding: 1.25rem; text-align: left; font-weight: 900; border-bottom: 3px solid #e2e8f0; }
                            .master-canvas td { padding: 1.25rem; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 1.1rem; }
                            .master-canvas blockquote { border-left: 8px solid #6366f1; background: #f5f7ff; padding: 3rem; margin: 3.5rem 0; font-style: italic; font-size: 1.5rem; color: #1e293b; border-radius: 0 32px 32px 0; }
                            .dark .master-canvas h1, .dark .master-canvas h2, .dark .master-canvas h3 { color: #f1f5f9; }
                            .dark .master-canvas h2 { border-color: #1e293b; }
                            .dark .master-canvas p, .dark .master-canvas td { color: #94a3b8; }
                            .dark .master-canvas th { background: #1e293b; border-color: #334155; }
                            .dark .master-canvas blockquote { background: #1e1b4b; color: #e2e8f0; }
                        `}</style>

                        {/* Metadata bar inside the canvas */}
                        <div className="flex gap-8 mb-16 pb-12 border-b border-slate-50 dark:border-slate-800">
                           <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Words</span><span className="text-2xl font-black text-slate-800 dark:text-white">{wordCount(editorContent)}</span></div>
                           <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Duration</span><span className="text-2xl font-black text-slate-800 dark:text-white">{Math.ceil(wordCount(editorContent)/200)}m</span></div>
                           <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Score</span><span className="text-2xl font-black text-emerald-500">92%</span></div>
                           <div className="flex flex-col ml-auto"><span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Visibility</span><span className="text-xs font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase">Public Ready</span></div>
                        </div>

                        <div
                            className="master-canvas outline-none"
                            contentEditable
                            onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
                            dangerouslySetInnerHTML={{ __html: currentDoc!.content }}
                            suppressContentEditableWarning
                        />
                    </div>
                </main>

                <aside className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                    <div className="p-1 flex bg-slate-100 dark:bg-slate-800 m-6 rounded-2xl">
                        <button onClick={() => setSidebarTab('SEO')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sidebarTab === 'SEO' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xl' : 'text-slate-400'}`}>SEO Intelligence</button>
                        <button onClick={() => setSidebarTab('AI')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${sidebarTab === 'AI' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xl' : 'text-slate-400'}`}>AI Co-Pilot</button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                        {sidebarTab === 'SEO' ? (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-600"><Target className="w-6 h-6" /></div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase text-emerald-700 tracking-widest">Global Rank</p>
                                            <p className="text-3xl font-black text-emerald-600">{seoScore}%</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-emerald-100 dark:bg-emerald-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${seoScore}%` }}></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Eye className="w-4 h-4" /> Visibility Checklist</h4>
                                    <div className="space-y-3">
                                        {['Primary Keyword in H1', 'Internal Links Present', 'Alt Text on Images', 'Mobile Optimized'].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center"><Check className="w-3 h-3 text-emerald-500" /></div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Stealth Humanizer Action */}
                                <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl shadow-emerald-500/20 text-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-white/20 rounded-xl"><Fingerprint className="w-5 h-5" /></div>
                                        <h4 className="font-black text-sm uppercase tracking-widest">Stealth Humanizer</h4>
                                    </div>
                                    <p className="text-[11px] text-emerald-50 font-medium mb-4 leading-relaxed">Apply High Perplexity and Burstiness to bypass AI detectors instantly.</p>
                                    <button
                                        onClick={handleHumanize}
                                        disabled={isHumanizing}
                                        className="w-full py-3 bg-white text-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-50 transition active:scale-95 disabled:opacity-50"
                                    >
                                        {isHumanizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                        {isHumanizing ? 'Humanizing...' : 'Humanize Content'}
                                    </button>
                                </div>

                                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
                                    <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-300 mb-2">Smart Commands</h4>
                                    <p className="text-xs text-indigo-600/70 mb-4 leading-relaxed">Let AI rewrite or expand your sections instantly.</p>
                                    <div className="space-y-2">
                                        {['Expand Paragraph', 'Rewrite Professionally', 'Generate FAQs', 'Summarize Content'].map((cmd, i) => (
                                            <button key={i} className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest text-indigo-600 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all text-left flex items-center justify-between group">
                                                {cmd}
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default DocumentEditor;
