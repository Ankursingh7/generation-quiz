import React, { useState, useCallback, useRef } from 'react';
import { generateQuizFromText } from '../services/geminiService';
import type { Quiz, UserAnswers } from '../types';
import QuizDisplay from './QuizDisplay';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import Instructions from './Instructions';
import UploadIcon from './icons/UploadIcon';
import SparklesIcon from './icons/SparklesIcon';
import * as pdfjsLib from 'pdfjs-dist';

// Dynamically set the worker source based on the library's version to prevent mismatches.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const getOptionPrefix = (option: string): string => {
  if (typeof option !== 'string') return '';
  const match = option.match(/^([A-D])\)?\.?\s*/);
  return match ? match[1] : '';
};


const QuizGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for interactive quiz
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number | null>(null);

  const resetQuizState = () => {
    setQuiz(null);
    setUserAnswers({});
    setSubmitted(false);
    setScore(null);
  };

  const handleGenerateQuiz = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please provide some text or upload a PDF to generate a quiz.');
      return;
    }

    setIsLoading(true);
    setError(null);
    resetQuizState();

    try {
      const generatedQuiz = await generateQuizFromText(inputText);
      setQuiz(generatedQuiz);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  const handleAnswerChange = (questionKey: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionKey]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    
    let correctAnswers = 0;
    
    quiz.multiple_choice.forEach((q, index) => {
        const key = `mc-${index}`;
        if (userAnswers[key] === q.answer) {
            correctAnswers++;
        }
    });

    quiz.true_false.forEach((q, index) => {
        const key = `tf-${index}`;
        if (userAnswers[key] === q.answer) {
            correctAnswers++;
        }
    });

    setScore(correctAnswers);
    setSubmitted(true);
    // The QuizDisplay component will handle scrolling
  };
  
  const handleReset = () => {
      setInputText('');
      resetQuizState();
      setError(null);
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF file.');
        return;
    }

    setProcessingStatus('Reading PDF...');
    setError(null);
    resetQuizState();
    setInputText('');
    setIsLoading(true); // Use main loader for consistency

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const numPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
            setProcessingStatus(`Extracting text from page ${i} of ${numPages}...`);
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
            fullText += pageText + '\n\n';
        }

        setInputText(fullText.trim());
    } catch (e: any) {
        console.error("Error processing PDF:", e);
        setError(`Failed to process PDF. The file might be corrupted or protected. Error: ${e.message}`);
    } finally {
        setProcessingStatus(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const isBusy = isLoading || !!processingStatus;

  return (
    <div className="space-y-8">
      {!quiz && (
        <>
            <Instructions />
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl border border-slate-700/60 backdrop-blur-sm">
                <label htmlFor="chapter-text" className="block text-lg font-semibold text-slate-200 mb-2">
                Source Material
                </label>
                <textarea
                id="chapter-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste an article, upload a PDF, or enter any educational text..."
                className="w-full h-64 p-4 border border-slate-600 rounded-xl shadow-inner bg-slate-900/70 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 disabled:bg-slate-800"
                disabled={isBusy}
                />
            
                <div className="mt-5 flex flex-col sm:flex-row-reverse justify-between items-center gap-4">
                <button
                    onClick={handleGenerateQuiz}
                    disabled={isBusy || !inputText}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-lg text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100 transition-all duration-200"
                >
                    <SparklesIcon />
                    {isLoading && !processingStatus ? 'Generating...' : 'Generate Quiz'}
                </button>
                <button
                    type="button"
                    onClick={triggerFileUpload}
                    disabled={isBusy}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-3 border border-slate-600 text-base font-semibold rounded-lg shadow-md text-slate-300 bg-slate-800/50 hover:bg-slate-700/70 hover:border-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                    <UploadIcon />
                    Upload PDF
                </button>
                </div>
            </div>
        </>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        className="hidden"
      />

      {isBusy && (
        <div className="flex justify-center items-center flex-col text-center p-8 bg-slate-800/80 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-sm">
            <Loader large={true} className="text-sky-500" />
            <p className="mt-4 text-slate-300 font-medium text-lg">{processingStatus || 'Analyzing text & crafting questions...'}</p>
            <p className="text-sm text-slate-400">This may take a moment.</p>
        </div>
      )}
      {error && <ErrorMessage message={error} />}
      {quiz && (
        <QuizDisplay 
            quiz={quiz}
            userAnswers={userAnswers}
            submitted={submitted}
            score={score}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitQuiz}
            onReset={handleReset}
        />
      )}
    </div>
  );
};

export default QuizGenerator;