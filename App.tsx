
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { View, GeneratedContent, BrandVoice, WordPressConfig, ApiKeyConfig, AiProvider } from './types';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Router from './components/layout/Router';
import { Sun, Moon, Bell, User, Search } from 'lucide-react';
import { API_BASE_URL } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>([]);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [wpConfig, setWpConfig] = useState<WordPressConfig>({ url: '', username: '', applicationPassword: '', defaultStatus: 'draft', defaultPostType: 'posts' });

    useEffect(() => {
        const fetchKeys = async () => {
            const response = await fetch(`${API_BASE_URL}/keys`);
            setApiKeys(await response.json());
        };
        if (isAuthenticated) fetchKeys();
    }, [isAuthenticated]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('astrawrite_history');
        if (savedHistory) setHistory(JSON.parse(savedHistory));

        const savedWpConfig = localStorage.getItem('astrawrite_wp_config');
        if (savedWpConfig) setWpConfig(JSON.parse(savedWpConfig));
    }, []);

    useEffect(() => {
        localStorage.setItem('astrawrite_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('astrawrite_wp_config', JSON.stringify(wpConfig));
    }, [wpConfig]);

    useEffect(() => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setIsDarkMode(true);
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

    const handlers = {
        addToHistory: (item: GeneratedContent) => setHistory(prev => [item, ...prev]),
        updateHistoryItem: (id: string, updates: Partial<GeneratedContent>) => setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item)),
        deleteHistoryItem: (id: string) => setHistory(prev => prev.filter(item => item.id !== id)),
        addBrandVoice: (voice: BrandVoice) => setBrandVoices(prev => [...prev, voice]),
        deleteBrandVoice: (id: string) => setBrandVoices(prev => prev.filter(v => v.id !== id)),
        addKey: async (label: string, key: string, provider: AiProvider) => {
            const response = await fetch(`${API_BASE_URL}/keys`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, key, provider }) });
            const newKey = await response.json();
            setApiKeys(prev => [...prev, newKey]);
        },
        deleteKey: async (id: string) => {
            await fetch(`${API_BASE_URL}/keys/${id}`, { method: 'DELETE' });
            setApiKeys(prev => prev.filter(k => k.id !== id));
        },
        selectKey: async (id: string) => {
            await fetch(`${API_BASE_URL}/keys/select/${id}`, { method: 'POST' });
            setApiKeys(prev => prev.map(k => ({ ...k, isActive: k.id === id })));
        }
    };

  if (!isAuthenticated) {
      return showLogin ?
          <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} onBackToLanding={() => setShowLogin(false)} /> :
          <LandingPage onLoginClick={() => setShowLogin(true)} onGetStarted={() => setShowLogin(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar currentView={view} onNavigate={setView} onLogout={() => setIsAuthenticated(false)} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
            <div className="flex items-center flex-1">
                <div className="relative w-96 max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search projects..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none transition" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
                <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span></button>
                <div onClick={() => setIsAuthenticated(false)} className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition" title="Logout">
                    <User className="w-5 h-5" />
                </div>
            </div>
        </header>
        <div className="flex-1 overflow-auto p-8 scroll-smooth">
          <Router
            view={view}
            history={history}
            brandVoices={brandVoices}
            apiKeys={apiKeys}
            wpConfig={wpConfig}
            onNavigate={setView}
            setWpConfig={setWpConfig}
            onSave={handlers.addToHistory}
            onUpdate={handlers.updateHistoryItem}
            onDelete={handlers.deleteHistoryItem}
            onAddBrandVoice={handlers.addBrandVoice}
            onDeleteBrandVoice={handlers.deleteBrandVoice}
            onAddKey={handlers.addKey}
            onDeleteKey={handlers.deleteKey}
            onSelectKey={handlers.selectKey}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
