import React from 'react';

const Instructions: React.FC = () => {
  return (
    <div className="bg-sky-900/30 border border-sky-700/40 text-slate-300 p-5 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-sky-300 mb-3">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-slate-400">
            <li>
                <strong>Provide Content:</strong> Paste your text directly into the text area below, or click 'Upload PDF' to have text extracted automatically.
            </li>
            <li>
                <strong>Generate Quiz:</strong> Click the 'Generate Quiz' button and the AI will create questions based on your material.
            </li>
            <li>
                <strong>Take the Quiz:</strong> Answer all the questions and click 'Submit Quiz' to see your results instantly.
            </li>
        </ol>
    </div>
  );
};

export default Instructions;