import { Container, Row, Col, Card } from 'react-bootstrap';

export default function CourseListSkeleton() {
  const skeletonCards = Array.from({ length: 4 }, (_, i) => i);

  return (
    <Container className="py-4">
      {/* Header Skeleton */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="skeleton-title" style={{ width: '200px', height: '2rem' }} />
        <div className="skeleton-line" style={{ width: '150px' }} />
      </div>

      {/* Course Cards Skeleton */}
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {skeletonCards.map((i) => (
          <Col key={i}>
            <Card className="border-0 h-100">
              {/* Card Image Skeleton */}
              <div
                className="skeleton-badge"
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: '0.25rem 0.25rem 0 0',
                }}
              />

              {/* Card Body Skeleton */}
              <Card.Body>
                {/* Title */}
                <div className="skeleton-line mb-2" style={{ width: '100%' }} />
                <div className="skeleton-line skeleton-line-short mb-3" style={{ width: '80%' }} />

                {/* Description Lines */}
                <div className="skeleton-line mb-2" style={{ width: '100%', height: '0.75rem' }} />
                <div className="skeleton-line mb-3" style={{ width: '95%', height: '0.75rem' }} />

                {/* Progress Bar Skeleton */}
                <div className="mb-3">
                  <div
                    className="skeleton-badge"
                    style={{
                      width: '100%',
                      height: '6px',
                      borderRadius: '3px',
                      marginBottom: '0.5rem',
                    }}
                  />
                  <div className="skeleton-line skeleton-line-short" style={{ width: '40%', height: '0.75rem' }} />
                </div>

                {/* Button Skeleton */}
                <div
                  className="skeleton-badge"
                  style={{
                    width: '100%',
                    height: '2.5rem',
                    borderRadius: '0.25rem',
                  }}
                />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
