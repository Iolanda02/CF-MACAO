import { Col, Container, Image, Nav, Row } from "react-bootstrap";
import logo from "../../assets/logo.png";
import { TelephoneFill } from "react-bootstrap-icons";
import "./styles.css";
import { NavLink } from "react-router";

function Footer() {  return (
    <footer className="bg-dark text-white pt-5 pb-3">
      <Container>
        <Row className="mb-4">
          {/* Colonna Logo */}
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <Nav.Link as={NavLink} to="/">
              <Image src={logo} alt="Lavazza Logo" fluid style={{ maxWidth: '120px' }} />
            </Nav.Link>
          </Col>

          {/* Colonna Prodotti */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-uppercase mb-3">Prodotti</h5>
            <Nav className="flex-column">
              <Nav.Link as={NavLink} to="/" className="text-white footer-link">
                Catalogo Prodotti
              </Nav.Link>
            </Nav>
          </Col>

          {/* Colonna Aiuto e Contatti */}
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-uppercase mb-3">Aiuto e Contatti</h5>
            <Nav className="flex-column">
              <Nav.Link as={NavLink} to="/help" className="text-white footer-link">
                FAQs
              </Nav.Link>
              <Nav.Link as={NavLink} to="/help" className="text-white footer-link">
                Contatti
              </Nav.Link>
              <div className="d-flex align-items-center mt-2">
                <TelephoneFill className="me-2" />
                <span>800 124 535</span>
              </div>
            </Nav>
          </Col>

          {/* Colonna Metodi di Pagamento */}
          {/* <Col md={3} className="mb-3 mb-md-0">
            <h5 className="text-uppercase mb-3">Pagamento Sicuro</h5>
            <div>
              <Image src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style={{ height: '30px' }} />
            </div>
          </Col> */}
        </Row>

        <hr className="bg-light my-4" />

        {/* Riga Copyright e Dettagli Extra */}
        <Row>
          <Col className="text-center">
            <p className="mb-0 small">
              &copy; {new Date().getFullYear()} Macao Caffè. Tutti i diritti riservati.
              {/* <br />
              <Nav.Link as={NavLink} to="/privacy" className="small d-inline-block me-3">
                Privacy Policy
              </Nav.Link>
              <Nav.Link as={NavLink} to="/terms" className="small d-inline-block">
                Termini e Condizioni
              </Nav.Link> */}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;