import React from "react";
import { Badge } from "react-bootstrap";
import type { Difficulty } from "~/types/problem";

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  difficulty,
}) => {
   const colors: Record<Difficulty, string> = {
    Easy: "bg-success text-white",
    Medium: "bg-warning text-dark",
    Hard: "bg-danger text-white",
  };

  return (
    <Badge
      className={`${colors[difficulty]}`}
    >
      {difficulty}
    </Badge>
  );
};

export default DifficultyBadge;
