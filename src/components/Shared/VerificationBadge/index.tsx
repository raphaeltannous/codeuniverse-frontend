import { Badge } from "react-bootstrap";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

interface VerificationBadgeProps {
  isVerified: boolean;
  className?: string;
}

export default function VerificationBadge({
  isVerified,
  className = "",
}: VerificationBadgeProps) {
  return isVerified ? (
    <Badge bg="info" className={`px-2 py-1 d-inline-flex align-items-center text-dark ${className}`}>
      <CheckCircle size={12} className="me-1" />
      Verified
    </Badge>
  ) : (
    <Badge bg="warning" className={`px-2 py-1 d-inline-flex align-items-center text-dark ${className}`}>
      <XCircle size={12} className="me-1" />
      Unverified
    </Badge>
  );
}
