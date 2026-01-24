import { Badge } from "react-bootstrap";

interface RoleBadgeProps {
  role: "admin" | "user";
  className?: string;
}

export default function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const colors = {
    admin: "danger",
    user: "primary",
  } as const;

  return (
    <Badge bg={colors[role]} className={`px-2 py-1 ${className}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
