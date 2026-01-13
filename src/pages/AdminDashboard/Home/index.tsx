import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Alert,
  Button,
  Badge,
  ProgressBar,
  Dropdown,
  DropdownButton,
} from 'react-bootstrap';
import {
  People,
  FileCode,
  CheckCircle,
  GraphUp,
  Calendar,
  BarChart,
  PersonCircle,
  PersonPlus,
  HourglassSplit,
} from 'react-bootstrap-icons';
import DashboardStatsCard from '~/components/AdminDashboard/Home/DashboardStatsCard';
import DashboardInfoCard from '~/components/AdminDashboard/Home/DashboardInfoCard';
import ActivityFeed from '~/components/AdminDashboard/Home/ActivityFeed';
import SubmissionChart from '~/components/AdminDashboard/Home/SubmissionChart';
import DashboardSkeleton from '~/components/AdminDashboard/Home/DashboardSkeleton';
import { useDashboardStats } from '~/hooks/useDashboardStats';

export default function AdminDashboardHome() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const {
    stats,
    statsLoading,
    statsError,
    statsErrorData,
    recentActivity,
    activityLoading,
    submissionTrends,
    trendsLoading,
  } = useDashboardStats({ timeRange });

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  if (statsError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{statsErrorData?.message || 'Failed to load dashboard data'}</p>
          <Button
            variant="outline-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>No Dashboard Data</Alert.Heading>
          <p>Unable to load dashboard statistics.</p>
        </Alert>
      </Container>
    );
  }

  const problemDistribution = [
    {
      difficulty: 'Easy',
      count: stats.easyProblems,
      color: 'success',
      percentage: Math.round((stats.easyProblems / stats.totalProblems) * 100)
    },
    {
      difficulty: 'Medium',
      count: stats.mediumProblems,
      color: 'warning',
      percentage: Math.round((stats.mediumProblems / stats.totalProblems) * 100)
    },
    {
      difficulty: 'Hard',
      count: stats.hardProblems,
      color: 'danger',
      percentage: Math.round((stats.hardProblems / stats.totalProblems) * 100)
    },
  ];

  const getSubmissionCount = () => {
    switch (timeRange) {
      case '24h': return stats.submissionsLast24h;
      case '7d': return stats.submissionsLast7d;
      case '30d': return stats.submissionsLast30d;
      default: return stats.submissionsLast7d;
    }
  };

  const submissionCount = getSubmissionCount();

  return (
    <Container fluid className="py-3">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="h2 m-0">Dashboard</h1>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <DropdownButton
            variant="outline-primary"
            title={`Last ${timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}`}
            size="sm"
          >
            <Dropdown.Item onClick={() => setTimeRange('24h')}>Last 24 hours</Dropdown.Item>
            <Dropdown.Item onClick={() => setTimeRange('7d')}>Last 7 days</Dropdown.Item>
            <Dropdown.Item onClick={() => setTimeRange('30d')}>Last 30 days</Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <DashboardStatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={People}
            change={`+${stats.totalUsersRegisteredLast7d.toLocaleString()} this week`}
            variant="primary"
          />
        </Col>
        <Col md={3}>
          <DashboardStatsCard
            title="Total Problems"
            value={stats.totalProblems.toLocaleString()}
            icon={FileCode}
            subtitle={`${stats.easyProblems} Easy • ${stats.mediumProblems} Medium • ${stats.hardProblems} Hard`}
            variant="success"
          />
        </Col>
        <Col md={3}>
          <DashboardStatsCard
            title="Total Submissions"
            value={stats.totalSubmissions.toLocaleString()}
            icon={CheckCircle}
            change={`+${submissionCount.toLocaleString()} last ${timeRange}`}
            variant="info"
          />
        </Col>
        <Col md={3}>
          <DashboardStatsCard
            title="Acceptance Rate"
            value={`${stats.acceptanceRate.toFixed(2)}%`}
            icon={GraphUp}
            subtitle={`${stats.acceptedSubmissions.toLocaleString()} accepted`}
            variant="warning"
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="h6 mb-0">Submission Activity</Card.Title>
                <small className="text-muted">Number of submissions over time</small>
              </div>
              <Badge className="px-3 py-2">
                {timeRange === '24h' ? 'Today' : `Last ${timeRange}`}
              </Badge>
            </Card.Header>
            <Card.Body>
              {trendsLoading ? (
                <div className="text-center py-5">
                  <p className="mt-2 text-muted">Loading chart...</p>
                </div>
              ) : submissionTrends && submissionTrends.length > 0 ? (
                <SubmissionChart data={submissionTrends} timeRange={timeRange}/>
              ) : (
                <div className="text-center py-5">
                  <BarChart size={48} className="text-muted mb-2" />
                  <p className="text-muted">No submission data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <Card.Title className="h6 mb-0">Problem Distribution</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                {problemDistribution.map((item) => (
                  <div key={item.difficulty} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className={`text-${item.color} fw-medium`}>
                        {item.difficulty}
                      </span>
                      <span className="fw-bold">{item.count}</span>
                    </div>
                    <ProgressBar
                      variant={item.color}
                      now={item.percentage}
                      className="mb-2"
                      style={{ height: '6px' }}
                    />
                    <div className="d-flex justify-content-between small text-muted">
                      <span>{item.percentage}%</span>
                      <span>
                        {item.count} of {stats.totalProblems}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">Total Problems</span>
                  <span className="fw-medium">{stats.totalProblems}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <DashboardInfoCard
            icon={PersonCircle}
            iconColor="text-success"
            value={stats.totalAdmins.toLocaleString()}
            label="Administrators"
            badgeColor="success"
            badgeText={`${Math.round((stats.totalAdmins / stats.totalUsers) * 100)}% of users`}
          />
        </Col>

        <Col md={3}>
          <DashboardInfoCard
            icon={HourglassSplit}
            iconColor="text-warning"
            value={stats.pendingSubmissions.toLocaleString()}
            label="Pending Submissions"
            badgeColor="warning"
            badgeText={`${Math.round((stats.pendingSubmissions / stats.totalSubmissions) * 100)}% of total`}
          />
        </Col>

        <Col md={3}>
          <DashboardInfoCard
            icon={Calendar}
            iconColor="text-info"
            value={stats.submissionsLast30d.toLocaleString()}
            label="Submissions (Last 30 days)"
            badgeColor="info"
            badgeText={`${Math.round((stats.submissionsLast30d / stats.totalSubmissions) * 100)}% of total`}
          />
        </Col>

        <Col md={3}>
          <DashboardInfoCard
            icon={PersonPlus}
            iconColor="text-primary"
            value={stats.totalUsersRegisteredLast7d.toLocaleString()}
            label="New Users (Last 7 days)"
            badgeColor="primary"
            badgeText={`${Math.round((stats.totalUsersRegisteredLast7d / stats.totalUsers) * 100)}% of total`}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <ActivityFeed
            activities={recentActivity || []}
            isLoading={activityLoading}
            maxItems={10}
          />
        </Col>
      </Row>
    </Container>
  );
}
