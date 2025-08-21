import type { Quiz } from '../types';

/**
 * Generates a quiz by sending the input text to a secure backend serverless function.
 * @param {string} text The input text to generate the quiz from.
 * @returns {Promise<Quiz>} A promise that resolves to the generated quiz object.
 * @throws {Error} Throws an error if the API call fails.
 */
export const generateQuizFromText = async (text: string): Promise<Quiz> => {
  try {
    const response = await fetch('/.netlify/functions/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Use the error message from the backend if available, otherwise provide a generic one.
      throw new Error(data.error || `Server error: ${response.statusText}`);
    }

    return data as Quiz;
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    // Re-throw the error to be caught by the UI component.
    // The component expects an error with a 'message' property.
    throw new Error(error.message || 'An unexpected network error occurred. Please check your connection and try again.');
  }
};
