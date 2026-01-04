
import React, { useState } from 'react';
import { Mail, Lock, Zap, ArrowRight, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../constants';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onBackToLanding: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                onLoginSuccess();
            } else {
                const data = await response.json();
                setError(data.message || 'Invalid credentials.');
                setIsLoggingIn(false);
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div onClick={onBackToLanding} className="flex flex-col items-center cursor-pointer group">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[24px] flex items-center justify-center shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
                        <Zap className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h1 className="mt-4 text-3xl font-black text-slate-900 tracking-tighter">
                        ASTRAWRI<span className="text-indigo-600">TE</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Gateway to Perfection</p>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-indigo-600 transition">
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in shake duration-300">
                                <ShieldCheck className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoggingIn} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {isLoggingIn ? (<><Loader2 className="w-5 h-5 animate-spin" />Authenticating...</>) : (<>Login to Console<ArrowRight className="w-4 h-4" /></>)}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs font-bold text-slate-400">
                            By logging in, you agree to our <span className="text-indigo-600 cursor-pointer hover:underline">Terms of Service</span>
                        </p>
                    </div>
                </div>
                <p className="text-center text-sm font-bold text-slate-500">
                    Not part of the elite? <span className="text-indigo-600 cursor-pointer hover:underline" onClick={onBackToLanding}>Explore plans</span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
