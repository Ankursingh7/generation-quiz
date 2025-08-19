export interface MultipleChoiceQuestion {
  question: string;
  options: string[];
  answer: string; // e.g., "A", "B", "C", "D"
}

export interface TrueFalseQuestion {
  question: string;
  answer: string; // "True" or "False"
}

export interface Quiz {
  multiple_choice: MultipleChoiceQuestion[];
  true_false: TrueFalseQuestion[];
}

export interface UserAnswers {
  [questionKey: string]: string; // e.g., { "mc-0": "B", "tf-1": "True" }
}
