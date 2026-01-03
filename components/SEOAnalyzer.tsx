
import * as React from 'react';
import { useState } from 'react';
import { generateSEOAnalysis, generateKeywordMetrics, optimizeContentWithKeywords, generateMetaTags, performDeepKeywordResearch, generateBulkKeywordMetrics, generateFAQAnswers } from '../services/geminiService';
import { Search, Activity, BarChart2, Loader2, CheckCircle, AlertCircle, FileText, TrendingUp, DollarSign, Filter, ChevronDown, PlusCircle, Sparkles, Tag, Check, Copy, Download, X, Globe, Database, FileSpreadsheet, HelpCircle, MessageCircleQuestion, List, Code, FileJson } from 'lucide-react';
import { KeywordMetrics } from '../types';

interface MissingKeyword {
    term: string;
    volume: string;
    difficulty: number;
    cpc?: string;
    competition?: string;
}

const SEOAnalyzer: React.FC = () => {
  const [content, setContent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [inputMode, setInputMode] = useState<'SINGLE' | 'BULK'>('SINGLE');

  const [analysis, setAnalysis] = useState<any>(null);
  const [metrics, setMetrics] = useState<KeywordMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isDeepResearching, setIsDeepResearching] = useState(false);
  const [metaTags, setMetaTags] = useState<{title: string, description: string} | null>(null);

  // State for Saved Keywords
  const [savedKeywords, setSavedKeywords] = useState<MissingKeyword[]>([]);

  // Extra state for GKP Mode results
  const [gkpKeywords, setGkpKeywords] = useState<MissingKeyword[]>([]);
  const [gkpQuestions, setGkpQuestions] = useState<string[]>([]);
  const [isGKPMode, setIsGKPMode] = useState(false);

  // FAQ Schema State
  const [faqData, setFaqData] = useState<{question: string, answer: string}[] | null>(null);
  const [isGeneratingFAQ, setIsGeneratingFAQ] = useState(false);

  const [error, setError] = useState('');

  const [keywordFilter, setKeywordFilter] = useState<'ALL' | 'EASY' | 'HIGH_VOL'>('ALL');

  const handleAnalyze = async () => {
    if (!content && !keyword) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setMetrics(null);
    setMetaTags(null);
    setSavedKeywords([]); // Reset saved on new analysis
    setGkpKeywords([]);
    setGkpQuestions([]);
    setIsGKPMode(false);
    setFaqData(null);
    setError('');

    try {
      // Normal Analysis
      const promises: any[] = [];

      if (content && keyword) {
         promises.push(generateSEOAnalysis(content, keyword));
      } else {
         promises.push(Promise.resolve(null));
      }

      if (keyword) {
          promises.push(generateKeywordMetrics(keyword));
      } else {
          promises.push(Promise.resolve(null));
      }

      const [analysisResult, metricsResult] = await Promise.all(promises);
      setAnalysis(analysisResult);
      setMetrics(metricsResult);
    } catch (error) {
      setError("Error during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeepKeywordResearch = async () => {
      if (!keyword) return;
      setIsDeepResearching(true);
      setIsGKPMode(true);
      setGkpKeywords([]);
      setGkpQuestions([]);
      setFaqData(null);

      try {
          // Fetch from "Keyword Planner" Service
          const results = await performDeepKeywordResearch(keyword);
          setGkpKeywords(results.keywords);
          setGkpQuestions(results.questions);
          // Also fetch top level metrics
          if (!metrics) {
              const m = await generateKeywordMetrics(keyword);
              setMetrics(m);
          }
      } catch (e) {
          console.error(e);
          setError("Failed to fetch Keyword Planner data.");
      } finally {
          setIsDeepResearching(false);
      }
  }

  const handleBulkMetrics = async () => {
      if (!bulkKeywords.trim()) return;
      setIsDeepResearching(true);
      setIsGKPMode(true); // Re-use GKP table mode
      setGkpKeywords([]);
      setGkpQuestions([]);
      setError('');

      try {
          const list = bulkKeywords.split('\n').map(k => k.trim()).filter(k => k.length > 0);
          if (list.length === 0) return;

          const results = await generateBulkKeywordMetrics(list);
          setGkpKeywords(results);
      } catch (e) {
          console.error(e);
          setError("Failed to generate bulk metrics.");
      } finally {
          setIsDeepResearching(false);
      }
  }

  const handleAutoOptimize = async () => {
    if (!content || !analysis?.missingKeywords) return;
    setIsOptimizing(true);
    try {
        const optimizedText = await optimizeContentWithKeywords(content, analysis.missingKeywords);
        if (optimizedText) {
            setContent(optimizedText);
            // Re-run analysis automatically to show improved score
            const newAnalysis = await generateSEOAnalysis(optimizedText, keyword);
            setAnalysis(newAnalysis);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsOptimizing(false);
    }
  };

  const handleGenerateMeta = async () => {
    if (!content || !keyword) return;
    setIsGeneratingMeta(true);
    try {
        const tags = await generateMetaTags(content, keyword);
        setMetaTags(tags);
    } catch (e) {
        console.error(e);
    } finally {
        setIsGeneratingMeta(false);
    }
  };

  const handleGenerateFAQ = async () => {
      if (gkpQuestions.length === 0) return;
      setIsGeneratingFAQ(true);
      try {
          const answers = await generateFAQAnswers(gkpQuestions);
          setFaqData(answers);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingFAQ(false);
      }
  };

  // Helper to generate schema string
  const generateSchemaString = (faqs: {question: string, answer: string}[]) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.answer
            }
        }))
    };
    return JSON.stringify(schema, null, 2);
  };

  // Toggle Save Keyword
  const toggleSaveKeyword = (kw: MissingKeyword) => {
      const exists = savedKeywords.find(k => k.term === kw.term);
      if (exists) {
          setSavedKeywords(prev => prev.filter(k => k.term !== kw.term));
      } else {
          setSavedKeywords(prev => [...prev, kw]);
      }
  };

  // Create actions
  const copySavedKeywords = () => {
      const text = savedKeywords.map(k => k.term).join(', ');
      navigator.clipboard.writeText(text);
      alert(`${savedKeywords.length} keywords copied to clipboard!`);
  };

  const downloadSavedKeywords = () => {
      const csvContent = "data:text/csv;charset=utf-8,Keyword,Volume,Difficulty,CPC,Competition\n" +
        savedKeywords.map(k => `"${k.term}","${k.volume}",${k.difficulty},"${k.cpc || ''}","${k.competition || ''}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "selected_keywords.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // Determine which list to show
  const activeKeywordList = isGKPMode ? gkpKeywords : (analysis?.missingKeywords || []);

  const handleExportAll = () => {
      if (activeKeywordList.length === 0) return;

      const csvContent = "data:text/csv;charset=utf-8,Keyword,Volume,Difficulty,CPC,Competition\n" +
        activeKeywordList.map(k => `"${k.term}","${k.volume}",${k.difficulty},"${k.cpc || ''}","${k.competition || ''}"`).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `all_keywords_${keyword.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreStroke = (score: number) => {
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 60) return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  const getDifficultyColor = (score: number) => {
    if (score < 30) return 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
    if (score < 60) return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  const getDifficultyLabel = (score: number) => {
      if (score < 15) return 'Easy';
      if (score < 30) return 'Medium';
      if (score < 60) return 'Hard';
      return 'Super Hard';
  };

  const filteredKeywords = activeKeywordList.filter((kw: MissingKeyword) => {
      if (keywordFilter === 'EASY') return kw.difficulty <= 30;
      if (keywordFilter === 'HIGH_VOL') {
          // Rudimentary check for 'K' or 'M'
          return kw.volume.includes('K') || kw.volume.includes('M');
      }
      return true;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto pb-20 items-start relative">
      {/* Input Section - Sticky on large screens */}
      <div className="flex flex-col gap-4 xl:sticky xl:top-0">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <Search className="w-5 h-5 text-indigo-500" />
            Content & Keyword Audit
          </h2>

          {/* Mode Switcher */}
          <div className="flex gap-4 mb-4 border-b border-slate-100 dark:border-slate-700">
             <button
                 onClick={() => setInputMode('SINGLE')}
                 className={`text-sm font-medium pb-2 border-b-2 transition flex items-center gap-2 ${inputMode === 'SINGLE' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
             >
                 <Activity className="w-4 h-4" />
                 Single Audit
             </button>
             <button
                 onClick={() => setInputMode('BULK')}
                 className={`text-sm font-medium pb-2 border-b-2 transition flex items-center gap-2 ${inputMode === 'BULK' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
             >
                 <List className="w-4 h-4" />
                 Bulk Metrics
             </button>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            {inputMode === 'SINGLE' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Target Keyword</label>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-bold"
                            placeholder="e.g. digital marketing strategies"
                        />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Article Content / Draft (Optional)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm min-h-[200px]"
                            placeholder="Paste your content here to analyze against metrics. Leave empty to just do Keyword Research."
                        />
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Enter Keywords (One per line)</label>
                    <textarea
                        value={bulkKeywords}
                        onChange={(e) => setBulkKeywords(e.target.value)}
                        className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm min-h-[300px] font-mono"
                        placeholder={`seo tools\nkeyword research\ncontent marketing`}
                    />
                     <p className="text-xs text-slate-500 mt-2">Get Search Volume, KD, and CPC for up to 50 keywords at once.</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-2">
                {inputMode === 'SINGLE' ? (
                    <>
                        <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || (!content && !keyword)}
                        className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
                            ${isAnalyzing || (!content && !keyword)
                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                            }`}
                        >
                        {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Activity className="w-5 h-5" />}
                        Quick Audit
                        </button>

                        <button
                            onClick={handleAutoOptimize}
                            disabled={isOptimizing || !analysis}
                            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
                                ${isOptimizing || !analysis
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/20'
                                }
                            `}
                        >
                            {isOptimizing ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                            Auto-Optimize
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleBulkMetrics}
                        disabled={isDeepResearching || !bulkKeywords}
                        className={`w-full col-span-2 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all
                            ${isDeepResearching || !bulkKeywords
                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
                            }`}
                        >
                        {isDeepResearching ? <Loader2 className="animate-spin w-5 h-5" /> : <Database className="w-5 h-5" />}
                        Fetch Bulk Metrics
                    </button>
                )}
            </div>

            {/* Google Keyword Planner Mode - Only for Single */}
            {inputMode === 'SINGLE' && (
                <button
                    onClick={handleDeepKeywordResearch}
                    disabled={isDeepResearching || !keyword}
                    className="w-full py-3 rounded-xl font-bold border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition"
                >
                    {isDeepResearching ? <Loader2 className="animate-spin w-5 h-5" /> : <Globe className="w-5 h-5" />}
                    Run Deep Keyword Research (GKP Mode)
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Section - Expands naturally */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px]">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            {isGKPMode ? 'Keyword Research / Metrics' : 'Content Audit'}
            </h2>

            {/* Generate Meta Button */}
            {analysis && !isGKPMode && (
                <button
                    onClick={handleGenerateMeta}
                    disabled={isGeneratingMeta}
                    className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                >
                    {isGeneratingMeta ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
                    Generate Meta Tags
                </button>
            )}
        </div>

        {isAnalyzing || isDeepResearching ? (
           <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-pulse">
              <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 font-medium text-slate-500">
                  {isDeepResearching ? 'Fetching Keyword Metrics...' : 'Analyzing Content & Keywords...'}
              </p>
           </div>
        ) : (analysis || gkpKeywords.length > 0) ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

             {/* SERP PREVIEW / META TAGS RESULT */}
             {metaTags && (
                 <div className="bg-white border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">SERP Preview</h3>
                     <div className="mb-4">
                         <div className="text-sm text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                            <span className="text-xs text-slate-500">example.com › blog › ...</span>
                         </div>
                         <h4 className="text-xl text-blue-700 dark:text-blue-400 hover:underline cursor-pointer mb-1 line-clamp-1">{metaTags.title}</h4>
                         <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{metaTags.description}</p>
                     </div>
                 </div>
             )}

             {/* Ahrefs Style Metric Banner - Only show if metrics exist and we are in Single mode or have results */}
             {metrics && inputMode === 'SINGLE' && (
               <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{metrics.intent}</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Live Data</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Keyword Difficulty */}
                        <div className="relative">
                             <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">Keyword Difficulty <span className="w-3 h-3 rounded-full bg-slate-300 text-[8px] flex items-center justify-center text-white">?</span></p>
                             <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-sm bg-white dark:bg-slate-800 ${getDifficultyColor(metrics.difficulty).replace('bg-', 'border-').split(' ')[2]}`}>
                                    {metrics.difficulty}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{getDifficultyLabel(metrics.difficulty)}</p>
                                    <p className="text-xs text-slate-400">To rank in top 10</p>
                                </div>
                             </div>
                        </div>

                        {/* Volume */}
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Volume</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-slate-800 dark:text-white">{metrics.volume}</span>
                                <span className="text-xs text-slate-400">/mo</span>
                            </div>
                            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 mt-2 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-3/4"></div>
                            </div>
                        </div>

                        {/* CPC */}
                        <div>
                             <p className="text-xs font-bold text-slate-500 uppercase mb-2">CPC</p>
                             <div className="text-2xl font-black text-slate-800 dark:text-white">{metrics.cpc}</div>
                             <p className="text-xs text-slate-400">Cost Per Click</p>
                        </div>

                         {/* Score (Mini) */}
                        <div className="opacity-80">
                             <p className="text-xs font-bold text-slate-500 uppercase mb-2">Content Score</p>
                             <div className={`text-2xl font-black ${analysis ? getScoreColor(analysis.score) : 'text-slate-400'}`}>
                                 {analysis ? analysis.score : '--'}
                                 <span className="text-sm font-normal text-slate-400">/100</span>
                             </div>
                             <p className="text-xs text-slate-400">Optimization Level</p>
                        </div>
                    </div>
               </div>
             )}

             {/* People Also Ask (Questions) Section - Show only if we have questions (GKP Mode) */}
             {isGKPMode && gkpQuestions.length > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                            <MessageCircleQuestion className="w-5 h-5 text-indigo-500" />
                            People Also Ask
                        </h3>
                         <div className="flex gap-2">
                            <button
                                onClick={handleGenerateFAQ}
                                disabled={isGeneratingFAQ}
                                className="text-xs flex items-center gap-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 px-3 py-1.5 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-50 transition"
                            >
                                {isGeneratingFAQ ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileJson className="w-3 h-3" />}
                                Generate FAQ Schema
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(gkpQuestions.join('\n'));
                                    alert("Questions copied to clipboard!");
                                }}
                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                            >
                                <Copy className="w-3 h-3" /> Copy All
                            </button>
                         </div>
                    </div>
                    <p className="text-xs text-indigo-600/80 mb-4 -mt-2">Google users often search for these questions. Answer them to target Featured Snippets.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {gkpQuestions.map((q, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-lg text-sm border border-indigo-100 dark:border-indigo-900/50 shadow-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-indigo-400 font-bold select-none">•</span>
                                {q}
                            </div>
                        ))}
                    </div>

                    {/* Generated FAQ Content Area */}
                    {faqData && (
                        <div className="mt-6 border-t border-indigo-100 dark:border-indigo-800 pt-6 animate-in fade-in">
                            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                                <Code className="w-4 h-4" /> Generated FAQ Content & Schema
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Visual Preview */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold uppercase text-slate-500">HTML Content</span>
                                        <button
                                            onClick={() => {
                                                const html = faqData.map(f => `<h3>${f.question}</h3><p>${f.answer}</p>`).join('\n');
                                                navigator.clipboard.writeText(html);
                                                alert("HTML copied!");
                                            }}
                                            className="text-xs text-indigo-600 font-bold hover:underline"
                                        >
                                            Copy HTML
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                        {faqData.map((item, i) => (
                                            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">{item.question}</p>
                                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{item.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* JSON-LD Schema */}
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase text-slate-500">JSON-LD Schema</span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(generateSchemaString(faqData));
                                                alert("Schema copied!");
                                            }}
                                            className="text-xs text-indigo-600 font-bold hover:underline"
                                        >
                                            Copy Code
                                        </button>
                                    </div>
                                    <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-[10px] overflow-auto h-64 font-mono custom-scrollbar border border-slate-800">
                                        {generateSchemaString(faqData)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
             )}

             {analysis && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Score Section */}
                    <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">On-Page SEO Score</p>
                            <div className={`text-4xl font-black ${getScoreColor(analysis.score)}`}>
                                {analysis.score}
                                <span className="text-base text-slate-400 font-normal">/100</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 font-medium">{analysis.readabilityLevel}</p>
                        </div>
                        <div className="w-20 h-20 relative flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path
                                    stroke={getScoreStroke(analysis.score)}
                                    strokeDasharray={`${analysis.score}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Density Section */}
                    <div className="p-6 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2 uppercase tracking-wide mb-2">
                            <FileText className="w-4 h-4" /> Keyword Density
                        </h3>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                            {analysis.keywordDensity}
                        </div>
                        <p className="text-xs text-slate-500">Recommended range is 1.0% - 2.0% for the main keyword.</p>
                    </div>
                 </div>
             )}

             {/* Keyword Opportunities Table (Ahrefs style) */}
             <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                 <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                     <div className="flex items-center gap-2 flex-wrap">
                         <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 whitespace-nowrap">
                             <TrendingUp className="w-4 h-4 text-emerald-500" />
                             {isGKPMode ? `Keyword Data (${gkpKeywords.length})` : 'Keyword Opportunities'}
                         </h3>
                         {isGKPMode && (
                             <p className="text-xs text-indigo-500 flex items-center gap-1 border-l pl-2 border-slate-300 dark:border-slate-700">
                                 <Database className="w-3 h-3" /> Powered by AI Estimation
                             </p>
                         )}
                     </div>

                     {/* Filters & Export */}
                     <div className="flex flex-wrap items-center gap-2">
                         <button
                            onClick={() => setKeywordFilter('ALL')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${keywordFilter === 'ALL' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                         >
                             All Keywords
                         </button>
                         <button
                            onClick={() => setKeywordFilter('EASY')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${keywordFilter === 'EASY' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                         >
                             KD &lt; 30
                         </button>
                         <button
                            onClick={() => setKeywordFilter('HIGH_VOL')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${keywordFilter === 'HIGH_VOL' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}
                         >
                             Volume &gt; 1K
                         </button>

                         {/* EXPORT ALL BUTTON */}
                         <button
                            onClick={handleExportAll}
                            disabled={activeKeywordList.length === 0}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors flex items-center gap-2 ml-2
                                ${activeKeywordList.length === 0
                                    ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'}`}
                            title="Export all keywords to CSV"
                         >
                             <FileSpreadsheet className="w-3 h-3" /> Export All ({activeKeywordList.length})
                         </button>
                     </div>
                 </div>

                 <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                     <table className="w-full text-left text-sm relative">
                         <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10">
                             <tr>
                                 <th className="px-4 py-3 bg-slate-50 dark:bg-slate-800">Keyword</th>
                                 <th className="px-4 py-3 w-24 bg-slate-50 dark:bg-slate-800">KD</th>
                                 <th className="px-4 py-3 w-32 bg-slate-50 dark:bg-slate-800">Volume</th>
                                 {isGKPMode && <th className="px-4 py-3 w-32 bg-slate-50 dark:bg-slate-800">CPC</th>}
                                 {isGKPMode && <th className="px-4 py-3 w-32 bg-slate-50 dark:bg-slate-800">Comp.</th>}
                                 <th className="px-4 py-3 w-24 text-center bg-slate-50 dark:bg-slate-800">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                             {filteredKeywords.map((kw: MissingKeyword, i: number) => {
                                 const isSaved = savedKeywords.some(k => k.term === kw.term);
                                 return (
                                     <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${isSaved ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                                         <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                                             {kw.term}
                                         </td>
                                         <td className="px-4 py-3">
                                             <span className={`inline-block w-8 text-center py-0.5 rounded text-[10px] font-bold ${getDifficultyColor(kw.difficulty)}`}>
                                                 {kw.difficulty}
                                             </span>
                                         </td>
                                         <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                             {kw.volume}
                                         </td>
                                         {isGKPMode && (
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                                {kw.cpc || '-'}
                                            </td>
                                         )}
                                          {isGKPMode && (
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs">
                                                {kw.competition || '-'}
                                            </td>
                                         )}
                                         <td className="px-4 py-3 text-center">
                                             <button
                                                onClick={() => toggleSaveKeyword(kw)}
                                                className={`transition-colors ${isSaved ? 'text-emerald-500 hover:text-red-500' : 'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300'}`}
                                             >
                                                 {isSaved ? <CheckCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                             </button>
                                         </td>
                                     </tr>
                                 );
                             })}
                             {filteredKeywords.length === 0 && (
                                 <tr>
                                     <td colSpan={isGKPMode ? 6 : 4} className="px-4 py-8 text-center text-slate-400 italic">
                                         No keywords match the selected filter.
                                     </td>
                                 </tr>
                             )}
                         </tbody>
                     </table>
                 </div>
             </div>

             {/* Actionable Tips Grid */}
             {analysis && (
                 <div>
                    <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wide">
                        <AlertCircle className="w-4 h-4 text-orange-500" /> Optimization Checklist
                    </h3>
                    <ul className="space-y-3">
                        {analysis.actionableTips.map((tip: string, i: number) => (
                            <li key={i} className="flex gap-3 text-sm p-4 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0">{i+1}</span>
                                <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{tip}</span>
                            </li>
                        ))}
                    </ul>
                 </div>
             )}

          </div>
        ) : error ? (
            <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-sm font-medium text-center border border-red-100 dark:border-red-900/30">{error}</div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 opacity-30" />
            </div>
            <p className="font-medium text-slate-500">Ready to audit or research</p>
            <p className="text-sm opacity-70">Enter a keyword and select "Quick Audit", "Deep Keyword Research" or "Bulk Metrics"</p>
          </div>
        )}
      </div>

      {/* Floating Action Bar for Saved Keywords */}
      {savedKeywords.length > 0 && (
          <div className="fixed bottom-6 right-6 lg:right-10 z-50 animate-in slide-in-from-bottom-6 duration-300">
              <div className="bg-slate-900 text-white p-2 rounded-xl shadow-2xl flex items-center gap-3 pr-2 border border-slate-700">
                  <div className="pl-4 pr-2 border-r border-slate-700">
                      <p className="text-xs text-slate-400 font-bold uppercase">Selection</p>
                      <p className="text-lg font-bold flex items-center gap-1">
                          {savedKeywords.length} <span className="text-xs font-normal text-slate-400">keywords</span>
                      </p>
                  </div>
                  <div className="flex items-center gap-1">
                      <button
                        onClick={copySavedKeywords}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition flex flex-col items-center gap-1 min-w-[60px]"
                        title="Copy to Clipboard"
                      >
                          <Copy className="w-4 h-4" />
                          <span className="text-[10px] font-medium">Copy</span>
                      </button>
                      <button
                         onClick={downloadSavedKeywords}
                         className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition flex flex-col items-center gap-1 min-w-[60px]"
                         title="Download CSV"
                      >
                          <Download className="w-4 h-4" />
                          <span className="text-[10px] font-medium">Export</span>
                      </button>
                      <button
                         onClick={() => setSavedKeywords([])}
                         className="p-2 hover:bg-red-900/50 rounded-lg text-slate-400 hover:text-red-400 transition ml-1"
                         title="Clear Selection"
                      >
                          <X className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SEOAnalyzer;
