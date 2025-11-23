import { GoogleGenAI } from "@google/genai";
import { StudySession } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY || ''; 
  // In a real app, we handle missing keys more gracefully. 
  // For this demo, we assume the environment injects it.
  return new GoogleGenAI({ apiKey });
};

export const getMotivationalQuote = async (currentHours: number): Promise<string> => {
  try {
    const ai = initGenAI();
    const prompt = `Generate a short, punchy motivational quote for a student who has studied for ${Math.floor(currentHours)} hours towards a 400-hour goal. 
    Do not use quotes from famous people, generate a new one. 
    Keep it under 20 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Consistency is the key to mastery. Keep going!";
  }
};

export const getStudySummary = async (sessions: StudySession[]): Promise<string> => {
  try {
    const ai = initGenAI();
    
    // Get last 5 sessions for context
    const recentSessions = sessions.slice(0, 5).map(s => 
      `- ${new Date(s.startTime).toLocaleDateString()}: Studied ${s.subject} for ${Math.floor(s.durationSeconds / 60)} mins. Note: ${s.notes}`
    ).join('\n');

    const prompt = `Here are my recent study sessions:\n${recentSessions}\n\n
    Based on this, give me a 2-sentence summary of my progress and 1 specific tip for my next session. 
    Talk to me like a supportive coach.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Great job logging your sessions! Review your notes to consolidate memory.";
  }
};