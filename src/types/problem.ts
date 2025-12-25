export interface Problem {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  hints: string[];
  codeSnippets: CodeSnippet[];
  testcases: TestCases;
  isPaid: boolean;
  isPublic: boolean;
}

export interface CodeSnippet {
  code: string;
  languageName: string;
  languageSlug: string;
}

export type TestCases = string[] | null;

export type Difficulty = "Easy" | "Medium" | "Hard" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
