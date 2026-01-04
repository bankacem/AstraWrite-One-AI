
import { ArticleConfig, Keyword, BrandVoice, ResearchData, KeywordMetrics } from '../types';

const API_BASE_URL = process.env.VITE_API_BASE_URL;

const post = async (endpoint: string, body: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const res = await post('/gemini/generate-image', { prompt, aspectRatio });
    return `data:image/png;base64,${res.base64Image}`;
};

export const generateBlogImages = async (title: string, style: string): Promise<string[]> => {
    if (style === 'None') return [];
    try {
        const imageData = await generateImage(`Hero image for article: "${title}". Style: ${style}`, "16:9");
        return [imageData];
    } catch {
        return [];
    }
};

export const generateArticleStream = async (config: ArticleConfig, onChunk: (chunk: string) => void) => {
    const response = await fetch(`${API_BASE_URL}/gemini/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
    });

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(decoder.decode(value));
    }
};

export const generateTitle = async (kw: string) => {
    const res = await post('/gemini/generate-title', { kw });
    return res.title;
};

export const rewriteContent = async (t: string, m: string, l: string = 'English (US)') => {
    const res = await post('/gemini/rewrite', { t, m, l });
    return res.text;
};

export const generateSEOAnalysis = async (c: string, k?: string) => {
    return post('/gemini/seo-analysis', { c, k });
};

export const humanizeContent = async (t: string) => {
    const res = await post('/gemini/humanize', { t });
    return res.text;
};

export const analyzeBrandVoice = async (t: string) => {
    return post('/gemini/analyze-brand-voice', { t });
};

export const generateFAQAnswers = async (q: string[]) => {
    return post('/gemini/faq-answers', { q });
};

export const generateKeywordMetrics = async (k: string): Promise<KeywordMetrics> => {
    return post('/gemini/keyword-metrics', { k });
};

export const performDeepKeywordResearch = async (k: string) => {
    return post('/gemini/keyword-research', { k });
};

export const generateTopicCluster = async (t: string) => {
    return post('/gemini/topic-cluster', { t });
};

export const analyzeSuperPageStructure = async (k: string, u?: string) => {
    return post('/gemini/super-page-structure', { k, u });
};

export const analyzeCompetitors = async (k: string, c?: string) => {
    return post('/gemini/competitor-analysis', { k, c });
};

export const optimizeContentWithKeywords = async (c: string, keywords: Keyword[]) => {
    return post('/gemini/optimize-content', { c, keywords });
};

export const generateMetaTags = async (c: string, k?: string) => {
    return post('/gemini/meta-tags', { c, k });
};

export const continueWriting = async (text: string) => {
    const res = await post('/gemini/continue-writing', { text });
    return res.text;
};

export const generateSeoGuidelines = async (kw: string) => {
    return post('/gemini/seo-guidelines', { kw });
};

export const generateBulkKeywordMetrics = async (k: string[]) => {
    return post('/gemini/bulk-keyword-metrics', { k });
};
