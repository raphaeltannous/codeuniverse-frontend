import { Container, Card, Row, Col } from "react-bootstrap";

export default function ProblemEditSkeleton() {
  return (
    <Container fluid className="py-4">
      {/* Header Skeleton */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div style={{ flex: 1 }}>
          <div className="skeleton-line" style={{ width: '300px', height: '2rem', marginBottom: '0' }} />
        </div>
        <div>
          <div className="skeleton-badge" style={{ width: '120px', height: '32px' }} />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <Card className="border-0 mb-4">
        <Card.Body className="p-0">
          <div className="skeleton-tabs border-bottom px-3 pt-2 pb-3">
            <div className="skeleton-tab-item" style={{ width: '100px' }} />
            <div className="skeleton-tab-item" style={{ width: '120px' }} />
            <div className="skeleton-tab-item" style={{ width: '150px' }} />
            <div className="skeleton-tab-item" style={{ width: '130px' }} />
          </div>

          {/* Tab Content Skeleton */}
          <div className="p-4">
            <Row className="g-3">
              {/* Title field */}
              <Col md={8}>
                <div className="skeleton-line" style={{ width: '100px', marginBottom: '8px' }} />
                <div className="skeleton-badge" style={{ width: '100%', height: '40px' }} />
              </Col>

              {/* Slug field */}
              <Col md={4}>
                <div className="skeleton-line" style={{ width: '80px', marginBottom: '8px' }} />
                <div className="skeleton-badge" style={{ width: '100%', height: '40px' }} />
              </Col>

              {/* Difficulty field */}
              <Col md={6}>
                <div className="skeleton-line" style={{ width: '90px', marginBottom: '8px' }} />
                <div className="skeleton-badge" style={{ width: '100%', height: '40px' }} />
              </Col>

              {/* Access Settings */}
              <Col md={6}>
                <div className="skeleton-line" style={{ width: '120px', marginBottom: '8px' }} />
                <div className="d-flex gap-4">
                  <div className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
                  <div className="skeleton-badge" style={{ width: '90px', height: '24px' }} />
                </div>
              </Col>

              {/* Description field */}
              <Col md={12}>
                <div className="skeleton-line" style={{ width: '100px', marginBottom: '8px' }} />
                <div className="skeleton-badge" style={{ width: '100%', height: '300px' }} />
              </Col>

              {/* Action buttons */}
              <Col md={12}>
                <div className="d-flex gap-2 justify-content-end">
                  <div className="skeleton-badge" style={{ width: '100px', height: '38px' }} />
                  <div className="skeleton-badge" style={{ width: '120px', height: '38px' }} />
                </div>
              </Col>
            </Row>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
