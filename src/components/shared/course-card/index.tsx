import { Activity } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router';
import type { Course } from '~/types/course/course';
import DifficultyBadge from '../difficulty-badge';
import type { Difficulty } from '~/types/problem';

interface CourseCardProps extends Course {
  completionPercentage?: number;
  buttonLink: string;
  buttonText: string;
}

export default function CourseCard({
  id,
  title,
  slug,
  description,
  thumbnailURL,
  difficulty,
  totalLessons,
  createdAt,
  updatedAt,
  completionPercentage = 0,
  buttonLink,
  buttonText,
}: CourseCardProps) {
  const getProgressVariant = () => {
    if (completionPercentage === 0) return 'secondary';
    if (completionPercentage < 50) return 'warning';
    if (completionPercentage < 90) return 'info';
    return 'success';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const parseTotalLessons = () => {
    const num = parseInt(totalLessons);
    return isNaN(num) ? 0 : num;
  };

  const lessonsCount = parseTotalLessons();

  return (
    <Card className="h-100 border-0">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={`/api/static/courses/thumbnails/${thumbnailURL}`}
          alt={title}
          style={{ height: '180px', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = '/api/static/courses/thumbnails/default.jpg';
          }}
        />

        <Activity mode={difficulty ? "visible" : "hidden"}>
          <div className="position-absolute top-0 end-0 m-1">
            <DifficultyBadge difficulty={difficulty as Difficulty} />
          </div>
        </Activity>

        <Activity mode={completionPercentage > 0 ? "visible" : "hidden"}>
          <div className="position-absolute bottom-0 start-0 w-100">
            <div className="progress rounded-0" style={{ height: '4px' }}>
              <div
                className={`progress-bar bg-${getProgressVariant()}`}
                role="progressbar"
                style={{ width: `${completionPercentage}%` }}
                aria-valuenow={completionPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </Activity>
      </div>

      <Card.Body className="d-flex flex-column px-1 py-3">
        <Card.Title className="h5 mb-2">
          <Link
            to={slug ? `/courses/${slug}` : `/courses/${id}`}
            className="text-decoration-none"
          >
            {title}
          </Link>
        </Card.Title>

        <Card.Text className="text-muted flex-grow-1" style={{ fontSize: '0.9rem' }}>
          {description || 'No description available'}
        </Card.Text>

        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Activity mode={lessonsCount > 0 ? "visible" : "hidden"}>
              <small className="text-muted">
                {lessonsCount} {lessonsCount === 1 ? 'lesson' : 'lessons'}
              </small>
            </Activity>

            <small className="text-muted">
              Updated {formatDate(updatedAt)}
            </small>
          </div>

          <div className="d-grid gap-2">
            <Link
              to={buttonLink}
              className="btn btn-sm btn-primary"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
