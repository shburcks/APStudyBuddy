// Lightweight client-side placeholder for development/build-time resolution.
// IMPORTANT: This file is a shim only — do NOT put secret keys or call Google APIs
// directly from browser code. Replace these functions with calls to your server
// API routes that call Google Generative AI with a service account.

type SendMessageInput = { message: string };
type SendMessageResponse = { text: string; candidates?: any[] };

export function initializeChat() {
  const chat = {
    // Accepts { message } and returns { text, candidates }
    sendMessage: async ({ message }: SendMessageInput): Promise<SendMessageResponse> => {
      // Simulate latency
      await new Promise((r) => setTimeout(r, 600));
      // Simple echo response for development
      return {
        text: `Echo: ${message}`,
        candidates: [],
      };
    },
  };

  // Cast to any to avoid strict type coupling with '@google/genai' types in the client
  return chat as unknown as any;
}

export async function generateImage(prompt: string): Promise<string> {
  // Return a placeholder image URL. Replace with server-side image generation.
  const safe = encodeURIComponent(prompt.slice(0, 40));
  return `https://via.placeholder.com/512.png?text=${safe}`;
}

export async function generateQuiz(topic: string, difficulty: string, numQuestions: number) {
  // Return mocked quiz questions. Replace with server-side generation that calls your model.
  const questions = Array.from({ length: Math.max(1, numQuestions) }).map((_, i) => ({
    id: i + 1,
    question: `${difficulty} question ${i + 1} about ${topic}`,
    choices: [
      `Choice A for ${topic}`,
      `Choice B for ${topic}`,
      `Choice C for ${topic}`,
      `Choice D for ${topic}`,
    ],
    answerIndex: 0,
  }));

  // Simulate a small delay
  await new Promise((r) => setTimeout(r, 400));
  return questions;
}
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { initializeChat, generateImage, generateQuiz } from './services/geminiService';
import type { ChatMessage as ChatMessageType, QuizQuestion } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import ConversationStarters from './components/ConversationStarters';
import QuizSetupModal from './components/QuizSetupModal';
import QuizView from './components/QuizView';
import { SparklesIcon, QuizIcon } from './components/icons';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);


  useEffect(() => {
    try {
      const chatSession = initializeChat();
      setChat(chatSession);
    } catch (e) {
      setError((e as Error).message);
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleGenerateQuiz = async (topic: string, difficulty: string, numQuestions: number) => {
    setIsQuizModalOpen(false);
    setIsLoading(true);
    setError(null);
    try {
      const questions = await generateQuiz(topic, difficulty, numQuestions);
      setQuizQuestions(questions);
      setIsQuizActive(true);
      setChatHistory([]); // Clear chat history for the quiz
    } catch (e) {
      setError('Sorry, I was unable to generate the quiz. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitQuiz = () => {
    setIsQuizActive(false);
    setQuizQuestions(null);
  };

  const sendMessage = async (message: string) => {
    if (!chat || isLoading) return;

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessageType = { role: 'user', text: message };
    setChatHistory(prev => [...prev, userMessage, { role: 'model', text: 'Thinking...' }]);

    try {
      const response = await chat.sendMessage({ message });
      const responseText = response.text;
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      const imagePromptRegex = /\[IMAGE_PROMPT\](.*?)\[\/IMAGE_PROMPT\]/s;
      const match = responseText.match(imagePromptRegex);

      const modelMessage: ChatMessageType = {
        role: 'model',
        text: responseText.replace(imagePromptRegex, '').trim(),
        groundingChunks: groundingChunks || [],
      };
      
      setChatHistory(prev => [...prev.slice(0, -1), modelMessage]);

      if (match && match[1]) {
        const imagePrompt = match[1].trim();
        try {
          const generatedImageUrl = await generateImage(imagePrompt);
          setChatHistory(prev => {
              const newHistory = [...prev];
              const lastMessage = newHistory[newHistory.length - 1];
              if (lastMessage.role === 'model') {
                  lastMessage.imageUrl = generatedImageUrl;
              }
              return newHistory;
          });
        } catch (imgErr) {
          console.error("Image generation failed:", imgErr);
          setChatHistory(prev => {
              const newHistory = [...prev];
              const lastMessage = newHistory[newHistory.length - 1];
              if (lastMessage.role === 'model') {
                  lastMessage.text += "\n\n(Sorry, I couldn't create the image.)";
              }
              return newHistory;
          });
        }
      }
    } catch (e) {
      const errorMessage = 'An error occurred. Please try again.';
      setError(errorMessage);
      console.error(e);
      setChatHistory(prev => [...prev.slice(0, -1), { role: 'model', text: `Sorry, ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-slate-50 shadow-2xl">
      <header className="p-4 border-b border-slate-200 bg-white flex items-center justify-center gap-3">
        <SparklesIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800">A&P Study Buddy</h1>
      </header>

      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        {isLoading && !isQuizActive && (
             <div className="flex justify-center items-center h-full">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div>
                    <p className="mt-3 text-slate-500">Generating...</p>
                </div>
            </div>
        )}

        {isQuizActive && quizQuestions ? (
          <QuizView questions={quizQuestions} onExit={handleExitQuiz} />
        ) : (
          <>
            {chatHistory.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full">
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Welcome to your A&P Study Buddy!</h2>
                        <p className="text-slate-500 mb-6">Ask me anything, or test your knowledge with a quiz.</p>
                        
                        <button 
                            onClick={() => setIsQuizModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 mb-6 font-semibold text-white bg-blue-600 rounded-lg shadow-md transition-all duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <QuizIcon className="w-5 h-5" />
                            Start a Quiz
                        </button>

                        <ConversationStarters onSelectStarter={sendMessage} isLoading={isLoading} />
                    </div>
                </div>
            )}
            {chatHistory.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </>
        )}
         {error && (
            <div className="flex justify-center">
                <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm">
                    {error}
                </div>
            </div>
        )}
      </main>

      {!isQuizActive && (
        <footer className="sticky bottom-0">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </footer>
      )}

      <QuizSetupModal 
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onGenerate={handleGenerateQuiz}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
