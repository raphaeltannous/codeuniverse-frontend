import { Card, Table } from "react-bootstrap";

export default function UsersTableSkeleton() {
  const skeletonRows = Array.from({ length: 10 }, (_, i) => i);

  return (
    <Card className="border-0">
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Premium</th>
                <th>Joined</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skeletonRows.map((i) => (
                <tr key={i}>
                  {/* User Column */}
                  <td>
                    <div className="d-flex align-items-center">
                      <div
                        className="skeleton-badge rounded-circle me-3"
                        style={{ width: "40px", height: "40px" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          className="skeleton-line mb-2"
                          style={{ width: "120px", height: "16px" }}
                        />
                        <div
                          className="skeleton-line"
                          style={{ width: "150px", height: "12px" }}
                        />
                      </div>
                    </div>
                  </td>
                  {/* Role Column */}
                  <td>
                    <div
                      className="skeleton-badge"
                      style={{ width: "70px", height: "24px" }}
                    />
                  </td>
                  {/* Status Column */}
                  <td>
                    <div
                      className="skeleton-badge"
                      style={{ width: "70px", height: "24px" }}
                    />
                  </td>
                  {/* Verification Column */}
                  <td>
                    <div
                      className="skeleton-badge"
                      style={{ width: "80px", height: "24px" }}
                    />
                  </td>
                  {/* Premium Column */}
                  <td>
                    <div
                      className="skeleton-badge"
                      style={{ width: "70px", height: "24px" }}
                    />
                  </td>
                  {/* Joined Column */}
                  <td>
                    <div
                      className="skeleton-line mb-1"
                      style={{ width: "100px", height: "14px" }}
                    />
                    <div
                      className="skeleton-line"
                      style={{ width: "80px", height: "12px" }}
                    />
                  </td>
                  {/* Last Updated Column */}
                  <td>
                    <div
                      className="skeleton-line mb-1"
                      style={{ width: "100px", height: "14px" }}
                    />
                    <div
                      className="skeleton-line"
                      style={{ width: "80px", height: "12px" }}
                    />
                  </td>
                  {/* Actions Column */}
                  <td>
                    <div className="d-flex gap-1">
                      <div
                        className="skeleton-badge"
                        style={{ width: "32px", height: "30px" }}
                      />
                      <div
                        className="skeleton-badge"
                        style={{ width: "32px", height: "30px" }}
                      />
                      <div
                        className="skeleton-badge"
                        style={{ width: "32px", height: "30px" }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}
