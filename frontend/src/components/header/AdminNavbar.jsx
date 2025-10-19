import { Container, Navbar } from "react-bootstrap";

const AdminNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/admin">Pannello Admin</Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              <ArrowLeftSquareFill className="me-2" />
              Torna al Negozio Pubblico
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;