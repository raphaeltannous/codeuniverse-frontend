import { Card, Badge } from 'react-bootstrap';
import type { Icon } from 'react-bootstrap-icons';

interface DashboardInfoCardProps {
  icon: Icon;
  iconColor: string;
  value: number | string;
  label: string;
  badgeColor: 'success' | 'warning' | 'info' | 'primary' | 'danger';
  badgeText: string;
}

export default function DashboardInfoCard({
  icon: IconComponent,
  iconColor,
  value,
  label,
  badgeColor,
  badgeText,
}: DashboardInfoCardProps) {
  return (
    <Card className="h-100">
      <Card.Body className="text-center">
        <div className="mb-3">
          <IconComponent size={32} className={iconColor} />
        </div>
        <h3 className="h4 mb-1">{value}</h3>
        <p className="text-muted mb-0">{label}</p>
        <Badge bg={badgeColor} className="mt-2">
          {badgeText}
        </Badge>
      </Card.Body>
    </Card>
  );
}
