import { Card } from "react-bootstrap";
import type { Icon } from "react-bootstrap-icons";

export default function DashboardStatsCard({
  title,
  value,
  icon: IconComponent,
  subtitle,
  change,
  variant = 'primary'
}: {
  title: string;
  value: string | number;
  icon: Icon;
  subtitle?: string;
  change?: string;
  variant?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
}) {
  const variantClass = `border-${variant} border-start border-${variant} border-4`;

  return (
    <Card className={`h-100 ${variantClass}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-muted text-uppercase mb-1">{title}</h6>
            <h2 className="mb-0">{value}</h2>
          </div>
          <div className={`avatar-title text-${variant} rounded`}>
            <IconComponent size={32} />
          </div>
        </div>

        {subtitle && (
          <p className="text-muted mb-1">
            <small>{subtitle}</small>
          </p>
        )}

        {change && (
          <p className={`text-${variant} mb-0`}>
            <small>{change}</small>
          </p>
        )}
      </Card.Body>
    </Card>
  );
}
