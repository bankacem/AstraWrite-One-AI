
import { ArticleConfig } from '../types';

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

export const generateImageWithOpenRouter = async (prompt: string): Promise<string> => {
    const res = await post('/openrouter/generate-image', { prompt });
    // Assuming the response contains the image data in a field like 'data'
    return res.data;
};

export const callOpenRouter = async (prompt: string, model: string = "google/gemini-2.0-flash-exp:free", systemInstruction?: string) => {
    return post('/openrouter/call', { prompt, model, systemInstruction });
};

// Mirroring the Gemini Service functions for OpenRouter support
export const openRouterGenerateTitle = async (kw: string) => {
    const res = await callOpenRouter(`Suggest 5 click-worthy, SEO-optimized titles for "${kw}". Return only the best one.`, "google/gemini-2.0-flash-exp:free");
    return res.title;
};

export const openRouterGenerateSEOAnalysis = async (c: string, k?: string) => {
    const res = await callOpenRouter(
        `Analyze this content for keyword "${k}". Provide: 1. Score (0-100), 2. Readability, 3. Keyword Density, 4. Actionable Tips, 5. Missing Keywords.`,
        "google/gemini-2.0-flash-exp:free",
        `You are an expert SEO auditor. Return ONLY JSON format: { "score": number, "readabilityLevel": string, "keywordDensity": string, "actionableTips": string[], "missingKeywords": string[] }`
    );
    try { return JSON.parse(res); } catch { return { score: 70, readabilityLevel: 'High School', keywordDensity: '0.8%', actionableTips: [], missingKeywords: [] }; }
};
