
import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Button,
  Spinner,
  Alert,
  ProgressBar,
  Offcanvas
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router';
import {
  PlayCircle,
  CheckCircle,
  Clock,
  Book,
  ArrowLeft,
  List,
  ArrowRight,
} from 'react-bootstrap-icons';
import { useAuth } from '~/context/AuthContext';
import VideoPlayer from '~/components/Shared/VideoPlayer';
import CourseLessonsSkeleton from '~/components/Platform/Courses/CourseLessonsSkeleton';
import { useCourseLessons } from '~/hooks/useCourseLessons';
import PremiumOnly from '~/components/Shared/PremiumOnly';
import { useUser } from '~/context/UserContext';

type ProgressResponse = Record<string, boolean>;

export default function CourseLessonsPage() {
  const { user, isLoading: isLoadingUser } = useUser();

  // Show premium banner if user is not premium/canceled or admin
  const shouldShowPremiumBanner = 
    !isLoadingUser &&
    user?.premiumStatus !== 'premium' && 
    user?.role !== 'admin';

  if (isLoadingUser) {
    return <CourseLessonsSkeleton />;
  }

  if (shouldShowPremiumBanner) {
    return (
      <PremiumOnly message="Unlock all courses and lessons with Premium! Get full access to video tutorials, hands-on exercises, and more.">
        <div />
      </PremiumOnly>
    );
  }

  return <CourseLessonsContent />;
}

