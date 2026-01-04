
export enum View {
  DASHBOARD = 'DASHBOARD',
  BUILDER = 'BUILDER',
  BULK_GENERATOR = 'BULK_GENERATOR',
  DOCS = 'DOCS',
  IMAGES = 'IMAGES',
  SEO = 'SEO',
  HISTORY = 'HISTORY',
  SUPER_PAGE = 'SUPER_PAGE',
  REWRITER = 'REWRITER',
  BRAND_VOICE = 'BRAND_VOICE',
  SETTINGS = 'SETTINGS',
  COMPETITOR_ANALYSIS = 'COMPETITOR_ANALYSIS',
  TOPIC_CLUSTERS = 'TOPIC_CLUSTERS',
  API_KEYS = 'API_KEYS',
}

export enum AiProvider {
  GEMINI = 'GEMINI',
  OPENROUTER = 'OPENROUTER',
}

export interface ApiKeyConfig {
  id: string;
  key: string;
  label: string;
  provider: AiProvider;
  usageCount: number;
  articlesGenerated: number;
  lastUsed?: number;
  isActive: boolean;
}

export interface WordPressConfig {
  url: string;
  username: string;
  applicationPassword: string;
  defaultStatus: 'draft' | 'publish';
  defaultPostType: 'posts' | 'pages';
}

export interface KeywordMetrics {
  volume: string;
  difficulty: number;
  cpc: string;
  competition: 'Low' | 'Medium' | 'High';
  intent: 'Informational' | 'Transactional' | 'Commercial' | 'Navigational';
}

export interface BrandVoice {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  archetype: string;
}

export interface ResearchData {
  statistics: { value: string; context: string; source: string }[];
  quotes: { text: string; author: string; title: string }[];
  keyInsights: string[];
  sources: { title: string; url: string }[];
}

export interface ArticleConfig {
  mainKeyword: string;
  title: string;
  language: string;
  articleSize: 'Small' | 'Medium' | 'Large';
  tone: string;
  brandVoiceId?: string;
  pointOfView: string;
  targetCountry: string;
  articleType: string;
  aiModel: string;
  readability: string;
  aiContentCleaning: string;
  humanize: boolean;
  detailsToInclude: string;
  includeImages: boolean;
  imageStyle: string;
  imagesCount: number;
  imageSize: string;
  includeYouTube: boolean;
  youtubeCount: number;
  youtubeLayout: string;
  keywordsToInclude: string;
  introHook: string;
  includeTableOfContents: boolean;
  includeH3: boolean;
  includeH4: boolean;
  includeH5: boolean;
  includeLists: boolean;
  includeTables: boolean;
  includeItalics: boolean;
  includeQuotes: boolean;
  includeKeyTakeaways: boolean;
  includeConclusion: boolean;
  includeFAQ: boolean;
  includeBold: boolean;
  connectToWeb: boolean;
  useResearchAgent: boolean;
  outlineEditorEnabled: boolean;
  // WordPress Overrides
  wpStatus?: 'draft' | 'publish';
  wpPostType?: 'posts' | 'pages';
}

export interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  type: 'article' | 'image' | 'seo-report';
  createdAt: number;
  status: 'generating' | 'completed' | 'error';
  progress: number;
  metadata?: any;
  researchData?: ResearchData;
  wpUrl?: string;
}

export interface NavItem {
  id: View;
  label: string;
  icon: any;
}

export interface Stats {
  totalWords: number;
  articlesGenerated: number;
  imagesCreated: number;
  creditsUsed: number;
}
