
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import Builder from './components/ArticleWriter';
import BulkGenerator from './components/BulkGenerator';
import ImageCreator from './components/ImageCreator';
import SEOAnalyzer from './components/SEOAnalyzer';
import CompetitorAnalyzer from './components/CompetitorAnalyzer';
import ClusterGenerator from './components/ClusterGenerator';
import SuperPageGenerator from './components/SuperPageGenerator';
import RewriterTool from './components/RewriterTool';
import BrandVoiceManager from './components/BrandVoiceManager';
import DocumentEditor from './components/DocumentEditor';
import { View, GeneratedContent, BrandVoice, WordPressConfig, Stats, ApiKeyConfig, AiProvider } from './types';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import ApiKeyManager from './components/ApiKeyManager';
import { Sun, Moon, Bell, User, Search, Settings, Globe, Key, User as UserIcon, Link as LinkIcon, FileText, Layout, Key as KeyIcon } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [isLanding, setIsLanding] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [apiKeys, setApiKeys] = useState<ApiKeyConfig[]>(() => {
    const saved = localStorage.getItem('astrawrite_api_keys');
    if (saved) return JSON.parse(saved);
    // Default key from ENV if available
    const envKey = process.env.VITE_GEMINI_API_KEY || "";
    if (envKey) {
      return [{ id: 'default', key: envKey, label: 'Default Engine', usageCount: 0, articlesGenerated: 0, isActive: true }];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('astrawrite_api_keys', JSON.stringify(apiKeys));
    const active = apiKeys.find(k => k.isActive);
    if (active) {
      localStorage.setItem('astrawrite_active_key', active.key);
    }
  }, [apiKeys]);

  const [history, setHistory] = useState<GeneratedContent[]>(() => {
    const saved = localStorage.getItem('astrawrite_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [wpConfig, setWpConfig] = useState<WordPressConfig>(() => {
    const saved = localStorage.getItem('astra_wp_config');
    return saved ? JSON.parse(saved) : {
      url: '',
      username: '',
      applicationPassword: '',
      defaultStatus: 'draft',
      defaultPostType: 'posts'
    };
  });

  useEffect(() => {
    localStorage.setItem('astra_wp_config', JSON.stringify(wpConfig));
  }, [wpConfig]);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const rotateKey = () => {
    if (apiKeys.length <= 1) return;

    setApiKeys(prev => {
      const activeIndex = prev.findIndex(k => k.isActive);
      const nextIndex = (activeIndex + 1) % prev.length;
      return prev.map((k, i) => ({ ...k, isActive: i === nextIndex }));
    });
  };

  const addToHistory = (item: GeneratedContent) => {
    setHistory(prev => [item, ...prev]);

    // Track usage/analytics per key
    if (item.type === 'article' || item.type === 'seo-report' || item.type === 'image') {
      setApiKeys(prev => prev.map(k => {
        if (k.isActive) {
          return {
            ...k,
            usageCount: k.usageCount + 1,
            articlesGenerated: item.type === 'article' ? k.articlesGenerated + 1 : k.articlesGenerated,
            lastUsed: Date.now()
          };
        }
        return k;
      }));

      // Auto-rotate for the NEXT generation
      rotateKey();
    }
  };

  const handleAddKey = (label: string, key: string, provider: AiProvider) => {
    const newKeyConfig: ApiKeyConfig = {
      id: Date.now().toString(),
      label,
      key,
      provider,
      usageCount: 0,
      articlesGenerated: 0,
      isActive: apiKeys.length === 0,
      lastUsed: undefined
    };
    setApiKeys(prev => [...prev, newKeyConfig]);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(prev => {
      const filtered = prev.filter(k => k.id !== id);
      if (filtered.length > 0 && !filtered.find(k => k.isActive)) {
        filtered[0].isActive = true;
      }
      return filtered;
    });
  };

  const handleSelectKey = (id: string) => {
    setApiKeys(prev => prev.map(k => ({ ...k, isActive: k.id === id })));
  };

  const updateHistoryItem = (id: string, updates: Partial<GeneratedContent>) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const addBrandVoice = (voice: BrandVoice) => {
    setBrandVoices(prev => [...prev, voice]);
  };

  const deleteBrandVoice = (id: string) => {
    setBrandVoices(prev => prev.filter(v => v.id !== id));
  };

  const renderView = () => {
    switch (view) {
      case View.DASHBOARD:
        return <DashboardHome onNavigate={setView} />;
      case View.BUILDER:
        return (
          <Builder
            history={history}
            onSave={addToHistory}
            onUpdate={updateHistoryItem}
            brandVoices={brandVoices}
            wpConfig={wpConfig}
          />
        );
      case View.BULK_GENERATOR:
        return (
          <BulkGenerator
            onSave={addToHistory}
            onUpdate={updateHistoryItem}
            wpConfig={wpConfig}
          />
        );
      case View.TOPIC_CLUSTERS:
        return (
          <ClusterGenerator
            onSave={addToHistory}
            onUpdate={updateHistoryItem}
          />
        );
      case View.DOCS:
      case View.HISTORY:
        return (
          <DocumentEditor
            history={history}
            onUpdate={updateHistoryItem}
            onDelete={deleteHistoryItem}
            wpConfig={wpConfig}
          />
        );
      case View.IMAGES:
        return <ImageCreator onSave={addToHistory} />;
      case View.SEO:
        return <SEOAnalyzer />;
      case View.COMPETITOR_ANALYSIS:
        return <CompetitorAnalyzer />;
      case View.SUPER_PAGE:
        return <SuperPageGenerator onSave={addToHistory} onUpdate={updateHistoryItem} />;
      case View.REWRITER:
        return <RewriterTool />;
      case View.BRAND_VOICE:
        return <BrandVoiceManager voices={brandVoices} onAddVoice={addBrandVoice} onDeleteVoice={deleteBrandVoice} />;
      case View.API_KEYS:
        return <ApiKeyManager apiKeys={apiKeys} onAddKey={handleAddKey} onDeleteKey={handleDeleteKey} onSelectKey={handleSelectKey} />;
      case View.SETTINGS:
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <Settings className="w-8 h-8 text-white" />
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
      default:
        return <DashboardHome onNavigate={setView} />;
    }
  };

  // Auth/Landing Logic
  if (isLanding && !showLogin) {
    return <LandingPage onLoginClick={() => setShowLogin(true)} onGetStarted={() => setShowLogin(true)} />;
  }

  if (showLogin && !isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setIsLanding(false);
          setShowLogin(false);
        }}
        onBackToLanding={() => setShowLogin(false)}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        onLogout={() => {
          setIsAuthenticated(false);
          setIsLanding(true);
        }}
      />
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
            <div
              onClick={() => {
                setIsAuthenticated(false);
                setIsLanding(true);
              }}
              className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white cursor-pointer hover:bg-indigo-700 transition"
              title="Logout"
            >
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 scroll-smooth">{renderView()}</div>
      </main>
    </div>
  );
};

export default App;
