import React, { useEffect, useRef } from 'react';
import type { Quiz, MultipleChoiceQuestion, TrueFalseQuestion, UserAnswers } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import ScoreDisplay from './ScoreDisplay';

interface QuizDisplayProps {
  quiz: Quiz;
  userAnswers: UserAnswers;
  submitted: boolean;
  score: number | null;
  onAnswerChange: (questionKey: string, answer: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const getOptionPrefix = (option: string): string => {
  if (typeof option !== 'string') return '';
  const match = option.match(/^([A-D])\)?\.?\s*/);
  return match ? match[1] : '';
};

const getOptionText = (option: string): string => {
    if (typeof option !== 'string') return '';
    return option.replace(/^([A-D])\)?\.?\s*/, '').trim();
}

const McqCard: React.FC<{ 
    question: MultipleChoiceQuestion; 
    index: number;
    userAnswer: string | undefined;
    submitted: boolean;
    onAnswerChange: (questionKey: string, answer: string) => void;
}> = ({ question, index, userAnswer, submitted, onAnswerChange }) => {
  if (!question || typeof question.question !== 'string') return null;
  const questionKey = `mc-${index}`;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/60 transition-all duration-300 hover:shadow-sky-500/10 hover:-translate-y-1">
      <p className="font-semibold text-lg text-slate-200">
        <span className="font-bold text-sky-400 mr-2">{index + 1}.</span>{question.question}
      </p>
      <ul className="mt-4 space-y-3">
        {Array.isArray(question.options) && question.options.map((option, i) => {
          if (typeof option !== 'string') return null;

          const optionLetter = getOptionPrefix(option);
          if (!optionLetter) return null;

          const isCorrect = optionLetter === question.answer;
          const isSelected = userAnswer === optionLetter;
          
          let stateStyles = 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-sky-900/30 hover:border-sky-700';
          let animationClass = '';

          if (submitted) {
            if (isCorrect) {
              stateStyles = 'bg-green-800/40 border-green-600 text-slate-100 font-semibold ring-2 ring-green-700';
            } else if (isSelected) {
              stateStyles = 'bg-red-800/40 border-red-600 text-slate-100';
              animationClass = 'animate-shake';
            } else {
              stateStyles = 'bg-slate-700/30 border-slate-700 text-slate-500 opacity-70';
            }
          }

          return (
            <li key={i} className={animationClass}>
              <label className={`flex items-center p-3 rounded-lg border text-base transition-all duration-200 cursor-pointer ${stateStyles}`}>
                <input 
                  type="radio"
                  name={questionKey}
                  value={optionLetter}
                  checked={isSelected}
                  onChange={(e) => onAnswerChange(questionKey, e.target.value)}
                  disabled={submitted}
                  className="mr-3 h-4 w-4 text-sky-500 focus:ring-sky-400 border-slate-500 bg-slate-700"
                />
                <span className="flex-grow">{getOptionText(option)}</span>
                {submitted && (
                    isCorrect ? <CheckIcon className="text-green-400" /> : (isSelected ? <XIcon className="text-red-400" /> : null)
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const TfCard: React.FC<{ 
    question: TrueFalseQuestion; 
    index: number;
    userAnswer: string | undefined;
    submitted: boolean;
    mcqCount: number;
    onAnswerChange: (questionKey: string, answer: string) => void;
}> = ({ question, index, submitted, onAnswerChange, userAnswer, mcqCount }) => {
  if (!question || typeof question.question !== 'string' || typeof question.answer !== 'string') return null;
  const questionKey = `tf-${index}`;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700/60 transition-all duration-300 hover:shadow-purple-500/10 hover:-translate-y-1">
      <p className="font-semibold text-lg text-slate-200">
        <span className="font-bold text-purple-400 mr-2">{index + mcqCount + 1}.</span>{question.question}
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['True', 'False'].map(option => {
            const isCorrect = option === question.answer;
            const isSelected = userAnswer === option;
            
            let stateStyles = 'bg-slate-700/50 hover:bg-sky-900/30 hover:border-sky-700 text-slate-300 border-slate-600';
            let animationClass = '';

            if (submitted) {
                if(isCorrect) {
                    stateStyles = 'bg-green-800/40 border-green-600 text-slate-100 font-semibold ring-2 ring-green-700';
                } else if (isSelected) {
                    stateStyles = 'bg-red-800/40 border-red-600 text-slate-100';
                    animationClass = 'animate-shake';
                } else {
                    stateStyles = 'bg-slate-700/30 border-slate-700 text-slate-500 opacity-70';
                }
            } else if (isSelected) {
                stateStyles = 'bg-sky-800/50 border-sky-600 text-sky-200 ring-2 ring-sky-700 font-semibold';
            }
            
            return (
                <button
                    key={option}
                    onClick={() => onAnswerChange(questionKey, option)}
                    disabled={submitted}
                    className={`w-full flex justify-center items-center gap-2 p-3 rounded-lg border text-base font-medium transition-all duration-200 disabled:cursor-not-allowed ${stateStyles} ${animationClass}`}
                >
                    {submitted && (
                       isCorrect ? <CheckIcon className="text-green-400" /> : (isSelected ? <XIcon className="text-red-400" /> : null)
                    )}
                    {option}
                </button>
            )
        })}
      </div>
    </div>
  );
};


const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz, userAnswers, submitted, score, onAnswerChange, onSubmit, onReset }) => {
  const totalQuestions = (quiz.multiple_choice?.length || 0) + (quiz.true_false?.length || 0);
  const answeredQuestions = Object.keys(userAnswers).length;
  const allAnswered = totalQuestions > 0 && answeredQuestions === totalQuestions;
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitted) {
        scoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [submitted]);

  return (
    <div className="space-y-10">
      <div ref={scoreRef}>
        {submitted && score !== null && (
            <ScoreDisplay score={score} totalQuestions={totalQuestions} onReset={onReset} />
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-4 pb-2 border-b-2 border-sky-500/50">
          Multiple Choice Questions
        </h2>
        <div className="space-y-4">
          {Array.isArray(quiz?.multiple_choice) && quiz.multiple_choice.map((q, index) => (
            q ? <div key={`mc-wrapper-${index}`} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <McqCard 
                        key={`mc-${index}`} 
                        question={q} 
                        index={index} 
                        userAnswer={userAnswers[`mc-${index}`]}
                        submitted={submitted}
                        onAnswerChange={onAnswerChange}
                    />
                </div> : null
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-4 pb-2 border-b-2 border-purple-500/50">
          True/False Questions
        </h2>
        <div className="space-y-4">
          {Array.isArray(quiz?.true_false) && quiz.true_false.map((q, index) => (
             q ? <div key={`tf-wrapper-${index}`} className="animate-fade-in-up" style={{ animationDelay: `${(quiz.multiple_choice.length + index) * 100}ms` }}>
                    <TfCard 
                        key={`tf-${index}`} 
                        question={q} 
                        index={index}
                        userAnswer={userAnswers[`tf-${index}`]}
                        submitted={submitted}
                        onAnswerChange={onAnswerChange}
                        mcqCount={quiz.multiple_choice.length}
                    />
                 </div> : null
          ))}
        </div>
      </div>
      
      {!submitted && totalQuestions > 0 && (
        <div className="mt-8 text-center bg-slate-900/80 backdrop-blur-sm sticky bottom-4 py-4 rounded-xl shadow-lg border border-slate-700/60">
            <button
                onClick={onSubmit}
                disabled={!allAnswered}
                className="w-full sm:w-auto px-10 py-4 border border-transparent text-lg font-semibold rounded-lg shadow-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
                Submit Quiz
            </button>
            {!allAnswered && (
                <p className="text-sm text-slate-400 mt-2">{answeredQuestions} of {totalQuestions} questions answered.</p>
            )}
        </div>
      )}

    </div>
  );
};

export default QuizDisplay;