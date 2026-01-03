
import * as React from 'react';
import { FileText, FilePlus2, Wand2, RefreshCw, Layout, TrendingUp, Activity } from 'lucide-react';
import { MOCK_STATS } from '../constants';
import { View } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ToolCardProps {
    title: string;
    description: string;
    icon: any;
    badge?: string;
    color: string;
    onClick?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, icon: Icon, badge, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all text-left group h-full flex flex-col"
  >
    <div className="flex justify-between items-start mb-4 w-full">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      {badge && (
        <span className="px-2 py-1 text-xs font-bold bg-indigo-100 text-indigo-600 rounded-full uppercase">
            {badge}
        </span>
      )}
    </div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
  </button>
);

const CHART_DATA = [
  { name: 'Mon', words: 4200, docs: 3 },
  { name: 'Tue', words: 3800, docs: 2 },
  { name: 'Wed', words: 6500, docs: 5 },
  { name: 'Thu', words: 2900, docs: 2 },
  { name: 'Fri', words: 8100, docs: 6 },
  { name: 'Sat', words: 2400, docs: 1 },
  { name: 'Sun', words: 5100, docs: 4 },
];

interface DashboardHomeProps {
    onNavigate: (view: View) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
            <span className="text-indigo-200 font-bold tracking-wider text-sm uppercase mb-2 block">Dashboard</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, Creator</h1>
            <p className="text-indigo-100 text-lg mb-8">Ready to scale your content production? You have <strong>{MOCK_STATS.creditsUsed}</strong> credits available this month.</p>
            <div className="flex gap-4">
                <button onClick={() => onNavigate(View.BUILDER)} className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg">
                    Start Writing
                </button>
                <button onClick={() => onNavigate(View.SEO)} className="text-white border border-white/30 px-6 py-2.5 rounded-lg font-bold hover:bg-white/10 transition">
                    SEO Audit
                </button>
            </div>
        </div>
        {/* Abstract shapes background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-purple-400 opacity-10 rounded-full blur-2xl"></div>
        <div className="hidden lg:block absolute bottom-0 right-10 transform translate-y-4">
             <Layout className="w-48 h-48 text-white/20" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-600" /> Creation Suite
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <ToolCard
                title="1-Click Blog Post"
                description="Create the perfect article using only the title. Generate and publish it in 1 click."
                icon={FileText}
                badge="Popular"
                color="bg-red-500 text-red-500"
                onClick={() => onNavigate(View.BUILDER)}
            />
            <ToolCard
                title="Bulk Article Generation"
                description="Bulk generate and auto-post up to 100 articles in a batch to WordPress in 1-click."
                icon={FilePlus2}
                color="bg-yellow-500 text-yellow-500"
                onClick={() => onNavigate(View.BULK_GENERATOR)}
            />
             <ToolCard
                title="Super Page"
                description="Clone SERP winners in seconds. Your CTA lands where conversions peak."
                icon={Layout}
                badge="New"
                color="bg-emerald-500 text-emerald-500"
                onClick={() => onNavigate(View.SUPER_PAGE)}
            />
             <ToolCard
                title="Rewriter Tool"
                description="Rewrite with SERP data. Transform any text into ranking-ready content."
                icon={RefreshCw}
                color="bg-blue-500 text-blue-500"
                onClick={() => onNavigate(View.REWRITER)}
            />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col min-w-0">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Weekly Production
                    </h3>
                    <p className="text-sm text-slate-500">Words generated over the last 7 days</p>
                </div>
                <select className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-xs p-2 outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
             </div>
             {/*
                 FIX: Added style prop with explicit height and width 100% to ensure Recharts can calculate dimensions immediately.
                 Also added flex-1 to the container to fill space if needed.
             */}
             <div style={{ width: '100%', height: 300 }} className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={CHART_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="words" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorWords)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Key Stats */}
          <div className="space-y-6">
               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-start justify-between">
                      <div>
                          <p className="text-slate-500 text-sm font-medium">Total Words</p>
                          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{MOCK_STATS.totalWords.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                          <Activity className="w-6 h-6 text-indigo-600" />
                      </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded w-fit">
                      <TrendingUp className="w-3 h-3" /> +12% from last week
                  </div>
               </div>

               <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-start justify-between">
                      <div>
                          <p className="text-slate-500 text-sm font-medium">Articles Created</p>
                          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{MOCK_STATS.articlesGenerated}</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-purple-500 w-[65%] rounded-full"></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">65% of monthly limit used</p>
               </div>
          </div>
      </div>
    </div>
  );
};

export default DashboardHome;
