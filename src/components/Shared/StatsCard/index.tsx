import { Card } from 'react-bootstrap';
import type { Icon } from 'react-bootstrap-icons';

interface StatsCardProps {
  icon: Icon;
  iconColor: string;
  value: number | string;
  label: string;
  bgColorClass?: string;
}

export default function StatsCard({
  icon: IconComponent,
  iconColor,
  value,
  label,
  bgColorClass = 'bg-primary',
}: StatsCardProps) {
  return (
    <Card className="border-0 h-100">
      <Card.Body className="d-flex align-items-center">
        <div className={`${bgColorClass} bg-opacity-10 p-3 rounded-circle me-3`}>
          <IconComponent size={24} className={iconColor} />
        </div>
        <div>
          <h5 className="mb-0 fw-bold">{value}</h5>
          <p className="text-muted mb-0">{label}</p>
        </div>
      </Card.Body>
    </Card>
  );
}
