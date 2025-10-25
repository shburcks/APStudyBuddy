import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { BotIcon, UserIcon } from './icons';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  const formatText = (text: string) => {
    // Basic markdown-like formatting
    const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const listItems = bolded.replace(/(\r\n|\n|\r)\* (.*)/g, (match, p1, p2) => {
        return `<br /><li class="ml-4 list-disc">${p2}</li>`;
      });
    return { __html: listItems.replace(/\n/g, '<br />') };
  };

  return (
    <div className={`flex items-start gap-4 my-4 ${isModel ? '' : 'justify-end'}`}>
      {isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
          <BotIcon className="w-6 h-6 text-slate-600" />
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-2xl shadow-sm ${
          isModel
            ? 'bg-white text-slate-800 rounded-tl-none'
            : 'bg-blue-600 text-white rounded-br-none'
        }`}
      >
        <div className="text-sm prose" dangerouslySetInnerHTML={formatText(message.text)} />
        {message.imageUrl && (
            <img src={message.imageUrl} alt="Generated visual aid" className="mt-4 rounded-lg shadow-md" />
        )}
        {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Sources:</h4>
                <ol className="text-xs list-decimal list-inside">
                    {/* FIX: Added checks for chunk.web.uri and chunk.web.title to safely render source links, as these properties are now optional. */}
                    {message.groundingChunks.map((chunk, index) => (
                        chunk.web && chunk.web.uri && chunk.web.title && <li key={index} className="truncate">
                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {chunk.web.title}
                            </a>
                        </li>
                    ))}
                </ol>
            </div>
        )}
      </div>
      {!isModel && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-blue-700" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
