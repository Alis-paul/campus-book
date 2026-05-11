import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const chatWithAssistant = async (message: string, context?: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = `You are CampusBook AI assistant for VVCE college. You help faculty and students find available rooms and answer questions about room bookings. You have access to real-time room data. Always give specific room names and times. Keep responses under 3 sentences.`;

  const fullPrompt = context
    ? `${systemPrompt}\n\nCURRENT CAMPUS STATUS:\n${context}\n\nUser Question: ${message}`
    : `${systemPrompt}\n\nUser Question: ${message}`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response.text();

  return { response, tokens: 0 };
};

export const summarizeText = async (text: string, style: 'bullet' | 'paragraph') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Summarize this text in ${style} format: ${text}`;
  const result = await model.generateContent(prompt);
  return { summary: result.response.text(), tokens: 0 };
};

export const generateQuiz = async (material: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Generate 5 MCQs as JSON from this material: ${material}`;
  const result = await model.generateContent(prompt);
  return { quiz: result.response.text(), tokens: 0 };
};

export const evaluateEssay = async (essay: string) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Give feedback on this essay: ${essay}`;
  const result = await model.generateContent(prompt);
  return { feedback: result.response.text(), tokens: 0 };
};