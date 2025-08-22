import React from 'react';

const Hero: React.FC = () => {
  const handleScrollToGenerator = () => {
    const generatorSection = document.getElementById('quiz-generator-section');
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="text-center py-20 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900">
        Instantly Create Tests From Any Document
      </h1>
      <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-600">
        Free and easy test maker for teachers and students. Just upload your file and let our AI generate multiple-choice and true-or-false questions in seconds.
      </p>
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleScrollToGenerator}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-300 focus:ring-indigo-500 transform hover:scale-105 active:scale-100 transition-all duration-200"
        >
          Generate Your Quiz Now
        </button>
      </div>
    </div>
  );
};

export default Hero;