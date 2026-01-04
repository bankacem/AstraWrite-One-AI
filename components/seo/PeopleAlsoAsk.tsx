
import React from 'react';
import { MessageCircleQuestion, Loader2, FileJson, Copy } from 'lucide-react';

interface PeopleAlsoAskProps {
    questions: string[];
    onGenerateFAQ: () => void;
    isGeneratingFAQ: boolean;
}

const PeopleAlsoAsk: React.FC<PeopleAlsoAskProps> = ({ questions, onGenerateFAQ, isGeneratingFAQ }) => {
    return (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                    <MessageCircleQuestion className="w-5 h-5 text-indigo-500" />
                    People Also Ask
                </h3>
                 <div className="flex gap-2">
                    <button
                        onClick={onGenerateFAQ}
                        disabled={isGeneratingFAQ}
                        className="text-xs flex items-center gap-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 px-3 py-1.5 rounded-lg text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-50 transition"
                    >
                        {isGeneratingFAQ ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileJson className="w-3 h-3" />}
                        Generate FAQ Schema
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(questions.join('\n'));
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
                {questions.map((q, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-lg text-sm border border-indigo-100 dark:border-indigo-900/50 shadow-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-indigo-400 font-bold select-none">•</span>
                        {q}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PeopleAlsoAsk;
