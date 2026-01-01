import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import CourseCard from '~/components/shared/course-card';
import { useQuery } from '@tanstack/react-query';
import type { Course } from '~/types/course/course';
import { useAuth } from '~/context/AuthContext';

interface CourseWithProgress extends Course {
  completionPercentage: number;
}

export default function CoursesList() {
  const { auth } = useAuth();

  const {
    data: courses = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<CourseWithProgress[]>({
    queryKey: ['courses', auth?.isAuthenticated ? 'authenticated' : 'public'],
    queryFn: async () => {
      const endpoint = auth?.isAuthenticated
        ? '/api/courses/loggedIn'
        : '/api/courses';

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (auth?.isAuthenticated && auth.jwt) {
        headers['Authorization'] = `Bearer ${auth.jwt}`;
      }

      const response = await fetch(endpoint, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();

      return data.map((course: CourseWithProgress) => ({
        ...course,
        completionPercentage: course.completionPercentage || 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const getButtonText = (course: CourseWithProgress) => {
    if (!auth?.isAuthenticated) return 'Start Course';

    const progress = course.completionPercentage || 0;
    if (progress > 0 && progress < 100) return 'Continue Course';
    if (progress === 100) return 'Review Course';
    return 'Start Course';
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading courses...</p>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading courses:</strong> {error?.message || 'Unknown error'}
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (courses.length === 0) {
    return (
      <Container className="py-4">
        <h2 className="mb-4">Browse Courses</h2>
        <Alert variant="info">
            No published courses available at the moment. Please check back later!
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Browse Courses</h2>
        {auth?.isAuthenticated && (
          <div className="text-muted small">
            Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {courses.map((course: CourseWithProgress) => (
          <Col key={course.id}>
            <CourseCard
              {...course}
              completionPercentage={course.completionPercentage || 0}
              buttonLink={`/courses/${course.slug}`}
              buttonText={getButtonText(course)}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
