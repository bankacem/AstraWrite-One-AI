
import React from 'react';
import { Settings as SettingsIcon, Globe, Key, User as UserIcon, Link as LinkIcon, FileText, Layout } from 'lucide-react';
import { WordPressConfig } from '../types';

interface SettingsProps {
    wpConfig: WordPressConfig;
    setWpConfig: (config: WordPressConfig) => void;
}

const Settings: React.FC<SettingsProps> = ({ wpConfig, setWpConfig }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                        <SettingsIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">System Settings</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Configure WordPress integrations and defaults.</p>
                    </div>
                </div>

                <div className="space-y-12">
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">WordPress Integration</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Site URL</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="url" value={wpConfig.url} onChange={(e) => setWpConfig({ ...wpConfig, url: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-sm" placeholder="https://yourwebsite.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Username</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" value={wpConfig.username} onChange={(e) => setWpConfig({ ...wpConfig, username: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-sm" placeholder="admin" />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Application Password</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="password" value={wpConfig.applicationPassword} onChange={(e) => setWpConfig({ ...wpConfig, applicationPassword: e.target.value })} className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition font-medium text-sm" placeholder="xxxx xxxx xxxx xxxx" />
                                </div>
                            </div>
                            <div className="md:col-span-1 space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 block">Default Post Type</label>
                                <div className="flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <button onClick={() => setWpConfig({ ...wpConfig, defaultPostType: 'posts' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition flex items-center justify-center gap-2 ${wpConfig.defaultPostType === 'posts' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><FileText className="w-3 h-3" /> Post</button>
                                    <button onClick={() => setWpConfig({ ...wpConfig, defaultPostType: 'pages' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition flex items-center justify-center gap-2 ${wpConfig.defaultPostType === 'pages' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}><Layout className="w-3 h-3" /> Page</button>
                                </div>
                            </div>
                            <div className="md:col-span-1 space-y-3">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 block">Default Status</label>
                                <div className="flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <button onClick={() => setWpConfig({ ...wpConfig, defaultStatus: 'draft' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${wpConfig.defaultStatus === 'draft' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Draft</button>
                                    <button onClick={() => setWpConfig({ ...wpConfig, defaultStatus: 'publish' })} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition ${wpConfig.defaultStatus === 'publish' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>Publish</button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Settings;
