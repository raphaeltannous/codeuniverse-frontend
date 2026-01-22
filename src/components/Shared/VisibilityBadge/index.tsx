import { Badge } from "react-bootstrap";
import { Globe, Lock } from "react-bootstrap-icons";

interface VisibilityBadgeProps {
  isPublic: boolean;
  className?: string;
}

export default function VisibilityBadge({ isPublic, className = "" }: VisibilityBadgeProps) {
  return isPublic ? (
    <Badge bg="info" className={`px-2 py-1 d-inline-flex align-items-center ${className}`}>
      <Globe size={12} className="me-1" />
      Public
    </Badge>
  ) : (
    <Badge bg="secondary" className={`px-2 py-1 d-inline-flex align-items-center ${className}`}>
      <Lock size={12} className="me-1" />
      Private
    </Badge>
  );
}
