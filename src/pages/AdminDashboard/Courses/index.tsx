import { useState, Activity } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
} from 'react-bootstrap';
import {
  Plus,
  Eye,
  EyeSlash,
  Book,
  ListTask,
} from 'react-bootstrap-icons';
import StatsCard from '~/components/Shared/StatsCard';
import CoursesList from '~/components/AdminDashboard/Courses/CoursesList';
import { useNotification } from '~/hooks/useNotification';
import CoursesSkeleton from '~/components/AdminDashboard/Courses/CoursesSkeleton';
import CourseThumbnailChangeModal from '~/components/AdminDashboard/Courses/CourseThumbnailChangeModal';
import CourseFormModal from '~/components/AdminDashboard/Courses/CourseFormModal';
import CourseDeleteModal from '~/components/AdminDashboard/Courses/CourseDeleteModal';
import type { Course, CourseFormData } from '~/types/course/course';
import { useAdminCourses } from '~/hooks/useAdminCourses';

export default function DashboardCourses() {
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

  const notification = useNotification();

  const {
    courses,
    isLoading,
    isError,
    error: fetchError,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
    togglePublishMutation,
    changeThumbnailMutation,
  } = useAdminCourses({
    onCreateSuccess: (message) => {
      notification.success(message);
      handleCloseModal();
    },
    onUpdateSuccess: (message) => {
      notification.success(message);
      handleCloseModal();
    },
    onDeleteSuccess: (message) => {
      notification.success(message);
      setShowDeleteModal(false);
      setCourseToDelete(null);
    },
    onTogglePublishSuccess: (message) => {
      notification.success(message);
    },
    onThumbnailSuccess: (message) => {
      notification.success(message);
      setShowThumbnailModal(false);
      setSelectedCourseForThumbnail(null);
    },
    onError: (message) => {
      notification.error(message);
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

    if (!formData.title.trim()) {
      notification.error('Course title is required');
      return;
    }

    if (!formData.slug.trim()) {
      notification.error('Course slug is required');
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
  };

  const togglePublish = (course: Course) => {
    togglePublishMutation.mutate({
      slug: course.slug,
      publish: !course.isPublished
    });
  };

  const handleThumbnailChange = (course: Course) => {
    setSelectedCourseForThumbnail({
      slug: course.slug,
      title: course.title,
      thumbnail: course.thumbnailURL
    });
    setShowThumbnailModal(true);
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 'published') return course.isPublished;
    if (filter === 'draft') return !course.isPublished;
    return true;
  });

  const publishedCourses = courses.filter((c) => c.isPublished);
  const draftCourses = courses.filter((c) => !c.isPublished);

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
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4" role="alert">
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
      )}

      <Row className="mb-4">
        <Col md={3} sm={6}>
          <StatsCard
            icon={Book}
            iconColor="text-primary"
            bgColorClass="bg-primary"
            value={courses.length}
            label="Total Courses"
            isLoading={isLoading}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={Eye}
            iconColor="text-success"
            bgColorClass="bg-success"
            value={publishedCourses.length}
            label="Published"
            isLoading={isLoading}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={EyeSlash}
            iconColor="text-warning"
            bgColorClass="bg-warning"
            value={draftCourses.length}
            label="Drafts"
            isLoading={isLoading}
          />
        </Col>
        <Col md={3} sm={6}>
          <StatsCard
            icon={ListTask}
            iconColor="text-info"
            bgColorClass="bg-info"
            value={totalLessons}
            label="Total Lessons"
            isLoading={isLoading}
          />
        </Col>
      </Row>

      <Activity mode={isLoading ? "visible" : "hidden"}>
        <CoursesSkeleton />
      </Activity> 
      <Activity mode={isLoading ? "hidden" : "visible"}>
        <CoursesList
          filteredCourses={filteredCourses}
          filter={filter}
          courses={courses}
          onFilterChange={(key) => setFilter(key as 'all' | 'published' | 'draft')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePublish={togglePublish}
          onThumbnailChange={handleThumbnailChange}
          onCreateNew={() => setShowModal(true)}
          togglePublishPending={togglePublishMutation.isPending}
          togglePublishVariables={togglePublishMutation.variables}
          updateMutationPending={updateMutation.isPending}
          deleteMutationPending={deleteMutation.isPending}
          deleteMutationVariables={deleteMutation.variables}
          changeThumbnailMutationPending={changeThumbnailMutation.isPending}
        />
      </Activity>
    
      <CourseThumbnailChangeModal
        show={showThumbnailModal}
        onClose={() => {
          setShowThumbnailModal(false);
          setSelectedCourseForThumbnail(null);
        }}
        currentThumbnail={selectedCourseForThumbnail?.thumbnail || 'default.jpg'}
        courseSlug={selectedCourseForThumbnail?.slug || ''}
        courseTitle={selectedCourseForThumbnail?.title || ''}
      />
      <CourseFormModal
        show={showModal}
        isEditing={!!editingCourse}
        formData={formData}
        isLoading={createMutation.isPending || updateMutation.isPending}
        error={error || undefined}
        onClose={handleCloseModal}
        onFormChange={handleInputChange}
        onSlugGenerate={handleSlugGenerate}
        onSubmit={handleSubmit}
      />
      <CourseDeleteModal
        show={showDeleteModal}
        courseTitle={courseToDeleteData?.title || ''}
        isPending={deleteMutation.isPending}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
    </Container>
  );
}
