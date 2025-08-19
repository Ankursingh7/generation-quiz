import React, { useState, useEffect } from 'react';
import RestartIcon from './icons/RestartIcon';

interface ScoreDisplayProps {
    score: number;
    totalQuestions: number;
    onReset: () => void;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, totalQuestions, onReset }) => {
    const [displayScore, setDisplayScore] = useState(0);
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    useEffect(() => {
        const animationDuration = 800; // ms
        const frameDuration = 1000 / 60; // 60 fps
        const totalFrames = Math.round(animationDuration / frameDuration);
        let frame = 0;

        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const currentScore = Math.round(score * progress);
            setDisplayScore(currentScore);

            if (frame === totalFrames) {
                clearInterval(counter);
                setDisplayScore(score); // Ensure final score is accurate
            }
        }, frameDuration);

        return () => clearInterval(counter);
    }, [score]);
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-slate-800/80 p-6 rounded-2xl shadow-2xl border border-slate-700/60 text-center animate-fade-in-score animate-subtle-glow backdrop-blur-sm">
             <style>{`
                @keyframes fade-in-score {
                    from { opacity: 0; transform: scale(0.9) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes subtle-glow {
                    0% { box-shadow: 0 0 20px -5px rgba(56, 189, 248, 0); }
                    50% { box-shadow: 0 0 25px 0px rgba(56, 189, 248, 0.2); }
                    100% { box-shadow: 0 0 20px -5px rgba(56, 189, 248, 0); }
                }
                .animate-fade-in-score { animation: fade-in-score 0.5s ease-out forwards; }
                .animate-subtle-glow { animation: subtle-glow 4s ease-in-out infinite; }
            `}</style>
            <h2 className="text-2xl font-bold text-slate-100">Quiz Complete!</h2>
            <p className="mt-2 text-lg text-slate-400">Your Score:</p>
            
            <div className="relative inline-flex items-center justify-center my-4">
                <svg className="w-40 h-40" viewBox="0 0 120 120">
                    <circle
                        className="text-slate-700"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="60"
                        cy="60"
                    />
                    <circle
                        className="text-sky-500"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r={radius}
                        cx="60"
                        cy="60"
                        transform="rotate(-90 60 60)"
                        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                    />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-extrabold text-sky-400">{displayScore}</span>
                    <span className="text-lg text-slate-400">/ {totalQuestions}</span>
                </div>
            </div>

            <p className="text-xl font-medium text-slate-300">
                You scored {Math.round(percentage)}%!
            </p>

            <button
                onClick={onReset}
                className="mt-6 inline-flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transform hover:scale-105 transition-all duration-200"
            >
                <RestartIcon />
                Start New Quiz
            </button>
        </div>
    );
};

export default ScoreDisplay;