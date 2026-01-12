import { Badge } from "react-bootstrap";
import type { Difficulty } from "~/types/problem";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export default function DifficultyBadge({
  difficulty,
}: DifficultyBadgeProps) {
  const colors: Record<Difficulty, string> = {
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
      className={`${colors[difficulty]}`}
    >
      {difficulty}
    </Badge>
  );
};
