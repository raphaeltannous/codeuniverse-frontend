import { Badge, Card, ListGroup, Spinner } from "react-bootstrap";
import { Clock, Code, PersonPlus } from "react-bootstrap-icons";
import type { ActivityLog } from "~/types/dashboard/stats";

export default function ActivityFeed({
  activities,
  isLoading,
  maxItems = 10
}: {
  activities: ActivityLog[];
  isLoading: boolean;
  maxItems?: number;
}) {
  const getActivityIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'submission': return <Code className="text-info" />;
      case 'user_registration': return <PersonPlus className="text-success" />;
      default: return <Clock className="text-muted" />;
    }
  };

  const getActivityColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'submission': return 'info';
      case 'user_registration': return 'success';
      default: return 'secondary';
    }
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <Card.Header>
        <Card.Title className="h6 mb-0">Recent Activity</Card.Title>
      </Card.Header>

      <Card.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" size="sm" />
            <p className="mt-2 text-muted">Loading activity...</p>
          </div>
        ) : displayActivities.length > 0 ? (
          <ListGroup variant="flush">
            {displayActivities.map((activity) => (
              <ListGroup.Item key={activity.id} className="border-0 py-3 px-4">
                <div className="d-flex align-items-start">
                  <div className="me-3 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <h6 className="mb-0">{activity.description}</h6>
                      <small className="text-muted">
                        {new Date(activity.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>
                    <div className="d-flex align-items-center">
                      <small className="text-muted me-2">@{activity.username}</small>
                      <Badge bg={getActivityColor(activity.type)} pill className="me-2">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                      <small className="text-muted">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-5">
            <Clock size={48} className="text-muted mb-2" />
            <p className="text-muted">No recent activity.</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
