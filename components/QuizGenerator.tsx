import React, { useState, useCallback, useRef } from 'react';
import { generateQuizFromText } from '../services/geminiService';
import type { Quiz } from '../types';
import QuizDisplay from './QuizDisplay';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';
import UploadIcon from './icons/UploadIcon';
import SparklesIcon from './icons/SparklesIcon';

const QuizGenerator: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [largeFileContent, setLargeFileContent] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<string>('10');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetQuizState = () => {
    setQuiz(null);
  };
  
  const handleCustomCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 2 && parseInt(value, 10) <= 50) { // only numbers up to 50
        setQuestionCount(value);
    } else if (value === '') {
        setQuestionCount('');
    }
  }

  const handleGenerateQuiz = useCallback(async () => {
    const textToProcess = largeFileContent || inputText;
    if (!textToProcess.trim()) {
      setError('Please provide some text or upload a file to generate a quiz.');
      return;
    }
    
    if (questionCount === '' || parseInt(questionCount, 10) === 0) {
      setError('Please specify a number of questions to generate.');
      return;
    }

    setIsLoading(true);
    setError(null);
    resetQuizState();

    try {
      // Chunking logic to handle large texts
      const CHUNK_SIZE = 15000; // Approx. 3-4k tokens
      const chunks: string[] = [];
      if (textToProcess.length > CHUNK_SIZE) {
        for (let i = 0; i < textToProcess.length; i += CHUNK_SIZE) {
            chunks.push(textToProcess.substring(i, i + CHUNK_SIZE));
        }
      } else {
        chunks.push(textToProcess);
      }
      
      const totalQuestions = questionCount === 'Max' ? -1 : parseInt(questionCount, 10);
      let totalMcq = totalQuestions === -1 ? 10 : Math.ceil(totalQuestions / 2); // 'Max' aims for 10 MCQ
      let totalTf = totalQuestions === -1 ? 10 : Math.floor(totalQuestions / 2); // and 10 T/F

      const combinedQuiz: Quiz = { multiple_choice: [], true_false: [] };
      let part = 1;

      if (chunks.length > 1) {
          setProcessingStatus(`Processing large document in ${chunks.length} parts...`);
      }
      
      for (const chunk of chunks) {
          if (chunks.length > 1) {
              setProcessingStatus(`Generating questions for part ${part} of ${chunks.length}...`);
          }
          
          let mcqPerChunk = totalMcq;
          let tfPerChunk = totalTf;

          if (chunks.length > 1 && totalQuestions !== -1) {
              mcqPerChunk = Math.ceil(totalMcq / chunks.length);
              tfPerChunk = Math.ceil(totalTf / chunks.length);
          }

          const chunkQuiz = await generateQuizFromText(chunk, mcqPerChunk, tfPerChunk);
          if (chunkQuiz.multiple_choice) {
            combinedQuiz.multiple_choice.push(...chunkQuiz.multiple_choice);
          }
          if (chunkQuiz.true_false) {
            combinedQuiz.true_false.push(...chunkQuiz.true_false);
          }
          part++;
      }
      
      if (totalQuestions !== -1) {
          combinedQuiz.multiple_choice = combinedQuiz.multiple_choice.slice(0, totalMcq);
          combinedQuiz.true_false = combinedQuiz.true_false.slice(0, totalTf);
      }

      if (combinedQuiz.multiple_choice.length === 0 && combinedQuiz.true_false.length === 0) {
        throw new Error("Could not generate any meaningful questions from the provided document. Please try a different file.");
      }

      setQuiz(combinedQuiz);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setProcessingStatus(null);
      // Do not clear largeFileContent here to allow regeneration with different question counts
    }
  }, [inputText, largeFileContent, questionCount]);
  
  const handleReset = () => {
      setInputText('');
      resetQuizState();
      setError(null);
      setLargeFileContent(null);
      setQuestionCount('10');
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const isDocx = fileName.endsWith('.docx');
    const isTxt = fileName.endsWith('.txt');

    if (!isPdf && !isDocx && !isTxt) {
        setError('Please upload a valid PDF, DOCX, or TXT file.');
        return;
    }

    setProcessingStatus('Reading file...');
    setError(null);
    resetQuizState();
    setInputText('');
    setLargeFileContent(null);
    setIsLoading(true);

    try {
        let fullText = '';
        if (isPdf) {
            setProcessingStatus('Reading PDF...');
            const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist');
            GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await getDocument(arrayBuffer).promise;
            const numPages = pdf.numPages;

            for (let i = 1; i <= numPages; i++) {
                setProcessingStatus(`Extracting text from page ${i} of ${numPages}...`);
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                fullText += pageText + '\n\n';
            }
        } else if (isDocx) {
            setProcessingStatus('Reading DOCX file...');
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            fullText = result.value;
        } else if (isTxt) {
            setProcessingStatus('Reading TXT file...');
            fullText = await file.text();
        }
        
        const trimmedText = fullText.trim();
        const TEXT_AREA_CHAR_LIMIT = 50000;
        
        if (trimmedText.length > TEXT_AREA_CHAR_LIMIT) {
            setLargeFileContent(trimmedText);
            setInputText(`Successfully loaded a large document (${(trimmedText.length / 1000).toFixed(1)}k chars). The content is hidden for performance. Click "Generate Quiz" to proceed.`);
        } else {
            setInputText(trimmedText);
            setLargeFileContent(null);
        }

    } catch (e: any) {
        console.error("Error processing file:", e);
        setError(`Failed to process the file. It might be corrupted or in an unsupported format. Error: ${e.message}`);
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
  const canGenerate = (inputText.trim() || largeFileContent) && !isBusy;

  return (
    <div className="space-y-8">
      {!quiz ? (
        <>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">Let's Get Started</h2>
                <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
                    Provide your course material below to generate a quiz.
                </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200/80">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="text-input" className="block text-base font-semibold text-slate-800 mb-2">
                            Paste your text or upload a file
                        </label>
                        <textarea
                            id="text-input"
                            value={inputText}
                            onChange={(e) => {
                                setInputText(e.target.value);
                                setLargeFileContent(null); // Clear large file content if user types manually
                            }}
                            placeholder="Paste an article, a book chapter, or any study material here..."
                            className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-700 disabled:bg-slate-100"
                            disabled={isBusy || !!largeFileContent}
                        />
                    </div>

                    <div>
                        <label className="block text-base font-semibold text-slate-800 mb-3">
                           How many questions would you like to generate?
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                            {['5', '10', '20', 'Max'].map(count => (
                            <button
                                key={count}
                                type="button"
                                onClick={() => setQuestionCount(count)}
                                className={`px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                                questionCount === count
                                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-offset-2 ring-indigo-500'
                                    : 'bg-white hover:bg-indigo-50 text-indigo-800 border border-slate-300'
                                }`}
                            >
                                {count}
                            </button>
                            ))}
                            <div className="relative">
                            <input
                                type="number"
                                value={['5', '10', '20', 'Max'].includes(questionCount) ? '' : questionCount}
                                onChange={handleCustomCountChange}
                                placeholder="Custom"
                                className={`w-28 px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-sm text-center border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                !['5', '10', '20', 'Max'].includes(questionCount)
                                    ? 'bg-indigo-600 text-white shadow-md border-transparent placeholder-indigo-200'
                                    : 'bg-white hover:bg-indigo-50 text-indigo-800 border-slate-300 placeholder-slate-400'
                                }`}
                            />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button
                        onClick={triggerFileUpload}
                        disabled={isBusy}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-base font-semibold rounded-lg shadow-sm text-slate-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <UploadIcon />
                        {processingStatus || 'Upload File (.pdf, .docx, .txt)'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                    />
                    <button
                        onClick={handleGenerateQuiz}
                        disabled={!canGenerate}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                    >
                        {isLoading ? <Loader /> : <SparklesIcon />}
                        {isLoading ? 'Generating...' : 'Generate Quiz'}
                    </button>
                </div>
            </div>
        </>
      ) : (
        <QuizDisplay quiz={quiz} onReset={handleReset} />
      )}
      {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
    </div>
  );
};

export default QuizGenerator;
