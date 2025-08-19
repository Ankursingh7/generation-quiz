
import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    multiple_choice: {
      type: Type.ARRAY,
      description: "An array of 5 multiple-choice questions.",
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
      description: "An array of 5 true/false questions.",
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

/**
 * Generates a quiz from a given piece of text using the Gemini API.
 * @param {string} text The input text to generate the quiz from.
 * @returns {Promise<Quiz>} A promise that resolves to the generated quiz object.
 * @throws {Error} Throws an error if the API call fails or the response is in an invalid format.
 */
export const generateQuizFromText = async (text: string): Promise<Quiz> => {
  const prompt = `You are a Quiz Question Creator for Educators.

Input: The raw text from a PDF chapter is provided below.

Task:
1. Read the provided text.
2. Extract the main ideas, facts, and key points.
3. Create:
   - 5 Multiple-Choice Questions (MCQs) with 4 options each. Clearly mark the correct answer.
   - 5 True/False questions with correct answers.
4. Ensure questions are clear, age-appropriate, and evenly cover the text.
5. Output the result in JSON format using the structure below:

{
  "multiple_choice": [
    {
      "question": "....",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "B"
    }
  ],
  "true_false": [
    {
      "question": "....",
      "answer": "True"
    }
  ]
}

Do not include explanations or commentary—only the questions, options, and answers in the JSON.

---
${text}
---
`;

  try {
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
    
    // Basic validation to ensure the structure is what we expect.
    if (!quizData.multiple_choice || !quizData.true_false) {
        throw new Error("Invalid quiz format received from API.");
    }

    return quizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz. The provided text might be too short or the content could not be processed. Please try again.");
  }
};
