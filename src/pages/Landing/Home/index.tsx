import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router';
import CodeEditor from '~/components/Shared/CodeEditor';
import DifficultyBadge from '~/components/Shared/DifficultyBadge';
import type { Difficulty } from '~/types/problem';

const LandingHome: React.FC = () => {
  const featuredProblems = [
    { id: 1, title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy' as Difficulty, acceptance: '49.5%' },
    { id: 2, title: 'Reverse Linked List', slug: 'reverse-linked-list', difficulty: 'Easy' as Difficulty, acceptance: '68.2%' },
    { id: 3, title: 'Merge Intervals', slug: 'merge-intervals', difficulty: 'Medium' as Difficulty, acceptance: '42.3%' },
    { id: 4, title: 'Binary Tree Inorder Traversal', difficulty: 'Medium' as Difficulty, acceptance: '71.8%' },
    { id: 5, title: 'N-Queens', difficulty: 'Hard' as Difficulty, acceptance: '58.9%' },
  ];

  const features = [
    {
      title: 'Interactive Coding',
      description: 'Write, test, and run code directly in your browser.',
      icon: '💻'
    },
    {
      title: 'Multiple Languages',
      description: 'Support for Go, Python, JavaScript, TypeScript, and C++.',
      icon: '🌐'
    },
    {
      title: 'Comprehensive Courses',
      description: 'Structured learning paths and in-depth courses.',
      icon: '🎓'
    },
    {
      title: 'Progress Tracking',
      description: 'Track your learning journey with statistics and badges.',
      icon: '📈'
    }
  ];

  const mainGoExample = `func twoSum(nums []int, target int) []int {
	hashMap := make(map[int]int)

	for x, value := range nums {
		if i, ok := hashMap[target - value]; ok {
			return []int{
				x,
				i,
			}
		}
		hashMap[value] = x
	}

	return []int{}
}`

  return (
    <div className="">
      <section className="">
        <Container className="py-5">
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="display-4 fw-bold mb-3">
                Master Your Coding Skills
                <span className="text-primary">.</span>
              </h1>
              <p className="lead mb-4">
                Practice with hundreds of coding challenges,
                prepare for technical interviews, and level up
                your programming skills with our interactive platform.
              </p>
              <div className="d-flex gap-3">
                <Link
                  className="btn btn-lg btn-primary px-md-4"
                  to="/problems"
                >
                  Start Practicing
                </Link>
                <Link
                  className="btn btn-lg btn-outline-primary px-md-4"
                  to="/courses"
                >
                  Courses
                </Link>
              </div>
              <div className="mt-4 d-flex align-items-center gap-4">
                <div>
                  <h3 className="fw-bold mb-0">2000+</h3>
                  <p className="text-muted mb-0">Coding Problems</p>
                </div>
                <div>
                  <h3 className="fw-bold mb-0">3+</h3>
                  <p className="text-muted mb-0">Programming Languages</p>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="rounded shadow">
                <div className="p-2 rounded-top">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="px-1 text-muted">main.go</span>
                    <div className="d-flex gap-2">
                      <div className="bg-success rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                      <div className="bg-warning rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                      <div className="bg-danger rounded-circle" style={{ width: '12px', height: '12px' }}></div>
                    </div>
                  </div>
                </div>
                <pre className="bg-body-tertiary mb-0 rounded-bottom" style={{ height: '330px' }}>
                  <CodeEditor code={mainGoExample} language='go' onCodeChange={() => { }} readonly={true} />
                </pre>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <h2 className="text-center mb-5 fw-bold">Why Choose Our Platform?</h2>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} md={6} lg={3} className="mb-4">
                <Card className="border-0">
                  <Card.Body className="text-center p-4">
                    <div className="display-4 mb-3">{feature.icon}</div>
                    <Card.Title className="fw-bold mb-3">{feature.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="py-5">
        <Container>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Featured Problems</h2>
            <Link
              className="btn btn-outline-primary px-md-4"
              to="/problems"
            >
              View All Problems
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th scope="col">Problem Title</th>
                  <th scope="col">Difficulty</th>
                  <th scope="col">Acceptance</th>
                </tr>
              </thead>
              <tbody>
                {featuredProblems.map((problem) => (
                  <tr key={problem.id} className="">
                    <th scope="row">
                      <Link to={`/problems/${problem.slug}`} className="text-decoration-none">
                        {problem.title}
                      </Link>
                    </th>
                    <td>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>
                    <td>{problem.acceptance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="cta-section py-5 bg-primary text-white">
        <Container className="text-center py-5">
          <h2 className="display-5 fw-bold mb-4">
            Ready to Start Your Coding Journey?
          </h2>
          <p className="lead mb-5">
            Join thousands of developers who have improved their skills with our platform.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link
              className="btn btn-lg btn-light px-md-5"
              to="/accounts/signup"
            >
              Sign Up
            </Link>
            <Link
              className="btn btn-lg btn-outline-light px-md-5"
              to="/courses"
            >
              Explore Courses
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default LandingHome;
