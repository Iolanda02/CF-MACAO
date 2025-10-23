import { useEffect, useRef, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { ArrowLeftSquareFill } from "react-bootstrap-icons";
import { Link } from "react-router";

const AdminNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
      const handleScroll = () => {
          const isScrolled = window.scrollY > 0;
          if (isScrolled !== scrolled) {
              setScrolled(isScrolled);
          }
      };

      window.addEventListener('scroll', handleScroll);

      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, [scrolled]);

  useEffect(() => {
      if (navbarRef.current) {
          const navbarElement = navbarRef.current;

          const updatePadding = () => {
              const navbarHeight = navbarElement.offsetHeight;
              document.body.style.paddingTop = `${navbarHeight}px`;
              // console.log('Navbar Height (after transition):', navbarHeight, 'Padding Top:', navbarHeight);
          };

          updatePadding();

          navbarElement.addEventListener('transitionend', updatePadding);

          return () => {
              navbarElement.removeEventListener('transitionend', updatePadding);
          };
      }
  }, [scrolled]);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className={`navbar-admin ${scrolled ? 'scrolled' : ''}`} fixed='top' ref={navbarRef}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/admin">Pannello di Amministrazione</Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              <ArrowLeftSquareFill className="me-2" />
              Vai al Negozio Pubblico
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;