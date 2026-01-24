import { Badge } from "react-bootstrap";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

interface ActiveStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export default function ActiveStatusBadge({
  isActive,
  className = "",
}: ActiveStatusBadgeProps) {
  return isActive ? (
    <Badge bg="success" className={`px-2 py-1 d-inline-flex align-items-center ${className}`}>
      <CheckCircle size={12} className="me-1" />
      Active
    </Badge>
  ) : (
    <Badge bg="secondary" className={`px-2 py-1 d-inline-flex align-items-center ${className}`}>
      <XCircle size={12} className="me-1" />
      Inactive
    </Badge>
  );
}
