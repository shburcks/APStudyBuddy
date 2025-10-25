import React from 'react';

interface ConversationStartersProps {
  onSelectStarter: (prompt: string) => void;
  isLoading: boolean;
}

const starters = [
  'Help me understand the difference between arteries and veins',
  'Give me a practice quiz on the skeletal system',
  'How does the muscular system relate to physical therapy?',
  'What are the best ways to memorize cranial nerves?',
];

const ConversationStarters: React.FC<ConversationStartersProps> = ({ onSelectStarter, isLoading }) => {
  return (
    <div className="p-4">
        <h2 className="text-lg font-semibold text-slate-700 mb-3 text-center">Or try one of these starters:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {starters.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectStarter(prompt)}
            disabled={isLoading}
            className="p-4 bg-white border border-slate-200 rounded-lg text-left text-sm font-medium text-blue-700 transition duration-200 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationStarters;