
import * as React from 'react';
import { useState } from 'react';
import { analyzeSuperPageStructure, generateArticleStream } from '../services/geminiService';
import { GeneratedContent, ArticleConfig } from '../types';
import { Layout, Search, Target, CheckCircle2, ChevronRight, Wand2, Loader2, ArrowLeft, GripVertical, Plus } from 'lucide-react';

interface SuperPageGeneratorProps {
  onSave: (content: GeneratedContent) => void;
  onUpdate: (id: string, content: Partial<GeneratedContent>) => void;
}

interface OutlineItem {
    type: 'h2' | 'h3';
    heading: string;
    intent: string;
}

const SuperPageGenerator: React.FC<SuperPageGeneratorProps> = ({ onSave, onUpdate }) => {
  const [step, setStep] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [structure, setStructure] = useState<OutlineItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAnalyze = async () => {
      if (!keyword) return;
      setIsAnalyzing(true);
      try {
          const result = await analyzeSuperPageStructure(keyword, competitorUrl);
          if (result) {
              setBlueprint(result);
              setStructure(result.structure || []);
              setStep(2);
          }
      } catch (e) {
          console.error(e);
          alert("Analysis failed. Please try again.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleGenerate = async () => {
      if (!blueprint) return;
      setIsGenerating(true);

      const newId = Date.now().toString();
      const title = blueprint.winningTitle || keyword;

      // 1. Save Initial Placeholder
      onSave({
          id: newId,
          title: title,
          content: '',
          type: 'article',
          createdAt: Date.now(),
          status: 'generating',
          progress: 0,
          metadata: { type: 'Super Page' }
      });

      // 2. Build Instructions based on structure
      const outlineText = structure.map(s => `${s.type.toUpperCase()}: ${s.heading} (Context: ${s.intent})`).join('\n');
      const conversionInstruction = blueprint.conversionPoints?.join(', ') || '';

      const config: ArticleConfig = {
          mainKeyword: keyword,
          title: title,
          language: 'English (US)',
          articleSize: 'Large',
          tone: 'Authoritative',
          pointOfView: 'Third Person',
          targetCountry: 'United States',
          articleType: 'Guide',
          aiModel: 'Gemini 2.5 Flash',
          readability: 'University',
          aiContentCleaning: 'Standard Removal',
          humanize: false,
          detailsToInclude: `FOLLOW THIS OUTLINE STRICTLY:\n${outlineText}\n\nCONVERSION ELEMENTS TO INCLUDE: ${conversionInstruction}`,
          includeImages: true,
          imageStyle: 'Cinematic',
          imagesCount: 2,
          imageSize: '16:9',
          includeYouTube: true,
          youtubeCount: 1,
          youtubeLayout: 'Middle',
          keywordsToInclude: '',
          introHook: blueprint.hook || 'Statistical',
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
          useResearchAgent: false,
          outlineEditorEnabled: false,
      };

      try {
          let currentText = '';
          await generateArticleStream(config, (chunk) => {
              currentText += chunk;
              const progress = Math.min(Math.floor((currentText.length / 4000) * 100), 95);
              onUpdate(newId, { content: currentText, progress });
          });
          onUpdate(newId, { status: 'completed', progress: 100 });
          setStep(1); // Reset
          alert("Super Page generated successfully! Check History.");
      } catch (e) {
          console.error(e);
          onUpdate(newId, { status: 'error', progress: 0 });
      } finally {
          setIsGenerating(false);
      }
  };

  const removeSection = (index: number) => {
      setStructure(prev => prev.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, val: string) => {
      setStructure(prev => {
          const copy = [...prev];
          copy[index].heading = val;
          return copy;
      });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

        {/* Step 1: Input */}
        {step === 1 && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <Layout className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Super Page Generator</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Clone and improve upon SERP winners to create a high-converting masterpiece.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Keyword</label>
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            type="text"
                            placeholder="e.g. best crm software for startups"
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Competitor URL (Optional)</label>
                        <input
                            value={competitorUrl}
                            onChange={(e) => setCompetitorUrl(e.target.value)}
                            type="text"
                            placeholder="https://example.com/competitor-page"
                            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-2">Leave empty to let AI find the #1 ranking result automatically.</p>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !keyword}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                            ${isAnalyzing || !keyword
                                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/25 transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        {isAnalyzing ? 'Analyzing Structure...' : 'Analyze & Extract Blueprint'}
                    </button>
                </div>
            </div>
        )}

        {/* Step 2: Blueprint Editor */}
        {step === 2 && blueprint && (
            <div className="animate-in slide-in-from-right-8 duration-500">
                <button onClick={() => setStep(1)} className="mb-4 text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition">
                    <ArrowLeft className="w-4 h-4" /> Back to Analysis
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Outline Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <Layout className="w-5 h-5 text-emerald-500" />
                                    Content Blueprint
                                </h2>
                                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{structure.length} Sections</span>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {structure.map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start group">
                                        <div className="mt-3 text-slate-300 cursor-grab active:cursor-grabbing">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <div className={`flex-1 p-3 rounded-lg border border-slate-200 dark:border-slate-700 ${item.type === 'h2' ? 'bg-slate-50 dark:bg-slate-900' : 'ml-8 bg-white dark:bg-slate-800'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${item.type === 'h2' ? 'text-indigo-600' : 'text-slate-500'}`}>{item.type}</span>
                                                <button onClick={() => removeSection(i)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">×</button>
                                            </div>
                                            <input
                                                value={item.heading}
                                                onChange={(e) => updateSection(i, e.target.value)}
                                                className="w-full bg-transparent outline-none text-sm font-medium text-slate-800 dark:text-slate-200"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">{item.intent}</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition flex items-center justify-center gap-2 text-sm font-bold">
                                    <Plus className="w-4 h-4" /> Add Section
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Strategy & Generation */}
                    <div className="space-y-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800">
                            <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Strategy Insights
                            </h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-emerald-700/70 uppercase mb-1">Winning Title</p>
                                    <p className="font-medium text-slate-800 dark:text-emerald-100">{blueprint.winningTitle}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-700/70 uppercase mb-1">Hook Strategy</p>
                                    <p className="font-medium text-slate-800 dark:text-emerald-100">{blueprint.hook}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-700/70 uppercase mb-1">Conversion Elements</p>
                                    <ul className="list-disc pl-4 text-slate-700 dark:text-emerald-100/80">
                                        {blueprint.conversionPoints?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-700/70 uppercase mb-1">Est. Word Count</p>
                                    <p className="font-black text-2xl text-slate-800 dark:text-white">{blueprint.wordCount}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all
                                ${isGenerating
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30'
                                }`}
                        >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            {isGenerating ? 'Generating Super Page...' : 'Generate Super Page'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default SuperPageGenerator;
