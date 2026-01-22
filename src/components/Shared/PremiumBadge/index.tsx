import { Badge } from "react-bootstrap";
import { Lock, Globe } from "react-bootstrap-icons";

interface PremiumBadgeProps {
  isPremium: boolean;
  className?: string;
}

export default function PremiumBadge({
  isPremium,
  className = "",
}: PremiumBadgeProps) {
  return isPremium ? (
    <Badge bg="warning" className={`px-2 py-1 text-dark d-inline-flex align-items-center ${className}`}>
      <Lock size={12} className="me-1" />
      Premium
    </Badge>
  ) : (
    <Badge bg="success" className={`px-2 py-1 d-inline-flex align-items-center ${className}`}>
      <Globe size={12} className="me-1" />
      Free
    </Badge>
  );
}
