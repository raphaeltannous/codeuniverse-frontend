import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Modal
} from 'react-bootstrap';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash,
  Play,
  Clock,
  List,
  Search,
  Upload,
  FileEarmarkPlay
} from 'react-bootstrap-icons';
import { Link, useParams } from 'react-router';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { useAuth } from '~/context/AuthContext';
import type { Lesson, LessonFormData } from '~/types/course/lesson';
import VideoUploadModal from '~/components/AdminDashboard/Lessons/video-upload-modal';
import VideoPlayer from '~/components/shared/video-player';

const API_BASE = '/api/admin/courses';

export default function LessonsDashboard() {
  const { auth } = useAuth();
  const { courseSlug } = useParams<{ courseSlug: string }>();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [selectedLessonForVideo, setSelectedLessonForVideo] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showVideoPlayerModal, setShowVideoPlayerModal] = useState(false);
  const [selectedVideoPlayerLesson, setSelectedVideoPlayerLesson] = useState<Lesson | null>(null);

  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    lessonNumber: 0,
  });

  const {
    data: lessonsData,
    isLoading,
    isError,
    error: fetchError
  } = useQuery({
    queryKey: ['lessons', courseSlug],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${courseSlug}/lessons`, {
        headers: {
          "Authorization": `Bearer ${auth.jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }
      return response.json();
    },
    enabled: !!courseSlug,
  });

  const createMutation = useMutation({
    mutationFn: async (data: LessonFormData) => {
      const response = await fetch(`${API_BASE}/${courseSlug}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      console.error('Error creating lesson:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LessonFormData }) => {
      const response = await fetch(`${API_BASE}/${courseSlug}/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      console.error('Error updating lesson:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/${courseSlug}/lessons/${id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${auth.jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] });
      setShowDeleteModal(false);
      setLessonToDelete(null);
    },
    onError: (error: Error) => {
      console.error('Error deleting lesson:', error);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLesson) {
      await updateMutation.mutateAsync({ id: editingLesson.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      lessonNumber: lesson.lessonNumber,
    });
    setShowModal(true);
  };

  const handleVideoUpload = (lesson: Lesson) => {
    setSelectedLessonForVideo(lesson);
    setShowVideoModal(true);
  };

  const handleDelete = (id: string) => {
    setLessonToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (lessonToDelete) {
      deleteMutation.mutate(lessonToDelete);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      lessonNumber: 0,
    });
  };

  const handlePlayVideo = (lesson: Lesson) => {
    if (lesson.videoUrl && lesson.videoUrl !== 'default.mp4') {
      setSelectedVideoPlayerLesson(lesson);
      setShowVideoPlayerModal(true);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalDuration = lessonsData?.lessons?.reduce((total: number, lesson: Lesson) =>
    total + (lesson.durationSeconds || 0), 0) || 0;

  const filteredLessons = lessonsData?.lessons?.filter((lesson: Lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.lessonNumber - b.lessonNumber;
    }
    return b.lessonNumber - a.lessonNumber;
  });

  if (!courseSlug) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          No course selected. Please go back and select a course.
        </Alert>
        <Button as={Link} to="/dashboard/courses" variant="primary">
          <ArrowLeft className="me-2" />
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">
            <Play size={24} className="me-2" />
            {lessonsData?.courseTitle || 'Course'} Lessons
          </h2>
          <p className="text-muted mb-0">Manage lessons for this course</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center gap-2"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Plus size={18} />
          Add New Lesson
        </Button>
      </div>

      {isError && (
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading lessons:</strong> {fetchError?.message || 'Unknown error'}
            </div>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['lessons', courseSlug] })}
              disabled={isLoading}
            >
              Retry
            </Button>
          </div>
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={4} sm={6}>
          <Card className="border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 p-3 rounded me-3">
                <List size={24} className="text-primary" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{lessonsData?.lessons?.length ?? 0}</h5>
                <p className="text-muted mb-0">Total Lessons</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6}>
          <Card className="border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-success bg-opacity-10 p-3 rounded me-3">
                <Clock size={24} className="text-success" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{formatDuration(totalDuration)}</h5>
                <p className="text-muted mb-0">Total Duration</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} sm={6}>
          <Card className="border-0 h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="bg-warning bg-opacity-10 p-3 rounded me-3">
                <FileEarmarkPlay size={24} className="text-warning" />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">
                  {
                    lessonsData?.lessons?.filter(
                      (l: Lesson) => l.durationSeconds > 0
                    ).length ?? 0
                  }
                </h5>
                <p className="text-muted mb-0">Lessons with Video</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 mb-4">
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0">
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading lessons...</p>
            </div>
          ) : sortedLessons.length === 0 ? (
            <div className="text-center py-5">
              <List size={48} className="text-muted mb-3" />
              <h5 className="mb-2">No lessons found</h5>
              <p className="text-muted mb-3">
                {searchQuery
                  ? 'No lessons match your search. Try a different query.'
                  : 'This course has no lessons yet. Add your first lesson!'}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={18} className="me-2" />
                  Add First Lesson
                </Button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th className="py-3">#</th>
                    <th className="py-3">Lesson Title</th>
                    <th className="py-3">Description</th>
                    <th className="py-3">Duration</th>
                    <th className="py-3">Video</th>
                    <th className="py-3">Updated</th>
                    <th className="py-3 text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLessons.map((lesson: Lesson) => (
                    <tr key={lesson.id}>
                      <td className="align-middle">
                        <Badge bg="primary" className="fs-6">
                          {lesson.lessonNumber}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        <strong>{lesson.title}</strong>
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">
                          {lesson.description.length > 100
                            ? `${lesson.description.substring(0, 50)}...`
                            : lesson.description}
                        </small>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center gap-2">
                          <Clock size={16} className="text-muted" />
                          <span>{formatDuration(lesson.durationSeconds || 0)}</span>
                        </div>
                      </td>
                      <td className="align-middle">

                        {lesson.videoUrl && lesson.durationSeconds > 0 ? (
                          <div className="d-flex align-items-center gap-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handlePlayVideo(lesson)}
                              className="d-flex align-items-center gap-1"
                              title="Play video"
                            >
                              <Play size={12} />
                              Play
                            </Button>
                          </div>
                        ) : (
                          <Badge bg="secondary">No video</Badge>
                        )}
                      </td>
                      <td className="align-middle">
                        <small className="text-muted">
                          {new Date(lesson.updatedAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="align-middle text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleVideoUpload(lesson)}
                            title="Upload/Manage Video"
                          >
                            <Upload size={14} />
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleEdit(lesson)}
                            disabled={updateMutation.isPending}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(lesson.id)}
                            disabled={deleteMutation.isPending}
                            title="Delete"
                          >
                            {deleteMutation.variables === lesson.id &&
                              deleteMutation.isPending ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <Trash size={14} />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        backdrop={createMutation.isPending || updateMutation.isPending ? 'static' : true}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h4 fw-bold">
            {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="py-3">
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Lesson Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Introduction to Arrays"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    Lesson Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="lessonNumber"
                    value={formData.lessonNumber}
                    onChange={handleInputChange}
                    required
                    min="1"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                required
                placeholder="Brief description of the lesson content..."
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={handleCloseModal}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingLesson ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingLesson ? 'Update Lesson' : 'Create Lesson'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => !deleteMutation.isPending && setShowDeleteModal(false)}
        centered
        backdrop={deleteMutation.isPending ? 'static' : true}
      >
        <Modal.Header closeButton={!deleteMutation.isPending} className="border-0">
          <Modal.Title className="h5 fw-bold text-danger">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center mb-3">
            <Trash size={48} className="text-danger mb-3" />
            <h5 className="fw-bold">Are you sure?</h5>
            <p className="text-muted">
              This will permanently delete the lesson. This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete Lesson'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {selectedLessonForVideo && (
        <VideoUploadModal
          show={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedLessonForVideo(null);
          }}
          lessonId={selectedLessonForVideo.id}
          lessonTitle={selectedLessonForVideo.title}
          courseSlug={courseSlug}
          currentVideoUrl={selectedLessonForVideo.videoUrl == "default.mp4" ? undefined : selectedLessonForVideo.videoUrl}
          currentDuration={selectedLessonForVideo.durationSeconds}
        />
      )}

      <Modal
        show={showVideoPlayerModal}
        onHide={() => setShowVideoPlayerModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedVideoPlayerLesson?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedVideoPlayerLesson && (
            <VideoPlayer
              videoUrl={`/api/static/lessons/${selectedVideoPlayerLesson.videoUrl}`}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
