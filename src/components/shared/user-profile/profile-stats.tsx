import { Badge, Col, ProgressBar, Row } from "react-bootstrap";
import type { UserProfile } from "~/types/user";

export default function ProfileStats({ profile }: { profile: UserProfile }) {
  return (
    <Row>
      <Col md={6}>
        <div className="mb-4">
          <h5 className="mb-3">Solved Problems</h5>
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-success fw-medium">Easy</span>
              <span className="fw-bold">{profile.easySolved} / {profile.easyCount}</span>
            </div>
            <ProgressBar
              variant="success"
              now={(profile.easySolved / profile.easyCount) * 100}
              className="mb-3"
              style={{ height: '8px' }}
            />
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-warning fw-medium">Medium</span>
              <span className="fw-bold">{profile.mediumSolved} / {profile.mediumCount}</span>
            </div>
            <ProgressBar
              variant="warning"
              now={(profile.mediumSolved / profile.mediumCount) * 100}
              className="mb-3"
              style={{ height: '8px' }}
            />
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-danger fw-medium">Hard</span>
              <span className="fw-bold">{profile.hardSolved} / {profile.hardCount}</span>
            </div>
            <ProgressBar
              variant="danger"
              now={(profile.hardSolved / profile.hardCount) * 100}
              style={{ height: '8px' }}
            />
          </div>
        </div>
      </Col>

      <Col md={6}>
        <div className="mb-4">
          <h5 className="mb-3">Submission Details</h5>
          <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded">
            <span className="fw-medium">Total Submissions</span>
            <Badge bg="info" className="fs-6 px-3 py-2">
              {profile.totalSubmissions.toLocaleString()}
            </Badge>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded">
            <span className="fw-medium">Accepted</span>
            <Badge bg="success" className="fs-6 px-3 py-2">
              {profile.acceptedSubmissions.toLocaleString()}
            </Badge>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded">
            <span className="fw-medium">Problems Solved</span>
            <Badge bg="primary" className="fs-6 px-3 py-2">
              {profile.problemsSolved.toLocaleString()}
            </Badge>
          </div>
        </div>
      </Col>
    </Row>
  );
};
