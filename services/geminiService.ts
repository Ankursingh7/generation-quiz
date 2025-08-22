import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz } from '../types';

/**
 * Generates a quiz by sending the input text to the Gemini API.
 * @param {string} text The input text to generate the quiz from.
 * @param {number} numMcq The number of multiple-choice questions to generate.
 * @param {number} numTf The number of true/false questions to generate.
 * @returns {Promise<Quiz>} A promise that resolves to the generated quiz object.
 * @throws {Error} Throws an error if the API call fails.
 */
export const generateQuizFromText = async (text: string, numMcq: number, numTf: number): Promise<Quiz> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const quizSchema = {
      type: Type.OBJECT,
      properties: {
        multiple_choice: {
          type: Type.ARRAY,
          description: `An array of up to ${numMcq} multiple-choice questions. It's okay to generate fewer if the text is short.`,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The question text."
              },
              options: {
                type: Type.ARRAY,
                description: "An array of 4 potential answers, formatted like 'A) ...', 'B) ...', etc.",
                items: { type: Type.STRING }
              },
              answer: {
                type: Type.STRING,
                description: "The letter of the correct option (e.g., 'A', 'B', 'C', 'D')."
              },
            },
            required: ["question", "options", "answer"],
          },
        },
        true_false: {
          type: Type.ARRAY,
          description: `An array of up to ${numTf} true/false questions. It's okay to generate fewer if the text is short.`,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The statement for the true/false question."
              },
              answer: {
                type: Type.STRING,
                description: "The correct answer, either 'True' or 'False'."
              },
            },
            required: ["question", "answer"],
          },
        },
      },
      required: ["multiple_choice", "true_false"],
    };
    
    const prompt = `You are an expert Quiz Creator for educators. Your task is to generate a quiz from the provided text.

**Instructions:**
1.  Carefully analyze the input text below. It could be a standard article, a book chapter, or technical content like mathematical equations.
2.  Identify the key concepts, definitions, facts, and principles.
    -   If the text is prose, focus on the main ideas.
    -   If the text contains mathematical problems or formulas, create questions about the concepts, properties, or interpretations of the material shown.
3.  Generate up to ${numMcq} multiple-choice questions and up to ${numTf} true/false questions. It is okay to generate fewer if the source material is short or lacks detail.
4.  Ensure questions are clear and directly relate to the provided material.
5.  Format the final output strictly as a JSON object according to the schema. Do not include any other text, explanations, or apologies.
    -   If you absolutely cannot extract any meaningful educational content to form questions, you must return a valid JSON object with empty arrays for 'multiple_choice' and 'true_false'.

**Input Text:**
---
${text}
---
`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
            temperature: 0.7,
        },
    });

    const jsonString = response.text;
    const quizData: Quiz = JSON.parse(jsonString);

    if (!quizData || !quizData.multiple_choice || !quizData.true_false) {
        throw new Error("Invalid quiz format received from API.");
    }
    
    if (quizData.multiple_choice.length === 0 && quizData.true_false.length === 0) {
        throw new Error("Could not generate meaningful questions from the provided text. Please try using a different source material with more descriptive content.");
    }

    return quizData;
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    // Re-throw a user-friendly error to be caught by the UI component.
    if (error.message.startsWith("Could not generate")) {
        throw error;
    }
    throw new Error("Failed to generate quiz. The provided text might be too short, the content could not be processed, or there might be an issue with the API key.");
  }
};