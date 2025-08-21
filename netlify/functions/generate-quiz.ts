
import { GoogleGenAI, Type } from "@google/genai";
import type { Quiz } from '../../types';

// The API key is sourced from Netlify's environment variables for security.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

const generateQuiz = async (text: string): Promise<Quiz> => {
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
    
    if (!quizData.multiple_choice || !quizData.true_false) {
        throw new Error("Invalid quiz format received from API.");
    }

    return quizData;
  } catch (error) {
    console.error("Error generating quiz in function:", error);
    throw new Error("Failed to generate quiz. The provided text might be too short or the content could not be processed.");
  }
};


export const handler = async (event: { httpMethod: string; body: string | null }) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
            headers: { 'Content-Type': 'application/json' },
        };
    }

    try {
        const { text } = JSON.parse(event.body || '{}');

        if (!text || typeof text !== 'string' || !text.trim()) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid request: text is required.' }),
                headers: { 'Content-Type': 'application/json' },
            };
        }

        const quizData = await generateQuiz(text);

        return {
            statusCode: 200,
            body: JSON.stringify(quizData),
            headers: { 'Content-Type': 'application/json' },
        };
    } catch (error: any) {
        console.error("Error in Netlify function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || "An unexpected server error occurred." }),
            headers: { 'Content-Type': 'application/json' },
        };
    }
};
