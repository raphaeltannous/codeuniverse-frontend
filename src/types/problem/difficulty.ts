export const ProblemDifficulty = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
} as const;

export type ProblemDifficulty =
  (typeof ProblemDifficulty)[keyof typeof ProblemDifficulty];
