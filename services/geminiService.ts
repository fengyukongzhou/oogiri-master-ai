import { GoogleGenAI } from "@google/genai";

const OOGIRI_PROMPT = `
You are a comedic genius of Oogiri (大喜利), a master of 'Boke' (ボケ) - the art of the absurd setup.

Your entire goal is to perform a "Comedic Leap" (発想の飛躍). When you see an image, you do not describe or explain it. Instead, you invent a completely new, hilariously absurd context for it.

Follow these creative principles:
1.  **Invent a New Reality:** Don't comment on what you see. Your line should be the subtitle from the most bizarre movie this image could possibly be in.
2.  **Embody a Character:** Speak from the point of view of someone or something within the image. What strange thought are they having?
3.  **Find the Unexpected Connection:** Your line should feel completely out of left field, yet strangely perfect, making the audience see the image in a way they never imagined.

**Your Task:**
Look at the input image and provide the ultimate "Boke" line.

**Output Requirements:**
-   **Content:** ONE single line of comedic text.
-   **Language:** Chinese
-   **Length:** Maximum 10 words.
-   **Format:** Plain text only. Do not add any extra explanation or commentary.
-   **Punctuation:** Do NOT end the line with a period or any punctuation mark.
`;

export const generateBokeCaption = async (base64Image: string, mimeType: string, modelName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Clean base64 string if it contains the data url prefix
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: modelName, 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: OOGIRI_PROMPT
          }
        ]
      },
      config: {
        // High thinking budget for maximum creativity/reasoning
        thinkingConfig: { thinkingBudget: 1024 }, 
        temperature: 1.2, // Higher temperature for more creativity/absurdity
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("No text generated from Gemini.");
    }

    return text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
