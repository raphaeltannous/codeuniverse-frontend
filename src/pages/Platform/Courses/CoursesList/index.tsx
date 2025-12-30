import { Container, Row, Col } from 'react-bootstrap';
import CourseCard from '~/components/shared/course-card';
import type { Course } from '~/types/course/course';

export default function CoursesList() {
  const courses: (Course & {
    completionPercentage?: number;
  })[] = [
    {
      id: '1',
      title: 'Data Structures Fundamentals',
      slug: 'data-structures-fundamentals',
      description: 'Master essential data structures including arrays, linked lists, stacks, queues, trees, and graphs.',
      thumbnailURL: 'default.jpg',
      difficulty: 'Beginner',
      totalLessons: '15',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z',
      completionPercentage: 0,
    },
    {
      id: '2',
      title: 'Algorithm Patterns & Strategies',
      slug: 'algorithm-patterns-strategies',
      description: 'Learn common algorithm patterns like two pointers, sliding window, BFS/DFS, and dynamic programming.',
      thumbnailURL: 'second.jpg',
      difficulty: 'Intermediate',
      totalLessons: '20',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-25T16:20:00Z',
      completionPercentage: 35,
    },
    {
      id: '3',
      title: 'LeetCode Top Interview Questions',
      slug: 'leetcode-top-interview-questions',
      description: 'Practice the most frequently asked coding interview questions from top tech companies.',
      thumbnailURL: 'default.jpg',
      difficulty: 'Intermediate',
      totalLessons: '30',
      createdAt: '2024-01-05T11:00:00Z',
      updatedAt: '2024-01-22T13:10:00Z',
      completionPercentage: 75,
    },
    {
      id: '4',
      title: 'Dynamic Programming Mastery',
      slug: 'dynamic-programming-mastery',
      description: 'From beginner to advanced DP problems. Learn memoization, tabulation, and state transitions.',
      thumbnailURL: 'default.jpg',
      difficulty: 'Advanced',
      totalLessons: '25',
      createdAt: '2024-01-18T15:45:00Z',
      updatedAt: '2024-01-23T10:30:00Z',
      completionPercentage: 0,
    },
    {
      id: '5',
      title: 'Graph Algorithms & Problems',
      slug: 'graph-algorithms-problems',
      description: 'Comprehensive guide to graph theory, traversal algorithms, and shortest path problems.',
      thumbnailURL: 'second.jpg',
      difficulty: 'Expert',
      totalLessons: '18',
      createdAt: '2024-01-12T14:20:00Z',
      updatedAt: '2024-01-24T11:50:00Z',
      completionPercentage: 20,
    }
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4">Browse Courses</h2>
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {courses.map((course) => (
          <Col key={course.id}>
            <CourseCard {...course} buttonLink={`/courses/${course.slug}`} buttonText={(course.completionPercentage ?? 0) > 0 ? "Continue Course" : "Start Course"}/>
          </Col>
        ))}
      </Row>
    </Container>
  );
};
