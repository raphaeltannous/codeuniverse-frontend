import { Container } from "react-bootstrap";

export default function PlatformFooterComponent() {
  return (
    <footer className="text-center py-3 mt-auto border-top platform-footer">
      <Container>
        <small className="text-body-secondary">
          © {new Date().getFullYear()} CodeUniverse. All rights reserved.
        </small>
      </Container>
    </footer>
  );
}
