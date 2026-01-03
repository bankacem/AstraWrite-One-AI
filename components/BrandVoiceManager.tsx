
import * as React from 'react';
import { useState } from 'react';
import { Radio, Mic2, Plus, Trash2, Loader2, Sparkles, Quote, BookOpen } from 'lucide-react';
import { analyzeBrandVoice } from '../services/geminiService';
import { BrandVoice } from '../types';

interface BrandVoiceManagerProps {
    voices: BrandVoice[];
    onAddVoice: (voice: BrandVoice) => void;
    onDeleteVoice: (id: string) => void;
}

const BrandVoiceManager: React.FC<BrandVoiceManagerProps> = ({ voices, onAddVoice, onDeleteVoice }) => {
    const [sampleText, setSampleText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!sampleText.trim()) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeBrandVoice(sampleText);
            if (result) {
                const newVoice: BrandVoice = {
                    id: Date.now().toString(),
                    name: result.name || 'Custom Voice',
                    description: result.description || 'Custom style detected from sample.',
                    archetype: result.archetype || 'Unknown',
                    systemInstruction: result.systemInstruction || ''
                };
                onAddVoice(newVoice);
                setSampleText(''); // Clear input
            }
        } catch (e) {
            console.error(e);
            alert("Failed to analyze voice.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Radio className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Brand Voice Intelligence</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Train the AI to write exactly like you by analyzing your previous content.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Input Area */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                            Upload a writing sample
                        </label>
                        <textarea
                            value={sampleText}
                            onChange={(e) => setSampleText(e.target.value)}
                            className="w-full h-48 p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 resize-none outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                            placeholder="Paste a blog post, newsletter, or any text that represents your brand's style..."
                        />
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !sampleText}
                            className={`w-full py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all
                                ${isAnalyzing || !sampleText
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/25'
                                }`}
                        >
                            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {isAnalyzing ? 'Analyzing Tone & Style...' : 'Create Voice Profile'}
                        </button>
                    </div>

                    {/* Info Side */}
                    <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-xl border border-purple-100 dark:border-purple-800/50 flex flex-col justify-center">
                        <h3 className="font-bold text-purple-900 dark:text-purple-300 mb-4 flex items-center gap-2">
                            <Mic2 className="w-5 h-5" /> How it works
                        </h3>
                        <ul className="space-y-4 text-sm text-purple-800/80 dark:text-purple-200/80">
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                <span><strong>Analyze:</strong> Our AI dissects your sentence structure, vocabulary, and emotional tone.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                <span><strong>Profile:</strong> We generate a unique "Persona Instruction" that mimics your style.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                <span><strong>Apply:</strong> Select this voice in the 1-Click Article Writer to use it instantly.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Voices List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white px-1">Your Voice Profiles</h2>
                {voices.length === 0 ? (
                     <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                        <Quote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No voice profiles created yet.</p>
                        <p className="text-sm text-slate-400">Paste some text above to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {voices.map((voice) => (
                            <div key={voice.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <button
                                        onClick={() => onDeleteVoice(voice.id)}
                                        className="text-slate-400 hover:text-red-500 transition p-1"
                                        title="Delete Voice"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{voice.name}</h3>
                                <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] font-bold uppercase rounded mb-3">
                                    {voice.archetype}
                                </span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                    {voice.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrandVoiceManager;
