import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import CourseCard from '~/components/Shared/CourseCard';
import CourseListSkeleton from '~/components/Platform/Courses/CourseListSkeleton';
import { useAuth } from '~/context/AuthContext';
import { useCoursesList, type CourseWithProgress } from '~/hooks/useCoursesList';

export default function CoursesList() {
  const { auth } = useAuth();

  const {
    courses,
    isLoading,
    isError,
    error,
    refetch
  } = useCoursesList({
    isAuthenticated: !!auth.isAuthenticated,
  });

  const getButtonText = (course: CourseWithProgress) => {
    if (!auth?.isAuthenticated) return 'Start Course';

    const progress = course.completionPercentage || 0;
    if (progress > 0 && progress < 100) return 'Continue Course';
    if (progress === 100) return 'Review Course';
    return 'Start Course';
  };

  if (isLoading) {
    return <CourseListSkeleton />;
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
