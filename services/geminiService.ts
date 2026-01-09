
import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionResponse } from "../types";

export const processVideoWithGemini = async (videoBase64: string, mimeType: string): Promise<TranscriptionResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a professional subtitle editor for Instagram Reels. 
    Your task is to transcribe this video, which may contain speech in Russian (RU) and French (FR).
    
    CRITICAL CONSTRAINTS:
    1. Language: Bilingual (RU/FR). Transcribe everything accurately.
    2. Format: Return a JSON array of subtitles.
    3. Line Structure: Exactly ONE line per subtitle. No line breaks.
    4. Character Count: Target 18-26 characters per subtitle. Minimum 5, Maximum 30 characters.
    5. Timing: Minimum duration 1.0 second. Maximum duration 2.2 seconds.
    6. Linguistic Logic: Do not end a subtitle with a preposition (RU: в, на, с, у; FR: à, de, en, avec) or an article (FR: le, la, les, un, une, des) if possible.
    7. Segmentation: Split by logical pauses, punctuation, or when character limits are reached.
    
    Output JSON format:
    {
      "subtitles": [
        { "start": 0.0, "end": 1.5, "text": "Привет всем друзьям" },
        ...
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: videoBase64, mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtitles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.NUMBER },
                  end: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                },
                required: ["start", "end", "text"]
              }
            }
          },
          required: ["subtitles"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result as TranscriptionResponse;
  } catch (error) {
    console.error("Gemini processing error:", error);
    throw error;
  }
};
