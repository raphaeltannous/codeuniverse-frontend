import { Container, Row, Col, Card, Table } from 'react-bootstrap';

export default function ProblemsetSkeleton() {
  const skeletonRows = Array.from({ length: 5 }, (_, i) => i);
  const skeletonCards = Array.from({ length: 3 }, (_, i) => i);

  return (
    <Container fluid className="py-4">
      {/* Header Skeleton */}
      <div className="mb-4">
        <div className="skeleton-title" style={{ width: '200px', height: '2rem', marginBottom: '12px' }} />
        <div className="skeleton-line skeleton-line-short" style={{ width: '400px' }} />
      </div>

      {/* Stats Cards Skeleton */}
      <Row className="mb-4">
        {skeletonCards.map((i) => (
          <Col md={3} sm={6} key={i}>
            <Card className="border-0 h-100">
              <Card.Body className="d-flex align-items-center">
                <div
                  className="skeleton-badge"
                  style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '50%', marginRight: '12px' }}
                />
                <div style={{ width: '100%' }}>
                  <div className="skeleton-line" style={{ width: '60%', marginBottom: '8px' }} />
                  <div className="skeleton-line skeleton-line-short" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter Skeleton */}
      <Card className="border-0 mb-4">
        <Card.Body>
          <Row className="g-2">
            <Col md={3}>
              <div className="skeleton-badge" style={{ width: '100%', height: '38px' }} />
            </Col>
            <Col md={2}>
              <div className="skeleton-badge" style={{ width: '100%', height: '38px' }} />
            </Col>
            <Col md={2}>
              <div className="skeleton-badge" style={{ width: '100%', height: '38px' }} />
            </Col>
            <Col md={2}>
              <div className="skeleton-badge" style={{ width: '100%', height: '38px' }} />
            </Col>
            <Col md={3}>
              <div className="skeleton-badge" style={{ width: '100%', height: '38px' }} />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <div className="skeleton-line" style={{ width: '200px' }} />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table Skeleton */}
      <Card className="border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Difficulty</th>
                  <th>Access</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {skeletonRows.map((i) => (
                  <tr key={i}>
                    <td>
                      <div className="mb-2">
                        <div className="skeleton-line" style={{ width: '150px' }} />
                      </div>
                      <div className="skeleton-line skeleton-line-short" style={{ width: '100px' }} />
                    </td>
                    <td>
                      <div className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
                    </td>
                    <td>
                      <div className="skeleton-badge" style={{ width: '70px', height: '24px' }} />
                    </td>
                    <td>
                      <div className="skeleton-badge" style={{ width: '80px', height: '24px' }} />
                    </td>
                    <td>
                      <div className="skeleton-line skeleton-line-short" style={{ width: '100px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
