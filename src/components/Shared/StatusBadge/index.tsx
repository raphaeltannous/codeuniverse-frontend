import { Badge } from "react-bootstrap";
import { CheckCircle } from "react-bootstrap-icons";

interface StatusBadgeProps {
  isSolved: boolean;
  className?: string;
}

export default function StatusBadge({ isSolved, className = "" }: StatusBadgeProps) {
  if (!isSolved) return null;
  
  return (
    <Badge bg="success" className={`px-2 py-1 d-inline-flex align-items-center ${className}`}>
      <CheckCircle size={12} className="me-1" />
      Solved
    </Badge>
  );
}
