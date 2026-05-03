import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../../config';

let genAI: GoogleGenerativeAI | null = null;

export function getGemini(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(config.google.geminiApiKey);
  }
  return genAI;
}

export function getModel(options?: { systemInstruction?: string }): GenerativeModel {
  return getGemini().getGenerativeModel({
    model: config.google.geminiModel,
    systemInstruction: options?.systemInstruction,
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 4096,
    },
  });
}

export function getVisionModel(): GenerativeModel {
  return getGemini().getGenerativeModel({
    model: config.google.geminiModel,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  });
}
