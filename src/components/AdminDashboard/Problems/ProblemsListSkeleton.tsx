import { Card, Table } from "react-bootstrap";

export default function ProblemsListSkeleton() {
  const skeletonRows = Array.from({ length: 8 }, (_, i) => i);

  return (
    <>
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
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {skeletonRows.map((i) => (
                  <tr key={i}>
                    <td>
                      <div>
                        <div className="skeleton-line" style={{ width: '200px', marginBottom: '6px' }} />
                        <div className="skeleton-line" style={{ width: '120px', marginBottom: '6px' }} />
                        <div className="skeleton-line" style={{ width: '280px', marginBottom: '0' }} />
                      </div>
                    </td>
                    <td>
                      <div className="skeleton-badge" style={{ width: '70px' }} />
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="skeleton-badge" style={{ width: '65px', height: '24px' }} />
                        <div className="skeleton-badge" style={{ width: '75px', height: '24px' }} />
                      </div>
                    </td>
                    <td>
                      <div className="skeleton-line" style={{ width: '100px', marginBottom: '0' }} />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <div className="skeleton-badge" style={{ width: '32px', height: '32px' }} />
                        <div className="skeleton-badge" style={{ width: '32px', height: '32px' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {/* Pagination Skeleton */}
        <Card.Footer className="border-0">
          <div className="d-flex justify-content-between align-items-center">
            <div className="skeleton-line" style={{ width: '180px', marginBottom: '0' }} />
            <div className="d-flex gap-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="skeleton-badge" style={{ width: '36px', height: '36px' }} />
              ))}
            </div>
          </div>
        </Card.Footer>
      </Card>
    </>
  );
}
