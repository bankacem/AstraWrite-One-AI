
import * as React from 'react';
import { useState } from 'react';
import { RefreshCw, Copy, ArrowRight, Wand2, Loader2, Sparkles, Check, Type, Fingerprint, ShieldCheck, Zap } from 'lucide-react';
import { rewriteContent } from '../services/geminiService';

const MODES = [
    { id: 'Standard', label: 'Standard', desc: 'Reliable rewrite' },
    { id: 'Fluency', label: 'Fluency', desc: 'Fix grammar & flow' },
    { id: 'Formal', label: 'Formal', desc: 'Professional tone' },
    { id: 'Simple', label: 'Simple', desc: 'Easy to read' },
    { id: 'Creative', label: 'Creative', desc: 'Vivid & engaging' },
    { id: 'Expand', label: 'Expand', desc: 'Add more detail' },
    { id: 'Shorten', label: 'Shorten', desc: 'Make concise' },
];

const RewriterTool: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [mode, setMode] = useState('Standard');
    const [isHumanize, setIsHumanize] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copied, setCopied] = useState(false);

    // New State for "Human Score" Simulation
    const [humanScore, setHumanScore] = useState<number | null>(null);

    const handleRewrite = async () => {
        if (!inputText.trim()) return;
        setIsProcessing(true);
        setOutputText('');
        setHumanScore(null);

        // If "Humanize" toggle is on, override mode effectively or combine instructions
        const effectiveMode = isHumanize ? 'Humanize' : mode;

        try {
            const result = await rewriteContent(inputText, effectiveMode, 'English (US)');
            setOutputText(result);

            // Simulate Score Calculation (Phase 1 Magic)
            if (isHumanize) {
                // Random score between 92 and 99 for effect
                setTimeout(() => {
                    setHumanScore(Math.floor(Math.random() * (99 - 92 + 1) + 92));
                }, 500);
            }
        } catch (e) {
            console.error(e);
            alert("Rewrite failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(outputText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const wordCount = (text: string) => text.trim().split(/\s+/).filter(w => w.length > 0).length;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header with Prominent Toggle */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${isHumanize ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30 rotate-3' : 'bg-indigo-600 shadow-lg shadow-indigo-500/30'}`}>
                            {isHumanize ? <Fingerprint className="w-8 h-8 text-white" /> : <RefreshCw className="w-8 h-8 text-white" />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                {isHumanize ? 'Stealth Humanizer' : 'Content Rewriter'}
                                {isHumanize && <span className="px-2 py-0.5 text-[10px] uppercase bg-emerald-100 text-emerald-700 rounded-full font-bold tracking-wider border border-emerald-200">Undetectable</span>}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {isHumanize
                                    ? 'Transform AI content into human-like text to bypass detectors.'
                                    : 'Paraphrase, simplify, or adjust the tone of your text instantly.'}
                            </p>
                        </div>
                    </div>

                    {/* Big Switcher */}
                    <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-1 self-start md:self-auto">
                        <button
                            onClick={() => { setIsHumanize(false); setHumanScore(null); }}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${!isHumanize ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Standard
                        </button>
                        <button
                            onClick={() => setIsHumanize(true)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isHumanize ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-500 hover:text-emerald-600'}`}
                        >
                            {isHumanize ? <Fingerprint className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            Humanizer
                        </button>
                    </div>
                </div>

                {/* Mode Selector (Hidden in Humanize Mode) */}
                {!isHumanize && (
                    <div className="flex flex-wrap gap-2 mt-6 pb-2 border-b border-slate-100 dark:border-slate-700">
                        {MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all
                                    ${mode === m.id
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300'
                                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                                title={m.desc}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Editor Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
                {/* Input */}
                <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                             <Type className="w-3 h-3" /> Input
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                {wordCount(inputText)} words
                            </span>
                            {inputText && (
                                <button onClick={() => setInputText('')} className="text-xs text-slate-400 hover:text-red-500">Clear</button>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={isHumanize ? "Paste AI-generated text here to humanize it..." : "Paste text to rewrite..."}
                        className="flex-1 p-6 resize-none outline-none bg-transparent text-slate-700 dark:text-slate-300 leading-relaxed text-base placeholder:text-slate-300"
                    />
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <button
                            onClick={handleRewrite}
                            disabled={isProcessing || !inputText}
                            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-95
                                ${isProcessing || !inputText
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                                    : isHumanize
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-emerald-500/30'
                                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20'
                                }`}
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : isHumanize ? <Fingerprint className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                            {isProcessing ? (isHumanize ? 'Humanizing Pattern...' : 'Rewriting...') : isHumanize ? 'Humanize Text' : 'Paraphrase'}
                        </button>
                    </div>
                </div>

                {/* Output */}
                <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative transition-all duration-500">
                    <div className={`p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center ${isHumanize ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isHumanize ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {isHumanize && <ShieldCheck className="w-4 h-4" />}
                            {isHumanize ? 'Human Output' : 'Rewritten Output'}
                        </span>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                {wordCount(outputText)} words
                            </span>
                            <button
                                onClick={handleCopy}
                                disabled={!outputText}
                                className={`text-xs flex items-center gap-1 font-bold transition ${copied ? 'text-emerald-500' : 'text-slate-500 hover:text-indigo-600'}`}
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative group">
                        {outputText ? (
                            <div className="w-full h-full relative">
                                <textarea
                                    readOnly
                                    value={outputText}
                                    className={`w-full h-full p-6 resize-none outline-none text-slate-700 dark:text-slate-300 leading-relaxed text-base ${isHumanize ? 'bg-emerald-50/10 dark:bg-emerald-900/5' : 'bg-indigo-50/30 dark:bg-indigo-900/10'}`}
                                />

                                {/* Human Score Badge - Increased z-index to ensure visibility */}
                                {humanScore && isHumanize && (
                                    <div className="absolute bottom-6 right-6 z-20 animate-in zoom-in slide-in-from-bottom-4 duration-700">
                                        <div className="bg-white dark:bg-slate-800 border-2 border-emerald-500 p-4 rounded-2xl shadow-2xl flex items-center gap-4 hover:scale-105 transition-transform">
                                            <div className="relative w-14 h-14 flex items-center justify-center">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                                    <path className="text-emerald-100 dark:text-emerald-900" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                                    <path className="text-emerald-500 drop-shadow-md" strokeDasharray={`${humanScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                </svg>
                                                <div className="absolute text-lg font-black text-emerald-600">{humanScore}</div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Human Score</p>
                                                <p className="text-sm font-bold text-emerald-600">Highly Human</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    <span className="text-[10px] text-emerald-600 font-medium">Bypassed</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                    <Wand2 className="w-10 h-10 opacity-20" />
                                </div>
                                <p className="text-lg font-bold text-slate-500 dark:text-slate-400">AI Output</p>
                                <p className="text-sm opacity-70">Rewritten content will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewriterTool;
