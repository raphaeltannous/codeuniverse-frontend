import { Row, Col } from "react-bootstrap";

export default function ProblemSkeleton() {
  return (
    <div className="problem-skeleton">
      {/* Header */}
      <Row className="align-items-center mb-4">
        <Col>
          <div className="skeleton-title"></div>
        </Col>
        <Col xs="auto">
          <div className="skeleton-badge"></div>
        </Col>
      </Row>

      {/* Tabs Navigation */}
      <div className="skeleton-tabs mb-4">
        <div className="skeleton-tab-item"></div>
        <div className="skeleton-tab-item"></div>
        <div className="skeleton-tab-item"></div>
      </div>

      {/* Content Area */}
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line skeleton-line-short"></div>

      <div className="skeleton-line mt-4"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line skeleton-line-short"></div>

      <div className="skeleton-line mt-4"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line skeleton-line-short"></div>

      <div className="skeleton-line mt-4"></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line"></div>
    </div>
  );
}
