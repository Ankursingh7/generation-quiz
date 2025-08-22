import React, { useState, useRef, useEffect } from 'react';
import type { Quiz, MultipleChoiceQuestion, TrueFalseQuestion } from '../types';
import CheckIcon from './icons/CheckIcon';
import RestartIcon from './icons/RestartIcon';
import DownloadIcon from './icons/DownloadIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface QuizDisplayProps {
  quiz: Quiz;
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
}> = ({ question, index }) => {
  if (!question || typeof question.question !== 'string') return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <p className="font-semibold text-lg text-slate-800">
        <span className="font-bold text-sky-600 mr-2">{index + 1}.</span>{question.question}
      </p>
      <ul className="mt-4 space-y-3">
        {Array.isArray(question.options) && question.options.map((option, i) => {
          if (typeof option !== 'string') return null;

          const optionLetter = getOptionPrefix(option);
          if (!optionLetter) return null;

          const isCorrect = optionLetter === question.answer;
          
          const stateStyles = isCorrect
            ? 'bg-green-100 border-green-300 text-green-900 font-semibold ring-2 ring-green-200'
            : 'bg-slate-100/70 border-slate-200 text-slate-700';

          return (
            <li key={i}>
              <div className={`flex items-center p-3 rounded-lg border text-base transition-colors duration-200 ${stateStyles}`}>
                <span className="flex-grow">
                    <span className="font-bold mr-2">{optionLetter})</span>
                    {getOptionText(option)}
                </span>
                {isCorrect && <CheckIcon className="text-green-600" />}
              </div>
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
    mcqCount: number;
}> = ({ question, index, mcqCount }) => {
  if (!question || typeof question.question !== 'string' || typeof question.answer !== 'string') return null;
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
      <p className="font-semibold text-lg text-slate-800">
        <span className="font-bold text-indigo-600 mr-2">{index + mcqCount + 1}.</span>{question.question}
      </p>
      <div className="mt-4">
        <div className="flex items-center p-3 rounded-lg border text-base bg-green-100 border-green-300 text-green-900 font-semibold">
            <CheckIcon className="mr-3 text-green-600 flex-shrink-0" />
            <span className="font-normal">Correct Answer:</span>
            <span className="font-bold ml-2">{question.answer}</span>
        </div>
      </div>
    </div>
  );
};


const QuizDisplay: React.FC<QuizDisplayProps> = ({ quiz, onReset }) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    if (isExportMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

  const triggerDownload = (content: string | Blob, filename: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateTxtContent = (): string => {
    if (!quiz) return '';
    let questionsText = "AI-Generated Quiz\n\n";
    let answerKeyText = "\n\nANSWER KEY\n";
    answerKeyText += "----------\n\n";

    if (Array.isArray(quiz.multiple_choice) && quiz.multiple_choice.length > 0) {
        questionsText += "MULTIPLE CHOICE QUESTIONS\n";
        questionsText += "-------------------------\n\n";
        quiz.multiple_choice.forEach((q, index) => {
            if (!q) return;
            questionsText += `${index + 1}. ${q.question}\n`;
            if(Array.isArray(q.options)) {
                q.options.forEach(opt => { questionsText += `   ${opt}\n`; });
            }
            questionsText += `\n`;
            const correctAnswerOption = q.options.find(o => getOptionPrefix(o) === q.answer) || q.answer;
            answerKeyText += `${index + 1}. ${correctAnswerOption}\n`;
        });
    }

    if (Array.isArray(quiz.true_false) && quiz.true_false.length > 0) {
        questionsText += "\nTRUE/FALSE QUESTIONS\n";
        questionsText += "----------------------\n\n";
        quiz.true_false.forEach((q, index) => {
            if (!q) return;
            const questionNumber = index + 1 + (quiz.multiple_choice?.length || 0);
            questionsText += `${questionNumber}. ${q.question}\n\n`;
            answerKeyText += `${questionNumber}. ${q.answer}\n`;
        });
    }
    return questionsText + answerKeyText;
  }

  const handleExport = async (format: 'txt' | 'pdf' | 'docx') => {
    setIsExportMenuOpen(false);
    if (!quiz) return;

    switch (format) {
      case 'txt': {
        const content = generateTxtContent();
        triggerDownload(content, 'quiz.txt', 'text/plain;charset=utf-8');
        break;
      }
      case 'pdf': {
        const { default: jsPDF } = await import('jspdf');
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const usableWidth = pageWidth - margin * 2;
        let y = 20;

        const addWrappedText = (text: string, x: number, yPos: number, options: { fontSize: number; fontStyle: 'normal' | 'bold'; } ) => {
          doc.setFontSize(options.fontSize).setFont('helvetica', options.fontStyle);
          const splitText = doc.splitTextToSize(text, usableWidth - (x > margin ? x - margin : 0));
          
          const textHeight = splitText.length * (options.fontSize * 0.35); // A reasonable height estimate
          if (yPos + textHeight > pageHeight - margin) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(splitText, x, yPos);
          return yPos + textHeight + 2;
        };
        
        y = addWrappedText('AI-Generated Quiz', margin, y, { fontSize: 22, fontStyle: 'bold' });
        y += 5;

        // Multiple Choice
        if (quiz.multiple_choice?.length > 0) {
          y = addWrappedText('Multiple Choice Questions', margin, y, { fontSize: 16, fontStyle: 'bold' });
          y += 1;
          doc.setLineWidth(0.2).line(margin, y, pageWidth - margin, y);
          y += 6;

          quiz.multiple_choice.forEach((q, index) => {
            if(!q) return;
            y = addWrappedText(`${index + 1}. ${q.question}`, margin, y, { fontSize: 12, fontStyle: 'bold' });
            if (Array.isArray(q.options)) {
              q.options.forEach(opt => {
                y = addWrappedText(`   ${opt}`, margin + 2, y, { fontSize: 12, fontStyle: 'normal' });
              });
            }
            y += 4;
          });
        }
        
        // True/False
        if (quiz.true_false?.length > 0) {
          y += 4;
          y = addWrappedText('True/False Questions', margin, y, { fontSize: 16, fontStyle: 'bold' });
          y += 1;
          doc.setLineWidth(0.2).line(margin, y, pageWidth - margin, y);
          y += 6;

          quiz.true_false.forEach((q, index) => {
            if(!q) return;
            const qNum = index + (quiz.multiple_choice?.length || 0) + 1;
            y = addWrappedText(`${qNum}. ${q.question}`, margin, y, { fontSize: 12, fontStyle: 'bold' });
            y += 4;
          });
        }
        
        // Answer Key - always on a new page for clarity
        doc.addPage();
        y = 20;
        y = addWrappedText('Answer Key', margin, y, { fontSize: 16, fontStyle: 'bold' });
        y += 1;
        doc.setLineWidth(0.2).line(margin, y, pageWidth - margin, y);
        y += 6;
        
        if (quiz.multiple_choice?.length > 0) {
            quiz.multiple_choice.forEach((q, index) => {
                if(!q) return;
                const correctAnswerOption = q.options.find(o => getOptionPrefix(o) === q.answer) || q.answer;
                y = addWrappedText(`${index + 1}. ${correctAnswerOption}`, margin, y, { fontSize: 12, fontStyle: 'normal' });
            });
        }
        if (quiz.true_false?.length > 0) {
            quiz.true_false.forEach((q, index) => {
                if(!q) return;
                const qNum = index + (quiz.multiple_choice?.length || 0) + 1;
                y = addWrappedText(`${qNum}. ${q.answer}`, margin, y, { fontSize: 12, fontStyle: 'normal' });
            });
        }

        doc.save('quiz.pdf');
        break;
      }
      case 'docx': {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
        const docChildren: any[] = [];
        
        docChildren.push(new Paragraph({ text: "AI-Generated Quiz", heading: HeadingLevel.TITLE, spacing: { after: 200 } }));

        if (quiz.multiple_choice?.length > 0) {
            docChildren.push(new Paragraph({ text: "Multiple Choice Questions", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }));
            quiz.multiple_choice.forEach((q, index) => {
                if(!q) return;
                docChildren.push(new Paragraph({
                    children: [new TextRun({ text: `${index + 1}. `, bold: true }), new TextRun(q.question)],
                    spacing: { after: 100 },
                }));
                if(Array.isArray(q.options)){
                    q.options.forEach(opt => {
                        docChildren.push(new Paragraph({ text: `\t${opt}`}));
                    });
                }
                docChildren.push(new Paragraph(""));
            });
        }
        
        if (quiz.true_false?.length > 0) {
            docChildren.push(new Paragraph({ text: "True/False Questions", heading: HeadingLevel.HEADING_1, spacing: { before: 200, after: 100 } }));
            quiz.true_false.forEach((q, index) => {
                if(!q) return;
                const qNum = index + (quiz.multiple_choice?.length || 0) + 1;
                docChildren.push(new Paragraph({
                    children: [new TextRun({ text: `${qNum}. `, bold: true }), new TextRun(q.question)],
                    spacing: { after: 200 },
                }));
            });
        }
        
        docChildren.push(new Paragraph({ text: "Answer Key", heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { before: 200, after: 100 } }));
        if (quiz.multiple_choice?.length > 0) {
            quiz.multiple_choice.forEach((q, index) => {
                if(!q) return;
                const correctAnswerOption = q.options.find(o => getOptionPrefix(o) === q.answer) || q.answer;
                docChildren.push(new Paragraph({
                    children: [new TextRun({ text: `${index + 1}. `, bold: true }), new TextRun(correctAnswerOption)],
                }));
            });
        }
        if (quiz.true_false?.length > 0) {
            quiz.true_false.forEach((q, index) => {
                if(!q) return;
                const qNum = index + (quiz.multiple_choice?.length || 0) + 1;
                docChildren.push(new Paragraph({
                    children: [new TextRun({ text: `${qNum}. `, bold: true }), new TextRun(q.answer)],
                }));
            });
        }

        const doc = new Document({ sections: [{ children: docChildren }] });
        
        const blob = await Packer.toBlob(doc);
        triggerDownload(blob, 'quiz.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        break;
      }
    }
  };


  return (
    <div className="space-y-10 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-sky-400/50">
          Multiple Choice Questions
        </h2>
        <div className="space-y-4">
          {Array.isArray(quiz?.multiple_choice) && quiz.multiple_choice.map((q, index) => (
            q ? <McqCard 
                    key={`mc-${index}`} 
                    question={q} 
                    index={index} 
                /> : null
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-indigo-400/50">
          True/False Questions
        </h2>
        <div className="space-y-4">
          {Array.isArray(quiz?.true_false) && quiz.true_false.map((q, index) => (
             q ? <TfCard 
                    key={`tf-${index}`} 
                    question={q} 
                    index={index}
                    mcqCount={quiz.multiple_choice.length}
                /> : null
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 py-4 sticky bottom-4">
         <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 p-4 bg-slate-300/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-400/60">
            <div ref={exportMenuRef} className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-300 focus:ring-indigo-500 transform hover:scale-105 transition-all duration-200"
                  id="options-menu"
                  aria-haspopup="true"
                  aria-expanded={isExportMenuOpen}
                >
                  <DownloadIcon />
                  Export Quiz
                  <ChevronDownIcon className="-mr-1 ml-2" />
                </button>
              </div>

              {isExportMenuOpen && (
                <div
                  className="origin-bottom-right absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <div className="py-1" role="none">
                    <button onClick={() => handleExport('txt')} className="w-full text-left text-slate-700 hover:bg-slate-100 block px-4 py-2 text-sm" role="menuitem">Export as .txt</button>
                    <button onClick={() => handleExport('pdf')} className="w-full text-left text-slate-700 hover:bg-slate-100 block px-4 py-2 text-sm" role="menuitem">Export as .pdf</button>
                    <button onClick={() => handleExport('docx')} className="w-full text-left text-slate-700 hover:bg-slate-100 block px-4 py-2 text-sm" role="menuitem">Export as .docx</button>
                  </div>
                </div>
              )}
            </div>

            <button
                onClick={onReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-400/80 text-base font-semibold rounded-lg shadow-md text-slate-700 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-300 focus:ring-indigo-500 transform hover:scale-105 transition-all duration-200"
            >
                <RestartIcon />
                Start New Quiz
            </button>
         </div>
      </div>

    </div>
  );
};

export default QuizDisplay;