function CourseLessonsContent() {
  const { auth } = useAuth();
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const navigate = useNavigate();

  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [localProgress, setLocalProgress] = useState<ProgressResponse>({});

  // Use the hook
  const {
    lessonsData,
    isLoading,
    isError,
    error,
    refetch,
    userProgressData,
    isLoadingProgress,
    refetchProgress,
    markLessonMutation,
  } = useCourseLessons({
    courseSlug: courseSlug || '',
    enabled: !!courseSlug && !!auth.isAuthenticated,
  });

  // Sync server progress to local state when it loads
  useEffect(() => {
    if (userProgressData) {
      setLocalProgress(userProgressData);
    }
  }, [userProgressData]);

  // Auto-select first lesson if none selected
  useEffect(() => {
    if (lessonsData?.lessons?.length && !selectedLesson) {
      const firstLessonId = lessonsData.lessons[0].id;
      setSelectedLesson(firstLessonId);
      // Mark first lesson as watched if not already
      if (!localProgress[firstLessonId]) {
        markLessonMutation.mutate(firstLessonId);
      }
    }
  }, [lessonsData, selectedLesson, localProgress]);

  const handleLessonSelect = (lessonId: string) => {
    setSelectedLesson(lessonId);

    // Mark as watched if not already watched
    if (!localProgress[lessonId]) {
      markLessonMutation.mutate(lessonId);
    }
  };

  const calculateProgress = () => {
    if (!lessonsData?.lessons?.length) return 0;

    // Use localProgress for immediate UI updates
    const completed = Object.values(localProgress).filter(Boolean).length;
    return Math.round((completed / lessonsData.lessons.length) * 100);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${secs}s`;
  };

  const currentLesson = lessonsData?.lessons?.find(
    lesson => lesson.id === selectedLesson
  ) || lessonsData?.lessons?.[0];

  const totalDuration = lessonsData?.lessons?.reduce(
    (acc, lesson) => acc + lesson.durationSeconds, 0
  ) || 0;

  const progressPercentage = calculateProgress();
  const completedLessonsCount = Object.values(localProgress).filter(Boolean).length;

  if (isLoading || isLoadingProgress) {
    return <CourseLessonsSkeleton />;
  }

  if (isError) {
    return (
      <Container fluid className="py-3 py-md-4">
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading course:</strong> {error?.message || 'Unknown error'}
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        </Alert>
        <Button
          variant="outline-primary"
          onClick={() => navigate('/courses')}
          className="d-flex align-items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </Button>
      </Container>
    );
  }

  if (!lessonsData?.lessons?.length) {
    return (
      <Container className="py-4">
        <Alert variant="info">
          <div className="d-flex align-items-center gap-3">
            <Book size={24} />
            <div>
              <h5 className="mb-1">No lessons available</h5>
              <p className="mb-0">This course doesn't have any lessons yet.</p>
            </div>
          </div>
        </Alert>
        <Button
          variant="outline-primary"
          onClick={() => navigate('/courses')}
          className="d-flex align-items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Courses
        </Button>
      </Container>
    );
  }

  const MobileSidebar = () => (
    <Offcanvas
      show={showMobileSidebar}
      onHide={() => setShowMobileSidebar(false)}
      placement="start"
      style={{ width: '320px' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Book />
            Course Content
          </h5>
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <ListGroup variant="flush">
          {lessonsData.lessons
            .sort((a, b) => a.lessonNumber - b.lessonNumber)
            .map((lesson) => {
              const isWatched = localProgress[lesson.id] || false;
              const isActive = currentLesson?.id === lesson.id;

              return (
                <ListGroup.Item
                  key={lesson.id}
                  action
                  onClick={() => {
                    handleLessonSelect(lesson.id);
                    setShowMobileSidebar(false);
                  }}
                  active={isActive}
                  className="border-0 px-3 py-3"
                >
                  <div className="d-flex align-items-start">
                    <div className="flex-shrink-0 me-3">
                      <div className="rounded-circle p-2 ">
                        <span className="fw-bold">{lesson.lessonNumber}</span>
                      </div>
                    </div>

                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                        <h6 className="fw-semibold mb-0 text-truncate">{lesson.title}</h6>
                        <div className="d-flex align-items-center gap-1 flex-shrink-0">
                          <small className="text-muted">
                            <Clock size={12} className="me-1" />
                            {formatDuration(lesson.durationSeconds)}
                          </small>
                          {isWatched && (
                            <CheckCircle size={16} className="text-success ms-1" />
                          )}
                          {markLessonMutation.isPending && markLessonMutation.variables === lesson.id && (
                            <Spinner animation="border" size="sm" className="ms-1" />
                          )}
                        </div>
                      </div>
                      <p className="small text-muted mb-0 text-truncate">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  );

  return (
    <Container fluid className="py-3 py-md-0">
      <MobileSidebar />

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Button
            variant="outline-secondary"
            onClick={() => setShowMobileSidebar(true)}
            className="d-md-none d-flex align-items-center gap-2"
            size="sm"
          >
            <List size={18} />
            Lessons
          </Button>
        </div>

        <div className="mb-3">
          <h1 className="h2 mb-2 fw-bold">{lessonsData.courseTitle}</h1>
          <div className="d-flex flex-wrap align-items-center gap-3 text-muted">
            <span className="d-flex align-items-center gap-1">
              <Book size={16} />
              {lessonsData.lessons.length} lessons
            </span>
            <span className="d-flex align-items-center gap-1">
              <Clock size={16} />
              {formatDuration(totalDuration)} total
            </span>
            <Badge bg="info" className="px-2 py-1">
              {progressPercentage}% Complete
            </Badge>
            {markLessonMutation.isPending && (
              <Spinner animation="border" size="sm" />
            )}
          </div>
        </div>

        <ProgressBar
          now={progressPercentage}
          variant="success"
          className="mt-2"
          style={{ height: '6px' }}
        />
        <div className="d-flex justify-content-between mt-1 small text-muted">
          <span>{completedLessonsCount} of {lessonsData.lessons.length} lessons completed</span>
          <span>{progressPercentage}%</span>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={4} className="d-none d-lg-block">
          <Card className="border-0 h-100">
            <Card.Header className="border-0 pt-3 pb-2">
              <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
                <Book />
                Course Content
              </h5>
              <p className="text-muted small mb-0">
                {completedLessonsCount} of {lessonsData.lessons.length} lessons completed
              </p>
            </Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {lessonsData.lessons
                  .sort((a, b) => a.lessonNumber - b.lessonNumber)
                  .map((lesson) => {
                    const isWatched = localProgress[lesson.id] || false;
                    const isActive = currentLesson?.id === lesson.id;

                    return (
                      <ListGroup.Item
                        key={lesson.id}
                        action
                        onClick={() => handleLessonSelect(lesson.id)}
                        active={isActive}
                        className="border-0 px-3 py-3"
                      >
                        <div className="d-flex align-items-start">
                          <div className="flex-shrink-0 me-3">
                            <div className="rounded p-2  d-flex align-items-center justify-content-center"
                              style={{ width: '36px', height: '36px' }}>
                              <span className="fw-bold">{lesson.lessonNumber}</span>
                            </div>
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <h6 className="fw-semibold mb-0">{lesson.title}</h6>
                              <div className="d-flex align-items-center gap-1">
                                <small className="text-muted">
                                  <Clock size={12} className="me-1" />
                                  {formatDuration(lesson.durationSeconds)}
                                </small>
                                {isWatched && (
                                  <CheckCircle size={16} className="text-success ms-1" />
                                )}
                                {markLessonMutation.isPending && markLessonMutation.variables === lesson.id && (
                                  <Spinner animation="border" size="sm" className="ms-1" />
                                )}
                              </div>
                            </div>
                            <p className="small text-muted mb-0">
                              {lesson.description}
                            </p>
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {currentLesson ? (
          <Card className="border-0">
            <Card.Header className="border-0">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2">
                <div>
                  <h3 className="h5 fw-bold">
                    Lesson {currentLesson.lessonNumber}: {currentLesson.title}
                  </h3>
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <Badge bg="secondary" className="px-2 py-1">
                      {formatDuration(currentLesson.durationSeconds)}
                    </Badge>
                    <span className="text-muted small">
                      Updated {new Date(currentLesson.updatedAt).toLocaleDateString()}
                    </span>
                    {localProgress[currentLesson.id] && (
                      <Badge bg="success" className="px-2 py-1 d-flex align-items-center gap-1">
                        <CheckCircle size={12} />
                        Watched
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              <div className="mb-4">
                {currentLesson.videoUrl ? (
                  <VideoPlayer
                    videoUrl={`/api/static/lessons/${currentLesson.videoUrl}`}
                    key={currentLesson.id}
                  />
                ) : (
                  <div className="ratio ratio-16x9  rounded d-flex flex-column align-items-center justify-content-center ">
                    <PlayCircle size={64} className="mb-3 opacity-50" />
                    <p className="mb-0">No video available for this lesson</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h5 className="fw-bold mb-3">About this lesson</h5>
                <div className=" p-3 rounded">
                  <p className="mb-0">{currentLesson.description}</p>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                <Button
                  variant="outline-primary"
                  onClick={() => {
                    const currentIndex = lessonsData.lessons.findIndex(
                      l => l.id === currentLesson.id
                    );
                    if (currentIndex > 0) {
                      const prevLessonId = lessonsData.lessons[currentIndex - 1].id;
                      setSelectedLesson(prevLessonId);
                      if (!localProgress[prevLessonId]) {
                        markLessonMutation.mutate(prevLessonId);
                      }
                    }
                  }}
                  disabled={currentLesson.lessonNumber === 1}
                  className="d-flex align-items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Previous Lesson
                </Button>

                <div className="text-center d-none d-md-block">
                  <span className="text-muted">
                    Lesson {currentLesson.lessonNumber} of {lessonsData.lessons.length}
                  </span>
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    const currentIndex = lessonsData.lessons.findIndex(
                      l => l.id === currentLesson.id
                    );
                    if (currentIndex < lessonsData.lessons.length - 1) {
                      const nextLessonId = lessonsData.lessons[currentIndex + 1].id;
                      setSelectedLesson(nextLessonId);
                      if (!localProgress[nextLessonId]) {
                        markLessonMutation.mutate(nextLessonId);
                      }
                    }
                  }}
                  disabled={currentLesson.lessonNumber === lessonsData.lessons.length}
                  className="d-flex align-items-center gap-2"
                >
                  Next Lesson
                  <ArrowRight size={18} className="rotate-180" />
                </Button>
              </div>

              <div className="text-center d-md-none mt-3">
                <span className="text-muted">
                  Lesson {currentLesson.lessonNumber} of {lessonsData.lessons.length}
                </span>
              </div>
            </Card.Body>
          </Card>
          ) : (
            <Alert variant="info">No lesson selected</Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}
