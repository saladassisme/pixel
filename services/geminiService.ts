import { GoogleGenAI } from "@google/genai";
import { ProjectSize } from '../types';

// Switch to Gemini 2.5 Flash Image as it typically has better availability/quotas than Imagen models
const MODEL_NAME = 'gemini-2.5-flash-image';

export const generatePixelArtImage = async (prompt: string, size: ProjectSize = 'medium'): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Adjust prompt complexity based on target size
  let complexityInstruction = "";
  if (size === 'small') {
    complexityInstruction = "Pixel Art Style: 16-bit, low resolution, thick outlines, minimalist, icon style.";
  } else if (size === 'medium') {
    complexityInstruction = "Pixel Art Style: 32-bit, game sprite, clear shapes, vibrant colors.";
  } else {
    complexityInstruction = "Pixel Art Style: High detail, dithering, complex shading, masterpiece.";
  }

  const enhancedPrompt = `
    ${complexityInstruction}
    Subject: ${prompt}.
    
    Requirements:
    - Pure white background (#FFFFFF).
    - Flat 2D view.
    - No text, no watermarks.
    - Centered single object.
    - Square aspect ratio.
  `;

  try {
    // Use generateContent for gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          // imageSize is not supported on 2.5-flash-image
        }
      }
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("AI generated content but no image found.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // enhance error message for UI
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
       throw new Error("Quota exceeded. Please try again later.");
    }
    throw error;
  }
};

// Helper to generate variations
export const generatePixelArtVariations = async (prompt: string, size: ProjectSize = 'medium'): Promise<string[]> => {
  // Reduced to 1 request to prevent hitting rate limits (429) immediately.
  // Ideally, we would chain these if we wanted multiple, but for stability on free tiers, 1 is safer.
  try {
    const image = await generatePixelArtImage(prompt, size);
    return [image];
  } catch (e) {
    throw e;
  }
};