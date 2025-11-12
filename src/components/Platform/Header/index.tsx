import { Container, Nav, Navbar } from "react-bootstrap";

import logo from "../../../assets/logo.svg";
import { Link } from "react-router";


export default function PlatformHeaderComponent() {
  return (
    <>
      <Navbar expand="md" className="bg-body-tertiary platform-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src={logo}
              width="40px"
              height="40px"
              className="d-inline-block align-top"
              alt="CodeUniverse Logo"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="platform-navbar-toggle" />
          <Navbar.Collapse id="platform-navbar-toggle">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/accounts/login">
                Login
              </Nav.Link>
              <Nav.Link as={Link} to="/accounts/signup">
                Signup
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  )
}
