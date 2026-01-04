import React, { useState } from 'react';
import { Key, Plus, Trash2, CheckCircle2, ShieldCheck, BarChart3, Clock, AlertCircle, Zap, FileText } from 'lucide-react';
import { ApiKeyConfig, AiProvider } from '../types';

interface ApiKeyManagerProps {
    apiKeys: ApiKeyConfig[];
    onAddKey: (label: string, key: string, provider: AiProvider) => void;
    onDeleteKey: (id: string) => void;
    onSelectKey: (id: string) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ apiKeys, onAddKey, onDeleteKey, onSelectKey }) => {
    const [newLabel, setNewLabel] = useState('');
    const [newKey, setNewKey] = useState('');
    const [newProvider, setNewProvider] = useState<AiProvider>(AiProvider.GEMINI);
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLabel && newKey) {
            onAddKey(newLabel, newKey, newProvider);
            setNewLabel('');
            setNewKey('');
            setIsAdding(false);
        }
    };

    const totalArticles = apiKeys.reduce((sum, k) => sum + k.articlesGenerated, 0);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-xl shadow-blue-600/20">
                        <Key className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">API Key Management</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Control your Gemini engines and monitor scientific usage.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Engine
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Articles</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{totalArticles}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Engines</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{apiKeys.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Security Status</p>
                        <p className="text-2xl font-black text-emerald-500">Verified</p>
                    </div>
                </div>
            </div>

            {/* Add New Key Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border-2 border-indigo-100 dark:border-indigo-900 shadow-2xl animate-in zoom-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Engine Label</label>
                            <input
                                type="text"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="Marketing Pro"
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">AI Provider</label>
                            <select
                                value={newProvider}
                                onChange={(e) => setNewProvider(e.target.value as AiProvider)}
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium"
                            >
                                <option value={AiProvider.GEMINI}>Google Gemini</option>
                                <option value={AiProvider.OPENROUTER}>OpenRouter</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">API Key</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    placeholder="sk-or-v1-..."
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition font-medium"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition">Activate Engine</button>
                    </div>
                </form>
            )}

            {/* Key List */}
            <div className="grid grid-cols-1 gap-4">
                {apiKeys.map((keyConfig) => (
                    <div
                        key={keyConfig.id}
                        onClick={() => onSelectKey(keyConfig.id)}
                        className={`group relative bg-white dark:bg-slate-800 p-8 rounded-[40px] border-2 transition-all duration-500 cursor-pointer overflow-hidden
              ${keyConfig.isActive
                                ? 'border-indigo-600 shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/20 ring-4 ring-indigo-50 dark:ring-indigo-900/10'
                                : 'border-slate-100 dark:border-slate-700 hover:border-indigo-200'}`}
                    >
                        {keyConfig.isActive && (
                            <div className="absolute top-0 right-12 bg-indigo-600 text-white px-4 py-1.5 rounded-b-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Active Engine
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                  ${keyConfig.isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                    <Zap className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{keyConfig.label}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            Last used: {keyConfig.lastUsed ? new Date(keyConfig.lastUsed).toLocaleDateString() : 'Never'}
                                        </span>
                                        <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                                        <span className="text-xs font-bold text-indigo-500">
                                            Key: ••••••••••{keyConfig.key.slice(-4)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto">
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Articles Generated</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black text-slate-800 dark:text-white">{keyConfig.articlesGenerated}</span>
                                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                                                style={{ width: `${Math.min((keyConfig.articlesGenerated / 100) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!keyConfig.isActive ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onSelectKey(keyConfig.id); }}
                                            className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition shadow-sm"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteKey(keyConfig.id); }}
                                        className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {apiKeys.length === 0 && !isAdding && (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">No Engines Configured</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mt-2">Add your Google Gemini API key to unlock scientific content generation.</p>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition"
                        >
                            Add Your First Key
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiKeyManager;