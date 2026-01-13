import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Shield, ArrowLeft, House } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Container fluid className="py-5 py-md-6">
      <Row className="justify-content-center align-items-center min-vh-100">
        <Col md={8} lg={6}>
          <Card className="border-0">
            <Card.Body className="p-5 text-center">
              {/* Icon */}
              <div className="mb-4">
                <Shield size={80} className="text-danger opacity-75" />
              </div>

              {/* Heading */}
              <h1 className="h2 fw-bold mb-2">Access Denied</h1>
              <p className="text-muted fs-5 mb-4">
                You don't have permission to access this resource.
              </p>

              {/* Error Code */}
              <div className="mb-4 p-3 rounded bg-danger bg-opacity-10">
                <p className="text-danger fw-bold mb-0">Error 403 - Forbidden</p>
              </div>

              {/* Description */}
              <p className="text-muted mb-4">
                This page is restricted to authorized users. If you believe this is a mistake, 
                please contact the administrator.
              </p>

              {/* Action Buttons */}
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate(-1)}
                  className="d-flex align-items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Go Back
                </Button>
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={() => navigate('/')}
                  className="d-flex align-items-center gap-2"
                >
                  <House size={18} />
                  Back to Home
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
