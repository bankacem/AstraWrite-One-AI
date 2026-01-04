
import * as React from 'react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { GeneratedContent, WordPressConfig } from '../types';
import { continueWriting, generateSeoGuidelines, humanizeContent } from '../services/geminiService';
import DOMPurify from 'dompurify';
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
    wpConfig: WordPressConfig;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ history, onUpdate, onDelete, wpConfig }) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
    const [searchQuery, setSearchQuery] = useState('');
    const [readingProgress, setReadingProgress] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [editorContent, setEditorContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isHumanizing, setIsHumanizing] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const [seoTerms, setSeoTerms] = useState<{ term: string, targetCount: number }[]>([]);
    const [seoScore, setSeoScore] = useState(0);
    const [sidebarTab, setSidebarTab] = useState<'SEO' | 'AI'>('SEO');

    const documents = useMemo(() => {
        return history.filter(h => h.type === 'article' && h.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [history, searchQuery]);

    const currentDoc = useMemo(() => history.find(h => h.id === selectedDocId), [selectedDocId, history]);

    useEffect(() => {
        if (currentDoc) {
            setEditorContent(currentDoc.content);
            generateSeoGuidelines(currentDoc.title).then(setSeoTerms);
        } else {
            setSeoTerms([]);
            setSeoScore(0);
        }
    }, [currentDoc]);

    const wordCount = (text: string) => {
        const plainText = text.replace(/<[^>]*>?/gm, '');
        return plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
    };

    const handleSave = () => {
        if (!selectedDocId) return;
        setIsSaving(true);
        onUpdate(selectedDocId, { content: editorContent });
        setTimeout(() => setIsSaving(false), 800);
    };

    const handlePublishToWP = async () => {
        if (!currentDoc || !wpConfig) return;
        setIsPublishing(true);
        try {
            const link = await publishToWordPress(wpConfig, currentDoc.title, editorContent, currentDoc.imageUrl);
            window.open(link, '_blank');
        } catch (e: any) {
            alert(e.message || "WordPress publishing failed.");
        } finally {
            setIsPublishing(false);
        }
    };

    if (!selectedDocId) {
        return (
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                        <p className="text-slate-500 mt-1">Manage, edit, and publish your generated content.</p>
                    </div>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button onClick={() => setViewMode('GRID')} className={`px-3 py-1 text-sm font-bold rounded-md transition ${viewMode === 'GRID' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('TABLE')} className={`px-3 py-1 text-sm font-bold rounded-md transition ${viewMode === 'TABLE' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}><List className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                        <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group">
                            {doc.imageUrl && <img src={doc.imageUrl} alt={doc.title} className="h-40 w-full object-cover" />}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg mb-2 truncate">{doc.title}</h3>
                                <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(doc.content) }}></div>
                                <div className="mt-auto pt-4 flex justify-between items-center">
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <FileText className="w-3 h-3" /> {wordCount(doc.content)} words
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onDelete(doc.id)} className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-slate-500 hover:text-red-600 dark:hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                        <button onClick={() => setSelectedDocId(doc.id)} className="px-4 py-2 text-sm font-bold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition">Edit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedDocId(null)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                        <h2 className="font-bold text-lg">{currentDoc?.title || "Document"}</h2>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span><FileText className="w-3 h-3 inline-block mr-1" />{wordCount(editorContent)} words</span>
                            <span><Clock className="w-3 h-3 inline-block mr-1" /> Reading time: {Math.ceil(wordCount(editorContent) / 200)} min</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50">
                        {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save</>}
                    </button>
                    <button onClick={handlePublishToWP} disabled={isPublishing} className="px-4 py-2 text-sm font-bold bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50">
                        {isPublishing ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</> : <><Globe className="w-4 h-4" />Publish</>}
                    </button>
                </div>
            </header>
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-auto p-8" ref={scrollContainerRef}>
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
                        className="prose prose-slate dark:prose-invert max-w-none focus:outline-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentDoc?.content || "") }}
                    />
                </div>
                <aside className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 overflow-auto">
                    <div>
                        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4">
                            <button onClick={() => setSidebarTab('SEO')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition text-center ${sidebarTab === 'SEO' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>SEO</button>
                            <button onClick={() => setSidebarTab('AI')} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition text-center ${sidebarTab === 'AI' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>AI Tools</button>
                        </div>

                        {sidebarTab === 'AI' && (
                             <div className="space-y-4">
                                <button onClick={() => humanizeContent(editorContent).then(setEditorContent)} disabled={isHumanizing} className="w-full px-4 py-2 text-sm font-bold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                     {isHumanizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Humanize
                                 </button>
                                 <button onClick={() => continueWriting(editorContent).then(c => setEditorContent(editorContent + c))} className="w-full px-4 py-2 text-sm font-bold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition flex items-center justify-center gap-2">
                                     <ArrowRight className="w-4 h-4" /> Continue Writing
                                 </button>
                             </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default DocumentEditor;
