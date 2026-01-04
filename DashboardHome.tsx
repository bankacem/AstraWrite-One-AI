import * as React from 'react';
import { FileText, FilePlus2, Wand2, RefreshCw, Layout } from 'lucide-react';
import { MOCK_STATS } from '../constants';

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

interface DashboardHomeProps {
    onNavigate: (view: any) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  // Mock import for View enum to avoid circular dependencies or complex passing
  const View = { 
      BUILDER: 'BUILDER',
      BULK_GENERATOR: 'BULK_GENERATOR'
  }; 

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
            <span className="text-indigo-200 font-bold tracking-wider text-sm uppercase mb-2 block">Dashboard</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome back, Creator</h1>
            <p className="text-indigo-100 text-lg mb-8">Use this guide to learn how to write your first article using our AI writing tool.</p>
            <div className="flex gap-4">
                <button onClick={() => onNavigate('BUILDER')} className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg">
                    Start Writing
                </button>
                <button className="text-white border border-white/30 px-6 py-2.5 rounded-lg font-bold hover:bg-white/10 transition">
                    Dismiss
                </button>
            </div>
        </div>
        {/* Abstract shapes background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 right-20 w-48 h-48 bg-purple-400 opacity-10 rounded-full blur-2xl"></div>
        <div className="hidden lg:block absolute bottom-0 right-10 transform translate-y-4">
             {/* Illustration placeholder */}
             <Layout className="w-48 h-48 text-white/20" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tools to help you create</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <ToolCard 
                title="1-Click Blog Post"
                description="Create the perfect article using only the title. Generate and publish it in 1 click."
                icon={FileText}
                badge="Lightning-Fast ⚡"
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
                badge="Conversion Rocket 🚀"
                color="bg-emerald-500 text-emerald-500"
            />
             <ToolCard 
                title="Rewriter Tool"
                description="Rewrite with SERP data. Transform any text into ranking-ready content."
                icon={RefreshCw}
                badge="New!"
                color="bg-blue-500 text-blue-500"
            />
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 text-sm font-medium">Words Generated</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{MOCK_STATS.totalWords.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 text-sm font-medium">Documents Created</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{MOCK_STATS.articlesGenerated}</p>
          </div>
           <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 text-sm font-medium">Credits Remaining</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">15,450</p>
          </div>
      </div>

       <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center min-h-[200px] flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No docs yet!</h3>
            <p className="text-slate-500 mb-6">Create Articles That Are SEO-Optimized & Ready To Hit The Top of Google Searches.</p>
            <button onClick={() => onNavigate('BUILDER')} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                New Document
            </button>
       </div>
    </div>
  );
};

export default DashboardHome;