export type Role = 'user' | 'model';

export interface GroundingChunk {
  web?: {
    // FIX: Made uri and title optional to align with the @google/genai SDK's GroundingChunk type, resolving a type mismatch error.
    uri?: string;
    title?: string;
  };
}

export interface ChatMessage {
  role: Role;
  text: string;
  groundingChunks?: GroundingChunk[];
  imageUrl?: string;
}

export interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  answer: string;
  explanation: string;
}
