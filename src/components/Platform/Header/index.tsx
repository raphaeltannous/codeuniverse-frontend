import { Container, Dropdown, Nav, Navbar, Offcanvas } from "react-bootstrap";
import { Link } from "react-router";
import { Activity, useState } from "react";
import logo from "../../../assets/logo.svg";
import { useAuth } from "~/context/AuthContext";
import { useUser } from "~/context/UserContext";

export default function PlatformHeaderComponent() {
  const { auth } = useAuth();
  const { user, isLoading } = useUser();

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
              <Nav.Link as={Link} to="/courses" onClick={close}>
                Courses
              </Nav.Link>
              <Nav.Link as={Link} to="/problems" onClick={close}>
                Problems
              </Nav.Link>
              <Activity mode={user?.role == "admin" ? "visible" : "hidden"}>
                <Nav.Link as={Link} to="/dashboard" onClick={close}>
                  Dashboard
                </Nav.Link>
              </Activity>
            </Nav>

            <div className="mobile-separator d-md-none"></div>

            <Nav className="ms-auto align-items-md-center">
              <Activity mode={auth.isAuthenticated ? "hidden" : "visible"}>
                <Nav.Link as={Link} to="/accounts/login" onClick={close}>
                  Login
                </Nav.Link>

                <span className="nav-link fw-light">or</span>

                <Nav.Link
                  as={Link}
                  to="/accounts/signup"
                  className="fw-semibold text-primary"
                  onClick={close}
                >
                  Signup
                </Nav.Link>
              </Activity>
              <Activity mode={auth.isAuthenticated ? "visible" : "hidden"}>
                <Activity mode={isLoading ? "visible" : "hidden"}>
                  <span>Loading...</span>
                </Activity>
                <Activity mode={isLoading ? "hidden" : "visible"}>
                  <Dropdown className="m-0 p-0 d-none d-md-block" drop="down-centered">
                    <Dropdown.Toggle className="bg-body-tertiary border-0" id="profile-dropdown">
                      <img
                        className="rounded"
                        src={`/api/static/avatars/${user?.avatarUrl}`}
                        style={{
                          width: '30px',
                          height: '30px',
                          objectFit: 'cover',
                        }}
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/accounts/logout">Logout</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <Nav.Link className="d-md-none d-block" as={Link} to="/profile" onClick={close}>
                    Profile
                  </Nav.Link>
                  <Nav.Link className="d-md-none d-block" as={Link} to="/accounts/logout" onClick={close}>
                    Logout
                  </Nav.Link>
                </Activity>
              </Activity>
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}
