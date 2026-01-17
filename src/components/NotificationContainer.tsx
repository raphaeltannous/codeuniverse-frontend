import { useContext } from 'react';
import { Toast, ToastContainer as BSToastContainer } from 'react-bootstrap';
import { CheckCircle, ExclamationCircle, ExclamationTriangle, InfoCircle } from 'react-bootstrap-icons';
import { NotificationContext } from '~/context/NotificationContext';

export function NotificationContainer() {
  const context = useContext(NotificationContext);

  if (!context) {
    return null;
  }

  return (
    <BSToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {context.notifications.map((notification) => (
        <Toast
          key={notification.id}
          onClose={() => context.removeNotification(notification.id)}
          show={true}
          delay={notification.duration}
          autohide={notification.duration !== -1}
          bg={notification.type}
        >
          <Toast.Header closeButton={true}>
            <div className="d-flex align-items-center gap-2">
              {getIcon(notification.type)}
              <strong>{getTitle(notification.type)}</strong>
            </div>
          </Toast.Header>
          <Toast.Body className={notification.type === 'danger' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </BSToastContainer>
  );
}

function getIcon(type: string) {
  const iconProps = { size: 20 };
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} className="text-success" />;
    case 'danger':
      return <ExclamationCircle {...iconProps} className="text-danger" />;
    case 'warning':
      return <ExclamationTriangle {...iconProps} className="text-warning" />;
    case 'info':
      return <InfoCircle {...iconProps} className="text-info" />;
    default:
      return <InfoCircle {...iconProps} />;
  }
}

function getTitle(type: string): string {
  const titles: Record<string, string> = {
    success: 'Success',
    danger: 'Error',
    warning: 'Warning',
    info: 'Info',
  };
  return titles[type] || 'Notification';
}
