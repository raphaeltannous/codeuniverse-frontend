import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
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
import type { APIError } from '~/types/api-error';
import { useAuth } from '~/context/AuthContext';
import type { ActivityLog, DailySubmissions, DashboardStats } from '~/types/dashboard/stats';
import StatsCard from '~/components/AdminDashboard/Home/stats-card';
import ActivityFeed from '~/components/AdminDashboard/Home/activity-feed';
import SubmissionChart from '~/components/AdminDashboard/Home/submissions-chart';

export default function DashboardHome() {
  const { auth } = useAuth();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorData
  } = useQuery<DashboardStats, APIError>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as DashboardStats;
    },
    refetchInterval: 10000,
  });

  const {
    data: recentActivity,
    isLoading: activityLoading
  } = useQuery<ActivityLog[], APIError>({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard/activity', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as ActivityLog[];
    },
    refetchInterval: 10000,
  });

  const {
    data: submissionTrends,
    isLoading: trendsLoading
  } = useQuery<DailySubmissions[], APIError>({
    queryKey: ['submission-trends', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/admin/dashboard/submissions-activities?range=${timeRange}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw data as APIError;
      }
      return data as DailySubmissions[];
    },
  });

  if (statsLoading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading dashboard...</p>
          </Col>
        </Row>
      </Container>
    );
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
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={<People className="text-primary" size={24} />}
            change={`+${stats.totalUsersRegisteredLast7d.toLocaleString()} this week`}
            variant="primary"
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Total Problems"
            value={stats.totalProblems.toLocaleString()}
            icon={<FileCode className="text-success" size={24} />}
            subtitle={`${stats.easyProblems} Easy • ${stats.mediumProblems} Medium • ${stats.hardProblems} Hard`}
            variant="success"
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Total Submissions"
            value={stats.totalSubmissions.toLocaleString()}
            icon={<CheckCircle className="text-info" size={24} />}
            change={`+${submissionCount.toLocaleString()} last ${timeRange}`}
            variant="info"
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Acceptance Rate"
            value={`${stats.acceptanceRate.toFixed(2)}%`}
            icon={<GraphUp className="text-warning" size={24} />}
            subtitle={`${stats.acceptedSubmissions.toLocaleString()} accepted`}
            variant="warning"
          />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="h-100 shadow-sm">
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
                  <Spinner animation="border" size="sm" />
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
          <Card className="h-100 shadow-sm">
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
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <PersonCircle size={32} className="text-success" />
              </div>
              <h3 className="h4 mb-1">{stats.totalAdmins.toLocaleString()}</h3>
              <p className="text-muted mb-0">Administrators</p>
              <Badge bg="success" className="mt-2">
                {Math.round((stats.totalAdmins / stats.totalUsers) * 100)}% of users
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <HourglassSplit size={32} className="text-warning" />
              </div>
              <h3 className="h4 mb-1">{stats.pendingSubmissions.toLocaleString()}</h3>
              <p className="text-muted mb-0">Pending Submissions</p>
              <Badge bg="warning" className="mt-2">
                {Math.round((stats.pendingSubmissions / stats.totalSubmissions) * 100)}% of total
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <Calendar size={32} className="text-info" />
              </div>
              <h3 className="h4 mb-1">{stats.submissionsLast30d.toLocaleString()}</h3>
              <p className="text-muted mb-0">Submissions (Last 30 days)</p>
              <Badge bg="info" className="mt-2">
                {Math.round((stats.submissionsLast30d / stats.totalSubmissions) * 100)}% of total
              </Badge>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="mb-3">
                <PersonPlus size={32} className="text-primary" />
              </div>
              <h3 className="h4 mb-1">{stats.totalUsersRegisteredLast7d.toLocaleString()}</h3>
              <p className="text-muted mb-0">New Users (Last 7 days)</p>
              <Badge bg="primary" className="mt-2">
                {Math.round((stats.totalUsersRegisteredLast7d / stats.totalUsers) * 100)}% of total
              </Badge>
            </Card.Body>
          </Card>
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
