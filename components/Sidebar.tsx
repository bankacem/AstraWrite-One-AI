import * as React from 'react';
import { View, NavItem } from '../types';
import { LayoutDashboard, PenTool, FileText, Image as ImageIcon, BarChart, History, Settings, LogOut, Zap, Radio, Layers, Target, Network, RefreshCw, Layout, Key as KeyIcon } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: View.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { id: View.BUILDER, label: '1-Click Writer', icon: PenTool },
  { id: View.BULK_GENERATOR, label: 'Bulk Generation', icon: Layers },
  { id: View.TOPIC_CLUSTERS, label: 'Programmatic SEO', icon: Network },
  { id: View.COMPETITOR_ANALYSIS, label: 'Competitor Gap', icon: Target },
  { id: View.SEO, label: 'SEO Analyzer', icon: BarChart },
  { id: View.REWRITER, label: 'Content Rewriter', icon: RefreshCw },
  { id: View.SUPER_PAGE, label: 'Super Page', icon: Layout },
  { id: View.IMAGES, label: 'Media Hub', icon: ImageIcon },
  { id: View.DOCS, label: 'Documents', icon: FileText },
  { id: View.API_KEYS, label: 'Gemini Engines', icon: KeyIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout }) => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-white font-bold text-xl italic">A</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white leading-none">AstraWrite</span>
          <span className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase mt-1">AI Platform</span>
        </div>
      </div>

      <div className="px-4 mb-2">
        <button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white p-3 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition">
          <Zap className="w-4 h-4" />
          Upgrade Plan
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
              {item.label}
            </button>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tools</p>
          <button
            onClick={() => onNavigate(View.BRAND_VOICE)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${currentView === View.BRAND_VOICE
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <Radio className="w-5 h-5" />
            Brand Voice
          </button>
          <button onClick={() => onNavigate(View.HISTORY)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${currentView === View.HISTORY
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}>
            <History className="w-5 h-5" />
            History
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onNavigate(View.SETTINGS)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-xl
            ${currentView === View.SETTINGS
              ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to sign out from AstraWrite?")) {
              onLogout();
            }
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-sm font-medium transition mt-1"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
