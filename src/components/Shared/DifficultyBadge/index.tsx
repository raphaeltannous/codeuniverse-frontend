import { Badge } from "react-bootstrap";
import type { CourseDifficulty } from "~/types/course/course";
import type { ProblemDifficulty } from "~/types/problem/difficulty";

interface DifficultyBadgeProps {
  difficulty: ProblemDifficulty | CourseDifficulty;
}

export default function DifficultyBadge({
  difficulty,
}: DifficultyBadgeProps) {
  const colors: Record<ProblemDifficulty | CourseDifficulty, string> = {
    Easy: "bg-success text-white",
    Medium: "bg-warning text-dark",
    Hard: "bg-danger text-white",
    Beginner: "bg-success text-white",
    Intermediate: "bg-warning text-dark",
    Advanced: "bg-danger text-white",
    Expert: "bg-dark text-white"
  };

  return (
    <Badge
      className={`${colors[difficulty]} d-inline-flex align-items-center`}
    >
      {difficulty}
    </Badge>
  );
};
