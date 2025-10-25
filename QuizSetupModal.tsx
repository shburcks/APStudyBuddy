import React, { useState } from 'react';

interface QuizSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (topic: string, difficulty: string, numQuestions: number) => void;
  isLoading: boolean;
}

const QuizSetupModal: React.FC<QuizSetupModalProps> = ({ isOpen, onClose, onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numQuestions, setNumQuestions] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic, difficulty, numQuestions);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Quiz Setup</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., The Skeletal System"
                  className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div>
                <label htmlFor="numQuestions" className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Questions
                </label>
                <select
                  id="numQuestions"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full p-3 bg-slate-100 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg flex items-center justify-center transition duration-200 enabled:hover:bg-blue-700 disabled:bg-slate-300"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-dashed rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizSetupModal;
