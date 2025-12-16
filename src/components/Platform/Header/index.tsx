import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import { Link } from "react-router";
import { useState } from "react";
import logo from "../../../assets/logo.svg";

export default function PlatformHeaderComponent() {
  const [show, setShow] = useState(false);

  const close = () => setShow(false);
  const open = () => setShow(true);

  return (
    <Navbar expand="md" bg="body-tertiary" className="platform-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/" onClick={close}>
          <img
            src={logo}
            width="40"
            height="40"
            className="d-inline-block align-top"
            alt="CodeUniverse Logo"
          />
        </Navbar.Brand>

        <Navbar.Toggle onClick={open} aria-controls="offcanvas-navbar" />

        <Navbar.Offcanvas
          id="offcanvas-navbar"
          show={show}
          onHide={close}
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvas-navbar-label">
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body className="text-center">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/problems" onClick={close}>
                Problems
              </Nav.Link>
            </Nav>

            <div className="mobile-separator d-md-none"></div>

            <Nav className="ms-auto align-items-md-center">
              <Nav.Link as={Link} to="/accounts/login" onClick={close}>
                Login
              </Nav.Link>

              <Nav.Link
                as={Link}
                to="/accounts/signup"
                className="fw-semibold text-primary"
                onClick={close}
              >
                Signup
              </Nav.Link>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
