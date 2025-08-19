import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/80 sticky top-0 z-10 shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-5 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-sky-400 to-indigo-500 text-transparent bg-clip-text">
          AI Quiz Generator
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Instantly create engaging quizzes from your course materials.
        </p>
      </div>
    </header>
  );
};

export default Header;