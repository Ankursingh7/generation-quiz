import type { Quiz } from '../types';

/**
 * Generates a quiz by sending the input text to the backend service.
 * @param {string} text The input text to generate the quiz from.
 * @param {number} numMcq The number of multiple-choice questions to generate.
 * @param {number} numTf The number of true/false questions to generate.
 * @returns {Promise<Quiz>} A promise that resolves to the generated quiz object.
 * @throws {Error} Throws an error if the API call fails.
 */
export const generateQuizFromText = async (text: string, numMcq: number, numTf: number): Promise<Quiz> => {
  try {
    const response = await fetch('/.netlify/functions/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, numMcq, numTf }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unexpected server error occurred.' }));
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    const quizData: Quiz = await response.json();
    return quizData;
  } catch (error: any) {
    console.error("Error calling backend service:", error);
    // Re-throw the error to be caught by the UI component.
    // The error message from the backend or the fetch failure will be propagated.
    throw new Error(error.message || "Failed to connect to the quiz generation service.");
  }
};
