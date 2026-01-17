import { Container, Card, Button } from 'react-bootstrap';
import { Lock } from 'react-bootstrap-icons';
import { useUser } from '~/context/UserContext';
import { useNavigate } from 'react-router';

interface PremiumOnlyProps {
  children: React.ReactNode;
  message?: string;
}

export default function PremiumOnly({ children, message }: PremiumOnlyProps) {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Container className="center-content-between-header-footer">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-8">
            <Card className="text-center border-0">
              <Card.Body className="p-5">
                <div className="skeleton-icon mx-auto mb-4" style={{ width: '64px', height: '64px', borderRadius: '50%' }}></div>
                <div className="skeleton-title mx-auto mb-3" style={{ width: '200px', height: '32px' }}></div>
                <div className="skeleton-line mx-auto mb-2" style={{ width: '100%', height: '16px' }}></div>
                <div className="skeleton-line mx-auto mb-4" style={{ width: '100%', height: '16px' }}></div>
                <div className="skeleton-button mx-auto" style={{ width: '200px', height: '48px', borderRadius: '6px' }}></div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  // User is premium or canceled (still has access until end of period)
  if (user?.premiumStatus === 'premium' || user?.premiumStatus === 'canceled') {
    return <>{children}</>;
  }

  // User is free - show upgrade message
  return (
    <Container className="center-content-between-header-footer">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-8">
          <Card className="text-center border-0">
            <Card.Body className="p-5">
              <Lock size={64} className="text-warning mb-4" />
              <h2 className="fw-bold mb-3">Premium Content</h2>
              <p className="text-muted mb-4">
                {message || 'This content is only available for premium users. Upgrade your plan to unlock full access to all courses and problems.'}
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/subscription')}
              >
                Upgrade to Premium
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}
