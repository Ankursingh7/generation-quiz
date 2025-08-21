// This Netlify serverless function has been deprecated.
// The quiz generation logic has been moved to the client-side service
// at `services/geminiService.ts` to call the Google Gemini API directly.
// This file can be safely removed from the project.

export const handler = async () => {
    return {
        statusCode: 410, // Gone
        body: JSON.stringify({ error: 'This API endpoint is deprecated and no longer in use.' }),
        headers: { 'Content-Type': 'application/json' },
    };
};
