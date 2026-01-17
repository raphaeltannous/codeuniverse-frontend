import { Row, Col, Card, Tabs, Tab } from 'react-bootstrap';

export default function CoursesSkeleton() {
  const courseCards = Array.from({ length: 4 }, (_, i) => i);

  return (
    <>
      {/* Tabs Skeleton */}
      <div className="mb-4">
        <Tabs>
          <Tab eventKey="all" title="All Courses (0)" disabled />
          <Tab eventKey="published" title="Published (0)" disabled />
          <Tab eventKey="draft" title="Drafts (0)" disabled />
        </Tabs>
      </div>

      {/* Course Cards Skeleton */}
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {courseCards.map((i) => (
          <Col key={i}>
            <Card className="border-0 h-100">
              <div
                className="skeleton-badge"
                style={{ width: '100%', height: '200px', borderRadius: '0.375rem 0.375rem 0 0' }}
              />
              <Card.Body>
                <div className="skeleton-line" style={{ width: '80%', marginBottom: '12px' }} />
                <div className="skeleton-line" style={{ width: '100%', marginBottom: '12px' }} />
                <div className="skeleton-line skeleton-line-short" style={{ width: '60%', marginBottom: '16px' }} />
                <div className="skeleton-badge" style={{ width: '100%', height: '36px' }} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
