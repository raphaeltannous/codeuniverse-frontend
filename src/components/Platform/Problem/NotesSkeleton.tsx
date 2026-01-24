import { Card, Col, Row } from 'react-bootstrap';

export default function NotesSkeleton() {
  return (
    <div>
      <Card className="mb-3">
        <Card.Header as="h5">
          <Row className="align-items-center">
            <Col className="d-flex align-items-center gap-2">
              <div className="skeleton-line" style={{ width: '150px', height: '1.5rem' }} />
            </Col>
            <Col xs="auto">
              <div className="skeleton-badge" style={{ width: '80px', height: '32px' }} />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <div style={{ height: '300px', padding: '1rem' }}>
            <div className="skeleton-line mb-3" style={{ width: '100%' }} />
            <div className="skeleton-line mb-3" style={{ width: '95%' }} />
            <div className="skeleton-line mb-3" style={{ width: '90%' }} />
            <div className="skeleton-line mb-3" style={{ width: '85%' }} />
            <div className="skeleton-line mb-3" style={{ width: '92%' }} />
            <div className="skeleton-line mb-3" style={{ width: '88%' }} />
            <div className="skeleton-line mb-3" style={{ width: '94%' }} />
            <div className="skeleton-line" style={{ width: '80%' }} />
          </div>
        </Card.Body>
        <Card.Footer className="text-muted">
          <div className="skeleton-line skeleton-line-short" style={{ width: '100px' }} />
        </Card.Footer>
      </Card>
    </div>
  );
}
