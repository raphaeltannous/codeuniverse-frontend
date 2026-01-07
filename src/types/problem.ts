export interface Problem {
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  hints: string[];
  codeSnippets: CodeSnippet[];
  testcases: TestCase[];
  isPaid: boolean;
  isPublic: boolean;
}

export interface CodeSnippet {
  code: string;
  languageName: string;
  languageSlug: string;
}

export type TestCase = {
  id: number;
  input: any;
  output: any;
  isPublic: boolean;
};

export type Difficulty = "Easy" | "Medium" | "Hard" | "Beginner" | "Intermediate" | "Advanced" | "Expert";
