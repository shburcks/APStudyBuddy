import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import { CheckIcon, XIcon } from './icons';

interface QuizViewProps {
  questions: QuizQuestion[];
  onExit: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerChange = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  if (isSubmitted) {
    const score = userAnswers.reduce((acc, answer, index) => {
        const correctAnswer = questions[index].answer;
        const isCorrect = answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        return isCorrect ? acc + 1 : acc;
    }, 0);

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Results</h2>
        <p className="text-lg font-semibold text-blue-600 mb-6">You scored {score} out of {totalQuestions}!</p>
        <div className="space-y-6">
          {questions.map((q, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
            return (
              <div key={index} className={`p-4 rounded-lg border ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <p className="font-semibold text-slate-800 mb-2">Q: {q.question}</p>
                <div className="flex items-center gap-2 text-sm">
                  {isCorrect ? <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0"/> : <XIcon className="w-5 h-5 text-red-600 flex-shrink-0" />}
                  <span className={`${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    Your answer: <span className="font-medium">{userAnswer || '(No answer)'}</span>
                    {!isCorrect && <span className="ml-2">| Correct answer: <span className="font-medium">{q.answer}</span></span>}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 pt-2 border-t border-slate-200">
                    <span className="font-semibold">Explanation:</span> {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
        <button onClick={onExit} className="mt-8 w-full px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md transition-all duration-200 hover:bg-blue-700">
          Back to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Quiz Time!</h2>
        <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {currentQuestionIndex + 1} / {totalQuestions}
        </span>
      </div>

      <div className="my-6">
        <p className="text-lg font-semibold text-slate-700 mb-4">{currentQuestion.question}</p>
        {currentQuestion.type === 'multiple-choice' ? (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label key={option} className="flex items-center p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-blue-50 has-[:checked]:bg-blue-100 has-[:checked]:border-blue-400">
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={userAnswers[currentQuestionIndex] === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            value={userAnswers[currentQuestionIndex]}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            rows={3}
          />
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2 text-sm font-semibold bg-slate-200 text-slate-700 rounded-lg enabled:hover:bg-slate-300 disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
          </button>
        ) : (
          <button onClick={() => setIsSubmitted(true)} className="px-5 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700">
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;
