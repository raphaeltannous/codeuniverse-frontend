export interface Course {
  id: string;

  title: string;
  slug: string;
  description: string;
  thumbnailURL: string;
  difficulty: string;
  totalLessons: string;
  isPublished?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  difficulty: CourseDifficulty;
  isPublished: boolean;
}

export type CourseDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';