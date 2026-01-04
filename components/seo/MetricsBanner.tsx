
import React from 'react';
import { KeywordMetrics } from '../../types';

interface MetricsBannerProps {
    metrics: KeywordMetrics;
    analysis: any;
}

const MetricsBanner: React.FC<MetricsBannerProps> = ({ metrics, analysis }) => {

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

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
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
    );
};

export default MetricsBanner;
