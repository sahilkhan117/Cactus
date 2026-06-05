import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = (): GoogleGenerativeAI => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

/**
 * Generates a 768-dimensional vector embedding for the given input text
 * using Google's text-embedding-004 model.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    
    if (result && result.embedding && result.embedding.values) {
      return result.embedding.values;
    }
    throw new Error("No embedding values returned from Gemini API");
  } catch (error: any) {
    console.error("Gemini API Embedding Error:", error.message || error);
    throw new Error(`Failed to generate text embedding: ${error.message || error}`);
  }
}
