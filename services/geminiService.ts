
import type { Quiz } from '../types';

/**
 * Generates a quiz from a given piece of text by calling a Netlify serverless function.
 * @param {string} text The input text to generate the quiz from.
 * @returns {Promise<Quiz>} A promise that resolves to the generated quiz object.
 * @throws {Error} Throws an error if the API call fails or the response is in an invalid format.
 */
export const generateQuizFromText = async (text: string): Promise<Quiz> => {
  const functionUrl = '/.netlify/functions/generate-quiz';

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate quiz. The server returned an invalid response.' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const quizData: Quiz = await response.json();

    // Basic validation to ensure the structure is what we expect.
    if (!quizData.multiple_choice || !quizData.true_false) {
        throw new Error("Invalid quiz format received from the server.");
    }
    
    return quizData;
  } catch (error: any) {
    console.error("Error calling Netlify function:", error);
    // Re-throw a user-friendly error message.
    throw new Error(error.message || "Failed to communicate with the quiz generation service. Please check your network connection and try again.");
  }
};
