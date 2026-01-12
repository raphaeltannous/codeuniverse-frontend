import { Card } from 'react-bootstrap';
import type { Icon } from 'react-bootstrap-icons';

interface StatsCardProps {
  icon: Icon;
  iconColor: string;
  value: number | string;
  label: string;
  bgColorClass?: string;
  isLoading?: boolean;
}

export default function StatsCard({
  icon: IconComponent,
  iconColor,
  value,
  label,
  bgColorClass = 'bg-primary',
  isLoading = false,
}: StatsCardProps) {
  return (
    <Card className="border-0 h-100">
      <Card.Body className="d-flex align-items-center">
        <div className={`${bgColorClass} bg-opacity-10 p-3 rounded-circle me-3`}>
          <IconComponent size={24} className={iconColor} />
        </div>
        <div style={{ width: '100%' }}>
          {isLoading ? (
            <>
              <div className="skeleton-line" style={{ width: '60px', marginBottom: '8px' }} />
              <div className="skeleton-line skeleton-line-short" style={{ width: '100px' }} />
            </>
          ) : (
            <>
              <h5 className="mb-0 fw-bold">{value}</h5>
              <p className="text-muted mb-0">{label}</p>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
