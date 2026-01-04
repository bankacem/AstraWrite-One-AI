
import * as React from 'react';
import { useState } from 'react';
import { generateTopicCluster, generateArticleStream } from '../services/geminiService';
import { GeneratedContent, ArticleConfig } from '../types';
import { Network, Wand2, Loader2, ArrowRight, Link as LinkIcon, FileText, CheckCircle2, Play, Layers } from 'lucide-react';

interface ClusterGeneratorProps {
  onSave: (content: GeneratedContent) => void;
  onUpdate: (id: string, content: Partial<GeneratedContent>) => void;
}

const ClusterGenerator: React.FC<ClusterGeneratorProps> = ({ onSave, onUpdate }) => {
  const [topic, setTopic] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [clusterPlan, setClusterPlan] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<{id: string, title: string, status: string}[]>([]);

  const handleGeneratePlan = async () => {
    if (!topic) return;
    setIsGeneratingPlan(true);
    try {
      const plan = await generateTopicCluster(topic);
      if (!plan || !plan.pillarPage || !plan.clusters) {
          throw new Error("Invalid plan structure generated");
      }
      setClusterPlan(plan);
      setExecutionLogs([]);
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleExecuteCluster = async () => {
    if (!clusterPlan) return;
    setIsExecuting(true);

    // Combine Pillar + Clusters into one queue
    const queue = [
       { ...clusterPlan.pillarPage, type: 'Pillar' },
       ...clusterPlan.clusters.map((c: any) => ({ ...c, type: 'Cluster' }))
    ];

    const logs = queue.map(item => ({ id: '', title: item.title, status: 'Pending' }));
    setExecutionLogs(logs);

    for (let i = 0; i < queue.length; i++) {
        const item = queue[i];

        // Update status to running
        setExecutionLogs(prev => {
            const copy = [...prev];
            copy[i].status = 'Writing...';
            return copy;
        });

        const newId = Date.now().toString();

        // Save initial entry
        onSave({
            id: newId,
            title: item.title,
            content: '',
            type: 'article',
            createdAt: Date.now(),
            status: 'generating',
            progress: 0,
            metadata: { type: item.type }
        });

        // Generate Content
        // We inject interlinking instructions into the context
        let interlinkingInstruction = "";
        if (item.type === 'Cluster') {
            interlinkingInstruction = `\n\nIMPORTANT INTERLINKING: You MUST include a hyperlink to the Pillar Page ("${clusterPlan.pillarPage.title}") using the anchor text "${item.linkToPillarAnchor}". Also try to link to "${item.crossLinkSuggestion}".`;
        }

        const config: ArticleConfig = {
            mainKeyword: item.keyword,
            title: item.title,
            language: 'English (US)',
            articleSize: 'Medium',
            tone: 'Authoritative',
            pointOfView: 'Third Person',
            targetCountry: 'United States',
            articleType: 'Blog Post',
            aiModel: 'Gemini 2.5 Flash',
            readability: 'University',
            aiContentCleaning: 'Standard Removal',
            humanize: false,
            detailsToInclude: interlinkingInstruction,
            includeImages: true, // Let's assume yes for clusters
            imageStyle: 'Minimalist',
            imagesCount: 1,
            imageSize: '16:9',
            includeYouTube: false,
            youtubeCount: 0,
            youtubeLayout: '',
            keywordsToInclude: '',
            introHook: 'Question',
            includeTableOfContents: true,
            includeH3: true,
            includeH4: true,
            includeH5: false,
            includeLists: true,
            includeTables: true,
            includeItalics: true,
            includeQuotes: false,
            includeKeyTakeaways: true,
            includeConclusion: true,
            includeFAQ: true,
            includeBold: true,
            connectToWeb: true, // Programmatic SEO benefits from web data
            useResearchAgent: false,
            outlineEditorEnabled: false,
        };

        try {
            let currentText = '';
            await generateArticleStream(config, (chunk) => {
                currentText += chunk;
                const progress = Math.min(Math.floor((currentText.length / 2500) * 100), 95);
                onUpdate(newId, { content: currentText, progress });
            });

            onUpdate(newId, { status: 'completed', progress: 100 });

            setExecutionLogs(prev => {
                const copy = [...prev];
                copy[i].status = 'Completed';
                return copy;
            });

        } catch (e) {
             setExecutionLogs(prev => {
                const copy = [...prev];
                copy[i].status = 'Failed';
                return copy;
            });
            onUpdate(newId, { status: 'error', progress: 0 });
        }
    }
    setIsExecuting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Network className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Programmatic SEO Clusters</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Generate topical authority by creating interconnected clusters of content automatically.</p>
                </div>
            </div>

            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Broad Topic (Seed Keyword)</label>
                    <input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        type="text"
                        placeholder="e.g. Cryptocurrency Investment, Keto Diet, Remote Work Software"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    />
                </div>
                <button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan || !topic}
                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-md flex items-center gap-2 h-[50px]
                        ${isGeneratingPlan || !topic
                            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                >
                    {isGeneratingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    Generate Strategy
                </button>
            </div>
        </div>

        {/* Plan Visualization */}
        {clusterPlan && clusterPlan.pillarPage && clusterPlan.clusters && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Visual Graph (Concept) */}
                <div className="lg:col-span-1 bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full"></div>
                    <h3 className="font-bold mb-6 flex items-center gap-2 relative z-10"><Network className="w-4 h-4 text-emerald-400" /> Cluster Map</h3>

                    <div className="flex flex-col items-center relative z-10">
                        {/* Pillar Node */}
                        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-8 border-4 border-emerald-400">
                            <Layers className="w-8 h-8 text-white" />
                        </div>

                        {/* Connecting Lines */}
                        <div className="w-full h-8 border-l-2 border-r-2 border-t-2 border-slate-700 rounded-t-3xl mb-0 relative -top-4"></div>

                        {/* Cluster Nodes */}
                        <div className="flex justify-between w-full px-2">
                             {clusterPlan.clusters.slice(0, 3).map((_: any, i: number) => (
                                 <div key={i} className="flex flex-col items-center gap-2">
                                     <div className="h-4 w-0.5 bg-slate-700"></div>
                                     <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                                         <FileText className="w-4 h-4 text-slate-400" />
                                     </div>
                                 </div>
                             ))}
                        </div>
                         <p className="mt-8 text-xs text-slate-400 text-center">
                            The AI has designed a hub-and-spoke model where 6 articles link back to the main Pillar Page: <br/>
                            <span className="text-white font-bold">"{clusterPlan.pillarPage.title}"</span>
                        </p>
                    </div>
                </div>

                {/* Strategy Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Content Plan</h3>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">1 Pillar</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{clusterPlan.clusters.length} Clusters</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Article Title</th>
                                    <th className="px-6 py-3">Interlink Strategy (Anchor Text)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                <tr className="bg-emerald-50/50 dark:bg-emerald-900/10">
                                    <td className="px-6 py-4 font-bold text-emerald-600">Pillar Page</td>
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{clusterPlan.pillarPage.title}</td>
                                    <td className="px-6 py-4 text-slate-400 italic">Target of all back-links</td>
                                </tr>
                                {clusterPlan.clusters.map((c: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 text-slate-500">Cluster #{i+1}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{c.title}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs">
                                                <LinkIcon className="w-3 h-3 text-indigo-500" />
                                                <span className="text-slate-600 dark:text-slate-400">Links to Pillar via: </span>
                                                <span className="font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">"{c.linkToPillarAnchor}"</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                         <div className="text-sm text-slate-500">
                             Total Words Est: <span className="font-bold text-slate-800 dark:text-white">~12,000 words</span>
                         </div>
                         <button
                            onClick={handleExecuteCluster}
                            disabled={isExecuting}
                            className={`px-6 py-3 rounded-lg font-bold text-white shadow-md flex items-center gap-2
                                ${isExecuting
                                    ? 'bg-slate-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                         >
                             {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                             {isExecuting ? 'Building Cluster...' : 'Execute Programmatic Build'}
                         </button>
                    </div>
                </div>
            </div>
        )}

        {/* Execution Logs */}
        {executionLogs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Build Progress</h3>
                <div className="space-y-3">
                    {executionLogs.map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 w-6">#{i+1}</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{log.title}</span>
                            </div>
                            <div>
                                {log.status === 'Pending' && <span className="text-xs text-slate-400">Pending</span>}
                                {log.status === 'Writing...' && <span className="text-xs text-indigo-600 font-bold animate-pulse">Writing...</span>}
                                {log.status === 'Completed' && <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Done</span>}
                                {log.status === 'Failed' && <span className="text-xs text-red-600 font-bold">Failed</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default ClusterGenerator;
