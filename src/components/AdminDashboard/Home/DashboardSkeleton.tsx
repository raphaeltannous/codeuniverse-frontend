import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';

export default function DashboardSkeleton() {
  const statsCards = Array.from({ length: 4 }, (_, i) => i);
  const distributionItems = Array.from({ length: 3 }, (_, i) => i);
  const smallCards = Array.from({ length: 4 }, (_, i) => i);
  const activityItems = Array.from({ length: 5 }, (_, i) => i);

  return (
    <Container fluid className="py-3">
      {/* Header Skeleton */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="skeleton-title" style={{ width: '150px', height: '2rem' }} />
        </Col>
        <Col xs="auto">
          <div className="skeleton-badge" style={{ width: '90px', height: '28px' }} />
        </Col>
      </Row>

      {/* Stats Cards Skeleton */}
      <Row className="g-3 mb-4">
        {statsCards.map((i) => (
          <Col md={3} key={i}>
            <Card className="border-0 h-100">
              <Card.Body>
                <div className="mb-3">
                  <div className="skeleton-line" style={{ width: '120px', marginBottom: '8px' }} />
                </div>
                <div className="skeleton-title" style={{ width: '80px', marginBottom: '8px' }} />
                <div className="skeleton-line skeleton-line-short" style={{ width: '150px' }} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Chart and Distribution Skeleton */}
      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="skeleton-line" style={{ width: '180px', marginBottom: '8px' }} />
                  <div className="skeleton-line skeleton-line-short" style={{ width: '220px' }} />
                </div>
                <div className="skeleton-badge" style={{ width: '100px', height: '28px' }} />
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-3" style={{ height: '300px' }}>
                {Array.from({ length: 2 }, (_, i) => (
                  <div key={i} style={{ flex: 1 }} className="d-flex flex-column justify-content-end">
                    <div
                      className="skeleton-badge"
                      style={{
                        height: `${Math.random() * 80 + 40}%`,
                        marginBottom: '8px',
                      }}
                    />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <div className="skeleton-line" style={{ width: '180px' }} />
            </Card.Header>
            <Card.Body>
              {distributionItems.map((i) => (
                <div key={i} className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <div className="skeleton-line" style={{ width: '80px' }} />
                    <div className="skeleton-line skeleton-line-short" style={{ width: '40px' }} />
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <div className="skeleton-badge" style={{ width: '100%', height: '6px' }} />
                  </div>
                  <div className="d-flex justify-content-between">
                    <div className="skeleton-line skeleton-line-short" style={{ width: '50px' }} />
                    <div className="skeleton-line skeleton-line-short" style={{ width: '80px' }} />
                  </div>
                </div>
              ))}
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between">
                  <div className="skeleton-line" style={{ width: '120px' }} />
                  <div className="skeleton-line skeleton-line-short" style={{ width: '50px' }} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Small Stats Cards Skeleton */}
      <Row className="g-3 mb-4">
        {smallCards.map((i) => (
          <Col md={3} key={i}>
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="mb-3 d-flex justify-content-center">
                  <div className="skeleton-badge" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                </div>
                <div className="skeleton-title" style={{ width: '100px', margin: '0 auto 8px' }} />
                <div className="skeleton-line skeleton-line-short" style={{ width: '140px', margin: '0 auto 12px' }} />
                <div className="skeleton-badge" style={{ width: '100px', height: '28px', margin: '0 auto' }} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Activity Feed Skeleton */}
      <Row>
        <Col>
          <Card className="border-0">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <div className="skeleton-line" style={{ width: '200px' }} />
                <div className="skeleton-line skeleton-line-short" style={{ width: '80px' }} />
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {activityItems.map((i) => (
                <div key={i} className="border-bottom px-4 py-3">
                  <div className="d-flex gap-3">
                    <div className="skeleton-badge" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton-line" style={{ width: '200px', marginBottom: '8px' }} />
                      <div className="skeleton-line skeleton-line-short" style={{ width: '280px', marginBottom: '8px' }} />
                      <div className="skeleton-line skeleton-line-short" style={{ width: '120px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
