import { ProblemDifficulty } from "./problem/difficulty";
import type { TestCase } from "./problem/testcase";

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

export type Difficulty = ProblemDifficulty;
