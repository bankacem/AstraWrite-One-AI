
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ActionableTipsProps {
    tips: string[];
}

const ActionableTips: React.FC<ActionableTipsProps> = ({ tips }) => {
    return (
        <div>
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-orange-500" /> Optimization Checklist
            </h3>
            <ul className="space-y-3">
                {tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm p-4 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold shrink-0">{i+1}</span>
                        <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{tip}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ActionableTips;
