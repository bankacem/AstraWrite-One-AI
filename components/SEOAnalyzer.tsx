
import * as React from 'react';
import { useState } from 'react';
import { generateSEOAnalysis, generateKeywordMetrics, optimizeContentWithKeywords, generateMetaTags, performDeepKeywordResearch, generateBulkKeywordMetrics, generateFAQAnswers } from '../services/geminiService';
import { Search, Activity, BarChart2, Loader2, List, Database } from 'lucide-react';
import { KeywordMetrics, Keyword } from '../types';
import MetricsBanner from './seo/MetricsBanner';
import KeywordTable from './seo/KeywordTable';
import ActionableTips from './seo/ActionableTips';
import PeopleAlsoAsk from './seo/PeopleAlsoAsk';
import FaqSchemaGenerator from './seo/FaqSchemaGenerator';

const SEOAnalyzer: React.FC = () => {
    const [content, setContent] = useState('');
    const [keyword, setKeyword] = useState('');
    const [bulkKeywords, setBulkKeywords] = useState('');
    const [inputMode, setInputMode] = useState<'SINGLE' | 'BULK'>('SINGLE');

    const [analysis, setAnalysis] = useState<any>(null);
    const [metrics, setMetrics] = useState<KeywordMetrics | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [isDeepResearching, setIsDeepResearching] = useState(false);
    const [gkpKeywords, setGkpKeywords] = useState<Keyword[]>([]);
    const [gkpQuestions, setGkpQuestions] = useState<string[]>([]);
    const [isGKPMode, setIsGKPMode] = useState(false);

    const [faqData, setFaqData] = useState<{question: string, answer: string}[] | null>(null);
    const [isGeneratingFAQ, setIsGeneratingFAQ] = useState(false);

    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!content && !keyword) return;
        setIsAnalyzing(true);
        setAnalysis(null);
        setMetrics(null);
        setGkpKeywords([]);
        setGkpQuestions([]);
        setIsGKPMode(false);
        setFaqData(null);
        setError('');

        try {
            const promises = [
                content && keyword ? generateSEOAnalysis(content, keyword) : Promise.resolve(null),
                keyword ? generateKeywordMetrics(keyword) : Promise.resolve(null)
            ];
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
        try {
            const results = await performDeepKeywordResearch(keyword);
            setGkpKeywords(results.keywords);
            setGkpQuestions(results.questions);
            if (!metrics) setMetrics(await generateKeywordMetrics(keyword));
        } catch (e) {
            setError("Failed to fetch Keyword Planner data.");
        } finally {
            setIsDeepResearching(false);
        }
    }

    const handleBulkMetrics = async () => {
        if (!bulkKeywords.trim()) return;
        setIsDeepResearching(true);
        setIsGKPMode(true);
        try {
            const list = bulkKeywords.split('\n').map(k => k.trim()).filter(Boolean);
            if (list.length > 0) setGkpKeywords(await generateBulkKeywordMetrics(list));
        } catch (e) {
            setError("Failed to generate bulk metrics.");
        } finally {
            setIsDeepResearching(false);
        }
    }

    const handleGenerateFAQ = async () => {
        if (gkpQuestions.length === 0) return;
        setIsGeneratingFAQ(true);
        try {
            setFaqData(await generateFAQAnswers(gkpQuestions));
        } catch (e) {
            setError("Failed to generate FAQ answers.");
        } finally {
            setIsGeneratingFAQ(false);
        }
    };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto pb-20 items-start relative">
      <div className="flex flex-col gap-4 xl:sticky xl:top-0">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
            <Search className="w-5 h-5 text-indigo-500" />
            Content & Keyword Audit
          </h2>

          <div className="flex gap-4 mb-4 border-b border-slate-100 dark:border-slate-700">
             <button onClick={() => setInputMode('SINGLE')} className={`text-sm font-medium pb-2 border-b-2 transition flex items-center gap-2 ${inputMode === 'SINGLE' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                 <Activity className="w-4 h-4" /> Single Audit
             </button>
             <button onClick={() => setInputMode('BULK')} className={`text-sm font-medium pb-2 border-b-2 transition flex items-center gap-2 ${inputMode === 'BULK' ? 'text-indigo-600 border-indigo-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                 <List className="w-4 h-4" /> Bulk Metrics
             </button>
          </div>

          <div className="space-y-4 flex-1 flex flex-col">
            {inputMode === 'SINGLE' ? (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Target Keyword</label>
                        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-bold" placeholder="e.g. digital marketing strategies" />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Article Content / Draft (Optional)</label>
                        <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm min-h-[200px]" placeholder="Paste your content here to analyze against metrics. Leave empty to just do Keyword Research." />
                    </div>
                    <button onClick={handleAnalyze} disabled={isAnalyzing || (!content && !keyword)} className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${isAnalyzing || (!content && !keyword) ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'}`}>
                        {isAnalyzing ? <Loader2 className="animate-spin w-5 h-5" /> : <Activity className="w-5 h-5" />} Quick Audit
                    </button>
                </>
            ) : (
                <div className="flex-1 flex flex-col">
                    <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Enter Keywords (One per line)</label>
                    <textarea value={bulkKeywords} onChange={(e) => setBulkKeywords(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm min-h-[300px] font-mono" placeholder={`seo tools\nkeyword research\ncontent marketing`} />
                    <button onClick={handleBulkMetrics} disabled={isDeepResearching || !bulkKeywords} className={`w-full col-span-2 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all mt-2 ${isDeepResearching || !bulkKeywords ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'}`}>
                        {isDeepResearching ? <Loader2 className="animate-spin w-5 h-5" /> : <Database className="w-5 h-5" />} Fetch Bulk Metrics
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px]">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white mb-4">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          {isGKPMode ? 'Keyword Research / Metrics' : 'Content Audit'}
        </h2>

        {isAnalyzing || isDeepResearching ? (
           <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-pulse">
              <Loader2 className="w-16 h-16 text-indigo-300 animate-spin" />
              <p className="mt-4 font-medium text-slate-500">{isDeepResearching ? 'Fetching Keyword Metrics...' : 'Analyzing Content & Keywords...'}</p>
           </div>
        ) : error ? (
            <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-sm font-medium text-center border border-red-100 dark:border-red-900/30">{error}</div>
        ) : (analysis || gkpKeywords.length > 0) ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {metrics && inputMode === 'SINGLE' && <MetricsBanner metrics={metrics} analysis={analysis} />}
             {isGKPMode && gkpQuestions.length > 0 && <PeopleAlsoAsk questions={gkpQuestions} onGenerateFAQ={handleGenerateFAQ} isGeneratingFAQ={isGeneratingFAQ} />}
             {faqData && <FaqSchemaGenerator faqData={faqData} />}
             {analysis && <ActionableTips tips={analysis.actionableTips} />}
             {(analysis?.missingKeywords || gkpKeywords.length > 0) && <KeywordTable keywords={isGKPMode ? gkpKeywords : analysis.missingKeywords} savedKeywords={[]} onToggleSave={() => {}} isGKPMode={isGKPMode} />}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
            <Search className="w-20 h-20 text-slate-200" />
            <p className="font-medium text-slate-500">Ready to audit or research</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOAnalyzer;
