# AI Quiz Generator

An intelligent assistant for teachers and educators to effortlessly create quizzes from educational text. Simply paste a chapter, an article, or upload a PDF, and the AI will generate relevant multiple-choice and true/false questions in seconds.

## Features

-   **Text-Based Quiz Generation**: Paste any text directly into the application.
-   **PDF Upload**: Upload PDF documents and the app will automatically extract the text content.
-   **Multiple Question Types**: Generates a mix of Multiple-Choice and True/False questions.
-   **Instant Results**: View the generated quiz on the same page, with correct answers clearly marked.
-   **Clean & Modern UI**: A user-friendly and aesthetically pleasing interface.

## How to Use

1.  **Provide Content**:
    -   Click **Upload PDF** to select a document from your device. The text will be automatically extracted and placed in the text area.
    -   Or, manually **paste your text** into the provided text area.
2.  **Generate Quiz**:
    -   Click the **Generate Quiz** button.
3.  **Review**:
    -   The generated quiz will appear below. Review the questions and answers for accuracy and appropriateness for your students.

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Model**: Google Gemini API (`@google/genai`)
-   **PDF Processing**: PDF.js (`pdfjs-dist`)
