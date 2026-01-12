import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

export default function CourseLessonsSkeleton() {
  const skeletonLessons = Array.from({ length: 6 }, (_, i) => i);

  return (
    <Container fluid className="py-3 py-md-4">
      {/* Header Section */}
      <div className="mb-4">
        <div className="mb-3">
          <div className="skeleton-title" style={{ width: '300px', height: '2rem', marginBottom: '12px' }} />
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="skeleton-line" style={{ width: '100px' }} />
            <div className="skeleton-line" style={{ width: '120px' }} />
            <div className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
          </div>
        </div>

        {/* Progress Bar Skeleton */}
        <div className="mt-3">
          <div
            className="skeleton-badge"
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              marginBottom: '8px',
            }}
          />
          <div className="d-flex justify-content-between">
            <div className="skeleton-line" style={{ width: '120px', height: '0.75rem' }} />
            <div className="skeleton-line skeleton-line-short" style={{ width: '50px', height: '0.75rem' }} />
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* Sidebar - Desktop Only */}
        <Col lg={4} className="d-none d-lg-block">
          <Card className="border-0 h-100">
            <Card.Header className="border-0 pt-3 pb-2">
              <div className="skeleton-line mb-2" style={{ width: '100px' }} />
              <div className="skeleton-line skeleton-line-short" style={{ width: '80px' }} />
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                {skeletonLessons.map((i) => (
                  <ListGroup.Item key={i} className="border-0 px-3 py-3">
                    <div className="d-flex align-items-start">
                      {/* Lesson Number Skeleton */}
                      <div
                        className="skeleton-badge"
                        style={{
                          width: '36px',
                          height: '36px',
                          flexShrink: 0,
                          marginRight: '12px',
                          borderRadius: '4px',
                        }}
                      />

                      {/* Lesson Info Skeleton */}
                      <div style={{ width: '100%' }}>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div className="skeleton-line" style={{ width: '80%' }} />
                          <div className="skeleton-line skeleton-line-short" style={{ width: '50px' }} />
                        </div>
                        <div className="skeleton-line skeleton-line-short" style={{ width: '70%', height: '0.75rem' }} />
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col lg={8}>
          <Card className="border-0">
            {/* Header */}
            <Card.Header className="border-0">
              <div className="mb-2">
                <div className="skeleton-title" style={{ width: '250px', height: '1.5rem', marginBottom: '8px' }} />
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
                <div className="skeleton-line skeleton-line-short" style={{ width: '120px', height: '0.875rem' }} />
                <div className="skeleton-badge" style={{ width: '90px', height: '24px' }} />
              </div>
            </Card.Header>

            {/* Body */}
            <Card.Body className="p-0">
              {/* Video Skeleton */}
              <div className="mb-4">
                <div
                  className="skeleton-badge"
                  style={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '0.25rem',
                  }}
                />
              </div>

              {/* Description Section */}
              <div className="mb-4 px-3">
                <div className="skeleton-title" style={{ width: '150px', height: '1.25rem', marginBottom: '12px' }} />
                <div className="skeleton-line mb-2" />
                <div className="skeleton-line mb-2" />
                <div className="skeleton-line skeleton-line-short" />
              </div>

              {/* Navigation Buttons Skeleton */}
              <div className="px-3 pt-3 border-top d-flex justify-content-between">
                <div className="skeleton-badge" style={{ width: '140px', height: '40px', borderRadius: '4px' }} />
                <div className="skeleton-badge" style={{ width: '140px', height: '40px', borderRadius: '4px' }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
