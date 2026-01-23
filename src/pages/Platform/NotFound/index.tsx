import { Container } from "react-bootstrap";
import { Link } from "react-router";

export default function NotFoundPage() {
    return (
        <Container className="center-content-between-header-footer">
            <div className="text-center">
                <h1 className="display-1 fw-bold text-primary">404</h1>
                <h2 className="mb-4">Page Not Found</h2>
                <p className="lead mb-4">
                    Sorry, the page you're looking for doesn't exist or has been moved.
                </p>
                <div className="d-flex gap-3 justify-content-center">
                    <Link to="/" className="btn btn-primary btn-lg">
                        Go Home
                    </Link>
                    <Link to="/problems" className="btn btn-outline-primary btn-lg">
                        Browse Problems
                    </Link>
                </div>
            </div>
        </Container>
    );
}
