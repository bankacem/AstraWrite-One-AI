import React from 'react';
import { Check, Zap, Sparkles, Globe, FileText, ArrowRight, Star, Shield, Layout, RefreshCw, BarChart3, Database } from 'lucide-react';

interface LandingPageProps {
    onLoginClick: () => void;
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onGetStarted }) => {
    return (
        <div className="bg-white text-slate-900 font-sans overflow-x-hidden">
            {/* Header/Nav */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="text-2xl font-black text-indigo-600 tracking-tighter flex items-center gap-2">
                            <Zap className="fill-indigo-600" /> ASTRAWRI<span className="text-slate-900 font-black">TE</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500">
                            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
                            <a href="#pricing" className="hover:text-indigo-600 transition">Pricing</a>
                            <a href="#" className="hover:text-indigo-600 transition">Resources</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onLoginClick} className="px-5 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition">Login</button>
                        <button onClick={onGetStarted} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20">Sign up — it's free!</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6">
                <div className="max-w-5xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                        Simple pricing for every <br /> <span className="text-indigo-600">content creator</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                        Choose a plan that fits your writing needs — upgrade anytime. AstraWrite One AI helps you rank #1 with scientific precision.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                        <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex items-center gap-2">
                            <button className="px-6 py-2 rounded-xl text-sm font-bold text-slate-500">Billed monthly</button>
                            <button className="px-6 py-2 rounded-xl text-sm font-bold bg-slate-800 text-white shadow-lg">Billed yearly <span className="text-emerald-400 ml-1 text-xs">Save 25%</span></button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Cards - Inspired by the provided image */}
            <section id="pricing" className="pb-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Starter Plan */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-2xl flex flex-col group relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="p-1.5 bg-yellow-400 rounded-lg text-white">
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <span className="font-bold text-slate-800">Starter</span>
                        </div>
                        <div className="mb-10">
                            <div className="text-5xl font-black text-slate-800 flex items-baseline gap-1">
                                $14<span className="text-sm font-bold text-slate-400">/month</span>
                            </div>
                            <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Billed 168$/year</div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-1 bg-emerald-100 rounded text-emerald-600"><Check className="w-3 h-3" /></div>
                                <span className="text-sm font-bold text-slate-700">Up to 50 Articles</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Perfect for bloggers and SEO specialists</p>
                        </div>
                        <button onClick={onGetStarted} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10 mb-4">Get 3 Free Articles</button>
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase">No credit card required</p>
                        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Everything in Starter includes:</p>
                            {[
                                { label: '50 Credits', icon: Check },
                                { label: 'Rewriter Tool', icon: Check, badge: 'New!' },
                                { label: 'AI Editor', icon: Check },
                                { label: 'Content Score', icon: Check },
                                { label: 'Super pages', icon: Check },
                                { label: 'Real-Time SERP', icon: Check },
                                { label: '1 Brand Voice', icon: Check },
                                { label: 'Bulk Generation', icon: Check },
                                { label: 'WordPress Integration', icon: Check },
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <feat.icon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-600">{feat.label}</span>
                                    </div>
                                    {feat.badge && <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase">{feat.badge}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Professional Plan */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-2xl flex flex-col group relative">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="p-1.5 bg-red-400 rounded-lg text-white">
                                <Zap className="w-4 h-4 fill-current" />
                            </div>
                            <span className="font-bold text-slate-800">Professional</span>
                        </div>
                        <div className="mb-10">
                            <div className="text-5xl font-black text-slate-800 flex items-baseline gap-1">
                                $59<span className="text-sm font-bold text-slate-400">/month</span>
                            </div>
                            <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Billed 708$/year</div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-1 bg-emerald-100 rounded text-emerald-600"><Check className="w-3 h-3" /></div>
                                <span className="text-sm font-bold text-slate-700">Up to 250 Articles</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Best for teams and agencies in content creation</p>
                        </div>
                        <button onClick={onGetStarted} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10 mb-4">Get 3 Free Articles</button>
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase">No credit card required</p>
                        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">All features of Starter, and:</p>
                            {[
                                { label: '250 Credits', icon: Check },
                                { label: 'Rewriter Tool', icon: Check, badge: 'New!' },
                                { label: 'AI Editor', icon: Check },
                                { label: 'Content Score', icon: Check },
                                { label: 'Super pages', icon: Check },
                                { label: 'Real-Time SERP', icon: Check },
                                { label: '5 Brand Voices', icon: Check },
                                { label: 'External Linking', icon: Check },
                                { label: 'Internal linking', icon: Check },
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <feat.icon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-600">{feat.label}</span>
                                    </div>
                                    {feat.badge && <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase">{feat.badge}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Professional Plus 1 - Highlighted */}
                    <div className="bg-white rounded-[40px] p-8 border-2 border-indigo-600 ring-[8px] ring-indigo-50 shadow-2xl flex flex-col group relative z-10 scale-105">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl shadow-indigo-600/40">Most Popular</div>
                        <div className="flex items-center gap-2 mb-8">
                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white font-bold text-xs">A+</div>
                            <span className="font-bold text-slate-800">Professional Plus 1</span>
                        </div>
                        <div className="mb-10">
                            <div className="text-5xl font-black text-slate-800 flex items-baseline gap-1">
                                $119<span className="text-sm font-bold text-slate-400">/month</span>
                            </div>
                            <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Billed 1,428$/year</div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-1 bg-emerald-100 rounded text-emerald-600"><Check className="w-3 h-3" /></div>
                                <span className="text-sm font-bold text-slate-700">Up to 500 Articles</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Great for companies scaling content strategies</p>
                        </div>
                        <button onClick={onGetStarted} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 mb-4">Get 3 Free Articles</button>
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase">No credit card required</p>
                        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-indigo-600">Full features, increased credits:</p>
                            {[
                                { label: '500 Credits', icon: Check },
                                { label: 'Rewriter Tool', icon: Check, badge: 'New!' },
                                { label: 'AI Editor', icon: Check },
                                { label: 'Content Score', icon: Check },
                                { label: 'Super pages', icon: Check },
                                { label: 'Real-Time SERP', icon: Check },
                                { label: '10 Brand Voices', icon: Check },
                                { label: 'Bulk Generation', icon: Check },
                                { label: 'External linking', icon: Check },
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <feat.icon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-600">{feat.label}</span>
                                    </div>
                                    {feat.badge && <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase">{feat.badge}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Professional Plus 2 */}
                    <div className="bg-white rounded-[40px] p-8 border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-2xl flex flex-col group relative">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                                <Zap className="w-4 h-4 fill-current" />
                            </div>
                            <span className="font-bold text-slate-800">Professional Plus 2</span>
                        </div>
                        <div className="mb-10">
                            <div className="text-5xl font-black text-slate-800 flex items-baseline gap-1">
                                $230<span className="text-sm font-bold text-slate-400">/month</span>
                            </div>
                            <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Billed 2,760$/year</div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-1 bg-emerald-100 rounded text-emerald-600"><Check className="w-3 h-3" /></div>
                                <span className="text-sm font-bold text-slate-700">Up to 1000 Articles</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Ultimate solution for enterprise content needs</p>
                        </div>
                        <button onClick={onGetStarted} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/10 mb-4">Get 3 Free Articles</button>
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase">No credit card required</p>
                        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-slate-500">Full features, increased credits:</p>
                            {[
                                { label: '1000 Credits', icon: Check },
                                { label: 'Rewriter Tool', icon: Check, badge: 'New!' },
                                { label: 'AI Editor', icon: Check },
                                { label: 'Content Score', icon: Check },
                                { label: 'Super pages', icon: Check },
                                { label: 'Real-Time SERP', icon: Check },
                                { label: '25 Brand Voices', icon: Check },
                                { label: 'Bulk Generation', icon: Check },
                                { label: 'External linking', icon: Check },
                            ].map((feat, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <feat.icon className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-bold text-slate-600">{feat.label}</span>
                                    </div>
                                    {feat.badge && <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded uppercase">{feat.badge}</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-100 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-xl font-black text-indigo-600 tracking-tighter flex items-center gap-2">
                        <Zap className="fill-indigo-600 w-5 h-5" /> ASTRAWRI<span className="text-slate-900">TE</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium text-center">© 2026 AstraWrite One AI. Revolutionary content creation powered by Google Gemini.</p>
                    <div className="flex gap-6 text-sm font-bold text-slate-400">
                        <a href="#" className="hover:text-indigo-600 transition">Terms</a>
                        <a href="#" className="hover:text-indigo-600 transition">Privacy</a>
                        <a href="#" className="hover:text-indigo-600 transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
