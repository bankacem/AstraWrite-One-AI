
import React from 'react';
import { PlusCircle, CheckCircle } from 'lucide-react';

interface Keyword {
    term: string;
    difficulty: number;
    volume: string;
    cpc?: string;
    competition?: string;
}

interface KeywordTableProps {
    keywords: Keyword[];
    savedKeywords: Keyword[];
    onToggleSave: (keyword: Keyword) => void;
    isGKPMode: boolean;
}

const KeywordTable: React.FC<KeywordTableProps> = ({ keywords, savedKeywords, onToggleSave, isGKPMode }) => {

    const getDifficultyColor = (score: number) => {
        if (score < 30) return 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
        if (score < 60) return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
        return 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
    };

    return (
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
                    {keywords.map((kw, i) => {
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
                                       onClick={() => onToggleSave(kw)}
                                       className={`transition-colors ${isSaved ? 'text-emerald-500 hover:text-red-500' : 'text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300'}`}
                                    >
                                        {isSaved ? <CheckCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                    {keywords.length === 0 && (
                        <tr>
                            <td colSpan={isGKPMode ? 6 : 4} className="px-4 py-8 text-center text-slate-400 italic">
                                No keywords match the selected filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default KeywordTable;
