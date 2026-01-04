
import React from 'react';
import { View, GeneratedContent, BrandVoice, ApiKeyConfig, AiProvider, WordPressConfig } from '../../types';
import DashboardHome from '../DashboardHome';
import Builder from '../ArticleWriter';
import BulkGenerator from '../BulkGenerator';
import ImageCreator from '../ImageCreator';
import SEOAnalyzer from '../SEOAnalyzer';
import CompetitorAnalyzer from '../CompetitorAnalyzer';
import ClusterGenerator from '../ClusterGenerator';
import SuperPageGenerator from '../SuperPageGenerator';
import RewriterTool from '../RewriterTool';
import BrandVoiceManager from '../BrandVoiceManager';
import DocumentEditor from '../DocumentEditor';
import ApiKeyManager from '../ApiKeyManager';
import Settings from '../Settings';

interface RouterProps {
    view: View;
    history: GeneratedContent[];
    brandVoices: BrandVoice[];
    apiKeys: ApiKeyConfig[];
    wpConfig: WordPressConfig;
    onNavigate: (view: View) => void;
    setWpConfig: (config: WordPressConfig) => void;
    onSave: (item: GeneratedContent) => void;
    onUpdate: (id: string, updates: Partial<GeneratedContent>) => void;
    onDelete: (id: string) => void;
    onAddBrandVoice: (voice: BrandVoice) => void;
    onDeleteBrandVoice: (id: string) => void;
    onAddKey: (label: string, key: string, provider: AiProvider) => void;
    onDeleteKey: (id: string) => void;
    onSelectKey: (id: string) => void;
}

const Router: React.FC<RouterProps> = ({
    view,
    history,
    brandVoices,
    apiKeys,
    wpConfig,
    onNavigate,
    setWpConfig,
    onSave,
    onUpdate,
    onDelete,
    onAddBrandVoice,
    onDeleteBrandVoice,
    onAddKey,
    onDeleteKey,
    onSelectKey,
}) => {
    switch (view) {
        case View.DASHBOARD:
            return <DashboardHome onNavigate={onNavigate} />;
        case View.BUILDER:
            return <Builder history={history} onSave={onSave} onUpdate={onUpdate} brandVoices={brandVoices} />;
        case View.BULK_GENERATOR:
            return <BulkGenerator onSave={onSave} onUpdate={onUpdate} />;
        case View.TOPIC_CLUSTERS:
            return <ClusterGenerator onSave={onSave} onUpdate={onUpdate} />;
        case View.DOCS:
        case View.HISTORY:
            return <DocumentEditor history={history} onUpdate={onUpdate} onDelete={onDelete} wpConfig={wpConfig} />;
        case View.IMAGES:
            return <ImageCreator onSave={onSave} />;
        case View.SEO:
            return <SEOAnalyzer />;
        case View.COMPETITOR_ANALYSIS:
            return <CompetitorAnalyzer />;
        case View.SUPER_PAGE:
            return <SuperPageGenerator onSave={onSave} onUpdate={onUpdate} />;
        case View.REWRITER:
            return <RewriterTool />;
        case View.BRAND_VOICE:
            return <BrandVoiceManager voices={brandVoices} onAddVoice={onAddBrandVoice} onDeleteVoice={onDeleteBrandVoice} />;
        case View.API_KEYS:
            return <ApiKeyManager apiKeys={apiKeys} onAddKey={onAddKey} onDeleteKey={onDeleteKey} onSelectKey={onSelectKey} />;
        case View.SETTINGS:
            return <Settings wpConfig={wpConfig} setWpConfig={setWpConfig} />;
        default:
            return <DashboardHome onNavigate={onNavigate} />;
    }
};

export default Router;
