import React from 'react';
import Header from './components/Header';
import QuizGenerator from './components/QuizGenerator';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';

const BackgroundPattern = () => (
    <div className="absolute inset-0 z-[-1] overflow-hidden">
        <svg
            className="absolute left-[50%] top-0 h-[100%] w-[100%] -translate-x-1/2"
            aria-hidden="true"
        >
            <defs>
                <pattern
                    id="subtle-pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                >
                    <path d="M.5 20v20H20" fill="none" stroke="rgba(156, 172, 192, 0.4)" strokeWidth="1"></path>
                    <path d="M20.5 0v20H40" fill="none" stroke="rgba(156, 172, 192, 0.4)" strokeWidth="1"></path>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#subtle-pattern)"></rect>
        </svg>
    </div>
);

const App: React.FC = () => {
  return (
    <>
    <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animate-shake { animation: shake 0.3s ease-in-out forwards; }
    `}</style>
    <div className="min-h-screen font-sans text-slate-700 bg-slate-300 relative">
      <BackgroundPattern />
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <div id="quiz-generator-section" className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 sm:py-24 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <QuizGenerator />
        </div>
      </main>
      <footer className="text-center py-6 text-sm text-slate-600">
        <p>Powered by Google Gemini. Always review questions for accuracy and appropriateness.</p>
      </footer>
    </div>
    </>
  );
};

export default App;