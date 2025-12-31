export interface Lesson {
  id: string;
  CourseId: string;
  title: string;
  description: string;
  videoUrl: string;
  durationSeconds: number;
  lessonNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonFormData {
  title: string;
  description: string;
  lessonNumber: number;
}

export interface LessonsResponse {
  lessons: Lesson[];
  total: number;
  courseTitle: string;
}
