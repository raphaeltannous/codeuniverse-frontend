import React from "react";
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
    <span
      className={`px-2 py-1 rounded text-sm ${colors[difficulty]} fw-bold`}
    >
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
