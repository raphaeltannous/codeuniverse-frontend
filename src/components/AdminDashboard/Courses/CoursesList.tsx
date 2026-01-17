import { Row, Col, Card, Button, Badge, Tabs, Tab, Spinner } from 'react-bootstrap';
import {
  Pencil,
  Trash,
  Plus,
  Eye,
  EyeSlash,
  FileEarmarkText,
  Camera,
} from 'react-bootstrap-icons';
import CourseCard from '~/components/Shared/CourseCard';
import type { Course } from '~/types/course/course';

interface CoursesListProps {
  filteredCourses: Course[];
  filter: 'all' | 'published' | 'draft';
  courses: Course[];
  onFilterChange: (key: string) => void;
  onEdit: (course: Course) => void;
  onDelete: (slug: string) => void;
  onTogglePublish: (course: Course) => void;
  onThumbnailChange: (course: Course) => void;
  onCreateNew: () => void;
  togglePublishPending: boolean;
  togglePublishVariables?: { slug: string };
  updateMutationPending: boolean;
  deleteMutationPending: boolean;
  deleteMutationVariables?: string;
  changeThumbnailMutationPending: boolean;
}

export default function CoursesList({
  filteredCourses,
  filter,
  courses,
  onFilterChange,
  onEdit,
  onDelete,
  onTogglePublish,
  onThumbnailChange,
  onCreateNew,
  togglePublishPending,
  togglePublishVariables,
  updateMutationPending,
  deleteMutationPending,
  deleteMutationVariables,
  changeThumbnailMutationPending,
}: CoursesListProps) {
  const publishedCourses = courses.filter((c) => c.isPublished);
  const draftCourses = courses.filter((c) => !c.isPublished);

  return (
    <>
      <div className="mb-4">
        <Tabs
          activeKey={filter}
          onSelect={(k) => onFilterChange(k as string)}
          className="mb-3"
        >
          <Tab eventKey="all" title={`All Courses (${courses.length})`} />
          <Tab eventKey="published" title={`Published (${publishedCourses.length})`} />
          <Tab eventKey="draft" title={`Drafts (${draftCourses.length})`} />
        </Tabs>
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
              onClick={onCreateNew}
              disabled={updateMutationPending}
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
                  buttonLink={`/dashboard/courses/${course.slug}`}
                  buttonText="Edit Course"
                />
                <div className="position-absolute top-0 start-0 m-2">
                  <div className="d-flex flex-column gap-1">
                    <Button
                      variant={course.isPublished ? "warning" : "success"}
                      size="sm"
                      className=""
                      onClick={() => onTogglePublish(course)}
                      disabled={togglePublishPending}
                      title={course.isPublished ? "Unpublish" : "Publish"}
                    >
                      {togglePublishVariables?.slug === course.slug && togglePublishPending ? (
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
                      className=""
                      onClick={() => onEdit(course)}
                      disabled={updateMutationPending}
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className=""
                      onClick={() => onDelete(course.slug)}
                      disabled={deleteMutationPending}
                      title="Delete"
                    >
                      {deleteMutationVariables === course.slug && deleteMutationPending ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <Trash size={12} />
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className=""
                      onClick={() => onThumbnailChange(course)}
                      disabled={changeThumbnailMutationPending}
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
  );
}
