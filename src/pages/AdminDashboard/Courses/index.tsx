import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Card,
  Spinner
} from 'react-bootstrap';
import {
  Pencil,
  Trash,
  Plus,
  Eye,
  EyeSlash,
  Book,
  ListTask,
  FileEarmarkText,
  Camera,
} from 'react-bootstrap-icons';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import CourseCard from '~/components/shared/course-card';
import type { Course, CourseFormData } from '~/types/course/course';
import { useAuth } from '~/context/AuthContext';
import ThumbnailChangeModal from '~/components/AdminDashboard/Courses/change-thumbnail-modal';

const API_BASE = '/api/admin';

export default function DashboardCourses() {
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    difficulty: 'Beginner',
    isPublished: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  const [selectedCourseForThumbnail, setSelectedCourseForThumbnail] = useState<{
    slug: string;
    title: string;
    thumbnail: string;
  } | null>(null);


  const changeThumbnailMutation = useMutation({
    mutationFn: async ({ slug, file }: { slug: string; file: File }) => {
      const formData = new FormData();
      formData.append('thumbnail', file);
      formData.append('courseSlug', slug);

      const response = await fetch(`${API_BASE}/courses/${slug}/thumbnail`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${auth.jwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update thumbnail');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSuccess('Thumbnail updated successfully!');
      setShowThumbnailModal(false);
      setSelectedCourseForThumbnail(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to update thumbnail');
    },
  });

  const handleThumbnailChange = (course: Course) => {
    setSelectedCourseForThumbnail({
      slug: course.slug,
      title: course.title,
      thumbnail: course.thumbnailURL
    });
    setShowThumbnailModal(true);
  };

  const {
    data: courses = [],
    isLoading,
    isError,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/courses`, {
        headers: {
          "Authorization": `Bearer ${auth.jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create course');
      }
      return response.json();
    },
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSuccess(`Course "${newCourse.title}" created successfully!`);
      handleCloseModal();
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to create course');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: CourseFormData }) => {
      const response = await fetch(`${API_BASE}/courses/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update course');
      }
      return response.json();
    },
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSuccess(`Course "${updatedCourse.title}" updated successfully!`);
      handleCloseModal();
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to update course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`${API_BASE}/courses/${slug}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${auth.jwt}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSuccess('Course deleted successfully!');
      setShowDeleteModal(false);
      setCourseToDelete(null);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to delete course');
      setShowDeleteModal(false);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ slug, publish }: { slug: string; publish: boolean }) => {
      const response = await fetch(`${API_BASE}/courses/${slug}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify({ isPublished: publish }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle publish status');
      }
      return response.json();
    },
    onSuccess: (toggledCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setSuccess(
        `Course "${toggledCourse.title}" ${toggledCourse.isPublished ? 'published' : 'unpublished'} successfully!`
      );
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to toggle publish status');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSlugGenerate = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim()) {
      setError('Course title is required');
      return;
    }

    if (!formData.slug.trim()) {
      setError('Course slug is required');
      return;
    }

    if (editingCourse) {
      updateMutation.mutate({ slug: editingCourse.slug, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description,
      difficulty: course.difficulty as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
      isPublished: course.isPublished || false,
    });
    setShowModal(true);
  };

  const handleDelete = (slug: string) => {
    setCourseToDelete(slug);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCourse(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      difficulty: 'Beginner',
      isPublished: false,
    });
    setError('');
  };

  const togglePublish = (course: Course) => {
    togglePublishMutation.mutate({
      slug: course.slug,
      publish: !course.isPublished
    });
  };

  const filteredCourses = courses.filter((course: { isPublished: any; }) => {
    if (filter === 'published') return course.isPublished;
    if (filter === 'draft') return !course.isPublished;
    return true;
  });

  const publishedCourses = courses.filter((c: { isPublished: any; }) => c.isPublished);
  const draftCourses = courses.filter((c: { isPublished: any; }) => !c.isPublished);

  const totalLessons = courses.reduce((acc: number, course: { totalLessons: string; }) => {
    const lessons = parseInt(course.totalLessons) || 0;
    return acc + lessons;
  }, 0);


  const courseToDeleteData = courses.find((c: { slug: string | null; }) => c.slug === courseToDelete);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1 fw-bold">Course Management</h2>
          <p className="text-muted mb-0">Create, edit, and manage your courses</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="d-flex align-items-center gap-2"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add New Course
              </>
            )}
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="danger" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error loading courses:</strong> {fetchError?.message || 'Unknown error'}
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
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">
          <div className="d-flex align-items-center">
            <span className="me-2">✓</span>
            <span>{success}</span>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
          <div className="d-flex align-items-center">
            <span className="me-2">⚠</span>
            <span>{error}</span>
          </div>
        </Alert>
      )}

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading courses...</p>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <Book size={24} className="text-primary" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{courses.length}</h5>
                    <p className="text-muted mb-0">Total Courses</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <Eye size={24} className="text-success" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{publishedCourses.length}</h5>
                    <p className="text-muted mb-0">Published</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                    <EyeSlash size={24} className="text-warning" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{draftCourses.length}</h5>
                    <p className="text-muted mb-0">Drafts</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                    <ListTask size={24} className="text-info" />
                  </div>
                  <div>
                    <h5 className="mb-0 fw-bold">{totalLessons}</h5>
                    <p className="text-muted mb-0">Total Lessons</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>


          <ThumbnailChangeModal
            show={showThumbnailModal}
            onClose={() => {
              setShowThumbnailModal(false);
              setSelectedCourseForThumbnail(null);
            }}
            currentThumbnail={selectedCourseForThumbnail?.thumbnail || 'default.jpg'}
            courseSlug={selectedCourseForThumbnail?.slug || ''}
            courseTitle={selectedCourseForThumbnail?.title || ''}
            onThumbnailChange={async (slug: string, file: any) => {
              await changeThumbnailMutation.mutateAsync({ slug, file });
              return { success: !changeThumbnailMutation.isError };
            }}
          />
          <div className="mb-4">
            <div className="border-bottom pb-2">
              <div className="d-flex justify-content-between align-items-center">
                <div className="btn-group" role="group">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('all')}
                    size="sm"
                  >
                    All Courses ({courses.length})
                  </Button>
                  <Button
                    variant={filter === 'published' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('published')}
                    size="sm"
                  >
                    Published ({publishedCourses.length})
                  </Button>
                  <Button
                    variant={filter === 'draft' ? 'primary' : 'outline-primary'}
                    onClick={() => setFilter('draft')}
                    size="sm"
                  >
                    Drafts ({draftCourses.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <Card className="border-dashed border-2 text-center py-5">
              <Card.Body>
                <FileEarmarkText size={48} className="text-muted mb-3" />
                <h5 className="mb-2">No courses found</h5>
                <p className="text-muted mb-3">
                  {filter === 'published'
                    ? 'No published courses yet. Publish a course to see it here.'
                    : filter === 'draft'
                      ? 'No draft courses. Create a new course to get started.'
                      : 'No courses available. Create your first course!'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                  disabled={createMutation.isPending}
                >
                  <Plus size={18} className="me-2" />
                  Create Your First Course
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row xs={1} md={2} lg={3} xl={4} className="g-4">
              {filteredCourses.map((course: Course) => (
                <Col key={course.id}>
                  <div className="position-relative h-100">
                    <CourseCard
                      {...course}
                      completionPercentage={0}
                      buttonLink={`/admin/dashboard/courses/${course.slug}`}
                      buttonText="Edit Course"
                    />
                    <div className="position-absolute top-0 start-0 m-2">
                      <div className="d-flex flex-column gap-1">
                        <Button
                          variant={course.isPublished ? "warning" : "success"}
                          size="sm"
                          className="shadow-sm"
                          onClick={() => togglePublish(course)}
                          disabled={togglePublishMutation.isPending}
                          title={course.isPublished ? "Unpublish" : "Publish"}
                        >
                          {togglePublishMutation.variables?.slug === course.slug &&
                            togglePublishMutation.isPending ? (
                            <Spinner animation="border" size="sm" />
                          ) : course.isPublished ? (
                            <EyeSlash size={12} />
                          ) : (
                            <Eye size={12} />
                          )}
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          className="shadow-sm"
                          onClick={() => handleEdit(course)}
                          disabled={updateMutation.isPending}
                          title="Edit"
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="shadow-sm"
                          onClick={() => handleDelete(course.slug)}
                          disabled={deleteMutation.isPending}
                          title="Delete"
                        >
                          {deleteMutation.variables === course.slug &&
                            deleteMutation.isPending ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <Trash size={12} />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="shadow-sm"
                          onClick={() => handleThumbnailChange(course)}
                          disabled={changeThumbnailMutation.isPending}
                          title="Change Thumbnail"
                        >
                          <Camera size={12} />
                        </Button>
                      </div>
                    </div>
                    <div className="position-absolute bottom-0 start-0 m-2">
                      <Badge
                        bg={course.isPublished ? "success" : "secondary"}
                        className="px-2 py-1"
                      >
                        {course.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        size="lg"
        centered
        backdrop={createMutation.isPending || updateMutation.isPending ? 'static' : true}
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h4 fw-bold">
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="py-3">
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Course Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Data Structures Fundamentals"
                    className="py-2"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md={9}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Slug <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      placeholder="data-structures"
                      className="py-2"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleSlugGenerate}
                      type="button"
                      className="d-flex align-items-center"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      Generate
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Difficulty Level</Form.Label>
                  <Form.Select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="py-2"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </Form.Select>
                </Form.Group>
              </Col>

            </Row>

            <Form.Group className="mt-3">
              <Form.Label className="fw-semibold">
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
                placeholder="Describe what students will learn in this course..."
                className="py-2"
                disabled={createMutation.isPending || updateMutation.isPending}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button
              variant="outline-secondary"
              onClick={handleCloseModal}
              className="px-4"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="px-4"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editingCourse ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingCourse ? 'Update Course' : 'Create Course'
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
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="h5 fw-bold text-danger">
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center mb-3">
            <Trash size={48} className="text-danger mb-3" />
            <h5 className="fw-bold">Are you sure?</h5>
            <p className="text-muted">
              This will permanently delete the course "{courseToDeleteData?.title}".
              This action cannot be undone.
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
              'Delete Course'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
