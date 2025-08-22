import React from 'react';
import DocumentTextIcon from './icons/DocumentTextIcon';
import SparklesIcon from './icons/SparklesIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import NoSymbolIcon from './icons/NoSymbolIcon';

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}> = ({ icon, title, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-slate-600">{children}</p>
    </div>
);

const Features: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">The Smart, Fast, and Simple Test Maker</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FeatureCard 
                    icon={<SparklesIcon />}
                    title="Effortless Test Creation"
                >
                    Just upload your PDF, DOCX, or TXT file, and our AI does the heavy lifting to create relevant questions.
                </FeatureCard>
                <FeatureCard 
                    icon={<DocumentTextIcon />}
                    title="Flexible & Versatile"
                >
                    Download your quiz in multiple formats (PDF, DOCX, TXT), perfect for printing, sharing, or editing.
                </FeatureCard>
                <FeatureCard 
                    icon={<NoSymbolIcon />}
                    title="No Signup Required"
                >
                    Start generating quizzes immediately. No accounts, no logins, no hassle. It's completely free.
                </FeatureCard>
                <FeatureCard
                    icon={<ShieldCheckIcon />}
                    title="Secure and Private"
                >
                    Your documents are processed securely and are never stored on our servers. Your privacy is guaranteed.
                </FeatureCard>
            </div>
        </div>
    </div>
  );
};

export default Features;