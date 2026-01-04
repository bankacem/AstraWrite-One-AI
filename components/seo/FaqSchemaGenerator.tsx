
import React from 'react';
import { Code } from 'lucide-react';

interface Faq {
    question: string;
    answer: string;
}

interface FaqSchemaGeneratorProps {
    faqData: Faq[];
}

const FaqSchemaGenerator: React.FC<FaqSchemaGeneratorProps> = ({ faqData }) => {

    const generateSchemaString = (faqs: Faq[]) => {
        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
                "@type": "Question",
                "name": f.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": f.answer
                }
            }))
        };
        return JSON.stringify(schema, null, 2);
    };

    return (
        <div className="mt-6 border-t border-indigo-100 dark:border-indigo-800 pt-6 animate-in fade-in">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
                <Code className="w-4 h-4" /> Generated FAQ Content & Schema
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Preview */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-slate-500">HTML Content</span>
                        <button
                            onClick={() => {
                                const html = faqData.map(f => `<h3>${f.question}</h3><p>${f.answer}</p>`).join('\n');
                                navigator.clipboard.writeText(html);
                                alert("HTML copied!");
                            }}
                            className="text-xs text-indigo-600 font-bold hover:underline"
                        >
                            Copy HTML
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {faqData.map((item, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">{item.question}</p>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* JSON-LD Schema */}
                <div className="relative">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-slate-500">JSON-LD Schema</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(generateSchemaString(faqData));
                                alert("Schema copied!");
                            }}
                            className="text-xs text-indigo-600 font-bold hover:underline"
                        >
                            Copy Code
                        </button>
                    </div>
                    <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg text-[10px] overflow-auto h-64 font-mono custom-scrollbar border border-slate-800">
                        {generateSchemaString(faqData)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default FaqSchemaGenerator;
