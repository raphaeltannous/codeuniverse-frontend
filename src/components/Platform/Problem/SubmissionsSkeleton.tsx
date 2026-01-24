import { Card, Col, Row } from "react-bootstrap";

export default function SubmissionsSkeleton() {
  const skeletonCards = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div>
      {skeletonCards.map((i) => (
        <Card className="mb-3" key={i}>
          <Card.Header>
            <Row className="align-items-center mb-2">
              <Col>
                <div className="skeleton-line" style={{ width: '180px', height: '1.5rem' }} />
              </Col>
              <Col xs="auto">
                <div className="skeleton-badge" style={{ width: '100px', height: '24px' }} />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col xs={12} md={4} className="mb-2 mb-md-0">
                <div className="skeleton-line skeleton-line-short" style={{ width: '100px', marginBottom: '8px' }} />
                <div className="skeleton-line" style={{ width: '80px' }} />
              </Col>
              <Col xs={12} md={4} className="mb-2 mb-md-0">
                <div className="skeleton-line skeleton-line-short" style={{ width: '100px', marginBottom: '8px' }} />
                <div className="skeleton-line" style={{ width: '80px' }} />
              </Col>
              <Col xs={12} md={4}>
                <div className="skeleton-line skeleton-line-short" style={{ width: '80px', marginBottom: '8px' }} />
                <div className="skeleton-line" style={{ width: '100px' }} />
              </Col>
            </Row>
          </Card.Header>

          <Card.Body className="p-0">
            <div className="submission-editor-height">
              <div className="skeleton-code-block" style={{ height: '100%', width: '100%' }} />
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
