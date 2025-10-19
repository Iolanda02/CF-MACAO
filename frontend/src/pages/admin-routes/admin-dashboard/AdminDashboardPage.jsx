import { Card, Col, Row } from "react-bootstrap";

const AdminDashboardPage = () => {
  return (
    <div className="admin-dashboard-content mt-4">
      <h2>Benvenuto nella Dashboard Admin!</h2>
      <Row className="mt-4 justify-content-center">
        <Col md={4} lg={3} className="mb-4">
          <Card className="text-center p-3 h-100">
            <Card.Body>
              <BoxSeamFill size={48} className="mb-3 text-primary" />
              <Card.Title>Gestione Prodotti</Card.Title>
              <Card.Text>
                Visualizza e gestisci i prodotti del negozio.
              </Card.Text>
              <Link to="/admin/products" className="btn btn-primary mt-3">
                Vai ai Prodotti
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={3} className="mb-4">
          <Card className="text-center p-3 h-100">
            <Card.Body>
              <CartFill size={48} className="mb-3 text-success" />
              <Card.Title>Gestione Ordini</Card.Title>
              <Card.Text>
                Visualizza e gestisci gli ordini dei clienti.
              </Card.Text>
              <Link to="/admin/orders" className="btn btn-success mt-3">
                Vai agli Ordini
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} lg={3} className="mb-4">
          <Card className="text-center p-3 h-100">
            <Card.Body>
              <PeopleFill size={48} className="mb-3 text-info" />
              <Card.Title>Gestione Utenti</Card.Title>
              <Card.Text>
                Visualizza e gestisci gli utenti registrati.
              </Card.Text>
              <Link to="/admin/users" className="btn btn-info mt-3">
                Vai agli Utenti
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;