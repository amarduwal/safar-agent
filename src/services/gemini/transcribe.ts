import { getModel } from './client';

export interface TranscriptionResult {
  text: string;
  detectedLanguage: 'ne' | 'en' | 'hi' | 'ar' | 'ms' | 'unknown';
  confidence: number;
}

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<TranscriptionResult> {
  const model = getModel({
    systemInstruction: `You are a transcription service specializing in Nepali language audio.
    Transcribe the audio accurately. If the speaker switches between Nepali and another language,
    transcribe everything. Return JSON with: text (transcription), detectedLanguage (ne/en/hi/ar/ms/unknown), confidence (0-1).`,
  });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: audioBuffer.toString('base64'),
      },
    },
    'Transcribe this audio message. Return only valid JSON: {"text": "...", "detectedLanguage": "ne", "confidence": 0.95}',
  ]);

  const responseText = result.response.text().trim();
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { text: responseText, detectedLanguage: 'ne', confidence: 0.7 };
  }
}

export async function translateToEnglish(nepaliText: string): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(
    `Translate this Nepali text to English accurately. Return only the translation, no explanation.\n\nNepali: ${nepaliText}`
  );
  return result.response.text().trim();
}
