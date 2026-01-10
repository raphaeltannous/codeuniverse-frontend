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
