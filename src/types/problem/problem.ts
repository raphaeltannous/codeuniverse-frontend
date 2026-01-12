import { ProblemDifficulty } from "./difficulty";
import type { TestCase } from "./testcase";

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: ProblemDifficulty;
  hints: string[];
  codeSnippets: CodeSnippet[];
  testcases: TestCase[];
  isPremium: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CodeSnippet {
  code: string;
  languageName: string;
  languageSlug: string;
}