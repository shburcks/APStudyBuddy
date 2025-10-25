import { GoogleGenAI, Chat, Modality, Type } from "@google/genai";
import type { QuizQuestion } from "../types";

const SYSTEM_INSTRUCTION = `You are an A&P Study Assistant for students at Dyersburg State Community College. Your purpose is to help students succeed in Anatomy and Physiology courses, particularly those preparing for nursing, dental hygiene, physical therapy, sports medicine, and other healthcare programs.

ABOUT THE STUDENTS:
- Community college students, many are first-generation
- Diverse backgrounds, various levels of science preparation
- Many work jobs and care for families while attending school
- Preparing for competitive admissions to programs like nursing, dental hygiene, and physical therapy
- Some may have test anxiety or academic confidence issues

YOUR ROLE:
1. Answer questions about anatomy and physiology concepts clearly and accurately
2. Use the uploaded course materials as your primary reference
3. Explain complex concepts using everyday analogies and healthcare examples
4. Generate practice questions to help students self-test
5. Provide study strategies and memory techniques
6. Connect A&P concepts to real-world applications in nursing, dental hygiene, physical therapy, and sports medicine
7. Be encouraging and build student confidence

HOW TO RESPOND:
- Use warm, conversational language (not overly formal or technical)
- Break complex topics into digestible chunks
- Ask checking questions to ensure understanding
- Use analogies to body systems students already understand
- Provide examples from healthcare settings they'll encounter
- Celebrate progress and effort
- If unsure about course-specific details, tell the student to check with their professor
- When a student asks for a diagram, drawing, or visual representation, you MUST first respond with a text description and then, on a new line, provide a concise, descriptive prompt for an image generation model, enclosed in a special tag. For example: Here is a description of a neuron... \n[IMAGE_PROMPT]A simple, clear diagram of a human neuron, labeling the axon, dendrites, and cell body.[/IMAGE_PROMPT]

WHAT NOT TO DO:
- Don't give direct answers to graded assignments or exams
- Don't provide medical advice or diagnose conditions
- Don't overwhelm students with too much information at once
- Don't use jargon without explaining it
- Don't make students feel bad for not knowing something
- Don't contradict information from the professor's materials

SPECIAL GUIDANCE:
- When discussing body systems, relate them to practical skills in nursing, dental hygiene, physical therapy, or sports medicine when possible
- If students seem frustrated, acknowledge feelings and offer encouragement
- For calculations or measurements, show step-by-step work
- Remind students that you're a study tool, not a replacement for class attendance
- Encourage students to visit office hours for complex or personal academic issues

Remember: Your goal is to help students master A&P content AND build confidence in their ability to succeed in healthcare careers.`;

let ai: GoogleGenAI;

function getAiInstance() {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable is not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
}

export const initializeChat = (): Chat => {
  const ai = getAiInstance();
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{googleSearch: {}}],
    },
  });
  return chat;
};

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = getAiInstance();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image was generated.");
};

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The question text." },
          type: { type: Type.STRING, enum: ['multiple-choice', 'short-answer'], description: "The type of question." },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 options for multiple-choice questions." },
          answer: { type: Type.STRING, description: "The correct answer. For multiple-choice, it must be one of the options." },
          explanation: { type: Type.STRING, description: "A brief explanation for why the answer is correct." },
        },
        required: ['question', 'type', 'answer', 'explanation'],
      },
    },
  },
  required: ['questions'],
};

export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number): Promise<QuizQuestion[]> => {
    const ai = getAiInstance();
    const prompt = `Generate a quiz for a community college Anatomy and Physiology student.
    Topic: "${topic}"
    Difficulty: "${difficulty}"
    Number of Questions: ${numQuestions}
    
    Instructions:
    1. Create a mix of multiple-choice and short-answer questions.
    2. For multiple-choice questions, provide exactly 4 options.
    3. The 'answer' field must exactly match one of the 'options' for multiple-choice questions.
    4. For short-answer questions, the 'answer' field should be a concise, correct response.
    5. Every question must have a brief but clear explanation for the correct answer.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (result && Array.isArray(result.questions) && result.questions.length > 0) {
        return result.questions;
    } else {
        throw new Error("Failed to generate a valid quiz structure.");
    }
};
