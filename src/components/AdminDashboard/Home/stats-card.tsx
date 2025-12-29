import { Card } from "react-bootstrap";

export default function StatsCard({
  title,
  value,
  icon,
  subtitle,
  change,
  variant = 'primary'
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  change?: string;
  variant?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
}) {
  const variantClass = `border-${variant} border-start border-${variant} border-4`;

  return (
    <Card className={`h-100 shadow-sm ${variantClass}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-muted text-uppercase mb-1">{title}</h6>
            <h2 className="mb-0">{value}</h2>
          </div>
          <div className={`avatar-title text-${variant} rounded`}>
            {icon}
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
