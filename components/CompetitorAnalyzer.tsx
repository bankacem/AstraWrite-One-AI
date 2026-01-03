
import React, { useState } from 'react';
import { analyzeCompetitors, generateKeywordMetrics } from '../services/geminiService';
import { KeywordMetrics } from '../types';
import { Target, Search, BarChart3, ArrowRight, Loader2, CheckCircle, XCircle, Layout, Image as ImageIcon, Type, TrendingUp, DollarSign, Activity } from 'lucide-react';

const CompetitorAnalyzer: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [userContent, setUserContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [metrics, setMetrics] = useState<KeywordMetrics | null>(null);

  const handleAnalyze = async () => {
    if (!keyword) return;
    setIsAnalyzing(true);
    setMetrics(null); // Reset metrics on new search
    setResult(null);

    try {
      // Execute both requests in parallel for speed
      const [competitorData, keywordData] = await Promise.all([
         analyzeCompetitors(keyword, userContent),
         generateKeywordMetrics(keyword)
      ]);

      setResult(competitorData);
      setMetrics(keywordData);
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const myWordCount = userContent.trim().split(/\s+/).filter(w => w.length > 0).length;

  const getDifficultyColor = (score: number) => {
      if (score < 40) return 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
      if (score < 70) return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
       {/* Header */}
       <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Competitor Gap Analysis</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Scientifically engineer your content to rank by analyzing the top 3 competitors.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Keyword</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            type="text"
                            placeholder="e.g. Sustainable Fashion Trends"
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
                </div>
                <div className="flex items-end">
                     <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !keyword}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2
                            ${isAnalyzing || !keyword
                                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                        {isAnalyzing ? 'Analyzing SERPs...' : 'Start Gap Analysis'}
                    </button>
                </div>
            </div>

            <div className="mt-4">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">My Content (Optional)</label>
                 <textarea
                    value={userContent}
                    onChange={(e) => setUserContent(e.target.value)}
                    className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none text-sm"
                    placeholder="Paste your current draft here to benchmark it against competitors..."
                 />
            </div>
       </div>

       {/* Metrics Bar */}
       {metrics && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                   <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold mb-1">
                       <Search className="w-3 h-3" /> Volume
                   </div>
                   <div className="text-2xl font-black text-slate-800 dark:text-white">{metrics.volume}</div>
                   <div className="text-xs text-slate-400">Monthly Searches</div>
               </div>
               <div className={`p-4 rounded-xl border shadow-sm flex flex-col justify-center ${getDifficultyColor(metrics.difficulty)}`}>
                   <div className="flex items-center gap-2 text-inherit opacity-80 text-xs uppercase font-bold mb-1">
                       <Activity className="w-3 h-3" /> Difficulty
                   </div>
                   <div className="text-2xl font-black">{metrics.difficulty}/100</div>
                   <div className="text-xs opacity-80">{metrics.competition} Competition</div>
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                   <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold mb-1">
                       <DollarSign className="w-3 h-3" /> CPC
                   </div>
                   <div className="text-2xl font-black text-slate-800 dark:text-white">{metrics.cpc}</div>
                   <div className="text-xs text-slate-400">Cost Per Click</div>
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
                   <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-bold mb-1">
                       <TrendingUp className="w-3 h-3" /> Intent
                   </div>
                   <div className="text-lg font-bold text-slate-800 dark:text-white truncate" title={metrics.intent}>{metrics.intent}</div>
                   <div className="text-xs text-slate-400">Search Context</div>
               </div>
           </div>
       )}

       {/* Results */}
       {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Main Stats */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                     {/* Word Count Card */}
                     <div className={`p-6 rounded-xl border-l-4 shadow-sm bg-white dark:bg-slate-800 ${myWordCount >= result.avgWordCount ? 'border-emerald-500' : 'border-red-500'}`}>
                         <div className="flex items-center gap-3 mb-2">
                             <Type className="w-5 h-5 text-slate-400" />
                             <h3 className="font-bold text-slate-700 dark:text-slate-200">Word Count</h3>
                         </div>
                         <div className="flex items-baseline gap-2">
                             <span className="text-3xl font-black text-slate-800 dark:text-white">{myWordCount}</span>
                             <span className="text-sm text-slate-500">/ {result.avgWordCount} avg</span>
                         </div>
                         <p className="text-xs mt-2 text-slate-500">
                             {myWordCount >= result.avgWordCount
                                ? "Great! Your length is competitive."
                                : `You need ~${result.avgWordCount - myWordCount} more words.`}
                         </p>
                     </div>

                     {/* Image Count Card */}
                     <div className="p-6 rounded-xl border-l-4 border-indigo-500 shadow-sm bg-white dark:bg-slate-800">
                         <div className="flex items-center gap-3 mb-2">
                             <ImageIcon className="w-5 h-5 text-slate-400" />
                             <h3 className="font-bold text-slate-700 dark:text-slate-200">Media Count</h3>
                         </div>
                         <div className="flex items-baseline gap-2">
                             <span className="text-3xl font-black text-slate-800 dark:text-white">?</span>
                             <span className="text-sm text-slate-500">/ {result.avgImageCount} avg</span>
                         </div>
                         <p className="text-xs mt-2 text-slate-500">Top articles use around {result.avgImageCount} images.</p>
                     </div>
                </div>

                {/* Common Keywords / NLP Terms */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Competitor Keywords</h3>
                    <p className="text-sm text-slate-500 mb-4">Terms that appear frequently in top ranking pages. You should try to include these.</p>
                    <div className="flex flex-wrap gap-2">
                        {result.commonKeywords.map((kw: string, i: number) => {
                            const isPresent = userContent.toLowerCase().includes(kw.toLowerCase());
                            return (
                                <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-2
                                    ${isPresent
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                                    }`}>
                                    {kw}
                                    {isPresent ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3 opacity-50" />}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Missing Topics */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Content Gaps</h3>
                    <ul className="space-y-3">
                        {result.missingTopics.map((topic: string, i: number) => (
                            <li key={i} className="flex gap-3 text-sm p-3 bg-red-50 dark:bg-red-900/10 rounded-lg text-slate-700 dark:text-slate-300">
                                <span className="font-bold text-red-500 shrink-0">Missing:</span>
                                {topic}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Sidebar: Competitors & Advice */}
            <div className="space-y-6">
                 {/* Advice */}
                 <div className="bg-indigo-600 p-6 rounded-xl shadow-lg text-white">
                     <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        AI Recommendation
                     </h3>
                     <p className="text-indigo-100 text-sm leading-relaxed">
                         {result.actionableAdvice}
                     </p>
                 </div>

                 {/* Competitor List */}
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                     <h3 className="font-bold text-slate-800 dark:text-white mb-4">Top 3 Competitors</h3>
                     <div className="space-y-4">
                         {result.topCompetitors.map((comp: any, i: number) => (
                             <div key={i} className="group">
                                 <div className="flex items-start gap-3">
                                     <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-bold text-slate-500">#{i+1}</span>
                                     <div className="flex-1 min-w-0">
                                         <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition">{comp.title}</p>
                                         <p className="text-xs text-slate-400 truncate">{comp.url}</p>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
       )}
    </div>
  );
};

export default CompetitorAnalyzer;
