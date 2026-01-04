
import * as React from 'react';
import { useState } from 'react';
import { generateImageWithOpenRouter } from '../services/openRouterService';
import { GeneratedContent } from '../types';
import { Image as ImageIcon, Download, Loader2, Sparkles } from 'lucide-react';

interface ImageCreatorProps {
  onSave: (content: GeneratedContent) => void;
}

const ImageCreator: React.FC<ImageCreatorProps> = ({ onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [status, setStatus] = useState<'IDLE' | 'GENERATING' | 'COMPLETED'>('IDLE');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setStatus('GENERATING');
    setError(null);
    setImageUrl(null);

    try {
      const imageData = await generateImageWithOpenRouter(prompt);
      const imageUrl = `data:image/png;base64,${imageData}`;
      setImageUrl(imageUrl);
      setStatus('COMPLETED');

      onSave({
        id: Date.now().toString(),
        title: `AI Image: ${prompt.substring(0, 30)}...`,
        content: imageUrl,
        type: 'image',
        createdAt: Date.now(),
        status: 'completed',
        progress: 100,
      });

    } catch (err) {
      setError("Failed to generate image.");
      setStatus('IDLE');
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Media Studio</h2>
              <p className="text-sm text-slate-500 font-medium">Generate high-resolution visuals.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Controls */}
          <div className="p-8 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 md:col-span-1 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-2">Visual Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:border-indigo-500 outline-none transition h-40 resize-none text-sm font-medium"
                placeholder="A high-tech laboratory with neon lights, 8k resolution..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-2">Format</label>
              <div className="grid grid-cols-2 gap-2">
                {['16:9', '1:1', '9:16', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-3 rounded-xl text-xs font-black border-2 transition-all
                      ${aspectRatio === ratio
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-indigo-200'
                      }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={status === 'GENERATING' || !prompt}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-95
                ${status === 'GENERATING' || !prompt
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-800 hover:shadow-indigo-500/30'
                }`}
            >
              {status === 'GENERATING' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Image
                </>
              )}
            </button>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase bg-red-50 p-4 rounded-xl border border-red-100">
                <ImageIcon className="w-4 h-4" /> {error}
              </div>
            )}
          </div>

          {/* Output */}
          <div className="p-12 md:col-span-2 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center min-h-[500px] relative">
            {imageUrl ? (
              <div className="relative group w-full max-w-2xl animate-in zoom-in-95 duration-500">
                <img
                  src={imageUrl}
                  alt="Generated result"
                  className="w-full h-auto rounded-[32px] shadow-2xl ring-8 ring-white dark:ring-slate-800"
                />
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <a
                    href={imageUrl}
                    download="astrawrite-image.png"
                    className="px-6 py-3 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white rounded-2xl shadow-2xl hover:bg-white flex items-center gap-3 backdrop-blur-md border border-white/20"
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Download Image</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 opacity-30">
                <div className="w-32 h-32 bg-slate-200 dark:bg-slate-800 rounded-[40px] mx-auto flex items-center justify-center animate-pulse">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Studio Ready</p>
                  <p className="text-xs font-bold text-slate-400">Your AI generated visual will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCreator;
