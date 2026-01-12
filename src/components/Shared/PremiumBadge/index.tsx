import { Badge } from "react-bootstrap";

interface PremiumBadgeProps {
  status: 'premium' | 'free';
}

export default function PremiumBadge({
  status,
}: PremiumBadgeProps) {
  const colors: Record<string, string> = {
    premium: "bg-warning text-dark",
    free: "bg-secondary text-white",    
  };

  return (
    <Badge
      className={`${colors[status]}`}
    >
      {status === 'premium' ? 'Premium' : 'Free'}
    </Badge>
  );
};
