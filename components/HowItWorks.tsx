import React from 'react';
import UploadIcon from './icons/UploadIcon';
import SparklesIcon from './icons/SparklesIcon';
import DownloadIcon from './icons/DownloadIcon';

const Step: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    stepNumber: number;
}> = ({ icon, title, description, stepNumber }) => (
    <div className="relative">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white shadow-lg border border-slate-200">
            <span className="text-indigo-600">{icon}</span>
        </div>
        <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-slate-600">{description}</p>
        </div>
    </div>
);

const HowItWorks: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
            How It Works in 3 Simple Steps
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Creating a quiz has never been easier.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-y-12 gap-x-8 md:grid-cols-3">
          <Step
            stepNumber={1}
            icon={<UploadIcon />}
            title="Upload Your Document"
            description="Drag and drop or select a PDF, DOCX, or TXT file from your device."
          />
          <Step
            stepNumber={2}
            icon={<SparklesIcon />}
            title="Generate Questions"
            description="Our AI analyzes your text and instantly generates a quiz."
          />
          <Step
            stepNumber={3}
            icon={<DownloadIcon />}
            title="Review & Export"
            description="Review the quiz and download it in your preferred format (PDF, DOCX, or TXT)."
          />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;