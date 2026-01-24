import { Modal, Row, Col, Card, Image } from "react-bootstrap";
import { Person } from "react-bootstrap-icons";
import RoleBadge from "~/components/Shared/RoleBadge";
import ActiveStatusBadge from "~/components/Shared/ActiveStatusBadge";
import VerificationBadge from "~/components/Shared/VerificationBadge";
import PremiumBadge from "~/components/Shared/PremiumBadge";
import type { User } from "~/types/admin/user";

interface UserDetailsModalProps {
  show: boolean;
  user: User | null;
  onHide: () => void;
  formatDateTime: (dateString: string) => string;
}

export default function UserDetailsModal({
  show,
  user,
  onHide,
  formatDateTime,
}: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="h5 fw-bold">User Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4} className="text-center">
            {user.avatarUrl ? (
              <Image
                src={`/api/static/avatars/${user.avatarUrl}`}
                alt={user.username}
                rounded
                width={130}
                height={130}
                className="mb-3"
              />
            ) : (
              <div
                className="bg-primary bg-opacity-10 rounded-circle p-4 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "120px", height: "120px" }}
              >
                <Person size={48} className="text-primary" />
              </div>
            )}
            <h5 className="fw-bold">{user.username}</h5>
            <p className="text-muted">{user.email}</p>
            <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
              <RoleBadge role={user.role} />
              <ActiveStatusBadge isActive={user.isActive} />
              <VerificationBadge isVerified={user.isVerified} />
            </div>
          </Col>
          <Col md={8}>
            <Card className="border-0">
              <Card.Body>
                <h6 className="fw-bold mb-3">User Information</h6>
                <dl className="row">
                  <dt className="col-sm-4">User ID</dt>
                  <dd className="col-sm-8">
                    <code className="user-select-all">{user.id}</code>
                  </dd>

                  <dt className="col-sm-4">Username</dt>
                  <dd className="col-sm-8">{user.username}</dd>

                  <dt className="col-sm-4">Email Address</dt>
                  <dd className="col-sm-8">{user.email}</dd>

                  <dt className="col-sm-4">Account Status</dt>
                  <dd className="col-sm-8">
                    {user.isActive ? (
                      <span className="text-success">Active</span>
                    ) : (
                      <span className="text-danger">Inactive</span>
                    )}
                  </dd>

                  <dt className="col-sm-4">Email Verification</dt>
                  <dd className="col-sm-8">
                    {user.isVerified ? (
                      <span className="text-success">Verified</span>
                    ) : (
                      <span className="text-warning">Unverified</span>
                    )}
                  </dd>

                  <dt className="col-sm-4">Account Created</dt>
                  <dd className="col-sm-8">{formatDateTime(user.createdAt)}</dd>

                  <dt className="col-sm-4">Last Updated</dt>
                  <dd className="col-sm-8">{formatDateTime(user.updatedAt)}</dd>

                  <dt className="col-sm-4">User Role</dt>
                  <dd className="col-sm-8">
                    <span className="text-capitalize">{user.role}</span>
                  </dd>

                  <dt className="col-sm-4">Premium Status</dt>
                  <dd className="col-sm-8">
                    <PremiumBadge isPremium={user.premiumStatus === "premium"} />
                  </dd>

                  {user.stripeCustomerId && (
                    <>
                      <dt className="col-sm-4">Stripe Customer ID</dt>
                      <dd className="col-sm-8">
                        <code className="user-select-all">
                          {user.stripeCustomerId}
                        </code>
                      </dd>
                    </>
                  )}
                </dl>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}
